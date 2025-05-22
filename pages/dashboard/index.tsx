"use client"

import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/contexts/auth-context"
import { useRouter } from "next/router"
import Head from "next/head"
import { toast } from "react-toastify"
import { api } from "@/services/api"
import Modal from "react-modal"
import { FiX } from "react-icons/fi"

// Definição do tipo para os pedidos
type OrderItemProps = {
  id: string
  customer: string
  table?: string
  status: string
  draft: boolean
  name?: string
  created_at: string
  updated_at: string
  total: number
}

// Definição do tipo para os itens do pedido
type OrderItemDetailProps = {
  id: string
  amount: number
  order_id: string
  product_id: string
  product: {
    id: string
    name: string
    price: string
    description: string
    banner: string
  }
}

// Definição do tipo para os detalhes do pedido
type OrderDetailsProps = {
  id: string
  table?: string | number
  status: boolean
  draft: boolean
  customer: string
  name?: string
  created_at: string
  updated_at: string
  total: number
  items: OrderItemDetailProps[]
}

export default function DashboardPage() {
  const { user, isAuthenticated, loadingAuth } = useContext(AuthContext)
  const [orders, setOrders] = useState<OrderItemProps[]>([])
  const [loading, setLoading] = useState(true)
  const [modalItem, setModalItem] = useState<OrderDetailsProps | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [loadingModal, setLoadingModal] = useState(false)
  const router = useRouter()

  // Proteção de rota no cliente
  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loadingAuth, router])

  // Carregar pedidos - Movido de getServerSideProps para useEffect
  useEffect(() => {
    async function loadOrders() {
      if (isAuthenticated) {
        // Garante que só busca se autenticado
        try {
          setLoading(true)
          const response = await api.get("/api/orders")
          setOrders(response.data)
        } catch (error) {
          console.error("Erro ao buscar pedidos:", error)
          toast.error("Erro ao carregar pedidos")
        } finally {
          setLoading(false)
        }
      }
    }

    loadOrders()
  }, [isAuthenticated]) // Executa quando isAuthenticated mudar

  // Função para abrir modal com detalhes do pedido
  async function handleOpenModalView(id: string) {
    try {
      setLoadingModal(true)
      const response = await api.get("/api/order/detail", {
        params: {
          order_id: id,
        },
      })

      setModalItem(response.data)
      setModalVisible(true)
    } catch (error) {
      console.error("Erro ao buscar detalhes do pedido:", error)
      toast.error("Erro ao buscar detalhes do pedido")
    } finally {
      setLoadingModal(false)
    }
  }

  // Função para fechar o modal
  function handleCloseModal() {
    setModalVisible(false)
    setModalItem(null)
  }

  // Função para finalizar um pedido
  async function handleFinishItem(id: string) {
    try {
      await api.put("/api/order/finish", {
        order_id: id,
      })

      // Atualiza a lista de pedidos removendo o pedido finalizado
      const updatedOrders = orders.filter((order) => order.id !== id)
      setOrders(updatedOrders)

      // Fecha o modal se estiver aberto
      setModalVisible(false)
      toast.success("Pedido finalizado com sucesso!")
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error)
      toast.error("Erro ao finalizar pedido")
    }
  }

  // Função para atualizar status do pedido
  async function handleUpdateStatus(id: string, status: string) {
    try {
      await api.put(`/api/orders/${id}`, { status })

      // Atualizar lista de pedidos
      setOrders(orders.map((order) => (order.id === id ? { ...order, status } : order)))

      toast.success(`Status atualizado para: ${status}`)
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast.error("Erro ao atualizar status do pedido")
    }
  }

  // Função para atualizar a lista de pedidos
  async function handleRefreshOrders() {
    try {
      setLoading(true)
      const response = await api.get("/api/orders")
      setOrders(response.data)
      toast.success("Pedidos atualizados!")
    } catch (error) {
      console.error("Erro ao atualizar pedidos:", error)
      toast.error("Erro ao atualizar pedidos")
    } finally {
      setLoading(false)
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

  // Estilos para o modal
  const customStyles = {
    content: {
      top: "50%",
      bottom: "auto",
      left: "50%",
      right: "auto",
      padding: "30px",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#fff",
      maxWidth: "800px",
      width: "90%",
    },
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

        <div className="flex justify-end mb-4">
          <button
            onClick={handleRefreshOrders}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
            disabled={loading}
          >
            {loading ? "Atualizando..." : "Atualizar Pedidos"}
          </button>
        </div>

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
                          onClick={() => handleOpenModalView(order.id)}
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
                        {order.status === "Pronto" && (
                          <button
                            onClick={() => handleFinishItem(order.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Finalizar
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

      {/* Modal de detalhes do pedido */}
      <Modal isOpen={modalVisible} onRequestClose={handleCloseModal} style={customStyles}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Detalhes do Pedido</h2>
          <button type="button" onClick={handleCloseModal} className="bg-transparent border-0 text-black text-2xl">
            <FiX size={24} />
          </button>
        </div>

        {loadingModal ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : modalItem ? (
          <div>
            <div className="flex flex-col mb-4">
              <span className="font-bold text-lg">
                Mesa: <span className="font-normal">{modalItem.table || "-"}</span>
              </span>
              <span className="font-bold text-lg">
                Cliente: <span className="font-normal">{modalItem.customer}</span>
              </span>
              <span className="font-bold text-lg">
                Data: <span className="font-normal">{formatDate(modalItem.created_at)}</span>
              </span>
              <span className="font-bold text-lg">
                Status:{" "}
                <span className="font-normal">{modalItem.status ? "Pedido Finalizado" : "Pedido em Aberto"}</span>
              </span>
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Itens do Pedido</h3>

              {modalItem.items.map((item) => (
                <div key={item.id} className="flex items-center border-b border-gray-200 py-3">
                  <div className="w-16 h-16 relative mr-4">
                    <img
                      src={item.product.banner ? item.product.banner : "/placeholder.png"}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{item.product.name}</p>
                    <p className="text-sm text-gray-500">{item.product.description}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm mr-2">
                        Quantidade: <strong>{item.amount}</strong>
                      </span>
                      <span className="text-sm">
                        Preço unitário: <strong>{formatCurrency(Number.parseFloat(item.product.price))}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div>
                <span className="font-bold text-lg">
                  Total: <span className="text-green-600">{formatCurrency(modalItem.total)}</span>
                </span>
              </div>

              {!modalItem.status && (
                <button
                  onClick={() => handleFinishItem(modalItem.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                >
                  Finalizar Pedido
                </button>
              )}
            </div>
          </div>
        ) : (
          <p>Nenhum detalhe encontrado para este pedido.</p>
        )}
      </Modal>
    </>
  )
}
