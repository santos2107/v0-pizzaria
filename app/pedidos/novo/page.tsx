"use client"

import {
  Dialog,
  DialogContent as DialogContentPrimitive,
  DialogHeader as DialogHeaderPrimitive,
  DialogTitle as DialogTitlePrimitive,
} from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Check, Minus, Plus, Search, Trash2, AlertCircle, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { produtosData } from "@/app/produtos/data"
import { clientesData } from "@/app/pedidos/data/clientes"
import { mesasData } from "@/app/pedidos/data/mesas"
import { adicionarPedido } from "@/app/pedidos/actions"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"

// Tipos de pagamento
const tiposPagamento = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Vale Refeição"]

// Interface para itens do pedido
interface ItemPedido {
  id: number
  produtoId: number
  nome: string
  preco: number
  quantidade: number
  observacao: string
  opcoes: {
    nome: string
    selecionado: boolean
    tipo?: string
    perguntaId?: string
    obrigatoria?: boolean
    opcoesPergunta?: any[]
  }[]
}

// Interface para mesa
interface Mesa {
  id: number
  numero: string
  capacidade: number
  status: string
}

export default function NovoPedidoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("cliente")
  const [tipoAtendimento, setTipoAtendimento] = useState("balcao")
  const [clienteSelecionado, setClienteSelecionado] = useState<number | null>(null)
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null)
  const [formaPagamento, setFormaPagamento] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [itensPedido, setItensPedido] = useState<ItemPedido[]>([])
  const [busca, setBusca] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas")
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    telefone: "",
    endereco: "",
  })
  const [troco, setTroco] = useState("")
  const [todasMesas, setTodasMesas] = useState<Mesa[]>([])
  const [carregandoMesas, setCarregandoMesas] = useState(true)
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
  const [modalProduto, setModalProduto] = useState(false)
  const [quantidade, setQuantidade] = useState(1)
  const [observacaoProduto, setObservacaoProduto] = useState("")
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string | undefined>(undefined)
  const [bordaSelecionada, setBordaSelecionada] = useState<any>(null)
  const [ingredientesSelecionados, setIngredientesSelecionados] = useState<any[]>([])
  const [saboresSelecionados, setSaboresSelecionados] = useState<any[]>([])
  const [buscaSabor, setBuscaSabor] = useState("")
  const [meiaPizza, setMeiaPizza] = useState(false)
  const [dropdownAberto, setDropdownAberto] = useState(false)

  // Verificar parâmetros da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const mesaIdParam = params.get("mesaId")
    const tabParam = params.get("tab")

    if (mesaIdParam) {
      setTipoAtendimento("mesa")
      setMesaSelecionada(Number(mesaIdParam))

      // Se o parâmetro tab estiver presente, definir a aba ativa
      if (tabParam === "produtos") {
        setActiveTab("produtos")
      }
    }
  }, [])

  // Categorias disponíveis
  const categorias = ["Todas", "Pizzas", "Hambúrgueres", "Bebidas", "Acompanhamentos", "Saladas"]

  // Função para carregar todas as mesas
  const carregarTodasMesas = () => {
    try {
      setCarregandoMesas(true)
      // Obter todas as mesas
      const mesas = mesasData
      console.log("Todas as mesas:", mesas)
      setTodasMesas(mesas)
    } catch (error) {
      console.error("Erro ao carregar mesas:", error)
      toast({
        title: "Erro ao carregar mesas",
        description: "Não foi possível carregar as mesas.",
        variant: "destructive",
      })
    } finally {
      setCarregandoMesas(false)
    }
  }

  // Carregar todas as mesas quando o tipo de atendimento for "mesa"
  useEffect(() => {
    if (tipoAtendimento === "mesa") {
      carregarTodasMesas()
    }
  }, [tipoAtendimento])

  // Calcular total do pedido
  const total = itensPedido.reduce((acc, item) => {
    const preco = item.preco || 0
    const quantidade = item.quantidade || 0
    return acc + preco * quantidade
  }, 0)

  // Filtrar produtos com base na busca e categoria
  const produtosFiltrados = produtosData.filter((produto) => {
    const matchesSearch =
      produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (produto.descricao && produto.descricao.toLowerCase().includes(busca.toLowerCase()))

    const matchesCategoria = categoriaFiltro === "Todas" || produto.categoria === categoriaFiltro

    return matchesSearch && matchesCategoria && produto.disponivel
  })

  // Filtrar sabores de pizza para a segunda metade
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

  // Abrir modal de configuração do produto
  const abrirModalProduto = (produto: any) => {
    if (!produto || !produto.disponivel) return

    setProdutoSelecionado(produto)
    setQuantidade(1)
    setObservacaoProduto("")
    setTamanhoSelecionado(produto.categoria === "Pizzas" ? "M" : undefined)
    setBordaSelecionada(null)
    setIngredientesSelecionados([])

    // Se for uma pizza, sempre inicia com o sabor principal
    if (produto.categoria === "Pizzas") {
      // Considerar o próprio produto como o sabor principal
      setSaboresSelecionados([produto])
    } else {
      setSaboresSelecionados([])
    }

    setBuscaSabor("")
    setMeiaPizza(false)
    setDropdownAberto(false)
    setModalProduto(true)
  }

  // Calcular preço base com base no tamanho
  const calcularPrecoBase = () => {
    if (!produtoSelecionado) return 0

    if (produtoSelecionado.categoria === "Pizzas") {
      if (tamanhoSelecionado === "P") return produtoSelecionado.precoP || 0
      if (tamanhoSelecionado === "M") return produtoSelecionado.precoM || 0
      if (tamanhoSelecionado === "G") return produtoSelecionado.precoG || 0
      if (tamanhoSelecionado === "GG") return produtoSelecionado.precoGG || 0
      return produtoSelecionado.precoP || 0
    }
    return produtoSelecionado.preco || 0
  }

  // Calcular preço total do produto selecionado
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
      if (segundoSabor.sabor && segundoSabor.sabor.adicional) {
        precoBase += segundoSabor.sabor.adicional / 2
      }
    }

    // Adicionar preço da borda
    if (bordaSelecionada) {
      precoBase += bordaSelecionada.preco || 0
    }

    // Adicionar preço dos ingredientes extras
    ingredientesSelecionados.forEach((ingrediente) => {
      precoBase += ingrediente.preco || 0
    })

    return precoBase * quantidade
  }

  // Alternar seleção de ingrediente
  const alternarIngrediente = (ingrediente: any) => {
    if (ingredientesSelecionados.some((i) => i.id === ingrediente.id)) {
      setIngredientesSelecionados(ingredientesSelecionados.filter((i) => i.id !== ingrediente.id))
    } else {
      setIngredientesSelecionados([...ingredientesSelecionados, ingrediente])
    }
  }

  // Alternar seleção de sabor
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

  // Remover sabor selecionado
  const removerSabor = (saborId: string) => {
    // Não permitir remover o sabor principal se for o único
    if (saboresSelecionados.length === 1) {
      return
    }

    setSaboresSelecionados(saboresSelecionados.filter((s) => s.id !== saborId))
  }

  // Preparar todas as opções para adicionar ao item
  const prepararOpcoes = () => {
    const opcoes = []

    // Adicionar opção de tamanho se aplicável
    if (tamanhoSelecionado) {
      opcoes.push({
        nome: `Tamanho: ${tamanhoSelecionado}`,
        selecionado: true,
      })
    }

    // Adicionar borda selecionada
    if (bordaSelecionada) {
      opcoes.push({
        nome: `Borda: ${bordaSelecionada.nome}`,
        selecionado: true,
      })
    }

    // Adicionar sabores selecionados
    saboresSelecionados.forEach((sabor) => {
      opcoes.push({
        nome: `Sabor: ${sabor.nome}`,
        selecionado: true,
      })
    })

    // Adicionar ingredientes extras
    ingredientesSelecionados.forEach((ingrediente) => {
      opcoes.push({
        nome: `Extra: ${ingrediente.nome}`,
        selecionado: true,
      })
    })

    // Adicionar promoções aplicáveis
    if (produtoSelecionado.promocoes && produtoSelecionado.promocoes.length > 0) {
      const hoje = new Date().getDay().toString()
      const promocoesAtivas = produtoSelecionado.promocoes.filter(
        (promo) => promo.ativa && promo.diasSemana.includes(hoje),
      )

      promocoesAtivas.forEach((promocao) => {
        opcoes.push({
          nome: `Promoção: ${promocao.nome} (${promocao.desconto}% off)`,
          selecionado: true,
        })
      })
    }

    // Adicionar perguntas e respostas se houver
    if (produtoSelecionado.perguntas && produtoSelecionado.perguntas.length > 0) {
      produtoSelecionado.perguntas.forEach((pergunta) => {
        // Aqui você pode adicionar lógica para capturar as respostas do usuário
        // Por enquanto, apenas adicionamos a pergunta como informação
        opcoes.push({
          nome: `Pergunta: ${pergunta.texto}`,
          selecionado: true,
          tipo: "pergunta",
          perguntaId: pergunta.id,
          obrigatoria: pergunta.obrigatoria,
          opcoesPergunta: pergunta.opcoes,
        })
      })
    }

    return opcoes
  }

  // Adicionar produto configurado ao pedido
  const adicionarProdutoConfigurado = () => {
    if (!produtoSelecionado) return

    const precoTotal = calcularPrecoTotal()
    const precoUnitario = precoTotal / quantidade

    const novoItem: ItemPedido = {
      id: Date.now(),
      produtoId: produtoSelecionado.id,
      nome: produtoSelecionado.nome,
      preco: precoUnitario,
      quantidade: quantidade,
      observacao: observacaoProduto,
      opcoes: prepararOpcoes(),
    }

    setItensPedido([...itensPedido, novoItem])
    setModalProduto(false)
  }

  // Remover item do pedido
  const removerItem = (id: number) => {
    setItensPedido(itensPedido.filter((item) => item.id !== id))
  }

  // Alterar quantidade do item
  const alterarQuantidade = (id: number, quantidade: number) => {
    if (quantidade < 1) return

    setItensPedido(itensPedido.map((item) => (item.id === id ? { ...item, quantidade } : item)))
  }

  // Alterar observação do item
  const alterarObservacao = (id: number, observacao: string) => {
    setItensPedido(itensPedido.map((item) => (item.id === id ? { ...item, observacao } : item)))
  }

  // Avançar para a próxima etapa
  const avancarEtapa = () => {
    if (activeTab === "cliente") {
      if (
        tipoAtendimento === "balcao" ||
        (tipoAtendimento === "delivery" && clienteSelecionado) ||
        (tipoAtendimento === "delivery" && novoCliente.nome && novoCliente.telefone && novoCliente.endereco) ||
        (tipoAtendimento === "mesa" && mesaSelecionada)
      ) {
        setActiveTab("produtos")
      } else {
        toast({
          title: "Informações incompletas",
          description: "Por favor, preencha todas as informações necessárias.",
          variant: "destructive",
        })
      }
    } else if (activeTab === "produtos") {
      if (itensPedido.length > 0) {
        setActiveTab("pagamento")
      } else {
        toast({
          title: "Pedido vazio",
          description: "Adicione pelo menos um item ao pedido.",
          variant: "destructive",
        })
      }
    }
  }

  // Voltar para a etapa anterior
  const voltarEtapa = () => {
    if (activeTab === "produtos") {
      setActiveTab("cliente")
    } else if (activeTab === "pagamento") {
      setActiveTab("produtos")
    }
  }

  // Função para atualizar o status da mesa nos dados mock
  const atualizarStatusMesa = (mesaId: number, novoStatus: string) => {
    const mesaIndex = mesasData.findIndex((mesa) => mesa.id === mesaId)
    if (mesaIndex !== -1) {
      mesasData[mesaIndex] = { ...mesasData[mesaIndex], status: novoStatus }
      setTodasMesas([...mesasData]) // Atualizar o estado local
    }
  }

  // Função para finalizar pedido
  const finalizarPedido = async () => {
    if (!formaPagamento) {
      toast({
        title: "Forma de pagamento não selecionada",
        description: "Por favor, selecione uma forma de pagamento.",
        variant: "destructive",
      })
      return
    }

    // Criar o objeto de pedido
    const pedidoId = `PED${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`

    // Obter informações do cliente
    let clienteInfo = "Cliente Balcão"
    let enderecoInfo = "Retirada no Balcão"

    if (tipoAtendimento === "delivery") {
      if (clienteSelecionado) {
        const cliente = clientesData.find((c) => c.id === clienteSelecionado)
        if (cliente) {
          clienteInfo = cliente.nome
          enderecoInfo = cliente.endereco
        }
      } else if (novoCliente.nome) {
        clienteInfo = `${novoCliente.nome} (Novo)`
        enderecoInfo = novoCliente.endereco
      }
    } else if (tipoAtendimento === "mesa") {
      const mesa = todasMesas.find((m) => m.id === mesaSelecionada)
      if (mesa) {
        clienteInfo = `Mesa ${mesa.numero}`
        enderecoInfo = `Mesa ${mesa.numero} - Local`
      }
    }

    // Formatar itens para exibição
    const itensFormatados = itensPedido.map((item) => {
      const opcoesTexto = item.opcoes
        .filter((opcao) => opcao.selecionado)
        .map((opcao) => opcao.nome)
        .join(", ")
      return `${item.quantidade}x ${item.nome}${opcoesTexto ? ` (${opcoesTexto})` : ""}${
        item.observacao ? ` - Obs: ${item.observacao}` : ""
      }`
    })

    // Criar o pedido
    const novoPedido = {
      id: pedidoId,
      cliente: clienteInfo,
      horario: new Date().toLocaleTimeString(),
      startTime: new Date().toISOString(),
      itens: itensFormatados,
      total: total,
      pagamento: formaPagamento + (formaPagamento === "Dinheiro" && troco ? ` (Troco para R$ ${troco})` : ""),
      endereco: enderecoInfo,
      status: "Pendente",
      mesaId: tipoAtendimento === "mesa" ? mesaSelecionada : null,
      tipoAtendimento: tipoAtendimento,
    }

    // Adicionar o pedido à lista de pedidos
    await adicionarPedido(novoPedido)

    // Atualizar o status da mesa para "Ocupada" se for atendimento em mesa
    if (tipoAtendimento === "mesa" && mesaSelecionada) {
      atualizarStatusMesa(mesaSelecionada, "Ocupada")
    }

    let mensagem = `Pedido ${pedidoId} no valor de R$ ${total.toFixed(2)} foi registrado.`

    if (tipoAtendimento === "mesa") {
      mensagem += " A mesa ficará ocupada até que o cliente peça a conta."
    }

    toast({
      title: "Pedido realizado com sucesso!",
      description: mensagem,
    })

    // Redirecionar para a página de pedidos
    router.push("/pedidos")
  }

  // Alternar tipo de atendimento
  const alternarTipoAtendimento = (tipo: string) => {
    setTipoAtendimento(tipo)
    setMesaSelecionada(null)
    setClienteSelecionado(null)
  }

  // Função para obter o texto do status da mesa
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "disponível":
        return "Disponível"
      case "ocupada":
        return "Ocupada"
      case "reservada":
        return "Reservada"
      case "em limpeza":
        return "Em Limpeza"
      default:
        return status
    }
  }

  // Verificar se uma mesa está disponível
  const mesaEstaDisponivel = (mesa: Mesa) => {
    return mesa.status === "Disponível"
  }

  // Alternar estado do dropdown
  const toggleDropdown = () => {
    setDropdownAberto(!dropdownAberto)
  }

  const diasSemana = [
    { id: "0", nome: "Domingo" },
    { id: "1", nome: "Segunda" },
    { id: "2", nome: "Terça" },
    { id: "3", nome: "Quarta" },
    { id: "4", nome: "Quinta" },
    { id: "5", nome: "Sexta" },
    { id: "6", nome: "Sábado" },
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Novo Pedido</h1>
        <Button variant="outline" onClick={() => router.push("/pedidos")}>
          Cancelar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cliente">Cliente</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
        </TabsList>

        {/* Tab Cliente */}
        <TabsContent value="cliente">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Atendimento</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={tipoAtendimento === "balcao" ? "default" : "outline"}
                      onClick={() => alternarTipoAtendimento("balcao")}
                    >
                      Balcão
                    </Button>
                    <Button
                      variant={tipoAtendimento === "delivery" ? "default" : "outline"}
                      onClick={() => alternarTipoAtendimento("delivery")}
                    >
                      Delivery
                    </Button>
                    <Button
                      variant={tipoAtendimento === "mesa" ? "default" : "outline"}
                      onClick={() => alternarTipoAtendimento("mesa")}
                    >
                      Mesa
                    </Button>
                  </div>
                </div>

                {tipoAtendimento === "delivery" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Selecione um Cliente</Label>
                      <Select
                        value={clienteSelecionado?.toString() || ""}
                        onValueChange={(value) => setClienteSelecionado(Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clientesData.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id.toString()}>
                              {cliente.nome} - {cliente.telefone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ou Cadastre um Novo Cliente</Label>
                      <div className="grid gap-2">
                        <Input
                          placeholder="Nome"
                          value={novoCliente.nome}
                          onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                        />
                        <Input
                          placeholder="Telefone"
                          value={novoCliente.telefone}
                          onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })}
                        />
                        <Input
                          placeholder="Endereço"
                          value={novoCliente.endereco}
                          onChange={(e) => setNovoCliente({ ...novoCliente, endereco: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {tipoAtendimento === "mesa" && (
                  <div className="space-y-4">
                    {carregandoMesas ? (
                      <div className="text-center py-4">Carregando mesas...</div>
                    ) : todasMesas.length > 0 ? (
                      <div className="space-y-2">
                        <Label>Selecione uma Mesa</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {todasMesas.map((mesa) => (
                            <Card
                              key={mesa.id}
                              className={`overflow-hidden cursor-pointer ${mesaSelecionada === mesa.id ? "ring-2 ring-primary" : ""} ${!mesaEstaDisponivel(mesa) ? "opacity-70" : ""}`}
                              onClick={() => mesaEstaDisponivel(mesa) && setMesaSelecionada(mesa.id)}
                            >
                              <CardContent className="p-6">
                                <div className="flex flex-col gap-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h2 className="text-xl font-bold">Mesa {mesa.numero}</h2>
                                      <p className="text-gray-500">{mesa.capacidade} lugares</p>
                                    </div>
                                    <Badge
                                      className={`px-3 py-1 ${
                                        mesa.status === "Disponível"
                                          ? "bg-green-100 text-green-800 border-green-200"
                                          : mesa.status === "Ocupada"
                                            ? "bg-red-100 text-red-800 border-red-200"
                                            : mesa.status === "Reservada"
                                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                              : "bg-blue-100 text-blue-800 border-blue-200"
                                      }`}
                                    >
                                      {getStatusText(mesa.status)}
                                    </Badge>
                                  </div>

                                  <div className="mt-2">
                                    {!mesaEstaDisponivel(mesa) ? (
                                      <p className="text-sm text-gray-500">Esta mesa não está disponível no momento</p>
                                    ) : (
                                      <p className="text-sm text-green-600">Disponível para pedidos</p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Nenhuma mesa cadastrada</AlertTitle>
                        <AlertDescription>
                          Não há mesas cadastradas no sistema. Por favor, cadastre mesas ou escolha outro tipo de
                          atendimento.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={avancarEtapa}
              disabled={tipoAtendimento === "mesa" && !todasMesas.some(mesaEstaDisponivel)}
            >
              Próximo
            </Button>
          </div>
        </TabsContent>

        {/* Tab Produtos */}
        <TabsContent value="produtos">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lista de Produtos */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Produtos</CardTitle>
                <div className="flex flex-col md:flex-row gap-4 mt-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Buscar produtos..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
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
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {produtosFiltrados.map((produto) => (
                      <Card
                        key={produto.id}
                        className={`cursor-pointer hover:bg-gray-50 ${!produto.disponivel ? "opacity-60" : ""}`}
                        onClick={() => produto.disponivel && abrirModalProduto(produto)}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                            {produto.imagem ? (
                              <img
                                src={produto.imagem || "/placeholder.svg"}
                                alt={produto.nome}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-400 text-xs text-center">Sem imagem</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{produto.nome}</h3>
                              {!produto.disponivel && (
                                <Badge variant="outline" className="text-red-500 border-red-200">
                                  Indisponível
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{produto.categoria}</p>
                            {produto.categoria === "Pizzas" ? (
                              <div className="text-sm">
                                <span className="font-semibold">Tamanhos:</span> a partir de R${" "}
                                {(produto.precoP || 0).toFixed(2)}
                              </div>
                            ) : (
                              <p className="font-bold">R$ {(produto.preco || 0).toFixed(2)}</p>
                            )}
                          </div>
                          {produto.disponivel && <Plus className="text-gray-400" />}
                        </CardContent>
                      </Card>
                    ))}

                    {produtosFiltrados.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        Nenhum produto encontrado com os filtros aplicados.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Resumo do Pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {itensPedido.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Nenhum item adicionado</p>
                  ) : (
                    <div className="space-y-4">
                      {itensPedido.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{item.nome}</h4>
                              <p className="text-sm">R$ {(item.preco || 0).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span>{item.quantidade}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() => removerItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Opções do item */}
                          {item.opcoes.length > 0 && (
                            <div className="pl-4 space-y-1">
                              <div className="flex flex-wrap gap-2">
                                {item.opcoes
                                  .filter((o) => o.selecionado)
                                  .map((opcao) => (
                                    <Badge key={opcao.nome} variant="secondary">
                                      {opcao.nome}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Observações do item */}
                          <Textarea
                            placeholder="Observações (ex: sem cebola, bem passado)"
                            className="text-sm"
                            value={item.observacao}
                            onChange={(e) => alterarObservacao(item.id, e.target.value)}
                          />
                          <Separator />
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={voltarEtapa}>
              Voltar
            </Button>
            <Button onClick={avancarEtapa}>Próximo</Button>
          </div>
        </TabsContent>

        {/* Tab Pagamento */}
        <TabsContent value="pagamento">
          <Card>
            <CardHeader>
              <CardTitle>Finalizar Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Forma de Pagamento</Label>
                  <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposPagamento.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formaPagamento === "Dinheiro" && (
                  <div className="space-y-2">
                    <Label>Troco para</Label>
                    <div className="flex gap-2 items-center">
                      <span>R$</span>
                      <Input type="number" value={troco} onChange={(e) => setTroco(e.target.value)} />
                    </div>
                    {Number(troco) > 0 && Number(troco) > total && (
                      <p className="text-sm">Troco: R$ {(Number(troco) - total).toFixed(2)}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Observações Gerais</Label>
                  <Textarea
                    placeholder="Observações adicionais sobre o pedido"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Resumo do Pedido</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Tipo de Atendimento:</span>
                      <span className="font-medium capitalize">{tipoAtendimento}</span>
                    </div>

                    {tipoAtendimento === "delivery" && clienteSelecionado && (
                      <div className="flex justify-between">
                        <span>Cliente:</span>
                        <span className="font-medium">
                          {clientesData.find((c) => c.id === clienteSelecionado)?.nome}
                        </span>
                      </div>
                    )}

                    {tipoAtendimento === "delivery" && novoCliente.nome && (
                      <div className="flex justify-between">
                        <span>Cliente:</span>
                        <span className="font-medium">{novoCliente.nome} (Novo)</span>
                      </div>
                    )}

                    {tipoAtendimento === "mesa" && mesaSelecionada && (
                      <div className="flex justify-between">
                        <span>Mesa:</span>
                        <span className="font-medium">{todasMesas.find((m) => m.id === mesaSelecionada)?.numero}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Itens:</span>
                      <span className="font-medium">{itensPedido.length}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Quantidade Total:</span>
                      <span className="font-medium">{itensPedido.reduce((acc, item) => acc + item.quantidade, 0)}</span>
                    </div>

                    <div className="flex justify-between font-bold mt-2 text-base">
                      <span>Total:</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={voltarEtapa}>
              Voltar
            </Button>
            <Button onClick={finalizarPedido}>Finalizar Pedido</Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de configuração do produto */}
      {modalProduto && produtoSelecionado && (
        <Dialog open={modalProduto} onOpenChange={() => setModalProduto(false)}>
          <DialogContentPrimitive className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeaderPrimitive>
              <DialogTitlePrimitive>{produtoSelecionado.nome}</DialogTitlePrimitive>
            </DialogHeaderPrimitive>

            <div className="space-y-3">
              {/* Imagem e detalhes básicos */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
                  {produtoSelecionado.imagem ? (
                    <img
                      src={produtoSelecionado.imagem || "/placeholder.svg"}
                      alt={produtoSelecionado.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs text-center">Sem imagem</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">{produtoSelecionado.nome}</h3>
                  <p className="text-sm text-gray-500">{produtoSelecionado.descricao}</p>
                  <p className="text-sm text-gray-500">{produtoSelecionado.categoria}</p>
                </div>
              </div>

              {/* Tamanhos (para pizzas) */}
              {produtoSelecionado.categoria === "Pizzas" && (
                <div className="space-y-2">
                  <h4 className="font-medium">Tamanho</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {produtoSelecionado.precoP && (
                      <Button
                        variant={tamanhoSelecionado === "P" ? "default" : "outline"}
                        onClick={() => setTamanhoSelecionado("P")}
                        size="sm"
                      >
                        P - R$ {produtoSelecionado.precoP.toFixed(2)}
                      </Button>
                    )}
                    {produtoSelecionado.precoM && (
                      <Button
                        variant={tamanhoSelecionado === "M" ? "default" : "outline"}
                        onClick={() => setTamanhoSelecionado("M")}
                        size="sm"
                      >
                        M - R$ {produtoSelecionado.precoM.toFixed(2)}
                      </Button>
                    )}
                    {produtoSelecionado.precoG && (
                      <Button
                        variant={tamanhoSelecionado === "G" ? "default" : "outline"}
                        onClick={() => setTamanhoSelecionado("G")}
                        size="sm"
                      >
                        G - R$ {produtoSelecionado.precoG.toFixed(2)}
                      </Button>
                    )}
                    {produtoSelecionado.precoGG && (
                      <Button
                        variant={tamanhoSelecionado === "GG" ? "default" : "outline"}
                        onClick={() => setTamanhoSelecionado("GG")}
                        size="sm"
                      >
                        GG - R$ {produtoSelecionado.precoGG.toFixed(2)}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Seleção de sabores simplificada */}
              {produtoSelecionado.categoria === "Pizzas" && (
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
                      <Badge key={sabor.id} variant="secondary" className="flex items-center gap-1 py-1.5 px-3">
                        {meiaPizza ? (
                          <span className="font-medium">{index === 0 ? "1ª metade: " : "2ª metade: "}</span>
                        ) : (
                          ""
                        )}
                        {sabor.nome}
                        {meiaPizza && saboresSelecionados.length > 1 && index > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 ml-1 hover:bg-red-100 rounded-full"
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
                    <div className="space-y-2 mt-2">
                      <Label>Selecione o segundo sabor</Label>
                      <div className="relative">
                        <div
                          className="flex items-center border rounded-md p-2 cursor-pointer"
                          onClick={toggleDropdown}
                        >
                          <Search className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="flex-1">{buscaSabor || "Selecione o segundo sabor..."}</span>
                          <div className={`transition-transform ${dropdownAberto ? "rotate-180" : ""}`}>
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M2.5 4.5L6 8L9.5 4.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Dropdown de sabores */}
                        {dropdownAberto && (
                          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                            <div className="sticky top-0 bg-white p-2 border-b">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                  placeholder="Buscar sabor..."
                                  value={buscaSabor}
                                  onChange={(e) => setBuscaSabor(e.target.value)}
                                  className="pl-8"
                                />
                              </div>
                            </div>

                            <div>
                              {saboresFiltrados
                                .filter((sabor) => !saboresSelecionados.some((s) => s.id === sabor.id))
                                .map((sabor) => (
                                  <div
                                    key={sabor.id}
                                    className="p-3 hover:bg-gray-100 cursor-pointer border-b flex items-center gap-3"
                                    onClick={() => {
                                      alternarSabor(sabor)
                                      setBuscaSabor("")
                                    }}
                                  >
                                    {sabor.imagem && (
                                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                        <img
                                          src={sabor.imagem || "/placeholder.svg"}
                                          alt={sabor.nome}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <div className="font-medium">{sabor.nome}</div>
                                      {sabor.descricao && (
                                        <div className="text-xs text-gray-500 line-clamp-1">{sabor.descricao}</div>
                                      )}
                                    </div>
                                    {sabor.adicional > 0 && (
                                      <Badge variant="outline" className="ml-2 text-green-600">
                                        +R$ {sabor.adicional.toFixed(2)}
                                      </Badge>
                                    )}
                                  </div>
                                ))}

                              {saboresFiltrados.filter((sabor) => !saboresSelecionados.some((s) => s.id === sabor.id))
                                .length === 0 && (
                                <p className="text-center text-sm text-gray-500 py-4">
                                  {buscaSabor ? "Nenhum sabor encontrado" : "Nenhum sabor disponível"}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bordas (para pizzas) */}
              {produtoSelecionado.categoria === "Pizzas" &&
                produtoSelecionado.bordas &&
                produtoSelecionado.bordas.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Borda</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                      {produtoSelecionado.bordas.map((borda: any) => (
                        <Button
                          key={borda.id}
                          variant={bordaSelecionada?.id === borda.id ? "default" : "outline"}
                          onClick={() => setBordaSelecionada(bordaSelecionada?.id === borda.id ? null : borda)}
                          disabled={!borda.disponivel}
                          className="justify-start text-xs"
                          size="sm"
                        >
                          {bordaSelecionada?.id === borda.id && <Check className="h-4 w-4 mr-2" />}
                          {borda.nome}
                          {borda.preco > 0 && ` (+R$ ${borda.preco.toFixed(2)})`}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Promoções aplicáveis */}
              {produtoSelecionado.promocoes && produtoSelecionado.promocoes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Promoções Disponíveis</h4>
                  <div className="space-y-2">
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
                                <div className="flex gap-1 mt-1">
                                  {promocao.diasSemana.map((diaId) => {
                                    const dia = diasSemana.find((d) => d.id === diaId)
                                    return dia ? (
                                      <Badge
                                        key={diaId}
                                        variant={hoje === diaId ? "default" : "outline"}
                                        className={hoje === diaId ? "bg-green-500" : ""}
                                      >
                                        {dia.nome.substring(0, 3)}
                                      </Badge>
                                    ) : null
                                  })}
                                </div>
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

              {/* Ingredientes extras */}
              {produtoSelecionado.ingredientes && produtoSelecionado.ingredientes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Ingredientes extras</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                    {produtoSelecionado.ingredientes.map((ingrediente: any) => (
                      <Button
                        key={ingrediente.id}
                        variant={ingredientesSelecionados.some((i) => i.id === ingrediente.id) ? "default" : "outline"}
                        onClick={() => alternarIngrediente(ingrediente)}
                        disabled={!ingrediente.disponivel}
                        className="justify-start text-xs"
                        size="sm"
                      >
                        {ingredientesSelecionados.some((i) => i.id === ingrediente.id) && (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        {ingrediente.nome}
                        {` (+R$ ${ingrediente.preco.toFixed(2)})`}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Perguntas personalizadas */}
              {produtoSelecionado.perguntas && produtoSelecionado.perguntas.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Perguntas</h4>
                  {produtoSelecionado.perguntas.map((pergunta) => (
                    <div key={pergunta.id} className="space-y-2 border p-3 rounded-md">
                      <div className="flex items-start">
                        <span className="font-medium">{pergunta.texto}</span>
                        {pergunta.obrigatoria && <span className="text-red-500 ml-1">*</span>}
                      </div>

                      <div className="pl-2 space-y-1">
                        {pergunta.tipo === "radio" ? (
                          // Opções de escolha única
                          <div className="space-y-2">
                            {pergunta.opcoes.map((opcao) => (
                              <div key={opcao.id} className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`opcao-${opcao.id}`}
                                  name={`pergunta-${pergunta.id}`}
                                  className="h-4 w-4"
                                />
                                <label htmlFor={`opcao-${opcao.id}`} className="text-sm">
                                  {opcao.texto} {opcao.preco > 0 && `(+R$ ${opcao.preco.toFixed(2)})`}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // Opções de múltipla escolha
                          <div className="space-y-2">
                            {pergunta.opcoes.map((opcao) => (
                              <div key={opcao.id} className="flex items-center space-x-2">
                                <input type="checkbox" id={`opcao-${opcao.id}`} className="h-4 w-4" />
                                <label htmlFor={`opcao-${opcao.id}`} className="text-sm">
                                  {opcao.texto} {opcao.preco > 0 && `(+R$ ${opcao.preco.toFixed(2)})`}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantidade e observações */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Quantidade</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => quantidade > 1 && setQuantidade(quantidade - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{quantidade}</span>
                    <Button variant="outline" size="icon" onClick={() => setQuantidade(quantidade + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Observações</h4>
                  <Textarea
                    placeholder="Ex: sem cebola, bem passado..."
                    value={observacaoProduto}
                    onChange={(e) => setObservacaoProduto(e.target.value)}
                  />
                </div>
              </div>

              {/* Total e botões */}
              <div className="pt-4 border-t flex flex-col gap-4 sticky bottom-0 bg-white pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-lg font-bold">R$ {calcularPrecoTotal().toFixed(2)}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setModalProduto(false)}>
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={adicionarProdutoConfigurado}>
                    Adicionar ao Pedido
                  </Button>
                </div>
              </div>
            </div>
          </DialogContentPrimitive>
        </Dialog>
      )}
    </div>
  )
}
