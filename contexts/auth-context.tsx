"use client"

import { createContext, type ReactNode, useEffect, useState } from "react"
import type { Session, User as SupabaseAuthUser } from "@supabase/supabase-js" // Tipos do Supabase
import { supabase } from "@/lib/supabaseClient" // Nosso cliente Supabase
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

// Tipos
type AuthContextData = {
  user: User | null
  session: Session | null // Supabase session object
  isAuthenticated: boolean
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<void>
  loadingAuth: boolean
}

// Nossa interface User da aplicação (pode ser igual à do Firebase ou ajustada)
type User = {
  id: string
  name?: string // Nome pode vir de uma tabela 'profiles'
  email?: string
  // avatarUrl?: string;
  // role?: string; // Se você tiver um sistema de roles
}

type SignInCredentials = {
  email: string
  password: string
}

type SignUpCredentials = {
  name: string // Vamos precisar salvar isso em uma tabela 'profiles'
  email: string
  password: string
}

type AuthProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user && !!session

  useEffect(() => {
    setLoadingAuth(true)
    // Verifica a sessão inicial ao carregar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      // Se há sessão, busca os dados do usuário (incluindo da tabela 'profiles' se necessário)
      if (session?.user) {
        fetchUserProfile(session.user)
      } else {
        setUser(null)
      }
      setLoadingAuth(false)
    })

    // Ouve mudanças no estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        await fetchUserProfile(session.user)
      } else {
        setUser(null)
      }
      setLoadingAuth(false) // Garante que o loading termina após a mudança de estado
    })

    return () => {
      authListener?.unsubscribe()
    }
  }, [])

  // Função para buscar/criar perfil do usuário na sua tabela 'profiles' ou 'users'
  async function fetchUserProfile(supabaseUser: SupabaseAuthUser, profileData?: { name?: string }) {
    if (!supabaseUser.email) {
      console.error("Supabase user sem email.")
      setUser(null)
      return
    }

    try {
      // Tenta buscar o perfil existente
      const { data: profile, error: profileError } = await supabase
        .from("profiles") // Certifique-se que essa tabela existe!
        .select("id, name, email, role") // Adicione os campos que você tem
        .eq("id", supabaseUser.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 = 'single row not found'
        console.error("Erro ao buscar perfil:", profileError)
        toast.error("Erro ao carregar dados do usuário.")
        setUser(null) // Limpa o usuário em caso de erro crítico
        return
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name || supabaseUser.user_metadata?.full_name || "Usuário",
          email: profile.email || supabaseUser.email,
          // role: profile.role // Se tiver role
        })
      } else if (profileData?.name) {
        // Se o perfil não existe (ex: após o signup) e temos dados para criar (como o nome)
        // Isso é útil se o signup não criar o perfil imediatamente
        console.warn("Perfil não encontrado, pode precisar ser criado após o signup se signUp não o fez.")
        setUser({
          // Usuário básico do Auth enquanto perfil não é criado/buscado
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: profileData.name, // Nome passado do signup
        })
      } else {
        // Usuário autenticado mas sem perfil e sem dados para criar um no momento
        // Pode acontecer se o perfil for deletado manualmente ou erro no signup
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email,
          name: supabaseUser.user_metadata?.full_name || "Usuário",
        })
      }
    } catch (error) {
      console.error("Erro no fetchUserProfile:", error)
      toast.error("Erro ao processar dados do usuário.")
      setUser(null)
    }
  }

  async function signIn({ email, password }: SignInCredentials) {
    setLoadingAuth(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      if (!data.session || !data.user) throw new Error("Login falhou, sem sessão ou usuário.")

      // onAuthStateChange irá lidar com a atualização de session e user
      toast.success("Login realizado com sucesso!")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Erro no SignIn:", error)
      toast.error(error.message || "E-mail ou senha inválidos.")
    } finally {
      setLoadingAuth(false)
    }
  }

  async function signUp({ name, email, password }: SignUpCredentials) {
    setLoadingAuth(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // Esses dados vão para a coluna 'raw_user_meta_data' da tabela auth.users
            name: name, // Ou full_name, conforme preferir
          },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Cadastro falhou, usuário não criado.")

      // **Importante:** Criar o perfil na sua tabela 'profiles' (ou 'users')
      // O trigger do Supabase pode fazer isso, ou você faz explicitamente aqui.
      // Vamos fazer explicitamente para clareza:
      const { error: profileError } = await supabase
        .from("profiles") // Certifique-se que essa tabela existe!
        .insert({
          id: authData.user.id, // Mesmo ID do auth.users
          name: name,
          email: email, // Pode ser redundante se você sempre buscar o email de auth.user.email
          // created_at: new Date().toISOString(), // Supabase pode gerenciar isso com default now()
          role: "customer", // Exemplo de role padrão
        })

      if (profileError) {
        console.error("Erro ao criar perfil do usuário:", profileError)
        // Considere o que fazer aqui. O usuário foi criado no Auth, mas não no profiles.
        // Poderia tentar deletar o usuário do Auth ou logar o erro para correção manual.
        toast.error("Erro ao finalizar cadastro do perfil. Contate o suporte.")
        // Forçar logout se o perfil for crítico
        await supabase.auth.signOut()
        router.push("/signup") // ou '/'
        return
      }

      // onAuthStateChange irá lidar com a atualização de session e user (com o perfil)
      // Se a confirmação de email estiver ATIVADA, o usuário não será logado automaticamente.
      // Se estiver DESATIVADA, onAuthStateChange será chamado com a nova sessão.
      if (authData.session) {
        // Usuário logado (confirmação desativada ou já confirmou)
        toast.success("Cadastro realizado com sucesso! Redirecionando...")
        router.push("/dashboard")
      } else {
        // Confirmação de email pendente
        toast.info("Cadastro realizado! Verifique seu e-mail para confirmar a conta.")
        router.push("/") // Redireciona para login ou uma página de "verifique seu email"
      }
    } catch (error: any) {
      console.error("Erro no SignUp:", error)
      toast.error(error.message || "Erro ao tentar cadastrar.")
    } finally {
      setLoadingAuth(false)
    }
  }

  async function signOut() {
    setLoadingAuth(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // setUser e setSession serão atualizados pelo onAuthStateChange
      toast.info("Você foi desconectado.")
      router.push("/")
    } catch (error: any) {
      console.error("Erro no SignOut:", error)
      toast.error(error.message || "Erro ao tentar desconectar.")
    } finally {
      setLoadingAuth(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated, signIn, signOut, signUp, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
