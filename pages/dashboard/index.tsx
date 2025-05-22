"use client"

import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/contexts/auth-context"
import { useRouter } from "next/router"
import Head from "next/head"
import { toast } from "react-toastify"
import { api } from "@/services/api"

type Order = {
  id: string
  customer: string
  status: string
  table?: string
  created_at: string
  total: number
}

export default function DashboardPage() {
  const { user, isAuthenticated, loadingAuth } = useContext(AuthContext)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Proteção de rota no cliente
  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loadingAuth, router])

  // Carregar pedidos
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true)
        const response = await api.get("/orders")
        setOrders(response.data)
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error)
        toast.error("Erro ao carregar pedidos")
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      loadOrders()
    }
  }, [isAuthenticated])

  // Atualizar status do pedido
  async function handleUpdateStatus(id: string, status: string) {
    try {
      await api.put(`/orders/${id}`, { status })

      // Atualizar lista de pedidos
      setOrders(orders.map((order) => (order.id === id ? { ...order, status } : order)))

      toast.success(`Status atualizado para: ${status}`)
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast.error("Erro ao atualizar status do pedido")
    }
  }

  // Formatar data
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Formatar valor
  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Se não estiver autenticado, não renderiza nada (será redirecionado pelo useEffect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Head>
        <title>Dashboard - Pizzaria do Kassio</title>
      </Head>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <p className="mb-6">Bem-vindo, {user?.name || "Usuário"}!</p>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pedidos Recentes</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum pedido encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mesa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.table || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            order.status === "Pendente"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "Em Preparo"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Pronto"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/order/${order.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Detalhes
                        </button>
                        {order.status === "Pendente" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "Em Preparo")}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Preparar
                          </button>
                        )}
                        {order.status === "Em Preparo" && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "Pronto")}
                            className="text-green-600 hover:text-green-900"
                          >
                            Concluir
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
