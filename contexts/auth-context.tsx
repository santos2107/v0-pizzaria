"use client"

import { createContext, type ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

type AuthContextData = {
  user: AppUser | null
  isAuthenticated: boolean
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<void>
  loadingAuth: boolean
}

export type AppUser = {
  id: string
  name?: string
  email?: string
  role?: string
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
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!appUser

  useEffect(() => {
    console.log("🔑 AuthContext: Iniciando verificação de sessão")
    setLoadingAuth(true)

    // Simular verificação de sessão
    setTimeout(() => {
      // Verificar se há dados salvos no localStorage (simulação)
      const savedUser = localStorage.getItem("@pizzaria:user")
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          console.log("🔑 AuthContext: Usuário encontrado no localStorage", userData)
          setAppUser(userData)
        } catch (error) {
          console.error("🔑 AuthContext: Erro ao parsear dados do usuário", error)
          localStorage.removeItem("@pizzaria:user")
        }
      } else {
        console.log("🔑 AuthContext: Nenhum usuário salvo encontrado")
      }
      setLoadingAuth(false)
    }, 1000)
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    console.log("🔐 AuthContext: Iniciando login", { email })
    setLoadingAuth(true)

    try {
      // Simular autenticação
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Verificar credenciais (simulação)
      if (email === "admin@pizzaria.com" && password === "admin123") {
        const userData: AppUser = {
          id: "1",
          name: "Administrador",
          email: "admin@pizzaria.com",
          role: "admin",
        }

        console.log("🔐 AuthContext: Login bem-sucedido", userData)
        setAppUser(userData)
        localStorage.setItem("@pizzaria:user", JSON.stringify(userData))

        toast.success("Login realizado com sucesso!")
        router.push("/dashboard")
      } else {
        throw new Error("Credenciais inválidas")
      }
    } catch (error: any) {
      console.error("🔐 AuthContext: Erro no login", error)
      toast.error(error.message || "Falha no login")
      throw error
    } finally {
      setLoadingAuth(false)
    }
  }

  async function signUp({ name, email, password }: SignUpCredentials) {
    console.log("📝 AuthContext: Iniciando cadastro", { name, email })
    setLoadingAuth(true)

    try {
      // Simular cadastro
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const userData: AppUser = {
        id: Date.now().toString(),
        name,
        email,
        role: "customer",
      }

      console.log("📝 AuthContext: Cadastro bem-sucedido", userData)
      setAppUser(userData)
      localStorage.setItem("@pizzaria:user", JSON.stringify(userData))

      toast.success("Cadastro realizado com sucesso!")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("📝 AuthContext: Erro no cadastro", error)
      toast.error(error.message || "Erro ao cadastrar")
      throw error
    } finally {
      setLoadingAuth(false)
    }
  }

  async function signOut() {
    console.log("🚪 AuthContext: Fazendo logout")
    setLoadingAuth(true)

    try {
      // Simular logout
      await new Promise((resolve) => setTimeout(resolve, 500))

      setAppUser(null)
      localStorage.removeItem("@pizzaria:user")

      toast.success("Logout realizado com sucesso!")
      router.push("/")
    } catch (error: any) {
      console.error("🚪 AuthContext: Erro no logout", error)
      toast.error("Erro ao fazer logout")
    } finally {
      setLoadingAuth(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        isAuthenticated,
        signIn,
        signOut,
        signUp,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
