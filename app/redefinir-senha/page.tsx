"use client"

import { useState, type FormEvent, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"

export default function RedefinirSenhaPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário está autenticado via hash na URL
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        toast.error("Link inválido ou expirado. Solicite um novo link de recuperação.")
        router.push("/esqueci-senha")
      }
    }

    checkSession()
  }, [router])

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {}
    let isValid = true

    if (!password) {
      newErrors.password = "Nova senha é obrigatória"
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres"
      isValid = false
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória"
      isValid = false
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setIsSuccess(true)
      toast.success("Senha redefinida com sucesso!")

      // Redirecionar após alguns segundos
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error)
      toast.error(error.message || "Erro ao redefinir senha")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Image src="/pizza-logo.png" alt="Pizzaria Logo" width={100} height={100} className="mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Redefinir Senha</h1>
          <p className="text-gray-600">
            {isSuccess ? "Sua senha foi redefinida com sucesso" : "Crie uma nova senha para sua conta"}
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-4">
            <p className="text-green-800">
              Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login.
            </p>
            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Ir para o login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nova senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="******"
                disabled={isLoading}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="******"
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isLoading ? "Redefinindo..." : "Redefinir senha"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
