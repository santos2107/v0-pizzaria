"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, RefreshCw } from "lucide-react"
import Link from "next/link"
import { ProdutoCard } from "./produto-card"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function ProdutosPage() {
  // Estado para armazenar os produtos
  const [produtos, setProdutos] = useState([])
  const { toast } = useToast()

  // Adicionar estado para subcategoria
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas")
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState("Todas")
  const [statusFiltro, setStatusFiltro] = useState("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categorias, setCategorias] = useState(["Todas"])

  // Atualizar produtos quando a página for carregada ou quando produtosData mudar
  const fetchProdutos = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Adicionar timestamp para evitar cache
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/produtos?_=${timestamp}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.json()

      if (!responseData.success) {
        throw new Error(responseData.error || "Erro desconhecido ao buscar produtos")
      }

      // Extrair o array de produtos da resposta da API
      const produtosData = responseData.data || []

      setProdutos(produtosData)

      // Extrair categorias únicas
      const categoriasUnicas = ["Todas", ...new Set(produtosData.map((produto) => produto.categoria))]
      setCategorias(categoriasUnicas)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      setError(error.message || "Erro ao buscar produtos")
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar os produtos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProdutos()
  }, [])

  // Adicionar subcategorias de bebidas
  const subcategoriasBebidas = [
    "Todas",
    "Refrigerantes",
    "Águas",
    "Sucos",
    "Cervejas",
    "Vinhos",
    "Drinks",
    "Cafés",
    "Chás",
    "Energéticos",
    "Outros",
  ]

  // Função para excluir produto
  const excluirProduto = (id: number) => {
    const novosProdutos = produtos.filter((produto) => produto.id !== id)
    setProdutos(novosProdutos)

    toast({
      title: "Produto excluído",
      description: "O produto foi excluído com sucesso.",
      variant: "default",
    })
  }

  // Função para atualizar disponibilidade
  const atualizarDisponibilidade = (id: number, disponivel: boolean) => {
    const novosProdutos = produtos.map((produto) => (produto.id === id ? { ...produto, disponivel } : produto))
    setProdutos(novosProdutos)

    toast({
      title: disponivel ? "Produto ativado" : "Produto desativado",
      description: `O status do produto foi atualizado com sucesso.`,
      variant: "default",
    })
  }

  // Atualizar a lógica de filtragem para incluir subcategoria
  const produtosFiltrados = produtos.filter((produto) => {
    // Filtro de busca por texto
    const matchesSearch =
      produto?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto?.descricao?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro por categoria
    const matchesCategoria = categoriaFiltro === "Todas" || produto?.categoria === categoriaFiltro

    // Filtro por subcategoria (apenas para bebidas)
    const matchesSubcategoria =
      subcategoriaFiltro === "Todas" || produto?.categoria !== "Bebidas" || produto?.subcategoria === subcategoriaFiltro

    // Filtro por status
    const matchesStatus =
      statusFiltro === "todos" ||
      (statusFiltro === "disponivel" && produto?.disponivel) ||
      (statusFiltro === "indisponivel" && !produto?.disponivel)

    return matchesSearch && matchesCategoria && matchesSubcategoria && matchesStatus
  })

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button asChild>
          <Link href="/produtos/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={categoriaFiltro}
              onValueChange={(value) => {
                setCategoriaFiltro(value)
                setSubcategoriaFiltro("Todas")
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {categoriaFiltro === "Bebidas" && (
              <Select value={subcategoriaFiltro} onValueChange={setSubcategoriaFiltro}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  {subcategoriasBebidas.map((subcategoria) => (
                    <SelectItem key={subcategoria} value={subcategoria}>
                      {subcategoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="indisponivel">Indisponível</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="flex justify-center mb-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p>Carregando produtos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-600 mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchProdutos} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : produtosFiltrados.length > 0 ? (
          produtosFiltrados.map((produto) => (
            <ProdutoCard
              key={produto.id}
              produto={produto}
              onDelete={() => excluirProduto(produto.id)}
              onToggleDisponibilidade={(disponivel) => atualizarDisponibilidade(produto.id, disponivel)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">Nenhum produto encontrado com os filtros aplicados.</div>
        )}
      </div>
    </div>
  )
}
