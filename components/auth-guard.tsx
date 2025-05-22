"use client"

import { useContext, useEffect, type ReactNode } from "react"
import { AuthContext } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"

type AuthGuardProps = {
  children: ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loadingAuth } = useContext(AuthContext)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Rotas públicas que não precisam de autenticação
    const publicRoutes = ["/login", "/cadastro", "/esqueci-senha", "/redefinir-senha"]

    // Se não estiver carregando e não estiver autenticado e não for uma rota pública
    if (!loadingAuth && !isAuthenticated && !publicRoutes.includes(pathname)) {
      router.push("/login")
    }
  }, [isAuthenticated, loadingAuth, router, pathname])

  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login", "/cadastro", "/esqueci-senha", "/redefinir-senha"]

  // Se não estiver autenticado e não for uma rota pública, não renderiza nada (será redirecionado)
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null
  }

  // Se estiver autenticado ou for uma rota pública, renderiza os filhos
  return <>{children}</>
}
