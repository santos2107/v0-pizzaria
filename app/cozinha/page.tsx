"use client"

import { useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { Loader2, RefreshCw, Clock, CheckCircle, ChefHat, Bell, Coffee, Timer } from "lucide-react"

// Tipos
type OrderItem = {
  id: string
  name: string
  quantity: number
  observation?: string
  status: "pending" | "preparing" | "ready"
}

type Order = {
  id: string
  number: string
  table?: string
  customerName?: string
  createdAt: string
  items: OrderItem[]
  status: "pending" | "preparing" | "ready"
}

export default function KitchenPage() {
  const { user, isAuthenticated, loadingAuth } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  // Proteção de rota
  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      toast.error("Faça login para acessar esta página")
      router.push("/")
    }
  }, [isAuthenticated, loadingAuth, router])

  // Carregar pedidos
  useEffect(() => {
    if (isAuthenticated && !loadingAuth) {
      loadOrders()
    }
  }, [isAuthenticated, loadingAuth])

  // Carregar pedidos (simulado)
  async function loadOrders() {
    setLoading(true)
    try {
      // Simulando carregamento
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Dados simulados
      const mockOrders: Order[] = [
        {
          id: "1",
          number: "#1234",
          table: "Mesa 2",
          customerName: "João Silva",
          createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: "preparing",
          items: [
            {
              id: "1",
              name: "Pizza Margherita",
              quantity: 1,
              status: "preparing",
            },
            {
              id: "2",
              name: "Pizza Calabresa",
              quantity: 1,
              status: "pending",
              observation: "Sem cebola, por favor",
            },
          ],
        },
        {
          id: "2",
          number: "#1235",
          table: "Mesa 5",
          customerName: "Família Oliveira",
          createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          status: "preparing",
          items: [
            {
              id: "3",
              name: "Pizza Quatro Queijos",
              quantity: 1,
              status: "ready",
            },
            {
              id: "4",
              name: "Pizza Portuguesa",
              quantity: 1,
              status: "preparing",
            },
            {
              id: "5",
              name: "Pizza Frango com Catupiry",
              quantity: 1,
              status: "pending",
            },
          ],
        },
        {
          id: "3",
          number: "#1236",
          table: "Mesa 7",
          customerName: "Carlos Pereira",
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: "pending",
          items: [
            {
              id: "6",
              name: "Pizza Pepperoni",
              quantity: 2,
              status: "pending",
            },
          ],
        },
      ]

      setOrders(mockOrders)
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error)
      toast.error("Erro ao carregar pedidos")
    } finally {
      setLoading(false)
    }
  }

  // Atualizar pedidos
  async function handleRefresh() {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
    toast.success("Pedidos atualizados!")
  }

  // Atualizar status do item
  function updateItemStatus(orderId: string, itemId: string, newStatus: "pending" | "preparing" | "ready") {
    setOrders((prevOrders) => {
      return prevOrders.map((order) => {
        if (order.id !== orderId) return order

        // Atualizar o item específico
        const updatedItems = order.items.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))

        // Calcular o novo status do pedido com base nos itens
        let newOrderStatus: "pending" | "preparing" | "ready" = "pending"

        if (updatedItems.every((item) => item.status === "ready")) {
          newOrderStatus = "ready"
        } else if (updatedItems.some((item) => item.status === "preparing" || item.status === "ready")) {
          newOrderStatus = "preparing"
        }

        return {
          ...order,
          items: updatedItems,
          status: newOrderStatus,
        }
      })
    })

    toast.success(`Status do item atualizado!`)
  }

  // Marcar pedido como pronto
  function markOrderAsReady(orderId: string) {
    setOrders((prevOrders) => {
      return prevOrders.map((order) => {
        if (order.id !== orderId) return order

        // Atualizar todos os itens para "pronto"
        const updatedItems = order.items.map((item) => ({
          ...item,
          status: "ready" as const,
        }))

        return {
          ...order,
          items: updatedItems,
          status: "ready",
        }
      })
    })

    toast.success(`Pedido marcado como pronto!`)
  }

  // Formatar tempo de espera
  function formatWaitTime(isoString: string) {
    const orderTime = new Date(isoString).getTime()
    const now = Date.now()
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes} min`
    } else {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return `${hours}h ${minutes}m`
    }
  }

  // Obter cor do status
  function getStatusColor(status: "pending" | "preparing" | "ready") {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "preparing":
        return "bg-blue-100 text-blue-800"
      case "ready":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Obter texto do status
  function getStatusText(status: "pending" | "preparing" | "ready") {
    switch (status) {
      case "pending":
        return "Pendente"
      case "preparing":
        return "Preparando"
      case "ready":
        return "Pronto"
      default:
        return "Desconhecido"
    }
  }

  // Obter ícone do status
  function getStatusIcon(status: "pending" | "preparing" | "ready") {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "preparing":
        return <ChefHat className="h-4 w-4" />
      case "ready":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
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

  if (!isAuthenticated) {
    return null // Será redirecionado pelo useEffect
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cozinha</h1>
          <p className="text-gray-500">Gerenciamento de pedidos em preparação</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline" className="mt-4 md:mt-0">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            <span className="text-gray-600">Carregando pedidos...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum pedido na fila</h3>
          <p className="text-gray-500">Todos os pedidos foram preparados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card key={order.id} className={order.status === "ready" ? "border-green-500" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{order.number}</CardTitle>
                    <div className="text-sm text-gray-500">
                      {order.table && <p>{order.table}</p>}
                      {order.customerName && <p>Cliente: {order.customerName}</p>}
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </div>
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <Timer className="h-4 w-4 mr-1" />
                  <span>Espera: {formatWaitTime(order.createdAt)}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <h3 className="font-medium text-gray-700 mb-2">Itens:</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-medium">
                            {item.quantity}x {item.name}
                          </p>
                          {item.observation && <p className="text-sm text-gray-500 italic">{item.observation}</p>}
                        </div>
                        <Badge className={getStatusColor(item.status)}>{getStatusText(item.status)}</Badge>
                      </div>
                      <div className="flex mt-2 space-x-2">
                        {item.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            onClick={() => updateItemStatus(order.id, item.id, "preparing")}
                          >
                            <ChefHat className="h-3 w-3 mr-1" />
                            Preparar
                          </Button>
                        )}
                        {item.status === "preparing" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => updateItemStatus(order.id, item.id, "ready")}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Pronto
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                {order.status !== "ready" && (
                  <Button className="w-full bg-green-500 hover:bg-green-600" onClick={() => markOrderAsReady(order.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar Pedido como Pronto
                  </Button>
                )}
                {order.status === "ready" && (
                  <div className="w-full text-center text-green-600 font-medium">Pedido pronto para entrega!</div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
