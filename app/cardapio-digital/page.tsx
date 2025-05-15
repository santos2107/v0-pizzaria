"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart, Home, Info, Star, Clock, Filter } from "lucide-react"
import { ProdutoCard } from "./produto-card"
import { Carrinho } from "./carrinho"
import { PizzaCustomizationModal } from "./pizza-customization-modal"
import { AddToCartModal } from "./add-to-cart-modal"
import { AuthModal } from "./auth-modal"
import { produtosData } from "@/app/produtos/data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

export default function CardapioDigitalPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos")
  const [busca, setBusca] = useState("")
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
  const [modalPizza, setModalPizza] = useState(false)
  const [modalAddToCart, setModalAddToCart] = useState(false)
  const [modalAuth, setModalAuth] = useState(false)
  const [clienteInfo, setClienteInfo] = useState<any>(null)
  const [ordenacao, setOrdenacao] = useState<string>("relevancia")
  const [filtroPreco, setFiltroPreco] = useState<[number, number] | null>(null)
  const [mostrarPromocoes, setMostrarPromocoes] = useState(false)
  const [visualizacao, setVisualizacao] = useState<"grid" | "lista">("grid")
  const [produtos, setProdutos] = useState<any[]>(produtosData) // Inicializar com dados estáticos
  const [isLoading, setIsLoading] = useState(false) // Não mostrar loading inicialmente
  const [categorias, setCategorias] = useState<string[]>([])
  const [produtosDestaque, setProdutosDestaque] = useState<any[]>([])
  const { toast } = useToast()

  // Buscar produtos da API em vez de usar dados estáticos
  useEffect(() => {
    // Buscar produtos
    const fetchProdutos = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/produtos")
        if (!response.ok) {
          throw new Error("Erro ao buscar produtos")
        }

        const responseData = await response.json()

        // Extrair o array de produtos da resposta da API
        const produtosData = responseData.data || (Array.isArray(responseData) ? responseData : [])

        // Filtrar produtos disponíveis e que devem ser mostrados no cardápio
        const produtosDisponiveis = produtosData.filter((produto) => produto.disponivel && produto.mostrarNoCardapio)

        setProdutos(produtosDisponiveis)

        // Extrair categorias únicas
        const categoriasUnicas = ["Todos", ...new Set(produtosDisponiveis.map((produto) => produto.categoria))]
        setCategorias(categoriasUnicas)

        // Definir produtos em destaque
        const destaques = produtosDisponiveis.filter((produto) => produto.emDestaque)
        setProdutosDestaque(destaques)
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os produtos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProdutos()
  }, [])

  // Verificar se há um carrinho salvo no localStorage
  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem("carrinho")
    if (carrinhoSalvo) {
      setCarrinho(JSON.parse(carrinhoSalvo))
    }

    const clienteInfoSalvo = localStorage.getItem("clienteInfo")
    if (clienteInfoSalvo) {
      setClienteInfo(JSON.parse(clienteInfoSalvo))
    }
  }, [])

  // Salvar carrinho no localStorage quando for atualizado
  useEffect(() => {
    localStorage.setItem("carrinho", JSON.stringify(carrinho))
  }, [carrinho])

  // Salvar informações do cliente no localStorage
  useEffect(() => {
    if (clienteInfo) {
      localStorage.setItem("clienteInfo", JSON.stringify(clienteInfo))
    }
  }, [clienteInfo])

  // Filtrar produtos por categoria, busca, promoções e preço
  const produtosFiltrados = produtos
    .filter((produto) => {
      const matchesCategoria = categoriaAtiva === "Todos" || produto.categoria === categoriaAtiva
      const matchesBusca =
        produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (produto.descricao && produto.descricao.toLowerCase().includes(busca.toLowerCase()))
      const matchesPromocao = !mostrarPromocoes || (produto.promocoes && produto.promocoes.some((p: any) => p.ativa))
      const matchesPreco = !filtroPreco || (produto.preco >= filtroPreco[0] && produto.preco <= filtroPreco[1])

      return (
        matchesCategoria &&
        matchesBusca &&
        produto.disponivel &&
        produto.mostrarNoCardapio !== false && // Considerar true por padrão se não estiver definido
        matchesPromocao &&
        matchesPreco
      )
    })
    .sort((a, b) => {
      switch (ordenacao) {
        case "precoAsc":
          return (a.preco || a.precoP || 0) - (b.preco || b.precoP || 0)
        case "precoDesc":
          return (b.preco || b.precoP || 0) - (a.preco || a.precoP || 0)
        case "alfabetica":
          return a.nome.localeCompare(b.nome)
        case "avaliacao":
          return (b.avaliacao || 0) - (a.avaliacao || 0)
        default: // relevancia
          return (b.emDestaque ? 1 : 0) - (a.emDestaque ? 1 : 0)
      }
    })

  // Produtos em destaque
  // const produtosDestaque = produtos.filter(
  //   (produto) => produto.emDestaque && produto.disponivel && produto.mostrarNoCardapio !== false,
  // )

  // Categorias disponíveis
  // const categorias = [
  //   "Todos",
  //   ...Array.from(new Set(produtos.filter((p) => p.mostrarNoCardapio !== false).map((produto) => produto.categoria))),
  // ]

  // Abrir modal de produto
  const abrirModalProduto = (produto: any) => {
    setProdutoSelecionado(produto)
    if (produto.categoria === "Pizzas") {
      setModalPizza(true)
    } else {
      setModalAddToCart(true)
    }
  }

  // Adicionar produto ao carrinho
  const adicionarAoCarrinho = (produto: any, quantidade: number, observacoes = "", opcoes: any = {}) => {
    const itemCarrinho = {
      id: Date.now(),
      produto,
      quantidade,
      observacoes,
      opcoes,
      precoUnitario: calcularPrecoUnitario(produto, opcoes),
      respostasPerguntas: opcoes.respostasPerguntas || [],
    }

    setCarrinho([...carrinho, itemCarrinho])
    setModalPizza(false)
    setModalAddToCart(false)
  }

  // Calcular preço unitário com base nas opções
  const calcularPrecoUnitario = (produto: any, opcoes: any) => {
    if (produto.categoria === "Pizzas") {
      const tamanho = opcoes.tamanho || "M"
      let preco = produto[`preco${tamanho}`] || 0

      // Adicionar preço da borda
      if (opcoes.borda) {
        preco += opcoes.borda.preco || 0
      }

      // Adicionar preço dos ingredientes extras
      if (opcoes.ingredientes && opcoes.ingredientes.length > 0) {
        opcoes.ingredientes.forEach((ingrediente: any) => {
          preco += ingrediente.preco || 0
        })
      }

      // Adicionar preço dos sabores adicionais
      if (opcoes.sabores && opcoes.sabores.length > 0) {
        opcoes.sabores.forEach((sabor: any) => {
          if (sabor.adicional) {
            preco += sabor.adicional
          }
        })
      }

      // Adicionar preço das respostas às perguntas
      if (opcoes.respostasPerguntas && opcoes.respostasPerguntas.length > 0) {
        opcoes.respostasPerguntas.forEach((resposta: any) => {
          if (resposta.opcoes) {
            resposta.opcoes.forEach((opcao: any) => {
              preco += opcao.preco || 0
            })
          }
        })
      }

      // Aplicar promoções se houver
      if (produto.promocoes && produto.promocoes.length > 0) {
        const hoje = new Date()
        const diaSemana = hoje.toLocaleDateString("pt-BR", { weekday: "long" }).toLowerCase()

        const promocaoAtiva = produto.promocoes.find((promocao: any) => {
          return promocao.ativa && promocao.diasSemana.includes(diaSemana)
        })

        if (promocaoAtiva) {
          const desconto = promocaoAtiva.desconto || 0
          preco = preco * (1 - desconto / 100)
        }
      }

      return preco
    }

    let preco = produto.preco || 0

    // Adicionar preço das respostas às perguntas
    if (opcoes.respostasPerguntas && opcoes.respostasPerguntas.length > 0) {
      opcoes.respostasPerguntas.forEach((resposta: any) => {
        if (resposta.opcoes) {
          resposta.opcoes.forEach((opcao: any) => {
            preco += opcao.preco || 0
          })
        }
      })
    }

    // Aplicar promoções se houver
    if (produto.promocoes && produto.promocoes.length > 0) {
      const hoje = new Date()
      const diaSemana = hoje.toLocaleDateString("pt-BR", { weekday: "long" }).toLowerCase()

      const promocaoAtiva = produto.promocoes.find((promocao: any) => {
        return promocao.ativa && promocao.diasSemana.includes(diaSemana)
      })

      if (promocaoAtiva) {
        const desconto = promocaoAtiva.desconto || 0
        preco = preco * (1 - desconto / 100)
      }
    }

    return preco
  }

  // Remover item do carrinho
  const removerDoCarrinho = (id: number) => {
    setCarrinho(carrinho.filter((item) => item.id !== id))
  }

  // Atualizar quantidade de um item no carrinho
  const atualizarQuantidade = (id: number, quantidade: number) => {
    if (quantidade < 1) return
    setCarrinho(carrinho.map((item) => (item.id === id ? { ...item, quantidade } : item)))
  }

  // Limpar carrinho
  const limparCarrinho = () => {
    setCarrinho([])
  }

  // Calcular total do carrinho
  const totalCarrinho = carrinho.reduce((total, item) => total + item.precoUnitario * item.quantidade, 0)

  // Salvar informações do cliente
  const salvarClienteInfo = (info: any) => {
    setClienteInfo(info)
    setModalAuth(false)
  }

  // Verificar se um produto tem promoção ativa hoje
  const temPromocaoAtiva = (produto: any) => {
    if (!produto.promocoes || produto.promocoes.length === 0) return false

    const hoje = new Date()
    const diaSemana = hoje.toLocaleDateString("pt-BR", { weekday: "long" }).toLowerCase()

    return produto.promocoes.some((promocao: any) => {
      return promocao.ativa && promocao.diasSemana.includes(diaSemana)
    })
  }

  // Função para renderizar o banner promocional
  const renderBannerPromocional = () => {
    return (
      <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-red-600 to-red-800 rounded-lg mb-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/delicious-pizza.png')] bg-cover bg-center"></div>
        </div>
        <div className="relative h-full flex flex-col justify-center px-6 md:px-10 text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Promoção Especial</h2>
          <p className="text-lg md:text-xl mb-4">Compre uma pizza grande e ganhe uma bebida!</p>
          <Button
            variant="outline"
            className="w-fit bg-white text-red-600 hover:bg-red-50 border-white"
            onClick={() => {
              setCategoriaAtiva("Pizzas")
              setMostrarPromocoes(true)
            }}
          >
            Aproveitar Agora
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cardápio Digital</h1>
          <p className="text-gray-500">Escolha seus produtos favoritos e faça seu pedido</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="relative" onClick={() => setCarrinhoAberto(true)}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            Carrinho
            {carrinho.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {carrinho.length}
              </span>
            )}
          </Button>
          {clienteInfo ? (
            <Button variant="ghost" onClick={() => setModalAuth(true)}>
              Olá, {clienteInfo.nome.split(" ")[0]}
            </Button>
          ) : (
            <Button variant="default" onClick={() => setModalAuth(true)}>
              Entrar
            </Button>
          )}
        </div>
      </div>

      {/* Banner promocional */}
      {renderBannerPromocional()}

      {/* Barra de busca e filtros */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-10"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={mostrarPromocoes ? "default" : "outline"}
              size="sm"
              onClick={() => setMostrarPromocoes(!mostrarPromocoes)}
            >
              <Star className="h-4 w-4 mr-1" />
              Promoções
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFiltroPreco([0, 30])}>Até R$ 30,00</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltroPreco([30, 50])}>R$ 30,00 a R$ 50,00</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltroPreco([50, 100])}>R$ 50,00 a R$ 100,00</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltroPreco([100, 1000])}>Acima de R$ 100,00</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFiltroPreco(null)}>Limpar filtro de preço</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setOrdenacao("relevancia")}>Relevância</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrdenacao("precoAsc")}>Menor preço</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrdenacao("precoDesc")}>Maior preço</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrdenacao("alfabetica")}>Ordem alfabética</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOrdenacao("avaliacao")}>Melhor avaliação</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisualizacao(visualizacao === "grid" ? "lista" : "grid")}
            >
              {visualizacao === "grid" ? "Lista" : "Grid"}
            </Button>
          </div>
        </div>

        {filtroPreco && (
          <div className="flex items-center">
            <Badge variant="outline" className="flex gap-1 items-center">
              Preço: R$ {filtroPreco[0].toFixed(2)} - R$ {filtroPreco[1].toFixed(2)}
              <button className="ml-1 text-gray-500 hover:text-gray-700" onClick={() => setFiltroPreco(null)}>
                ×
              </button>
            </Badge>
          </div>
        )}
      </div>

      <Tabs defaultValue="destaques" className="w-full">
        <ScrollArea className="w-full">
          <TabsList className="mb-6 flex h-auto w-max">
            <TabsTrigger value="destaques">Destaques</TabsTrigger>
            {categorias.map((categoria) => (
              <TabsTrigger key={categoria} value={categoria} onClick={() => setCategoriaAtiva(categoria)}>
                {categoria}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value="destaques" className="space-y-6">
          <h2 className="text-2xl font-bold">Produtos em Destaque</h2>
          {visualizacao === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtosDestaque.length > 0 ? (
                produtosDestaque.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    produto={{
                      ...produto,
                      emPromocao: temPromocaoAtiva(produto),
                    }}
                    onClick={() => abrirModalProduto(produto)}
                    visualizacao="grid"
                  />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 py-10">
                  Nenhum produto em destaque disponível no momento.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {produtosDestaque.length > 0 ? (
                produtosDestaque.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    produto={{
                      ...produto,
                      emPromocao: temPromocaoAtiva(produto),
                    }}
                    onClick={() => abrirModalProduto(produto)}
                    visualizacao="lista"
                  />
                ))
              ) : (
                <p className="text-center text-gray-500 py-10">Nenhum produto em destaque disponível no momento.</p>
              )}
            </div>
          )}
        </TabsContent>

        {categorias.map((categoria) => (
          <TabsContent key={categoria} value={categoria} className="space-y-6">
            <h2 className="text-2xl font-bold">{categoria === "Todos" ? "Todos os Produtos" : categoria}</h2>

            {produtosFiltrados.length > 0 ? (
              <>
                {visualizacao === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {produtosFiltrados.map((produto) => (
                      <ProdutoCard
                        key={produto.id}
                        produto={{
                          ...produto,
                          emPromocao: temPromocaoAtiva(produto),
                        }}
                        onClick={() => abrirModalProduto(produto)}
                        visualizacao="grid"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {produtosFiltrados.map((produto) => (
                      <ProdutoCard
                        key={produto.id}
                        produto={{
                          ...produto,
                          emPromocao: temPromocaoAtiva(produto),
                        }}
                        onClick={() => abrirModalProduto(produto)}
                        visualizacao="lista"
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-10">
                <Info className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">Nenhum produto encontrado com os filtros aplicados.</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setBusca("")
                    setFiltroPreco(null)
                    setMostrarPromocoes(false)
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Seção de informações */}
      <div className="mt-12 mb-6">
        <Separator className="my-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Clock className="h-8 w-8 mb-2 text-red-600" />
              <h3 className="text-lg font-bold mb-1">Horário de Funcionamento</h3>
              <p className="text-gray-500">Segunda a Sexta: 18h às 23h</p>
              <p className="text-gray-500">Sábado e Domingo: 18h às 00h</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Home className="h-8 w-8 mb-2 text-red-600" />
              <h3 className="text-lg font-bold mb-1">Endereço</h3>
              <p className="text-gray-500">Rua das Pizzas, 123</p>
              <p className="text-gray-500">Centro - Cidade</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Info className="h-8 w-8 mb-2 text-red-600" />
              <h3 className="text-lg font-bold mb-1">Informações</h3>
              <p className="text-gray-500">Entrega: 30-45 minutos</p>
              <p className="text-gray-500">Taxa de entrega: Grátis (pedido mínimo R$ 30)</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Carrinho */}
      <Carrinho
        aberto={carrinhoAberto}
        setAberto={setCarrinhoAberto}
        itens={carrinho}
        removerItem={removerDoCarrinho}
        atualizarQuantidade={atualizarQuantidade}
        limparCarrinho={limparCarrinho}
        total={totalCarrinho}
        clienteInfo={clienteInfo}
        abrirModalAuth={() => setModalAuth(true)}
      />

      {/* Modal de personalização de pizza */}
      {modalPizza && produtoSelecionado && (
        <PizzaCustomizationModal
          isOpen={modalPizza}
          produto={produtoSelecionado}
          onClose={() => setModalPizza(false)}
          onAddToCart={(produto) =>
            adicionarAoCarrinho(produtoSelecionado, produto.quantidade || 1, produto.observacoes || "", {
              tamanho: produto.tamanho,
              borda: produto.borda,
              adicionais: produto.adicionais,
              sabores: produto.meiaPizza ? [produtoSelecionado, produto.segundaMetade] : [produtoSelecionado],
              respostasPerguntas: produto.respostasPerguntas || [],
            })
          }
        />
      )}

      {/* Modal de adição ao carrinho para produtos não-pizza */}
      {modalAddToCart && produtoSelecionado && (
        <AddToCartModal
          produto={produtoSelecionado}
          onClose={() => setModalAddToCart(false)}
          onAddToCart={(quantidade, observacoes, respostasPerguntas) =>
            adicionarAoCarrinho(produtoSelecionado, quantidade, observacoes, { respostasPerguntas })
          }
        />
      )}

      {/* Modal de autenticação */}
      {modalAuth && <AuthModal onClose={() => setModalAuth(false)} onSave={salvarClienteInfo} />}
    </div>
  )
}
