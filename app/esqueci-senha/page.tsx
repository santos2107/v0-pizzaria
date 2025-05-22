"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "react-toastify"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError("E-mail é obrigatório")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("E-mail inválido")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })

      if (error) throw error

      setIsSubmitted(true)
      toast.success("E-mail de recuperação enviado com sucesso!")
    } catch (error: any) {
      console.error("Erro ao enviar e-mail de recuperação:", error)
      setError(error.message || "Erro ao enviar e-mail de recuperação")
      toast.error("Falha ao enviar e-mail de recuperação")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Image src="/pizza-logo.png" alt="Pizzaria Logo" width={100} height={100} className="mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">Recuperar Senha</h1>
          <p className="text-gray-600">
            {isSubmitted
              ? "Verifique seu e-mail para redefinir sua senha"
              : "Enviaremos um link para redefinir sua senha"}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="seu@email.com"
                disabled={isLoading}
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {isLoading ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-4">
            <p className="text-green-800">
              Um e-mail com instruções para redefinir sua senha foi enviado para {email}.
            </p>
            <p className="text-green-800 mt-2">Verifique sua caixa de entrada e siga as instruções no e-mail.</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
              Voltar para o login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
