"use client"

import { useState, useContext, type FormEvent } from "react"
import { AuthContext } from "@/contexts/auth-context"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/router" // Note: using pages router
import { toast } from "react-toastify"
import Head from "next/head"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const { signUp, loadingAuth, isAuthenticated } = useContext(AuthContext)
  const router = useRouter()

  // Redirecionar se já estiver autenticado
  if (typeof window !== "undefined" && isAuthenticated) {
    router.push("/dashboard")
  }

  const validateForm = () => {
    const newErrors: {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
    } = {}
    let isValid = true

    if (!name) {
      newErrors.name = "Nome é obrigatório"
      isValid = false
    }

    if (!email) {
      newErrors.email = "E-mail é obrigatório"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "E-mail inválido"
      isValid = false
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória"
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

    try {
      await signUp({ name, email, password })
      // O redirecionamento é feito dentro do signUp
    } catch (error) {
      console.error("Erro ao cadastrar:", error)
      toast.error("Falha ao criar conta. Tente novamente.")
    }
  }

  return (
    <>
      <Head>
        <title>Cadastro - Pizzaria do Kassio</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <Image src="/pizza-logo.png" alt="Pizzaria Logo" width={100} height={100} className="mb-2" />
            <h1 className="text-2xl font-bold text-gray-800">Pizzaria do Kassio</h1>
            <p className="text-gray-600">Crie sua conta para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Seu nome"
                disabled={loadingAuth}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

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
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="seu@email.com"
                disabled={loadingAuth}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
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
                disabled={loadingAuth}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="******"
                disabled={loadingAuth}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={loadingAuth}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {loadingAuth ? "Cadastrando..." : "Cadastrar"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link href="/" className="font-medium text-orange-600 hover:text-orange-500">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
