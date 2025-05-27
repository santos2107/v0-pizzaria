"use client"

import type React from "react"

import { useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loader2, Plus, Search, MoreVertical, Edit, Trash2, Pizza, Coffee, GlassWater, IceCream2 } from "lucide-react"
import { toast } from "react-hot-toast"

// Tipos
type Product = {
  id: string
  name: string
  price: number
  description: string
  category: string
  available: boolean
  image_url?: string
}

type Category = {
  id: string
  name: string
  icon: JSX.Element
}

export default function ProductsPage() {
  const { user, isAuthenticated, loadingAuth } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false)
  const router = useRouter()

  // Proteção de rota
  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      toast.error("Faça login para acessar esta página")
      router.push("/")
    } else if (!loadingAuth && isAuthenticated && user?.role !== "admin") {
      toast.error("Acesso restrito para administradores")
      router.push("/dashboard")
    }
  }, [isAuthenticated, loadingAuth, user, router])

  // Carregar produtos
  useEffect(() => {
    if (isAuthenticated && !loadingAuth && user?.role === "admin") {
      loadProducts()
    }
  }, [isAuthenticated, loadingAuth, user])

  // Dados simulados de categorias
  const categories: Category[] = [
    { id: "pizzas", name: "Pizzas", icon: <Pizza className="h-4 w-4" /> },
    { id: "bebidas", name: "Bebidas", icon: <GlassWater className="h-4 w-4" /> },
    { id: "cafes", name: "Cafés", icon: <Coffee className="h-4 w-4" /> },
    { id: "sobremesas", name: "Sobremesas", icon: <IceCream2 className="h-4 w-4" /> },
  ]

  // Carregar produtos (simulado)
  async function loadProducts() {
    setLoading(true)
    try {
      // Simulando carregamento
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Dados simulados
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Pizza Margherita",
          price: 35.9,
          description: "Molho de tomate, mussarela, tomate e manjericão",
          category: "pizzas",
          available: true,
          image_url: "/placeholder.svg?height=200&width=200&query=pizza",
        },
        {
          id: "2",
          name: "Pizza Calabresa",
          price: 39.9,
          description: "Molho de tomate, mussarela e calabresa",
          category: "pizzas",
          available: true,
          image_url: "/placeholder.svg?height=200&width=200&query=pepperoni+pizza",
        },
        {
          id: "3",
          name: "Pizza Frango com Catupiry",
          price: 42.9,
          description: "Molho de tomate, mussarela, frango desfiado e catupiry",
          category: "pizzas",
          available: true,
          image_url: "/placeholder.svg?height=200&width=200&query=chicken+pizza",
        },
        {
          id: "4",
          name: "Coca-Cola 2L",
          price: 12.9,
          description: "Refrigerante Coca-Cola 2 litros",
          category: "bebidas",
          available: true,
          image_url: "/placeholder.svg?height=200&width=200&query=coca+cola",
        },
        {
          id: "5",
          name: "Guaraná Antarctica 2L",
          price: 10.9,
          description: "Refrigerante Guaraná Antarctica 2 litros",
          category: "bebidas",
          available: true,
          image_url: "/placeholder.svg?height=200&width=200&query=guarana",
        },
        {
          id: "6",
          name: "Pudim",
          price: 8.9,
          description: "Pudim de leite condensado",
          category: "sobremesas",
          available: false,
          image_url: "/placeholder.svg?height=200&width=200&query=pudding",
        },
        {
          id: "7",
          name: "Café Expresso",
          price: 4.5,
          description: "Café expresso tradicional",
          category: "cafes",
          available: true,
          image_url: "/placeholder.svg?height=200&width=200&query=espresso",
        },
      ]

      setProducts(mockProducts)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
      toast.error("Erro ao carregar produtos")
    } finally {
      setLoading(false)
    }
  }

  // Filtrar produtos
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Alternar disponibilidade do produto
  function toggleProductAvailability(productId: string) {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, available: !product.available } : product,
      ),
    )
    toast.success("Status do produto atualizado!")
  }

  // Excluir produto
  function handleDeleteProduct(productId: string) {
    setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId))
    toast.success("Produto excluído com sucesso!")
  }

  // Novo produto (simulado)
  function handleAddProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const price = Number.parseFloat(formData.get("price") as string)
    const description = formData.get("description") as string
    const category = formData.get("category") as string

    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      price,
      description,
      category,
      available: true,
      image_url: `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(name)}`,
    }

    setProducts((prevProducts) => [...prevProducts, newProduct])
    setIsNewProductDialogOpen(false)
    toast.success("Produto adicionado com sucesso!")
  }

  // Formatação de preço
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Renderização condicional
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          <span className="text-gray-600">Verificando autenticação...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || (user && user.role !== "admin")) {
    return null // Será redirecionado pelo useEffect
  }

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-500">Gerencie o catálogo de produtos da pizzaria</p>
          </div>
          <Button
            className="mt-4 md:mt-0 bg-orange-500 hover:bg-orange-600"
            onClick={() => setIsNewProductDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          {/* Sidebar de filtros */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Categorias</h3>
                  <div className="space-y-1">
                    <div
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        selectedCategory === "all" ? "bg-orange-100 text-orange-800" : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedCategory("all")}
                    >
                      <span>Todas as categorias</span>
                    </div>
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={`flex items-center p-2 rounded-md cursor-pointer ${
                          selectedCategory === category.id ? "bg-orange-100 text-orange-800" : "hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.icon}
                        <span className="ml-2">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de produtos:</span>
                  <span className="font-medium">{products.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disponíveis:</span>
                  <span className="font-medium">{products.filter((p) => p.available).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Indisponíveis:</span>
                  <span className="font-medium">{products.filter((p) => !p.available).length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de produtos */}
          <div>
            <Tabs defaultValue="grid" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="grid">Grade</TabsTrigger>
                  <TabsTrigger value="list">Lista</TabsTrigger>
                </TabsList>
                <div className="text-sm text-gray-500">
                  {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""} encontrado
                  {filteredProducts.length !== 1 ? "s" : ""}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                    <span className="text-gray-600">Carregando produtos...</span>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <Pizza className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum produto encontrado</h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? `Não encontramos produtos que correspondam a "${searchTerm}"`
                      : "Não há produtos nesta categoria"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Visualização em grade */}
                  <TabsContent value="grid" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <div className="aspect-video relative bg-gray-100">
                            {product.image_url ? (
                              <img
                                src={product.image_url || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <Pizza className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Badge
                                variant="outline"
                                className={
                                  product.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }
                              >
                                {product.available ? "Disponível" : "Indisponível"}
                              </Badge>
                            </div>
                          </div>
                          <CardHeader className="p-4">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{product.name}</CardTitle>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Ações</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => toast.success("Editar " + product.name)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleProductAvailability(product.id)}>
                                    {product.available ? (
                                      <>
                                        <span className="text-red-600">Marcar como indisponível</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-green-600">Marcar como disponível</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <Badge className="mt-1">{categories.find((c) => c.id === product.category)?.name}</Badge>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
                          </CardContent>
                          <CardFooter className="p-4 pt-0 flex justify-between items-center">
                            <p className="font-bold text-lg">{formatCurrency(product.price)}</p>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`available-${product.id}`} className="text-sm">
                                {product.available ? "Disponível" : "Indisponível"}
                              </Label>
                              <Switch
                                id={`available-${product.id}`}
                                checked={product.available}
                                onCheckedChange={() => toggleProductAvailability(product.id)}
                              />
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Visualização em lista */}
                  <TabsContent value="list" className="mt-0">
                    <div className="bg-white rounded-lg border overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 p-4 font-medium text-gray-500 border-b">
                        <div className="col-span-5">Produto</div>
                        <div className="col-span-2">Categoria</div>
                        <div className="col-span-2">Preço</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1"></div>
                      </div>
                      {filteredProducts.map((product) => (
                        <div key={product.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b">
                          <div className="col-span-5 flex items-center">
                            <div className="w-10 h-10 rounded bg-gray-100 mr-3 overflow-hidden flex-shrink-0">
                              {product.image_url ? (
                                <img
                                  src={product.image_url || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Pizza className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{product.name}</h3>
                              <p className="text-gray-500 text-sm line-clamp-1">{product.description}</p>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Badge variant="outline">{categories.find((c) => c.id === product.category)?.name}</Badge>
                          </div>
                          <div className="col-span-2 font-medium">{formatCurrency(product.price)}</div>
                          <div className="col-span-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`list-available-${product.id}`}
                                checked={product.available}
                                onCheckedChange={() => toggleProductAvailability(product.id)}
                              />
                              <Label htmlFor={`list-available-${product.id}`} className="text-sm">
                                {product.available ? "Disponível" : "Indisponível"}
                              </Label>
                            </div>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Ações</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toast.success("Editar " + product.name)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleProductAvailability(product.id)}>
                                  {product.available ? (
                                    <>
                                      <span className="text-red-600">Marcar como indisponível</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-green-600">Marcar como disponível</span>
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </div>
      </div>

      {/* Modal de novo produto */}
      <Dialog open={isNewProductDialogOpen} onOpenChange={setIsNewProductDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
            <DialogDescription>Adicione um novo produto ao catálogo da pizzaria.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProduct}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do produto</Label>
                <Input id="name" name="name" placeholder="Ex: Pizza Margherita" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="Ex: 35.90" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Ex: Molho de tomate, mussarela, tomate e manjericão"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  name="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="new-product-available" defaultChecked />
                <Label htmlFor="new-product-available">Disponível para venda</Label>
              </div>
              <div className="space-y-2">
                <Label>Imagem do produto</Label>
                <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center">
                    <Plus className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Clique para fazer upload da imagem</span>
                    <span className="text-xs text-gray-400 mt-1">(PNG, JPG ou WEBP, máximo de 5MB)</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewProductDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Adicionar Produto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
