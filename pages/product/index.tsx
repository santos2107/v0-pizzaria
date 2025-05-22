"use client"

import { useState, useEffect, type FormEvent, useContext, type ChangeEvent } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { toast } from "react-toastify"
import { FiUpload } from "react-icons/fi"
import { AuthContext } from "@/contexts/auth-context"
import { api } from "@/services/api"
import { supabase } from "@/lib/supabaseClient"

type CategoryProps = {
  id: string
  name: string
}

export default function Product() {
  const { user, isAuthenticated, loadingAuth } = useContext(AuthContext)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [imageAvatar, setImageAvatar] = useState<File | null>(null)
  const [categories, setCategories] = useState<CategoryProps[]>([])
  const [categorySelected, setCategorySelected] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
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

  // Carregar categorias usando Supabase JS diretamente
  useEffect(() => {
    async function loadCategories() {
      if (isAuthenticated && user?.role === "admin") {
        try {
          setLoadingCategories(true)

          // Usando Supabase JS diretamente
          const { data, error } = await supabase.from("categories").select("id, name")

          if (error) {
            throw error
          }

          setCategories(data || [])

          if (data && data.length > 0) {
            setCategorySelected(data[0].id)
          }
        } catch (error) {
          console.error("Erro ao buscar categorias:", error)
          toast.error("Erro ao carregar categorias")
        } finally {
          setLoadingCategories(false)
        }
      }
    }

    loadCategories()
  }, [isAuthenticated, user])

  // Selecionar imagem
  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return
    }

    const image = e.target.files[0]

    if (!image) {
      return
    }

    if (image.type === "image/jpeg" || image.type === "image/png") {
      setImageAvatar(image)
      setAvatarUrl(URL.createObjectURL(image))
    } else {
      toast.error("Tipo de imagem não suportado. Envie uma imagem JPEG ou PNG")
      setImageAvatar(null)
      setAvatarUrl("")
    }
  }

  // Cadastrar produto
  async function handleRegister(event: FormEvent) {
    event.preventDefault()

    if (name === "" || price === "" || description === "" || !categorySelected) {
      toast.warning("Preencha todos os campos!")
      return
    }

    if (!imageAvatar) {
      toast.error("Selecione uma imagem para o produto.")
      return
    }

    try {
      setLoading(true)

      // Upload para Supabase Storage
      const file = imageAvatar
      const fileName = `${Date.now()}_${file.name.replace(/\s/g, "_")}`
      const bucketName = "product-banners" // Crie este bucket no Supabase Storage
      const filePath = `${fileName}` // Pode adicionar pastas se quiser: `public/${fileName}`

      const { error: uploadError, data: uploadData } = await supabase.storage.from(bucketName).upload(filePath, file)

      if (uploadError) {
        toast.error("Falha no upload da imagem: " + uploadError.message)
        setLoading(false)
        return
      }

      // Obter a URL pública
      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)

      if (!urlData || !urlData.publicUrl) {
        toast.error("Não foi possível obter a URL da imagem.")
        setLoading(false)
        return
      }
      const bannerUrl = urlData.publicUrl

      // Converter preço para número
      const priceNumber = Number.parseFloat(price.replace(",", "."))
      if (isNaN(priceNumber)) {
        toast.error("Preço inválido. Use apenas números e ponto ou vírgula para decimais.")
        setLoading(false)
        return
      }

      // Criar objeto de dados do produto (JSON em vez de FormData)
      const productData = {
        name,
        price: priceNumber,
        description,
        category_id: categorySelected,
        banner: bannerUrl,
      }

      // Enviar dados para a API
      const response = await api.post("/product", productData)

      toast.success("Produto cadastrado com sucesso!")

      // Limpar formulário
      setName("")
      setPrice("")
      setDescription("")
      setImageAvatar(null)
      setAvatarUrl("")
    } catch (error: any) {
      console.error("Erro ao cadastrar produto:", error)
      toast.error("Erro ao cadastrar produto: " + (error.message || "Erro desconhecido"))
    } finally {
      setLoading(false)
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
        <title>Novo Produto - Pizzaria do Kassio</title>
      </Head>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Novo Produto</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleRegister}>
            <div className="mb-4 flex justify-center">
              <label className="w-full max-w-xs flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                <span className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-50 text-orange-500">
                  <FiUpload size={24} />
                </span>
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {avatarUrl ? "Trocar imagem" : "Adicionar imagem"}
                </span>
                <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFile} />

                {avatarUrl && (
                  <div className="mt-4 w-full">
                    <img
                      src={avatarUrl || "/placeholder.svg"}
                      alt="Imagem do produto"
                      className="w-full h-auto max-h-40 object-contain rounded-md"
                    />
                  </div>
                )}
              </label>
            </div>

            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Produto
              </label>
              <input
                type="text"
                id="name"
                placeholder="Nome do produto"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Preço
              </label>
              <input
                type="text"
                id="price"
                placeholder="Preço do produto (ex: 29,90)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                placeholder="Descreva seu produto..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              {loadingCategories ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-500">Carregando categorias...</span>
                </div>
              ) : (
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={categorySelected || ""}
                  onChange={(e) => setCategorySelected(e.target.value)}
                >
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Nenhuma categoria encontrada</option>
                  )}
                </select>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || loadingCategories}
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
