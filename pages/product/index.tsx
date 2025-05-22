"use client"

import type React from "react"

import { useState, useEffect, useContext, type FormEvent } from "react"
import { AuthContext } from "@/contexts/auth-context"
import { useRouter } from "next/router"
import Head from "next/head"
import { toast } from "react-toastify"
import { api } from "@/services/api"
import { supabase } from "@/lib/supabaseClient"

type Category = {
  id: string
  name: string
}

export default function ProductPage() {
  const { user, isAuthenticated, loadingAuth } = useContext(AuthContext)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const router = useRouter()

  // Proteção de rota no cliente
  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      router.push("/")
      return
    }

    // Verificar se o usuário é admin
    if (user && user.role !== "admin") {
      toast.error("Acesso restrito a administradores")
      router.push("/dashboard")
    }
  }, [isAuthenticated, loadingAuth, router, user])

  // Carregar categorias
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true)
        const response = await api.get("/categories")
        setCategories(response.data)
      } catch (error) {
        console.error("Erro ao buscar categorias:", error)
        toast.error("Erro ao carregar categorias")
      } finally {
        setLoadingCategories(false)
      }
    }

    if (isAuthenticated && user?.role === "admin") {
      loadCategories()
    }
  }, [isAuthenticated, user])

  // Manipular seleção de imagem
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return
    }

    const file = e.target.files[0]
    if (!file) {
      return
    }

    if (file.type === "image/jpeg" || file.type === "image/png") {
      setImageFile(file)
      setAvatarUrl(URL.createObjectURL(file))
    }
  }

  // Enviar formulário
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!name || !price || !description || !categoryId) {
      toast.warning("Preencha todos os campos!")
      return
    }

    try {
      setLoading(true)

      let imageUrl = ""

      // Upload da imagem para o Supabase Storage
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, imageFile)

        if (uploadError) {
          throw uploadError
        }

        // Obter URL pública da imagem
        const { data: publicUrlData } = supabase.storage.from("product-images").getPublicUrl(uploadData.path)

        imageUrl = publicUrlData.publicUrl
      }

      // Criar produto na API
      const productData = {
        name,
        price: Number.parseFloat(price),
        description,
        category_id: categoryId,
        banner: imageUrl,
      }

      await api.post("/products", productData)

      toast.success("Produto cadastrado com sucesso!")

      // Limpar formulário
      setName("")
      setPrice("")
      setDescription("")
      setCategoryId("")
      setAvatarUrl("")
      setImageFile(null)
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error)
      toast.error("Erro ao cadastrar produto")
    } finally {
      setLoading(false)
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

  // Se não estiver autenticado ou não for admin, não renderiza nada
  if (!isAuthenticated || (user && user.role !== "admin")) {
    return null
  }

  return (
    <>
      <Head>
        <title>Novo Produto - Pizzaria do Kassio</title>
      </Head>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Novo Produto</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do produto</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Nome do produto"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Preço do produto"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Descreva seu produto..."
                rows={4}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              {loadingCategories ? (
                <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={loading}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do produto</label>
              <div className="flex items-center space-x-6">
                <div className="w-32 h-32 relative border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl || "/placeholder.svg"}
                      alt="Imagem do produto"
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <span className="text-gray-500 text-sm text-center">Nenhuma imagem selecionada</span>
                  )}
                </div>
                <label className="cursor-pointer bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-md">
                  Selecionar imagem
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handleFile}
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
