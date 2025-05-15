"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Check } from "lucide-react"
import Image from "next/image"
import type { Produto } from "../produtos/data"
import { MeiaPizzaModal } from "../pedidos/meia-pizza-modal"

interface AdicionarProdutosModalProps {
  isOpen: boolean
  onClose: () => void
  onAddProdutos: (produtos: any[]) => void
  mesa: any
  mesaId: string
}

export function AdicionarProdutosModal({ isOpen, onClose, onAddProdutos, mesa, mesaId }: AdicionarProdutosModalProps) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("Todos")
  const [termoBusca, setTermoBusca] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [produtosSelecionados, setProdutosSelecionados] = useState<any[]>([])

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [quantidade, setQuantidade] = useState(1)
  const [observacoes, setObservacoes] = useState("")
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>("")
  const [meiaPizza, setMeiaPizza] = useState(false)
  const [segundaMetade, setSegundaMetade] = useState<Produto | null>(null)
  const [showMeiaPizzaModal, setShowMeiaPizzaModal] = useState(false)

  // Opções para bordas e adicionais
  const [bordaSelecionada, setBordaSelecionada] = useState<any>(null)
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<any[]>([])

  // Bordas disponíveis para pizzas
  const bordasDisponiveis = [
    { id: 1, nome: "Sem Borda", preco: 0, disponivel: true },
    { id: 2, nome: "Catupiry", preco: 5, disponivel: true },
    { id: 3, nome: "Cheddar", preco: 5, disponivel: true },
    { id: 4, nome: "Chocolate", preco: 7, disponivel: true },
    { id: 5, nome: "Cream Cheese", preco: 6, disponivel: true },
  ]

  // Adicionais disponíveis para pizzas
  const adicionaisDisponiveis = [
    { id: 1, nome: "Bacon Extra", preco: 4, disponivel: true },
    { id: 2, nome: "Catupiry Extra", preco: 3, disponivel: true },
    { id: 3, nome: "Cheddar Extra", preco: 3, disponivel: true },
    { id: 4, nome: "Calabresa Extra", preco: 3, disponivel: true },
    { id: 5, nome: "Mussarela Extra", preco: 3, disponivel: true },
    { id: 6, nome: "Orégano Extra", preco: 1, disponivel: true },
    { id: 7, nome: "Parmesão Extra", preco: 4, disponivel: true },
    { id: 8, nome: "Tomate Extra", preco: 2, disponivel: true },
  ]

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/produtos")
        const data = await response.json()

        // Extrair o array de produtos da resposta da API
        const produtosArray = data.data || (Array.isArray(data) ? data : [])

        // Adicionar bordas e adicionais aos produtos de pizza
        const produtosProcessados = produtosArray.map((produto: Produto) => {
          if (produto.categoria === "Pizza" || produto.categoria === "Pizzas") {
            return {
              ...produto,
              bordas: bordasDisponiveis,
              adicionais: adicionaisDisponiveis,
            }
          }
          return produto
        })

        setProdutos(produtosProcessados)

        // Extrair categorias únicas
        const uniqueCategorias = ["Todos", ...new Set(produtosProcessados.map((produto: Produto) => produto.categoria))]
        setCategorias(uniqueCategorias)
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
        // Em caso de erro, inicializar com array vazio
        setProdutos([])
        setCategorias(["Todos"])
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchProdutos()
      resetForm()
    }
  }, [isOpen])

  // Adicione ao resetForm
  const resetForm = () => {
    setProdutoSelecionado(null)
    setQuantidade(1)
    setObservacoes("")
    setTamanhoSelecionado("")
    setMeiaPizza(false)
    setSegundaMetade(null)
    setCategoriaSelecionada("Todos")
    setTermoBusca("")
    setBordaSelecionada(null)
    setAdicionaisSelecionados([])
  }

  const handleSelectProduto = (produto: Produto) => {
    setProdutoSelecionado(produto)

    // Se o produto for uma pizza, selecione o primeiro tamanho disponível por padrão
    if (produto.categoria === "Pizza" && produto.precos && Object.keys(produto.precos).length > 0) {
      setTamanhoSelecionado(Object.keys(produto.precos)[0])
    }
  }

  // Adicione esta função para alternar a seleção de adicionais
  const toggleAdicional = (adicional: any) => {
    if (adicionaisSelecionados.some((a) => a.id === adicional.id)) {
      setAdicionaisSelecionados(adicionaisSelecionados.filter((a) => a.id !== adicional.id))
    } else {
      setAdicionaisSelecionados([...adicionaisSelecionados, adicional])
    }
  }

  // Modifique a função handleAddProduct para incluir as novas opções
  const handleAddProduct = () => {
    if (!produtoSelecionado) return

    // Para produtos que não são pizza, não exigimos tamanho
    if (isPizza && !tamanhoSelecionado) return

    let precoUnitario = isPizza ? produtoSelecionado.precos?.[tamanhoSelecionado] || 0 : produtoSelecionado.preco || 0

    // Adicionar preço da borda
    if (bordaSelecionada) {
      precoUnitario += bordaSelecionada.preco || 0
    }

    // Adicionar preço dos adicionais
    adicionaisSelecionados.forEach((adicional) => {
      precoUnitario += adicional.preco || 0
    })

    const novoProduto = {
      id: Date.now().toString(),
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      tamanho: isPizza ? tamanhoSelecionado : null,
      quantidade,
      precoUnitario,
      observacoes,
      meiaPizza: isPizza ? meiaPizza : false,
      segundaMetade: segundaMetade
        ? {
            id: segundaMetade.id,
            nome: segundaMetade.nome,
            imagem: segundaMetade.imagem,
          }
        : null,
      borda: bordaSelecionada,
      adicionais: adicionaisSelecionados,
    }

    setProdutosSelecionados([...produtosSelecionados, novoProduto])
    resetForm()
  }

  const handleSelectSegundaMetade = (pizza: Produto) => {
    setSegundaMetade(pizza)
    setShowMeiaPizzaModal(false)
  }

  const handleFinalizarPedido = () => {
    if (produtosSelecionados.length === 0) return
    onAddProdutos(produtosSelecionados)
  }

  const removerProduto = (id: string) => {
    setProdutosSelecionados(produtosSelecionados.filter((p) => p.id !== id))
  }

  // Garantindo que produtos é sempre um array antes de chamar filter
  const produtosFiltrados = Array.isArray(produtos)
    ? produtos.filter((produto) => {
        const matchCategoria = categoriaSelecionada === "Todos" || produto.categoria === categoriaSelecionada
        const matchBusca =
          produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
          produto.descricao.toLowerCase().includes(termoBusca.toLowerCase())
        return matchCategoria && matchBusca
      })
    : []

  const isPizza = produtoSelecionado?.categoria === "Pizza"

  // Calcular total do pedido
  const totalPedido = produtosSelecionados.reduce((total, produto) => {
    return total + produto.precoUnitario * produto.quantidade
  }, 0)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Produtos à Mesa {mesaId}</DialogTitle>
          </DialogHeader>

          {!produtoSelecionado ? (
            <div className="space-y-4">
              {produtosSelecionados.length > 0 && (
                <div className="border rounded-md p-3 space-y-3">
                  <h3 className="font-medium">Produtos Selecionados</h3>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {produtosSelecionados.map((produto) => (
                      <div key={produto.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <div className="font-medium">{produto.nome}</div>
                          <div className="text-sm text-gray-500">
                            {produto.quantidade}x {produto.tamanho && `(${produto.tamanho})`} - R${" "}
                            {produto.precoUnitario.toFixed(2)}
                          </div>
                          {produto.borda && <div className="text-xs text-gray-500">Borda: {produto.borda.nome}</div>}
                          {produto.adicionais && produto.adicionais.length > 0 && (
                            <div className="text-xs text-gray-500">
                              Adicionais: {produto.adicionais.map((a) => a.nome).join(", ")}
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removerProduto(produto.id)}>
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 font-medium">
                    <span>Total:</span>
                    <span>R$ {totalPedido.toFixed(2)}</span>
                  </div>
                  <Button className="w-full" onClick={handleFinalizarPedido}>
                    Finalizar Pedido
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar produtos..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="flex-1"
                />
                <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
                  <SelectTrigger className="w-[180px]">
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
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
                </div>
              ) : produtosFiltrados.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-gray-500">Nenhum produto encontrado</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid grid-cols-1 gap-4">
                    {produtosFiltrados.map((produto) => (
                      <Card
                        key={produto.id}
                        className="cursor-pointer transition-all hover:shadow-md"
                        onClick={() => handleSelectProduto(produto)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          {produto.imagem && (
                            <div className="relative h-16 w-16 rounded-md overflow-hidden">
                              <Image
                                src={produto.imagem || "/placeholder.svg"}
                                alt={produto.nome}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-medium">{produto.nome}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{produto.descricao}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {produtoSelecionado.imagem && (
                  <div className="relative h-20 w-20 rounded-md overflow-hidden">
                    <Image
                      src={produtoSelecionado.imagem || "/placeholder.svg"}
                      alt={produtoSelecionado.nome}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium">{produtoSelecionado.nome}</h3>
                  <p className="text-sm text-gray-500">{produtoSelecionado.descricao}</p>
                </div>
              </div>

              {isPizza && produtoSelecionado.precos && (
                <div className="space-y-2">
                  <Label>Tamanho</Label>
                  <Select value={tamanhoSelecionado} onValueChange={setTamanhoSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(produtoSelecionado.precos).map(([tamanho, preco]) => (
                        <SelectItem key={tamanho} value={tamanho}>
                          {tamanho} - R$ {preco.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isPizza && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="meia-pizza"
                    checked={meiaPizza}
                    onCheckedChange={(checked) => {
                      setMeiaPizza(checked)
                      if (checked) {
                        setShowMeiaPizzaModal(true)
                      } else {
                        setSegundaMetade(null)
                      }
                    }}
                  />
                  <Label htmlFor="meia-pizza">Meia Pizza</Label>
                </div>
              )}

              {meiaPizza && segundaMetade && (
                <div className="p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {segundaMetade.imagem && (
                        <div className="relative h-12 w-12 rounded-md overflow-hidden">
                          <Image
                            src={segundaMetade.imagem || "/placeholder.svg"}
                            alt={segundaMetade.nome}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium">Segunda metade: {segundaMetade.nome}</h4>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowMeiaPizzaModal(true)}>
                      Trocar
                    </Button>
                  </div>
                </div>
              )}

              {isPizza && produtoSelecionado.bordas && produtoSelecionado.bordas.length > 0 && (
                <div className="space-y-2">
                  <Label>Borda</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {produtoSelecionado.bordas.map((borda: any) => (
                      <Button
                        key={borda.id}
                        variant={bordaSelecionada?.id === borda.id ? "default" : "outline"}
                        className="justify-start text-sm"
                        size="sm"
                        onClick={() => setBordaSelecionada(bordaSelecionada?.id === borda.id ? null : borda)}
                      >
                        {bordaSelecionada?.id === borda.id && <Check className="h-4 w-4 mr-2" />}
                        {borda.nome}
                        {borda.preco > 0 && ` (+R$ ${borda.preco.toFixed(2)})`}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {produtoSelecionado.adicionais && produtoSelecionado.adicionais.length > 0 && (
                <div className="space-y-2">
                  <Label>Adicionais</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {produtoSelecionado.adicionais.map((adicional: any) => (
                      <Button
                        key={adicional.id}
                        variant={adicionaisSelecionados.some((a) => a.id === adicional.id) ? "default" : "outline"}
                        className="justify-start text-sm"
                        size="sm"
                        onClick={() => toggleAdicional(adicional)}
                      >
                        {adicionaisSelecionados.some((a) => a.id === adicional.id) && (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        {adicional.nome}
                        {` (+R$ ${adicional.preco.toFixed(2)})`}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Quantidade</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantidade((prev) => Math.max(1, prev - 1))}>
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number.parseInt(e.target.value) || 1)}
                    className="w-20 text-center"
                  />
                  <Button variant="outline" size="icon" onClick={() => setQuantidade((prev) => prev + 1)}>
                    +
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  placeholder="Ex: Sem cebola, bem passado, etc."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => setProdutoSelecionado(null)}>
                  Voltar
                </Button>
                <Button
                  onClick={handleAddProduct}
                  disabled={isPizza && (!tamanhoSelecionado || (meiaPizza && !segundaMetade))}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MeiaPizzaModal
        isOpen={showMeiaPizzaModal}
        onClose={() => setShowMeiaPizzaModal(false)}
        onSelect={handleSelectSegundaMetade}
        selectedPizza={segundaMetade || undefined}
      />
    </>
  )
}
