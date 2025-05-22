"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Clock, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { ProgressBar } from "../pedidos/progress-bar"
import { formatTime, getElapsedTime } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { obterPedidos, atualizarStatusPedido } from "../pedidos/actions"

// Interface para os itens do pedido
interface PedidoItem {
  nome: string
  quantidade: number
  observacao: string
}

// Interface para os pedidos
interface Pedido {
  id: string
  startTime: string
  horario: string
  cliente: string
  itens: PedidoItem[] | string[] // Aceita ambos os formatos
  total: number
  pagamento: string
  endereco: string
  status: string
  mesaId?: number | null
  tipoAtendimento: string
  statusUpdatedAt?: Record<string, string>
}

// Interface para o estado dos pedidos na cozinha
interface PedidosCozinha {
  id: string
  startTime: string
  horario: string
  cliente: string
  itens: PedidoItem[]
  status: "Pendente" | "Em Preparo" | "Concluído" | "finalizado" | "Em Entrega"
  tipoAtendimento: string
  statusUpdatedAt?: Record<string, string>
}

// Interface para o estado dos pedidos
interface PedidosState {
  Pendentes: PedidosCozinha[]
  Concluídos: PedidosCozinha[]
}

export default function CozinhaPage() {
  // Estado para armazenar os pedidos
  const [pedidos, setPedidos] = useState<PedidosState>({
    Pendentes: [],
    Concluídos: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [atualizando, setAtualizando] = useState(false)

  // Hook de toast para notificações
  const { toast } = useToast()

  // Função para converter itens de string para objeto PedidoItem
  const converterItens = (itens: string[] | PedidoItem[]): PedidoItem[] => {
    if (itens.length === 0) return []

    // Verificar se os itens já são do tipo PedidoItem
    if (typeof itens[0] === "object" && "nome" in itens[0]) {
      return itens as PedidoItem[]
    }

    // Converter de string para PedidoItem
    return (itens as string[]).map((item) => {
      const [quantidade, nome] = item.split("x ").map((part) => part.trim())
      return {
        nome: nome || item,
        quantidade: Number.parseInt(quantidade) || 1,
        observacao: "",
      }
    })
  }

  // Função para carregar pedidos
  const carregarPedidos = async () => {
    try {
      setAtualizando(true)

      // Obter pedidos do sistema
      const pedidosDoSistema = await obterPedidos()

      if (!Array.isArray(pedidosDoSistema)) {
        throw new Error("Formato de dados inválido")
      }

      // Filtrar e converter pedidos para o formato da cozinha
      const pedidosCozinha = pedidosDoSistema
        .filter((p) => p && p.id && p.startTime) // Validar dados necessários
        .map((p) => ({
          id: p.id,
          startTime: p.startTime,
          horario: formatTime(new Date(p.startTime)) + ` (${getElapsedTime(p.startTime)})`,
          cliente: p.cliente || (p.mesaId ? `Mesa ${p.mesaId}` : "Cliente não identificado"),
          itens: converterItens(p.itens || []),
          status: p.status as "Pendente" | "Em Preparo" | "Concluído" | "finalizado" | "Em Entrega",
          tipoAtendimento: p.tipoAtendimento || "delivery",
          statusUpdatedAt: p.statusUpdatedAt || {},
        }))

      // Separar pedidos em pendentes e concluídos
      // Na cozinha, só mostramos pedidos Pendentes e Em Preparo na aba Pendentes
      const pendentes = pedidosCozinha.filter((p) => 
        p.status === "Pendente" || 
        p.status === "Em Preparo"
      )

      const concluidos = pedidosCozinha.filter((p) => 
        p.status === "Concluído" || 
        p.status === "finalizado" || 
        p.status === "Em Entrega"
      )

      setPedidos({
        Pendentes: pendentes,
        Concluídos: concluidos,
      })

      setError(null)
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err)
      setError("Não foi possível carregar os pedidos. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
      setAtualizando(false)
    }
  }

  // Efeito para carregar pedidos do sistema
  useEffect(() => {
    // Carregar pedidos inicialmente
    carregarPedidos()

    // Configurar intervalo para atualizar pedidos a cada 10 segundos
    const intervalId = setInterval(carregarPedidos, 10000)

    return () => clearInterval(intervalId)
  }, [])

  // Efeito para atualizar o status dos pedidos automaticamente
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        // Obter todos os pedidos atuais
        const todosPedidos = await obterPedidos()

        // Filtrar apenas os pedidos pendentes e em preparo
        const pedidosAtivos = todosPedidos.filter((p) => p.status === "Pendente" || p.status === "Em Preparo")

        // Para cada pedido ativo, verificar se precisa atualizar o status
        for (const pedido of pedidosAtivos) {
          const startTime = new Date(pedido.startTime).getTime()
          const now = Date.now()
          const elapsed = now - startTime

          if (pedido.status === "Pendente" && elapsed >= 60 * 1000) {
            // Se passou 1 minuto e está pendente, atualizar para "Em Preparo"
            await atualizarStatusPedido(pedido.id, "Em Preparo")

            toast({
              title: "Pedido em preparo",
              description: `O pedido ${pedido.id} está agora em preparo.`,
            })
          } else if (pedido.status === "Em Preparo" && elapsed >= (1 + 4) * 60 * 1000) {
            // Se passou 5 minutos (1 min pendente + 4 min preparo), mover para "Em Entrega"
            await atualizarStatusPedido(pedido.id, "Em Entrega")

            toast({
              title: "Pedido pronto",
              description: `O pedido ${pedido.id} está pronto para entrega.`,
            })
          }
        }

        // Atualizar a lista de pedidos após as alterações
        await carregarPedidos()
      } catch (error) {
        console.error("Erro ao atualizar status dos pedidos:", error)
      }
    }, 5000) // Verificar a cada 5 segundos

    return () => clearInterval(timer)
  }, [toast])

  // Função para marcar um pedido como pronto manualmente
  const marcarComoPronto = async (id: string) => {
    try {
      // Atualizar no sistema para "Em Entrega" (não "Concluído")
      // Isso permite que o fluxo continue na página de pedidos
      await atualizarStatusPedido(id, "Em Entrega")

      // Atualizar a interface
      setPedidos((prev) => {
        const pendentesAtualizados = prev.Pendentes.filter((p) => p.id !== id)
        const pedidoAtualizado = prev.Pendentes.find((p) => p.id === id)
        
        toast({
          title: "Pedido pronto",
          description: `O pedido ${id} foi marcado como pronto e está aguardando entrega.`,
        })

        return {
          Pendentes: pendentesAtualizados,
          Concluídos: pedidoAtualizado 
            ? [...prev.Concluídos, {...pedidoAtualizado, status: "Em Entrega"}] 
            : prev.Concluídos
        }
      })
    } catch (error) {
      console.error("Erro ao marcar pedido como pronto:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar o pedido como pronto. Tente novamente.",
      })
    }
  }

  // Função para atualizar manualmente os pedidos
  const atualizarPedidos = () => {
    carregarPedidos()
    toast({
      title: "Atualizando",
      description: "Lista de pedidos atualizada",
    })
  }

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Cozinha</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  // Renderizar estado de erro
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Cozinha</h1>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={atualizarPedidos}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Cozinha</h1>
        <Button 
          variant="outline" 
          onClick={atualizarPedidos} 
          disabled={atualizando}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${atualizando ? 'animate-spin' : ''}`} />
          {atualizando ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      <Tabs defaultValue="Pendentes">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="Pendentes" className="relative">
            Pendentes
            {pedidos.Pendentes.length > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pedidos.Pendentes.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="Concluídos">Concluídos Hoje</TabsTrigger>
        </TabsList>

        <TabsContent value="Pendentes" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pedidos.Pendentes.length > 0 ? (
              pedidos.Pendentes.map((pedido) => (
                <Card
                  key={pedido.id}
                  className={
                    pedido.status === "Pendente"
                      ? "border-blue-200"
                      : pedido.status === "Em Preparo"
                        ? "border-yellow-200"
                        : ""
                  }
                >
                  <CardHeader className="pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pedido.id}</CardTitle>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {pedido.horario}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{pedido.cliente}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pedido.itens.map((item, index) => (
                        <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {item.quantidade}x {item.nome}
                            </span>
                          </div>
                          {item.observacao && <p className="text-sm text-gray-500 mt-1">Obs: {item.observacao}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Barra de progresso */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{pedido.status === "Pendente" ? "Aguardando preparo" : "Em preparo"}</span>
                        <span>{pedido.status === "Pendente" ? "Inicia em breve" : "Em andamento"}</span>
                      </div>
                      <ProgressBar
                        status={pedido.status}
                        startTime={pedido.startTime}
                        tipoAtendimento={pedido.tipoAtendimento}
                      />
                    </div>

                    <Button
                      className="w-full mt-4 bg-green-600 hover:bg-green-700"
                      onClick={() => marcarComoPronto(pedido.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Pronto
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Nenhum pedido pendente</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="Concluídos" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pedidos.Concluídos.length > 0 ? (
              pedidos.Concluídos.map((pedido) => (
                <Card key={pedido.id}>
                  <CardHeader className="pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pedido.id}</CardTitle>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {pedido.horario}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">{pedido.cliente}</div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pedido.itens.map((item, index) => (
                        <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {item.quantidade}x {item.nome}
                            </span>
                          </div>
                          {item.observacao && <p className="text-sm text-gray-500 mt-1">Obs: {item.observacao}</p>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                      Status: {pedido.status === "Em Entrega" ? "Pronto para entrega" : 
                              pedido.status === "Concluído" || pedido.status === "finalizado" ? 
                              "Finalizado" : pedido.status}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Nenhum pedido concluído hoje</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
