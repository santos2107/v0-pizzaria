"use client"

import { useState } from "react"
import { Plus, Minus, Search, User, MapPin, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { produtosData } from "../produtos/data"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"

// Interface para os pedidos
interface Pedido {
  id: string
  cliente: string
  horario: string
  startTime: string
  itens: string[]
  total: number
  pagamento: string
  endereco: string
  status: string
}

// Interface para os itens do pedido
interface ItemPedido {
  id: number
  produto: any
  quantidade: number
  observacoes: string
  opcoes: any
  precoUnitario: number
  precoTotal: number
}

// Interface para os clientes
interface Cliente {
  id: number
  nome: string
  telefone: string
  endereco: string
  complemento?: string
  bairro: string
  cidade: string
}

// Dados de exemplo para clientes
const clientesData = [
  {
    id: 1,
    nome: "Maria Silva",
    telefone: "(11) 98765-4321",
    endereco: "Rua das Palmeiras, 234",
    complemento: "Apto 101",
    bairro: "Jardim Europa",
    cidade: "São Paulo",
  },
  {
    id: 2,
    nome: "João Pereira",
    telefone: "(11) 97654-3210",
    endereco: "Av. Brasil, 567",
    bairro: "Centro",
    cidade: "São Paulo",
  },
  {
    id: 3,
    nome: "Ana Costa",
    telefone: "(11) 96543-2109",
    endereco: "Rua do Comércio, 789",
    complemento: "Casa 2",
    bairro: "Vila Nova",
    cidade: "São Paulo",
  },
]

interface NovoPedidoModalProps {
  onClose: () => void
  onSave: (pedido: Pedido) => void
  itensPredefinidos?: ItemPedido[]
}

export function NovoPedidoModal({ onClose, onSave, itensPredefinidos = [] }: NovoPedidoModalProps) {
  // Estado para o pedido atual
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>(itensPredefinidos)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [novoCliente, setNovoCliente] = useState<Partial<Cliente>>({})
  const [tipoEntrega, setTipoEntrega] = useState("entrega")
  const [formaPagamento, setFormaPagamento] = useState("dinheiro")
  const [observacoesPedido, setObservacoesPedido] = useState("")
  const [trocoPara, setTrocoPara] = useState("")
  const [searchCliente, setSearchCliente] = useState("")
  const [searchProduto, setSearchProduto] = useState("")
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas")
  const [modalNovoCliente, setModalNovoCliente] = useState(false)
  const [modalProdutoDetalhes, setModalProdutoDetalhes] = useState(false)
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
  const [quantidadeProduto, setQuantidadeProduto] = useState(1)
  const [opcoesProduto, setOpcoesProduto] = useState<any>({})
  const [observacoesProduto, setObservacoesProduto] = useState("")
  const [meiaPizza, setMeiaPizza] = useState(false)
  const [saboresSelecionados, setSaboresSelecionados] = useState<any[]>([])
  const [buscaSabor, setBuscaSabor] = useState("")
  const [dropdownAberto, setDropdownAberto] = useState(false)
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("M")
  const [bordaSelecionada, setBordaSelecionada] = useState<any>(null)
  const [ingredientesSelecionados, setIngredientesSelecionados] = useState<any[]>([])
  const [quantidade, setQuantidade] = useState(1)

  // Verificar se há dados de usuário no localStorage
  useState(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      const user = JSON.parse(userData)
      // Verificar se o usuário tem dados de endereço
      if (user.endereco) {
        // Criar um cliente com os dados do usuário
        const cliente: Cliente = {
          id: user.id || Date.now(),
          nome: user.nome || "",
          telefone: user.telefone || "",
          endereco: user.endereco || "",
          complemento: user.complemento,
          bairro: user.bairro || "",
          cidade: user.cidade || "",
        }
        setClienteSelecionado(cliente)
      }
    }
  })

  // Extrair categorias únicas dos produtos
  const categorias = ["Todas", ...Array.from(new Set(produtosData.map((produto) => produto.categoria)))]

  // Filtrar produtos
  const produtosFiltrados = produtosData.filter((produto) => {
    // Filtro de busca por texto
    const matchesSearch =
      produto.nome.toLowerCase().includes(searchProduto.toLowerCase()) ||
      produto.descricao.toLowerCase().includes(searchProduto.toLowerCase())

    // Filtro por categoria
    const matchesCategoria = categoriaSelecionada === "Todas" || produto.categoria === categoriaSelecionada

    // Apenas produtos disponíveis
    const isDisponivel = produto.disponivel

    return matchesSearch && matchesCategoria && isDisponivel
  })

  // Filtrar clientes
  const clientesFiltrados = clientesData.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchCliente.toLowerCase()) || cliente.telefone.includes(searchCliente),
  )

  // Calcular total do pedido
  const calcularTotal = () => {
    return itensPedido.reduce((total, item) => total + item.precoTotal, 0)
  }

  // Vamos melhorar a modal de novo pedido para incluir mais opções para pizzas

  // Adicione esta função para calcular o preço total considerando todas as opções
  const calcularPrecoTotal = () => {
    let precoBase = calcularPrecoBase()

    // Se for meia pizza, calcular a média dos preços dos sabores
    if (meiaPizza && saboresSelecionados.length > 1) {
      // Preço do primeiro sabor (já incluído no preço base)
      const precoSabor1 = produtoSelecionado[`preco${tamanhoSelecionado}`] || 0

      // Preço do segundo sabor
      const segundoSabor = saboresSelecionados[1]
      const precoSabor2 = segundoSabor[`preco${tamanhoSelecionado}`] || 0

      // Calcular a média dos preços
      precoBase = (precoSabor1 + precoSabor2) / 2

      // Adicionar adicionais do segundo sabor (se houver)
      if (segundoSabor.adicional) {
        precoBase += segundoSabor.adicional / 2
      }
    }

    // Adicionar preço da borda
    if (bordaSelecionada) {
      precoBase += bordaSelecionada.preco || 0
    }

    // Adicionar preço de ingredientes extras
    ingredientesSelecionados.forEach((ingrediente) => {
      precoBase += ingrediente.preco || 0
    })

    return precoBase * quantidade
  }

  const calcularPrecoBase = () => {
    let precoUnitario = 0

    // Calcular preço unitário com base nas opções selecionadas
    if (produtoSelecionado.categoria === "Pizzas") {
      precoUnitario = produtoSelecionado[`preco${tamanhoSelecionado}`] || 0
    } else {
      precoUnitario = produtoSelecionado.preco || 0
    }

    return precoUnitario
  }

  // Adicionar produto ao pedido
  const adicionarProdutoAoPedido = () => {
    if (!produtoSelecionado) return

    const precoUnitario = calcularPrecoTotal()

    const precoTotal = precoUnitario * quantidadeProduto

    // Criar descrição do item para exibição
    let descricaoItem = produtoSelecionado.nome

    if (produtoSelecionado.categoria === "Pizzas" && tamanhoSelecionado) {
      descricaoItem += ` (${tamanhoSelecionado})`
    }

    // Criar novo item
    const novoItem: ItemPedido = {
      id: Date.now(),
      produto: produtoSelecionado,
      quantidade: quantidadeProduto,
      observacoes: observacoesProduto,
      opcoes: {
        tamanho: tamanhoSelecionado,
        sabores: saboresSelecionados,
        meiaPizza: meiaPizza,
        borda: bordaSelecionada,
        ingredientes: ingredientesSelecionados,
      },
      precoUnitario,
      precoTotal,
    }

    setItensPedido([...itensPedido, novoItem])
    setModalProdutoDetalhes(false)
    setProdutoSelecionado(null)
    setQuantidadeProduto(1)
    setOpcoesProduto({})
    setObservacoesProduto("")
    setSaboresSelecionados([])
    setMeiaPizza(false)
    setTamanhoSelecionado("M")
    setBordaSelecionada(null)
    setIngredientesSelecionados([])
    setQuantidade(1)
  }

  // Remover item do pedido
  const removerItemDoPedido = (id: number) => {
    setItensPedido(itensPedido.filter((item) => item.id !== id))
  }

  // Atualizar quantidade de um item
  const atualizarQuantidadeItem = (id: number, novaQuantidade: number) => {
    if (novaQuantidade < 1) return

    setItensPedido(
      itensPedido.map((item) => {
        if (item.id === id) {
          const precoTotal = item.precoUnitario * novaQuantidade
          return { ...item, quantidade: novaQuantidade, precoTotal }
        }
        return item
      }),
    )
  }

  // Adicionar novo cliente
  const adicionarNovoCliente = () => {
    if (!novoCliente.nome || !novoCliente.telefone || !novoCliente.endereco) return

    const novoClienteCompleto: Cliente = {
      id: Date.now(),
      nome: novoCliente.nome || "",
      telefone: novoCliente.telefone || "",
      endereco: novoCliente.endereco || "",
      complemento: novoCliente.complemento,
      bairro: novoCliente.bairro || "",
      cidade: novoCliente.cidade || "",
    }

    // Em um cenário real, aqui você salvaria o cliente no banco de dados
    // Para este exemplo, vamos apenas simular a seleção do cliente
    setClienteSelecionado(novoClienteCompleto)
    setModalNovoCliente(false)
    setNovoCliente({})
  }

  // Finalizar pedido
  const finalizarPedido = () => {
    if (itensPedido.length === 0) {
      alert("Adicione pelo menos um item ao pedido")
      return
    }

    if (!clienteSelecionado && tipoEntrega === "entrega") {
      alert("Selecione um cliente para entrega")
      return
    }

    // Gerar ID do pedido
    const pedidoId = `#${Math.floor(1000 + Math.random() * 9000)}`

    // Criar descrições dos itens para exibição
    const itensDescricao = itensPedido.map((item) => {
      let desc = `${item.quantidade}x ${item.produto.nome}`

      if (item.produto.categoria === "Pizzas" && item.opcoes.tamanho) {
        desc += ` (${item.opcoes.tamanho})`

        // Adicionar informação de meia pizza se aplicável
        if (item.opcoes.meiaPizza && item.opcoes.sabores && item.opcoes.sabores.length > 1) {
          desc += ` - Meia ${item.produto.nome} / Meia ${item.opcoes.sabores[1].nome}`
        }
      }

      return desc
    })

    // Criar novo pedido
    const novoPedido: Pedido = {
      id: pedidoId,
      cliente: clienteSelecionado ? clienteSelecionado.nome : "Cliente Balcão",
      horario: new Date().toLocaleTimeString(),
      startTime: new Date().toISOString(),
      itens: itensDescricao,
      total: calcularTotal(),
      pagamento:
        formaPagamento === "dinheiro"
          ? `Dinheiro${trocoPara ? ` (Troco para R$ ${trocoPara})` : ""}`
          : formaPagamento === "cartao"
            ? "Cartão"
            : "PIX",
      endereco:
        tipoEntrega === "entrega" && clienteSelecionado
          ? `${clienteSelecionado.endereco}${clienteSelecionado.complemento ? `, ${clienteSelecionado.complemento}` : ""}, ${clienteSelecionado.bairro}, ${clienteSelecionado.cidade}`
          : "Retirada no local",
      status: "Pendente",
    }

    onSave(novoPedido)
  }

  // Função para selecionar um produto e abrir o modal de detalhes
  const selecionarProduto = (produto: any) => {
    setProdutoSelecionado(produto)

    // Inicializar opções padrão
    const opcoesIniciais: any = {}

    if (produto.categoria === "Pizzas") {
      opcoesIniciais.tamanho = "M" // Tamanho padrão

      // Para pizzas, considerar o próprio produto como o sabor principal
      setSaboresSelecionados([produto])
    }

    setOpcoesProduto(opcoesIniciais)
    setModalProdutoDetalhes(true)
  }

  // Função para selecionar tamanho da pizza
  const selecionarTamanhoPizza = (tamanho: string) => {
    setTamanhoSelecionado(tamanho)
    setOpcoesProduto({ ...opcoesProduto, tamanho })
  }

  // Função para selecionar borda
  const selecionarBorda = (borda: any) => {
    setOpcoesProduto({ ...opcoesProduto, borda })
  }

  // Função para toggle de ingrediente
  const toggleIngrediente = (ingrediente: any) => {
    const ingredientes = [...(opcoesProduto.ingredientes || [])]
    const index = ingredientes.findIndex((ing) => ing.id === ingrediente.id)

    if (index >= 0) {
      ingredientes.splice(index, 1)
    } else {
      ingredientes.push(ingrediente)
    }

    setOpcoesProduto({ ...opcoesProduto, ingredientes })
  }

  // Função para alternar sabor
  const alternarSabor = (sabor: any) => {
    // Se não for meia pizza, substituir o sabor atual
    if (!meiaPizza) {
      setSaboresSelecionados([sabor])
      setDropdownAberto(false)
      return
    }

    // Se for meia pizza, permitir até 2 sabores
    if (saboresSelecionados.some((s) => s.id === sabor.id)) {
      // Não permitir remover o sabor principal (o primeiro selecionado)
      if (saboresSelecionados[0].id === sabor.id && saboresSelecionados.length > 1) {
        return
      }
      setSaboresSelecionados(saboresSelecionados.filter((s) => s.id !== sabor.id))
    } else if (saboresSelecionados.length < 2) {
      setSaboresSelecionados([...saboresSelecionados, sabor])
      setDropdownAberto(false)
    }
  }

  // Função para remover sabor
  const removerSabor = (id: any) => {
    // Não permitir remover o sabor principal se for o único
    if (saboresSelecionados.length === 1) {
      return
    }

    setSaboresSelecionados(saboresSelecionados.filter((sabor) => sabor.id !== id))
  }

  // Filtrar sabores de pizza disponíveis para a segunda metade
  const saboresFiltrados = produtosData.filter((produto) => {
    return (
      produto.categoria === "Pizzas" &&
      produto.disponivel &&
      (buscaSabor === "" ||
        produto.nome.toLowerCase().includes(buscaSabor.toLowerCase()) ||
        produto.descricao.toLowerCase().includes(buscaSabor.toLowerCase())) &&
      // Não mostrar o sabor já selecionado como primeiro sabor
      (!saboresSelecionados.length || produto.id !== saboresSelecionados[0].id)
    )
  })

  const alternarIngrediente = (ingrediente: any) => {
    if (ingredientesSelecionados.some((i) => i.id === ingrediente.id)) {
      setIngredientesSelecionados(ingredientesSelecionados.filter((i) => i.id !== ingrediente.id))
    } else {
      setIngredientesSelecionados([...ingredientesSelecionados, ingrediente])
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-xl font-bold">Novo Pedido</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Painel esquerdo - Produtos */}
          <div className="w-full md:w-1/2 border-r flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Buscar produtos..."
                    className="pl-8"
                    value={searchProduto}
                    onChange={(e) => setSearchProduto(e.target.value)}
                  />
                </div>
                <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
                  <SelectTrigger className="w-[140px]">
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
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-1 gap-3">
                {produtosFiltrados.map((produto) => (
                  <Card
                    key={produto.id}
                    className="cursor-pointer hover:border-green-500 transition-colors"
                    onClick={() => selecionarProduto(produto)}
                  >
                    <CardContent className="p-3 flex items-center">
                      <div className="w-12 h-12 rounded-md bg-gray-100 mr-3 flex-shrink-0 overflow-hidden">
                        {produto.imagem && (
                          <img
                            src={produto.imagem || "/placeholder.svg"}
                            alt={produto.nome}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{produto.nome}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{produto.descricao}</p>
                        {produto.categoria === "Pizzas" ? (
                          <div className="text-xs text-gray-600 mt-1">A partir de R$ {produto.precoP?.toFixed(2)}</div>
                        ) : (
                          <div className="text-sm font-medium text-green-600 mt-1">R$ {produto.preco?.toFixed(2)}</div>
                        )}
                      </div>
                      <Badge>{produto.categoria}</Badge>
                    </CardContent>
                  </Card>
                ))}

                {produtosFiltrados.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum produto encontrado com os filtros aplicados.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Painel direito - Detalhes do pedido */}
          <div className="w-full md:w-1/2 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <Tabs defaultValue="cliente">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="cliente">Cliente</TabsTrigger>
                  <TabsTrigger value="entrega">Entrega e Pagamento</TabsTrigger>
                </TabsList>

                <TabsContent value="cliente">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type="search"
                          placeholder="Buscar cliente por nome ou telefone..."
                          className="pl-8"
                          value={searchCliente}
                          onChange={(e) => setSearchCliente(e.target.value)}
                        />
                      </div>
                      <Button onClick={() => setModalNovoCliente(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Novo
                      </Button>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <ScrollArea className="h-[200px]">
                        {clientesFiltrados.map((cliente) => (
                          <div
                            key={cliente.id}
                            className={`p-3 border-b cursor-pointer hover:bg-gray-50 flex items-center justify-between ${clienteSelecionado?.id === cliente.id ? "bg-green-50 border-green-200" : ""}`}
                            onClick={() => setClienteSelecionado(cliente)}
                          >
                            <div>
                              <div className="font-medium">{cliente.nome}</div>
                              <div className="text-sm text-gray-500">{cliente.telefone}</div>
                              <div className="text-xs text-gray-400 truncate max-w-[250px]">{cliente.endereco}</div>
                            </div>
                            {clienteSelecionado?.id === cliente.id && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        ))}

                        {clientesFiltrados.length === 0 && (
                          <div className="text-center py-8 text-gray-500">Nenhum cliente encontrado.</div>
                        )}
                      </ScrollArea>
                    </div>

                    {clienteSelecionado && (
                      <div className="border rounded-md p-3 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium flex items-center">
                              <User className="h-4 w-4 mr-1 text-gray-500" />
                              {clienteSelecionado.nome}
                            </h3>
                            <p className="text-sm text-gray-500">{clienteSelecionado.telefone}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setClienteSelecionado(null)}
                            className="h-8 text-gray-500"
                          >
                            Remover
                          </Button>
                        </div>
                        <div className="mt-2 text-sm flex items-start">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span>
                            {clienteSelecionado.endereco}
                            {clienteSelecionado.complemento && `, ${clienteSelecionado.complemento}`},{" "}
                            {clienteSelecionado.bairro}, {clienteSelecionado.cidade}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="entrega">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Tipo de Pedido</Label>
                      <RadioGroup value={tipoEntrega} onValueChange={setTipoEntrega} className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="entrega" id="entrega" />
                          <Label htmlFor="entrega">Entrega</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="retirada" id="retirada" />
                          <Label htmlFor="retirada">Retirada</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="consumo" id="consumo" />
                          <Label htmlFor="consumo">Consumo no Local</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-medium">Forma de Pagamento</Label>
                      <RadioGroup
                        value={formaPagamento}
                        onValueChange={setFormaPagamento}
                        className="grid grid-cols-3 gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dinheiro" id="dinheiro" />
                          <Label htmlFor="dinheiro">Dinheiro</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cartao" id="cartao" />
                          <Label htmlFor="cartao">Cartão</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pix" id="pix" />
                          <Label htmlFor="pix">PIX</Label>
                        </div>
                      </RadioGroup>

                      {formaPagamento === "dinheiro" && (
                        <div className="mt-2">
                          <Label htmlFor="troco">Troco para</Label>
                          <Input
                            id="troco"
                            placeholder="R$ 0,00"
                            className="mt-1"
                            value={trocoPara}
                            onChange={(e) => setTrocoPara(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="observacoes">Observações do Pedido</Label>
                      <Textarea
                        id="observacoes"
                        placeholder="Informações adicionais sobre o pedido..."
                        className="mt-1"
                        value={observacoesPedido}
                        onChange={(e) => setObservacoesPedido(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <h3 className="font-medium mb-2">Itens do Pedido</h3>

              {itensPedido.length > 0 ? (
                <div className="space-y-3">
                  {itensPedido.map((item) => (
                    <div key={item.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <div className="font-medium">{item.produto.nome}</div>
                        <div className="font-medium text-green-600">R$ {item.precoTotal.toFixed(2)}</div>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => atualizarQuantidadeItem(item.id, item.quantidade - 1)}
                            disabled={item.quantidade <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantidade}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => atualizarQuantidadeItem(item.id, item.quantidade + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-red-500 hover:text-red-700"
                          onClick={() => removerItemDoPedido(item.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remover
                        </Button>
                      </div>

                      {/* Detalhes do item */}
                      {item.produto.categoria === "Pizzas" && item.opcoes.tamanho && (
                        <div className="text-xs text-gray-500 mt-1">Tamanho: {item.opcoes.tamanho}</div>
                      )}

                      {/* Exibir informações de meia pizza */}
                      {item.opcoes.meiaPizza && item.opcoes.sabores && item.opcoes.sabores.length > 1 && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Meia-a-meia:</span> {item.opcoes.sabores[0].nome} /{" "}
                          {item.opcoes.sabores[1].nome}
                        </div>
                      )}

                      {item.opcoes.borda && (
                        <div className="text-xs text-gray-500">Borda: {item.opcoes.borda.nome}</div>
                      )}

                      {item.opcoes.ingredientes && item.opcoes.ingredientes.length > 0 && (
                        <div className="text-xs text-gray-500">
                          Extras: {item.opcoes.ingredientes.map((i: any) => i.nome).join(", ")}
                        </div>
                      )}

                      {item.observacoes && <div className="text-xs text-gray-500">Obs: {item.observacoes}</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <p className="text-gray-500">Nenhum item adicionado ao pedido</p>
                  <p className="text-sm text-gray-400 mt-1">Selecione produtos no painel à esquerda</p>
                </div>
              )}
            </div>

            <div className="border-t p-4">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total do Pedido:</span>
                <span className="font-bold text-green-600">R$ {calcularTotal().toFixed(2)}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={finalizarPedido}>
                  Finalizar Pedido
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Modal de Novo Cliente */}
      {modalNovoCliente && (
        <Dialog open={modalNovoCliente} onOpenChange={() => setModalNovoCliente(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={novoCliente.nome || ""}
                  onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                  placeholder="Ex: Maria Silva"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={novoCliente.telefone || ""}
                  onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                  placeholder="Ex: (11) 98765-4321"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={novoCliente.endereco || ""}
                  onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                  placeholder="Ex: Rua das Flores, 123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={novoCliente.complemento || ""}
                  onChange={(e) => setNovoCliente({ ...novoCliente, complemento: e.target.value })}
                  placeholder="Ex: Apto 101"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={novoCliente.bairro || ""}
                    onChange={(e) => setNovoCliente({ ...novoCliente, bairro: e.target.value })}
                    placeholder="Ex: Centro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={novoCliente.cidade || ""}
                    onChange={(e) => setNovoCliente({ ...novoCliente, cidade: e.target.value })}
                    placeholder="Ex: São Paulo"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setModalNovoCliente(false)}>
                  Cancelar
                </Button>
                <Button onClick={adicionarNovoCliente}>Salvar Cliente</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Detalhes do Produto */}
      {modalProdutoDetalhes && produtoSelecionado && (
        <Dialog open={modalProdutoDetalhes} onOpenChange={() => setModalProdutoDetalhes(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{produtoSelecionado.nome}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">{produtoSelecionado.descricao}</p>

              {/* Opções específicas para pizzas */}
              {produtoSelecionado.categoria === "Pizzas" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Tamanho</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <Button
                        variant={tamanhoSelecionado === "P" ? "default" : "outline"}
                        onClick={() => setTamanhoSelecionado("P")}
                      >
                        P - R$ {produtoSelecionado.precoP?.toFixed(2)}
                      </Button>
                      <Button
                        variant={tamanhoSelecionado === "M" ? "default" : "outline"}
                        onClick={() => setTamanhoSelecionado("M")}
                      >
                        M - R$ {produtoSelecionado.precoM?.toFixed(2)}
                      </Button>
                      <Button
                        variant={tamanhoSelecionado === "G" ? "default" : "outline"}
                        onClick={() => setTamanhoSelecionado("G")}
                      >
                        G - R$ {produtoSelecionado.precoG?.toFixed(2)}
                      </Button>
                      <Button
                        variant={tamanhoSelecionado === "GG" ? "default" : "outline"}
                        onClick={() => setTamanhoSelecionado("GG")}
                      >
                        GG - R$ {produtoSelecionado.precoGG?.toFixed(2)}
                      </Button>
                    </div>
                  </div>

                  {/* Seleção de sabores simplificada */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Switch id="meiaPizza" checked={meiaPizza} onCheckedChange={setMeiaPizza} />
                        <Label htmlFor="meiaPizza" className="ml-2">
                          Meia Pizza
                        </Label>
                      </div>
                    </div>

                    {/* Sabores selecionados */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {saboresSelecionados.map((sabor, index) => (
                        <Badge key={sabor.id} variant="secondary" className="flex items-center gap-1 py-1">
                          {index === 0 ? "1ª metade: " : "2ª metade: "}
                          {sabor.nome}
                          {meiaPizza && index > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 p-0 ml-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                removerSabor(sabor.id)
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </Badge>
                      ))}
                    </div>

                    {/* Busca de sabores - aparece apenas quando o toggle está ativado */}
                    {meiaPizza && saboresSelecionados.length < 2 && (
                      <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Buscar segundo sabor..."
                          value={buscaSabor}
                          onChange={(e) => setBuscaSabor(e.target.value)}
                          className="pl-8"
                          onClick={() => setDropdownAberto(true)}
                        />

                        {dropdownAberto && (
                          <ScrollArea className="h-[150px] mt-2 border rounded-md absolute w-full bg-white z-10">
                            {saboresFiltrados
                              .filter((sabor) => !saboresSelecionados.some((s) => s.id === sabor.id))
                              .map((sabor) => (
                                <div
                                  key={sabor.id}
                                  className="p-2 hover:bg-gray-100 cursor-pointer border-b flex items-center gap-2"
                                  onClick={() => {
                                    alternarSabor(sabor)
                                    setBuscaSabor("")
                                  }}
                                >
                                  {sabor.imagem && (
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                      <img
                                        src={sabor.imagem || "/placeholder.svg"}
                                        alt={sabor.nome}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium">{sabor.nome}</div>
                                    {sabor.sabor && sabor.sabor.adicional > 0 && (
                                      <div className="text-xs text-green-600">
                                        +R$ {sabor.sabor.adicional.toFixed(2)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}

                            {saboresFiltrados.filter((sabor) => !saboresSelecionados.some((s) => s.id === sabor.id))
                              .length === 0 && (
                              <p className="text-center text-sm text-gray-500 py-2">Nenhum sabor encontrado</p>
                            )}
                          </ScrollArea>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bordas */}
                  {produtoSelecionado.bordas && produtoSelecionado.bordas.length > 0 && (
                    <div>
                      <Label className="text-base font-medium">Borda</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {produtoSelecionado.bordas
                          .filter((borda: any) => borda.disponivel)
                          .map((borda: any) => (
                            <Button
                              key={borda.id}
                              variant={bordaSelecionada?.id === borda.id ? "default" : "outline"}
                              onClick={() => setBordaSelecionada(bordaSelecionada?.id === borda.id ? null : borda)}
                              disabled={!borda.disponivel}
                              className="justify-start text-xs h-auto py-2"
                              size="sm"
                            >
                              <div className="text-left">
                                <div className="font-medium">{borda.nome}</div>
                                {borda.preco > 0 && (
                                  <div className="text-xs text-green-600">+R$ {borda.preco.toFixed(2)}</div>
                                )}
                              </div>
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ingredientes extras */}
              {produtoSelecionado.ingredientes && produtoSelecionado.ingredientes.length > 0 && (
                <div>
                  <Label className="text-base font-medium">Ingredientes extras</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                    {produtoSelecionado.ingredientes.map((ingrediente: any) => (
                      <Button
                        key={ingrediente.id}
                        variant={ingredientesSelecionados.some((i) => i.id === ingrediente.id) ? "default" : "outline"}
                        onClick={() => alternarIngrediente(ingrediente)}
                        disabled={!ingrediente.disponivel}
                        className="justify-start text-xs h-auto py-2"
                        size="sm"
                      >
                        <div className="text-left">
                          <div className="font-medium">{ingrediente.nome}</div>
                          <div className="text-xs text-green-600">+R$ {ingrediente.preco.toFixed(2)}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Promoções aplicáveis */}
              {produtoSelecionado.promocoes && produtoSelecionado.promocoes.length > 0 && (
                <div>
                  <Label className="text-base font-medium">Promoções Disponíveis</Label>
                  <div className="space-y-2 mt-2">
                    {produtoSelecionado.promocoes
                      .filter((promocao) => promocao.ativa)
                      .map((promocao) => {
                        const hoje = new Date().getDay().toString()
                        const aplicavelHoje = promocao.diasSemana.includes(hoje)

                        return (
                          <div
                            key={promocao.id}
                            className={`p-2 border rounded-md ${aplicavelHoje ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-medium">{promocao.nome}</span>
                                <p className="text-xs text-gray-600">{promocao.descricao}</p>
                              </div>
                              <Badge variant={aplicavelHoje ? "default" : "outline"} className="ml-2">
                                {promocao.desconto}% OFF
                              </Badge>
                            </div>
                            {!aplicavelHoje && <p className="text-xs text-gray-500 mt-1">Não disponível hoje</p>}
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Perguntas personalizadas */}
              {produtoSelecionado.perguntas && produtoSelecionado.perguntas.length > 0 && (
                <div>
                  <Label className="text-base font-medium">Opções Adicionais</Label>
                  <div className="space-y-3 mt-2">
                    {produtoSelecionado.perguntas.map((pergunta) => (
                      <div key={pergunta.id} className="border rounded-md p-3">
                        <div className="flex items-start">
                          <span className="font-medium">{pergunta.texto}</span>
                          {pergunta.obrigatoria && <span className="text-red-500 ml-1">*</span>}
                        </div>

                        <div className="mt-2 space-y-1">
                          {pergunta.tipo === "radio" ? (
                            // Opções de escolha única
                            <RadioGroup defaultValue={pergunta.opcoes[0]?.id}>
                              {pergunta.opcoes.map((opcao) => (
                                <div key={opcao.id} className="flex items-center space-x-2">
                                  <RadioGroupItem value={opcao.id} id={`opcao-${opcao.id}`} />
                                  <Label htmlFor={`opcao-${opcao.id}`} className="text-sm">
                                    {opcao.texto} {opcao.preco > 0 && `(+R$ ${opcao.preco.toFixed(2)})`}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          ) : (
                            // Opções de múltipla escolha
                            <div className="space-y-2">
                              {pergunta.opcoes.map((opcao) => (
                                <div key={opcao.id} className="flex items-center space-x-2">
                                  <Checkbox id={`opcao-${opcao.id}`} />
                                  <Label htmlFor={`opcao-${opcao.id}`} className="text-sm">
                                    {opcao.texto} {opcao.preco > 0 && `(+R$ ${opcao.preco.toFixed(2)})`}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {produtoSelecionado.categoria === "Pizzas" && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium mb-2">Resumo da Pizza</h4>
                  <div className="relative w-full aspect-square max-w-[200px] mx-auto bg-yellow-100 rounded-full overflow-hidden border-4 border-yellow-300">
                    {/* Visualização da pizza */}
                    {meiaPizza && saboresSelecionados.length > 1 ? (
                      <>
                        {/* Primeira metade */}
                        <div className="absolute top-0 left-0 w-1/2 h-full bg-yellow-200 flex items-center justify-center overflow-hidden">
                          <div className="text-center p-2">
                            <div className="font-bold text-sm">{saboresSelecionados[0].nome}</div>
                          </div>
                        </div>
                        {/* Segunda metade */}
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-yellow-300 flex items-center justify-center overflow-hidden">
                          <div className="text-center p-2">
                            <div className="font-bold text-sm">{saboresSelecionados[1].nome}</div>
                          </div>
                        </div>
                        {/* Linha divisória */}
                        <div className="absolute top-0 left-1/2 h-full w-1 bg-yellow-400 transform -translate-x-1/2"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="font-bold">{saboresSelecionados[0]?.nome || produtoSelecionado.nome}</div>
                        </div>
                      </div>
                    )}

                    {/* Borda */}
                    {bordaSelecionada && (
                      <div className="absolute inset-0 border-8 border-yellow-600 rounded-full pointer-events-none">
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {bordaSelecionada.nome}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lista de opções selecionadas */}
                  <div className="mt-4 text-sm">
                    <div>
                      <strong>Tamanho:</strong> {tamanhoSelecionado}
                    </div>
                    {bordaSelecionada && (
                      <div>
                        <strong>Borda:</strong> {bordaSelecionada.nome}
                      </div>
                    )}
                    {ingredientesSelecionados.length > 0 && (
                      <div>
                        <strong>Extras:</strong> {ingredientesSelecionados.map((i) => i.nome).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="observacoesProduto">Observações</Label>
                <Textarea
                  id="observacoesProduto"
                  placeholder="Ex: Sem cebola, bem passado, etc."
                  value={observacoesProduto}
                  onChange={(e) => setObservacoesProduto(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-none"
                    onClick={() => quantidadeProduto > 1 && setQuantidadeProduto(quantidadeProduto - 1)}
                    disabled={quantidadeProduto <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center">{quantidadeProduto}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-none"
                    onClick={() => setQuantidadeProduto(quantidadeProduto + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button onClick={adicionarProdutoAoPedido}>Adicionar ao Pedido</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
