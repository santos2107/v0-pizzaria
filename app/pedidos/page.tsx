"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Loader2 } from "lucide-react"
import { PedidoCard } from "./pedido-card"
import { useEffect, useState, useMemo, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { formatTime, getElapsedTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { obterPedidos, atualizarStatusPedido } from "./actions"

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
  status: "Pendente" | "Em Preparo" | "Em Entrega" | "Concluído"
  statusUpdatedAt?: Record<string, string>
  tipoAtendimento?: string
}

// Interface para o estado dos pedidos
interface PedidosState {
  Pendente: Pedido[]
  "Em Preparo": Pedido[]
  "Em Entrega": Pedido[]
  Concluído: Pedido[]
}

export default function PedidosPage() {
  // Estado para armazenar os pedidos
  const [pedidos, setPedidos] = useState<PedidosState>({
    Pendente: [],
    "Em Preparo": [],
    "Em Entrega": [],
    Concluído: [],
  })

  // Estado para armazenar o termo de busca
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Estado para armazenar o período selecionado
  const [period, setPeriod] = useState<string>("hoje")

  // Estado para controlar a aba selecionada
  const [activeTab, setActiveTab] = useState<string>("Pendente")

  // Estado de carregamento
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Estado de erro
  const [error, setError] = useState<string | null>(null)

  // Referência para armazenar os pedidos processados para evitar processamento duplicado
  const processedPedidos = useRef<Set<string>>(new Set())

  // Referência para controlar se a atualização automática está em andamento
  const isUpdating = useRef<boolean>(false)

  // Hook de toast para notificações
  const { toast } = useToast()

  // Hook do Next.js para rotas
  const router = useRouter()

  // Carregar pedidos ao iniciar
  useEffect(() => {
    const carregarPedidos = async () => {
      // Se já estiver atualizando, não iniciar outra atualização
      if (isUpdating.current) return

      isUpdating.current = true
      setIsLoading(true)
      setError(null)

      try {
        const todosPedidos = await obterPedidos()

        // Verificar se cada pedido tem os campos necessários
        const pedidosValidos = todosPedidos.filter((pedido) => {
          const camposObrigatorios = ["id", "cliente", "startTime", "itens", "total", "status"]
          return camposObrigatorios.every((campo) => pedido[campo] !== undefined)
        })

        if (pedidosValidos.length < todosPedidos.length) {
          toast({
            title: "Aviso",
            description: "Alguns pedidos estão com dados incompletos e foram filtrados.",
            variant: "warning",
          })
        }

        // Organizar pedidos por status
        const pedidosOrganizados: PedidosState = {
          Pendente: [],
          "Em Preparo": [],
          "Em Entrega": [],
          Concluído: [],
        }

        // Garantir que só procesamos pedidos com status válido
        pedidosValidos.forEach((pedido) => {
          const status = pedido.status as keyof PedidosState
          if (pedidosOrganizados[status]) {
            pedidosOrganizados[status].push({
              ...pedido,
              // Garantir valores padrão para campos opcionais
              endereco: pedido.endereco || "Endereço não disponível",
              pagamento: pedido.pagamento || "Pagamento não informado",
              // Atualizar o horário exibido
              horario: formatTime(new Date(pedido.startTime)) + ` (${getElapsedTime(pedido.startTime)})`,
            })
          }
        })

        setPedidos(pedidosOrganizados)
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error)
        setError("Não foi possível carregar os pedidos. Tente novamente mais tarde.")
        toast({
          title: "Erro",
          description: "Não foi possível carregar os pedidos. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        isUpdating.current = false
      }
    }

    carregarPedidos()

    // Configurar intervalo para atualizar pedidos a cada 10 segundos
    const intervalId = setInterval(carregarPedidos, 10000)
    return () => clearInterval(intervalId)
  }, [toast])

  // Efeito para atualizar o status dos pedidos automaticamente
  useEffect(() => {
    const timer = setInterval(async () => {
      // Evitar atualizações simultâneas
      if (isUpdating.current) return
      isUpdating.current = true

      try {
        // Obter todos os pedidos atuais
        const todosPedidos = await obterPedidos()

        // Para cada pedido, verificar se precisa atualizar o status
        for (const pedido of todosPedidos) {
          const startTime = new Date(pedido.startTime).getTime()
          const now = Date.now()
          const elapsed = now - startTime

          // Verificar se o pedido é de balcão
          const isBalcao = pedido.tipoAtendimento === "balcao"

          // Obter o timestamp de quando o pedido entrou em cada status
          const statusUpdatedAt = pedido.statusUpdatedAt || {}

          // Verificar transições de status
          if (pedido.status === "Pendente") {
            // Todos os pedidos pendentes passam para "Em Preparo" após 1 minuto
            if (elapsed >= 60 * 1000) {
              const pedidoKey = `${pedido.id}-EmPreparo`
              if (!processedPedidos.current.has(pedidoKey)) {
                processedPedidos.current.add(pedidoKey)
                await atualizarStatusPedido(pedido.id, "Em Preparo")
                toast({
                  title: "Pedido em preparo",
                  description: `O pedido ${pedido.id} está agora em preparo.`,
                })
              }
            }
          } else if (pedido.status === "Em Preparo") {
            // Pedidos em preparo passam para "Em Entrega" após 4 minutos de preparo
            if (elapsed >= (1 + 4) * 60 * 1000) {
              const pedidoKey = `${pedido.id}-EmEntrega`
              if (!processedPedidos.current.has(pedidoKey)) {
                processedPedidos.current.add(pedidoKey)
                await atualizarStatusPedido(pedido.id, "Em Entrega")
                toast({
                  title: "Pedido em entrega",
                  description: `O pedido ${pedido.id} está pronto para entrega.`,
                })
              }
            }
          } else if (pedido.status === "Em Entrega") {
            // Para pedidos de balcão, concluir após 5 minutos em entrega
            if (isBalcao) {
              // Calcular quanto tempo o pedido está em entrega
              const entregaTime = statusUpdatedAt["Em Entrega"]
                ? new Date(statusUpdatedAt["Em Entrega"]).getTime()
                : startTime + (1 + 4) * 60 * 1000

              const tempoEmEntrega = now - entregaTime

              // Se passou 5 minutos em entrega, concluir o pedido
              if (tempoEmEntrega >= 5 * 60 * 1000) {
                const pedidoKey = `${pedido.id}-Concluido`
                if (!processedPedidos.current.has(pedidoKey)) {
                  processedPedidos.current.add(pedidoKey)
                  await atualizarStatusPedido(pedido.id, "Concluído")
                  toast({
                    title: "Pedido concluído",
                    description: `O pedido ${pedido.id} foi concluído.`,
                  })
                }
              }
            }
            // Para pedidos de delivery, concluir após 30 minutos em entrega
            else {
              // Calcular quanto tempo o pedido está em entrega
              const entregaTime = statusUpdatedAt["Em Entrega"]
                ? new Date(statusUpdatedAt["Em Entrega"]).getTime()
                : startTime + (1 + 4) * 60 * 1000

              const tempoEmEntrega = now - entregaTime

              // Se passou 30 minutos em entrega, concluir o pedido
              if (tempoEmEntrega >= 30 * 60 * 1000) {
                const pedidoKey = `${pedido.id}-Concluido`
                if (!processedPedidos.current.has(pedidoKey)) {
                  processedPedidos.current.add(pedidoKey)
                  await atualizarStatusPedido(pedido.id, "Concluído")
                  toast({
                    title: "Pedido concluído",
                    description: `O pedido ${pedido.id} foi entregue com sucesso.`,
                  })
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Erro ao atualizar status dos pedidos:", error)
      } finally {
        isUpdating.current = false
      }
    }, 5000) // Verificar a cada 5 segundos

    return () => clearInterval(timer)
  }, [toast])

  // Usar useMemo para recalcular apenas quando pedidos ou searchTerm mudarem
  const filteredPedidos = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase()

    return {
      Pendente: pedidos.Pendente.filter(
        (pedido) =>
          pedido.id.toLowerCase().includes(searchTermLower) || pedido.cliente.toLowerCase().includes(searchTermLower),
      ),
      "Em Preparo": pedidos["Em Preparo"].filter(
        (pedido) =>
          pedido.id.toLowerCase().includes(searchTermLower) || pedido.cliente.toLowerCase().includes(searchTermLower),
      ),
      "Em Entrega": pedidos["Em Entrega"].filter(
        (pedido) =>
          pedido.id.toLowerCase().includes(searchTermLower) || pedido.cliente.toLowerCase().includes(searchTermLower),
      ),
      Concluído: pedidos.Concluído.filter(
        (pedido) =>
          pedido.id.toLowerCase().includes(searchTermLower) || pedido.cliente.toLowerCase().includes(searchTermLower),
      ),
    }
  }, [pedidos, searchTerm])

  // Usar contagem de pedidos pendentes para badge de notificação
  const countPendentes = filteredPedidos.Pendente.length
  const countEmPreparo = filteredPedidos["Em Preparo"].length
  const countEmEntrega = filteredPedidos["Em Entrega"].length

  // Função para lidar com a mudança de aba
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Componente de feedback visual para carregamento
  if (isLoading && Object.values(pedidos).every((arr) => arr.length === 0)) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Carregando pedidos...</p>
      </div>
    )
  }

  // Componente de feedback visual para erro
  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[70vh]">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Erro ao carregar pedidos</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <Button onClick={() => router.push("/pedidos/novo")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar pedidos por ID ou cliente..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar pedidos"
              />
            </div>
            <Select defaultValue={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full md:w-[180px]" aria-label="Selecionar período">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                <SelectItem value="30dias">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="Pendente" className="relative">
            Pendentes
            {countPendentes > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {countPendentes}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Em Preparo" className="relative">
            Em Preparo
            {countEmPreparo > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {countEmPreparo}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Em Entrega" className="relative">
            Em Entrega
            {countEmEntrega > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {countEmEntrega}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Concluído">Concluídos</TabsTrigger>
        </TabsList>

        {Object.keys(filteredPedidos).map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            <div className="space-y-4">
              {isLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {!isLoading &&
                filteredPedidos[status as keyof typeof filteredPedidos].map((pedido) =>
                  // Verificação de segurança antes de renderizar o PedidoCard
                  pedido && pedido.id ? <PedidoCard key={pedido.id} pedido={pedido} /> : null,
                )}

              {!isLoading && filteredPedidos[status as keyof typeof filteredPedidos].length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum pedido {status.toLowerCase()}</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
