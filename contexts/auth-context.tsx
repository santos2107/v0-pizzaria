"use client"

import { createContext, type ReactNode, useEffect, useState } from "react"
import type { Session, User as SupabaseAuthUser } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabaseClient" // Verifique o caminho
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

type AuthContextData = {
  user: AppUser | null // Renomeado para AppUser para evitar conflito com SupabaseAuthUser
  session: Session | null
  isAuthenticated: boolean
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<void>
  loadingAuth: boolean
}

// Sua interface de usuário da aplicação
export type AppUser = {
  // Renomeado
  id: string
  name?: string
  email?: string
  role?: string // Se você for usar roles
}

type SignInCredentials = {
  email: string
  password: string
}

type SignUpCredentials = {
  name: string
  email: string
  password: string
}

type AuthProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [appUser, setAppUser] = useState<AppUser | null>(null) // Renomeado
  const [session, setSession] = useState<Session | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!appUser && !!session

  useEffect(() => {
    setLoadingAuth(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserProfile(session.user) // Busca o perfil da sua tabela 'users' ou 'profiles'
      } else {
        setAppUser(null)
      }
      setLoadingAuth(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession)
      if (currentSession?.user) {
        await fetchUserProfile(currentSession.user)
      } else {
        setAppUser(null)
      }
      setLoadingAuth(false)
    })

    return () => {
      authListener?.unsubscribe()
    }
  }, [])

  async function fetchUserProfile(supabaseAuthUser: SupabaseAuthUser) {
    try {
      // Assumindo que sua tabela Prisma 'User' é onde você armazena perfis
      // e que o 'id' dela corresponde ao 'id' do supabase.auth.user()
      const { data: profile, error } = await supabase
        .from("profiles") // Ou 'profiles', dependendo do nome da sua tabela no BD
        .select(`id, name, email, role`) // Adicione 'role' se tiver
        .eq("id", supabaseAuthUser.id)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116: 'single row not found'
        console.error("Erro ao buscar perfil:", error)
        // Não limpe o appUser aqui, pode ser que ele só não tenha perfil ainda
        // mas está autenticado.
        // Apenas use os dados do SupabaseAuthUser como fallback.
      }

      if (profile) {
        setAppUser({
          id: profile.id,
          name: profile.name || supabaseAuthUser.user_metadata?.name,
          email: profile.email || supabaseAuthUser.email,
          role: profile.role, // Se tiver
        })
      } else {
        // Se não encontrou perfil, use os dados do auth.user se disponíveis
        setAppUser({
          id: supabaseAuthUser.id,
          name: supabaseAuthUser.user_metadata?.name || "Usuário", // 'name' passado no options do signUp
          email: supabaseAuthUser.email,
        })
      }
    } catch (e) {
      console.error("Exceção em fetchUserProfile:", e)
      setAppUser({
        // Fallback para dados do Supabase Auth User
        id: supabaseAuthUser.id,
        name: supabaseAuthUser.user_metadata?.name || "Usuário",
        email: supabaseAuthUser.email,
      })
    }
  }

  async function signIn({ email, password }: SignInCredentials) {
    setLoadingAuth(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      // onAuthStateChange cuidará de definir user e session
      toast.success("Login bem-sucedido!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Falha no login.")
    } finally {
      setLoadingAuth(false)
    }
  }

  async function signUp({ name, email, password }: SignUpCredentials) {
    setLoadingAuth(true)
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name }, // Adiciona 'name' aos metadados do usuário no Supabase Auth
        },
      })

      if (signUpError) throw signUpError
      if (!signUpData.user) throw new Error("Usuário não retornado após signUp.")

      // **CRÍTICO:** Inserir na sua tabela 'users' (ou 'profiles') do Prisma/Supabase
      // O ID do Supabase Auth User é signUpData.user.id
      // O nome é 'name', email é 'email'.
      const { error: profileError } = await supabase
        .from("profiles") // Certifique-se que esta é a tabela correta!
        .insert([
          {
            id: signUpData.user.id, // ID do Supabase Auth
            name: name,
            email: email,
            role: "customer", // Role padrão
            // created_at e updated_at devem ter default no BD
          },
        ])

      if (profileError) {
        console.error("Erro ao criar perfil local:", profileError)
        // Usuário foi criado no Supabase Auth, mas não no 'users'.
        // Isso precisa ser tratado (ex: logar para admin, ou tentar deletar do Auth)
        toast.error("Erro ao finalizar cadastro do perfil. Contate o suporte.")
        await supabase.auth.signOut() // Desloga para evitar estado inconsistente
        return // Não continua se o perfil não foi criado
      }

      // onAuthStateChange vai lidar com a atualização do estado do usuário
      // Se a confirmação de email estiver ATIVADA no Supabase, o usuário não será logado.
      if (signUpData.session) {
        // Logado automaticamente (confirmação de email desativada)
        toast.success("Cadastro realizado! Bem-vindo!")
        router.push("/dashboard")
      } else {
        // Confirmação de email pendente
        toast.info("Cadastro realizado! Verifique seu e-mail para confirmar a conta.")
        router.push("/") // Volta para login
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar.")
    } finally {
      setLoadingAuth(false)
    }
  }

  async function signOut() {
    setLoadingAuth(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // onAuthStateChange vai limpar user e session
      toast.info("Você foi desconectado.")
      router.push("/")
    } catch (error: any) {
      toast.error(error.message || "Erro ao desconectar.")
    } finally {
      setLoadingAuth(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user: appUser, session, isAuthenticated, signIn, signOut, signUp, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
