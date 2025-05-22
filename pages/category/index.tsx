"use client"

import type React from "react"

import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/contexts/auth-context"
import { useRouter } from "next/router"
import Head from "next/head"
import { toast } from "react-toastify"

// Tipo para categoria
type Categoria = {
  id: number
  nome: string
  descricao?: string
}

export default function CategoryPage() {
  const { user, isAuthenticated, loadingAuth } = useContext(AuthContext)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [novaCategoria, setNovaCategoria] = useState({ nome: "", descricao: "" })
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // Buscar role do usuário
  useEffect(() => {
    async function fetchUserRole() {
      if (!user) return

      try {
        const response = await fetch("/api/me/role")
        if (!response.ok) throw new Error("Falha ao buscar role")

        const data = await response.json()
        setUserRole(data.role)
      } catch (error) {
        console.error("Erro ao buscar role:", error)
      }
    }

    if (user) {
      fetchUserRole()
    }
  }, [user])

  // Buscar categorias
  useEffect(() => {
    async function fetchCategorias() {
      try {
        const response = await fetch("/api/categorias")
        if (!response.ok) throw new Error("Falha ao buscar categorias")

        const data = await response.json()
        setCategorias(data)
      } catch (error) {
        console.error("Erro ao buscar categorias:", error)
        toast.error("Erro ao carregar categorias")
      } finally {
        setLoading(false)
      }
    }

    fetchCategorias()
  }, [])

  // Proteção de rota no cliente
  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loadingAuth, router])

  // Criar nova categoria
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!novaCategoria.nome.trim()) {
      toast.error("Nome da categoria é obrigatório")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}`,
        },
        body: JSON.stringify(novaCategoria),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar categoria")
      }

      const novaCategoriaCriada = await response.json()

      // Atualizar lista de categorias
      setCategorias((prev) => [...prev, novaCategoriaCriada])

      // Limpar formulário
      setNovaCategoria({ nome: "", descricao: "" })

      toast.success("Categoria criada com sucesso!")
    } catch (error: any) {
      console.error("Erro ao criar categoria:", error)
      toast.error(error.message || "Erro ao criar categoria")
    } finally {
      setSubmitting(false)
    }
  }

  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Se não estiver autenticado, não renderiza nada (será redirecionado pelo useEffect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Head>
        <title>Categorias - Pizzaria do Kassio</title>
      </Head>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gerenciar Categorias</h1>

        {/* Lista de categorias */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Categorias</h2>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : categorias.length === 0 ? (
            <p className="text-gray-500 py-4">Nenhuma categoria encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    {userRole === "admin" && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categorias.map((categoria) => (
                    <tr key={categoria.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{categoria.nome}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{categoria.descricao || "-"}</div>
                      </td>
                      {userRole === "admin" && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-orange-600 hover:text-orange-900 mr-3"
                            onClick={() => router.push(`/category/edit/${categoria.id}`)}
                          >
                            Editar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Formulário para criar categoria (apenas admin) */}
        {userRole === "admin" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Nova Categoria</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  id="nome"
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  value={novaCategoria.descricao}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {submitting ? "Salvando..." : "Salvar Categoria"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  )
}
