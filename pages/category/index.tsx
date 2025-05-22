"use client"

import { useState, useEffect, type FormEvent, useContext } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { toast } from "react-toastify"
import { AuthContext } from "@/contexts/auth-context"
import { api } from "@/services/api"

type CategoryProps = {
  id: string
  name: string
}

export default function Category() {
  const { user, isAuthenticated, loadingAuth } = useContext(AuthContext)
  const [name, setName] = useState("")
  const [categories, setCategories] = useState<CategoryProps[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Proteção de rota no cliente
  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      router.push("/")
    } else if (!loadingAuth && isAuthenticated && user?.role !== "admin") {
      toast.error("Acesso não autorizado. Apenas administradores podem acessar esta página.")
      router.push("/dashboard")
    }
  }, [isAuthenticated, loadingAuth, user, router])

  // Carregar categorias
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await api.get("/categories")
        setCategories(response.data)
      } catch (error) {
        console.error("Erro ao buscar categorias:", error)
        toast.error("Erro ao carregar categorias")
      }
    }

    if (isAuthenticated && user?.role === "admin") {
      loadCategories()
    }
  }, [isAuthenticated, user])

  // Adicionar categoria
  async function handleAddCategory(event: FormEvent) {
    event.preventDefault()

    if (name === "") {
      toast.warning("Digite um nome para a categoria")
      return
    }

    try {
      setLoading(true)
      const response = await api.post("/categories", {
        name,
      })

      // Adicionar nova categoria à lista
      setCategories([...categories, response.data])
      toast.success("Categoria cadastrada com sucesso!")
      setName("")
    } catch (error) {
      console.error("Erro ao cadastrar categoria:", error)
      toast.error("Erro ao cadastrar categoria")
    } finally {
      setLoading(false)
    }
  }

  // Remover categoria
  async function handleRemoveCategory(id: string) {
    try {
      await api.delete(`/categories/${id}`)

      // Atualizar lista de categorias
      setCategories(categories.filter((category) => category.id !== id))
      toast.success("Categoria removida com sucesso!")
    } catch (error) {
      console.error("Erro ao remover categoria:", error)
      toast.error("Erro ao remover categoria")
    }
  }

  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (loadingAuth || !isAuthenticated || (isAuthenticated && user?.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Categorias - Pizzaria do Kassio</title>
      </Head>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Categorias</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulário de cadastro */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Cadastrar Categoria</h2>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Nome da categoria"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>
            </form>
          </div>

          {/* Lista de categorias */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Categorias Cadastradas</h2>
            {categories.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma categoria cadastrada.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <li key={category.id} className="py-3 flex justify-between items-center">
                    <span className="text-gray-800">{category.name}</span>
                    <button
                      onClick={() => handleRemoveCategory(category.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
