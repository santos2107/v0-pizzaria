"use client"

import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import {
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  LogOut,
} from "lucide-react"

// Tipos para os dados
type OrderItem = {
  id: string
  amount: number
  product: {
    id: string
    name: string
    price: number
  }
}

type Order = {
  id: string
  customer: string
  table?: string
  status: string
  draft: boolean
  name?: string
  created_at: string
  total: number
  items?: OrderItem[]
}

export default function DashboardPage() {
  const { user, isAuthenticated, loadingAuth, signOut } = useContext(AuthContext)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  // Logs de depuração
  console.log("🔄 Dashboard: Componente renderizado", {
    loadingAuth,
    isAuthenticated,
    user: user
      ? {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      : null,
  })

  // Proteção de rota
  useEffect(() => {
    console.log("🛡️ Dashboard: useEffect de proteção de rota", {
      loadingAuth,
      isAuthenticated,
      user: user
        ? {
            id: user.id,
            email: user.email,
            role: user.role,
          }
        : null,
    })

    if (!loadingAuth) {
      console.log("🛡️ Dashboard: loadingAuth terminou")

      if (!isAuthenticated) {
        console.log("🛡️ Dashboard: Usuário não autenticado, redirecionando")
        toast.error("Faça login para acessar o dashboard")
        router.push("/")
      } else {
        console.log("🛡️ Dashboard: Usuário autenticado, permitindo acesso")
      }
    } else {
      console.log("🛡️ Dashboard: Ainda carregando autenticação")
    }
  }, [isAuthenticated, loadingAuth, user, router])

  // Carregar pedidos (simulado)
  useEffect(() => {
    if (isAuthenticated && !loadingAuth) {
      loadOrders()
    }
  }, [isAuthenticated, loadingAuth])

  async function loadOrders() {
    console.log("📊 Dashboard: Iniciando loadOrders", { isAuthenticated })

    if (!isAuthenticated) {
      console.log("📊 Dashboard: Não autenticado, saindo de loadOrders")
      return
    }

    console.log("📊 Dashboard: Definindo loading=true")
    setLoading(true)

    try {
      // Simulando dados para demonstração
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockOrders: Order[] = [
        {
          id: "1",
          customer: "João Silva",
          table: "Mesa 5",
          status: "Preparando",
          draft: false,
          name: "Pedido #001",
          created_at: new Date().toISOString(),
          total: 45.9,
          items: [
            {
              id: "1",
              amount: 1,
              product: { id: "1", name: "Pizza Margherita", price: 35.9 },
            },
            {
              id: "2",
              amount: 1,
              product: { id: "2", name: "Coca-Cola 350ml", price: 10.0 },
            },
          ],
        },
        {
          id: "2",
          customer: "Maria Santos",
          table: "Mesa 3",
          status: "Pronto",
          draft: false,
          name: "Pedido #002",
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          total: 52.8,
          items: [
            {
              id: "3",
              amount: 1,
              product: { id: "3", name: "Pizza Calabresa", price: 42.8 },
            },
            {
              id: "4",
              amount: 1,
              product: { id: "4", name: "Guaraná 350ml", price: 10.0 },
            },
          ],
        },
        {
          id: "3",
          customer: "Pedro Costa",
          table: "Mesa 1",
          status: "Finalizado",
          draft: false,
          name: "Pedido #003",
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          total: 38.9,
          items: [
            {
              id: "5",
              amount: 1,
              product: { id: "5", name: "Pizza Portuguesa", price: 38.9 },
            },
          ],
        },
      ]

      console.log("📊 Dashboard: Dados simulados carregados", { count: mockOrders.length })
      setOrders(mockOrders)
    } catch (err) {
      console.error("📊 Dashboard: Erro ao carregar pedidos", err)
      toast.error("Erro ao carregar pedidos")
      setOrders([])
    } finally {
      console.log("📊 Dashboard: Definindo loading=false")
      setLoading(false)
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
    toast.success("Pedidos atualizados!")
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case "preparando":
        return "bg-yellow-100 text-yellow-800"
      case "pronto":
        return "bg-green-100 text-green-800"
      case "finalizado":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  function getStatusIcon(status: string) {
    switch (status.toLowerCase()) {
      case "preparando":
        return <Clock className="h-4 w-4" />
      case "pronto":
        return <CheckCircle className="h-4 w-4" />
      case "finalizado":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
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

  // Estatísticas
  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status !== "Finalizado").length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-orange-500 p-2 rounded-lg mr-3">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Pizzaria do Kassio</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Olá, {user?.name || user?.email}</span>
              <Button variant="outline" size="sm" onClick={signOut} className="text-gray-600 hover:text-gray-900">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">{pendingOrders} pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalOrders > 0 ? totalRevenue / totalOrders : 0)}
              </div>
              <p className="text-xs text-muted-foreground">Por pedido</p>
            </CardContent>
          </Card>
        </div>

        {/* Pedidos */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pedidos Recentes</CardTitle>
                <CardDescription>Acompanhe os pedidos em tempo real</CardDescription>
              </div>
              <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                  <span className="text-gray-600">Carregando pedidos...</span>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum pedido encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.name || `Pedido #${order.id}`}</h3>
                        <p className="text-sm text-gray-600">Cliente: {order.customer}</p>
                        {order.table && <p className="text-sm text-gray-600">{order.table}</p>}
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </div>
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">{formatTime(order.created_at)}</p>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Itens:</h4>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {item.amount}x {item.product.name}
                              </span>
                              <span className="text-gray-900">{formatCurrency(item.product.price * item.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="font-semibold text-lg">Total: {formatCurrency(order.total)}</span>
                      {order.status === "Pronto" && (
                        <Button size="sm" className="bg-green-500 hover:bg-green-600">
                          Finalizar Pedido
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
