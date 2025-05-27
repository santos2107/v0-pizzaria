"use client"

import type React from "react"

import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { Loader2, Pizza, User, Lock } from "lucide-react"

export default function LoginPage() {
  const { signIn, isAuthenticated, loadingAuth } = useContext(AuthContext)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (!loadingAuth && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, loadingAuth, router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Preencha todos os campos")
      return
    }

    setLoading(true)
    try {
      await signIn({ email, password })
    } catch (error) {
      console.error("Erro no login:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          <span className="text-gray-600">Verificando autenticação...</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          <span className="text-gray-600">Redirecionando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-500 p-3 rounded-full">
              <Pizza className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Pizzaria do Kassio</CardTitle>
          <CardDescription>Sistema de Gerenciamento</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Usuário de teste:</p>
            <p className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">admin@pizzaria.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
