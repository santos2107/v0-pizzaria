"use client"

import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/contexts/auth-context"
import { useRouter } from "next/router"
import Head from "next/head"
import { toast } from "react-toastify"
import { Dialog } from "@headlessui/react"

// Tipos
type ItemPedido = {
  id: number
  pedido_id: number
  produto_id: number
  quantidade: number
  preco_unitario: number
  observacoes?: string
  produto: {
    id: number
    nome: string
    descricao?: string
    preco: number
    categoria: string
    imagem_url?: string
  }
}

type Pedido = {
  id: number
  cliente_id: string
  mesa_id?: number
  status: "Pendente" | "Em Preparo" | "Pronto" | "Entregue" | "Cancelado"
  tipo_entrega: string
  valor_total: number
  observacoes?: string
  created_at: string
  updated_at: string
  cliente?: {
    id: string
    nome: string
    telefone?: string
    email?: string
  }
  mesa?: {
    id: number
    numero: string
    capacidade: number
  }
  itens: ItemPedido[]
}

export default function DashboardPage() {
  const { user, isAuthenticated, loadingAuth } = useContext(AuthContext)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [atualizandoStatus, setAtualizandoStatus] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string>("Pendente")
  const router = useRouter()

  // Buscar role do usuário
  useEffect(() => {
    async function fetchUserRole() {
      if (!user) return

      try {
        const response = await fetch("/api/me/role")
        if (!response.ok) throw new Error("Falha ao buscar role")

        const data = await response.json()
        setUserRole(data.role)
      } catch (error) {
        console.error("Erro ao buscar role:", error)
      }
    }

    if (user) {
      fetchUserRole()
    }
  }, [user])

  // Buscar pedidos
  useEffect(() => {
    async function fetchPedidos() {
      try {
        const response = await fetch(`/api/pedidos?status=${filtroStatus}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}`,
          },
        })

        if (!response.ok) throw new Error("Falha ao buscar pedidos")

        const data = await response.json()
        setPedidos(data)
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error)
        toast.error("Erro ao carregar pedidos")
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchPedidos()
    }
  }, [isAuthenticated, filtroStatus])

  // Atualizar pedidos a cada 30 segundos
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      fetchPedidos()
    }, 30000) // 30 segundos

    return () => clearInterval(interval)
  }, [isAuthenticated, filtroStatus])

  // Função para buscar pedidos (usada no refresh manual e no interval)
  async function fetchPedidos() {
    try {
      const response = await fetch(`/api/pedidos?status=${filtroStatus}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}`,
        },
      })

      if (!response.ok) throw new Error("Falha ao buscar pedidos")

      const data = await response.json()
      setPedidos(data)
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error)
    }
  }

  // Proteção de rota no cliente
  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loadingAuth, router])

  // Abrir modal de detalhes do pedido
  function abrirDetalhesPedido(pedido: Pedido) {
    setPedidoSelecionado(pedido)
    setModalAberto(true)
  }

  // Atualizar status do pedido
  async function atualizarStatusPedido(pedidoId: number, novoStatus: string) {
    setAtualizandoStatus(true)

    try {
      const response = await fetch(`/api/pedidos/${pedidoId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}`,
        },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao atualizar status")
      }

      const pedidoAtualizado = await response.json()

      // Atualizar lista de pedidos
      setPedidos((prev) => prev.map((p) => (p.id === pedidoId ? { ...p, status: pedidoAtualizado.status } : p)))

      // Atualizar pedido selecionado se estiver aberto no modal
      if (pedidoSelecionado && pedidoSelecionado.id === pedidoId) {
        setPedidoSelecionado({ ...pedidoSelecionado, status: pedidoAtualizado.status })
      }

      toast.success(`Status atualizado para: ${novoStatus}`)

      // Se o status não for mais o filtrado, remover da lista
      if (novoStatus !== filtroStatus) {
        setPedidos((prev) => prev.filter((p) => p.id !== pedidoId))
      }
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error)
      toast.error(error.message || "Erro ao atualizar status")
    } finally {
      setAtualizandoStatus(false)
    }
  }

  // Próximo status baseado no status atual
  function getProximoStatus(statusAtual: string) {
    const fluxoStatus: Record<string, string> = {
      Pendente: "Em Preparo",
      "Em Preparo": "Pronto",
      Pronto: "Entregue",
    }

    return fluxoStatus[statusAtual] || null
  }

  // Formatar data
  function formatarData(dataString: string) {
    const data = new Date(dataString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(data)
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gerenciar Pedidos</h1>

          <div className="flex items-center space-x-4">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="Pendente">Pendentes</option>
              <option value="Em Preparo">Em Preparo</option>
              <option value="Pronto">Prontos</option>
              <option value="Entregue">Entregues</option>
              <option value="Cancelado">Cancelados</option>
            </select>

            <button
              onClick={() => fetchPedidos()}
              className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              title="Atualizar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Lista de pedidos */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Nenhum pedido {filtroStatus.toLowerCase()} encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Pedido #{pedido.id}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pedido.status === "Pendente"
                          ? "bg-yellow-100 text-yellow-800"
                          : pedido.status === "Em Preparo"
                            ? "bg-blue-100 text-blue-800"
                            : pedido.status === "Pronto"
                              ? "bg-green-100 text-green-800"
                              : pedido.status === "Entregue"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                      }`}
                    >
                      {pedido.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{formatarData(pedido.created_at)}</p>
                </div>

                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Cliente:</p>
                    <p className="text-sm text-gray-900">{pedido.cliente?.nome || "Cliente não identificado"}</p>
                  </div>

                  {pedido.mesa && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700">Mesa:</p>
                      <p className="text-sm text-gray-900">{pedido.mesa.numero}</p>
                    </div>
                  )}

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Itens:</p>
                    <p className="text-sm text-gray-900">{pedido.itens.length} item(ns)</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Valor Total:</p>
                    <p className="text-sm text-gray-900">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(pedido.valor_total)}
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => abrirDetalhesPedido(pedido)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Ver Detalhes
                    </button>

                    {getProximoStatus(pedido.status) && (userRole === "admin" || userRole === "staff") && (
                      <button
                        onClick={() => atualizarStatusPedido(pedido.id, getProximoStatus(pedido.status)!)}
                        disabled={atualizandoStatus}
                        className="px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                      >
                        {atualizandoStatus ? "Atualizando..." : getProximoStatus(pedido.status)}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalhes do pedido */}
      <Dialog open={modalAberto} onClose={() => setModalAberto(false)} className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-3xl w-full mx-4 shadow-xl">
            {pedidoSelecionado && (
              <>
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <Dialog.Title className="text-xl font-semibold">
                      Detalhes do Pedido #{pedidoSelecionado.id}
                    </Dialog.Title>

                    <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                      <p
                        className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                          pedidoSelecionado.status === "Pendente"
                            ? "bg-yellow-100 text-yellow-800"
                            : pedidoSelecionado.status === "Em Preparo"
                              ? "bg-blue-100 text-blue-800"
                              : pedidoSelecionado.status === "Pronto"
                                ? "bg-green-100 text-green-800"
                                : pedidoSelecionado.status === "Entregue"
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-800"
                        }`}
                      >
                        {pedidoSelecionado.status}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Data do Pedido</h3>
                      <p className="text-gray-900">{formatarData(pedidoSelecionado.created_at)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Cliente</h3>
                      <p className="text-gray-900">{pedidoSelecionado.cliente?.nome || "Cliente não identificado"}</p>
                    </div>

                    {pedidoSelecionado.mesa && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Mesa</h3>
                        <p className="text-gray-900">{pedidoSelecionado.mesa.numero}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Tipo de Entrega</h3>
                      <p className="text-gray-900">{pedidoSelecionado.tipo_entrega}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Valor Total</h3>
                      <p className="text-gray-900 font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(pedidoSelecionado.valor_total)}
                      </p>
                    </div>
                  </div>

                  {pedidoSelecionado.observacoes && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Observações</h3>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded">{pedidoSelecionado.observacoes}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Itens do Pedido</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Produto
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Qtd
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Preço Unit.
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {pedidoSelecionado.itens.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{item.produto.nome}</div>
                                {item.observacoes && (
                                  <div className="text-xs text-gray-500 mt-1">{item.observacoes}</div>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">
                                {item.quantidade}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(item.preco_unitario)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(item.quantidade * item.preco_unitario)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-between">
                  <button
                    onClick={() => setModalAberto(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Fechar
                  </button>

                  {getProximoStatus(pedidoSelecionado.status) && (userRole === "admin" || userRole === "staff") && (
                    <button
                      onClick={() => {
                        atualizarStatusPedido(pedidoSelecionado.id, getProximoStatus(pedidoSelecionado.status)!)
                        setModalAberto(false)
                      }}
                      disabled={atualizandoStatus}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                    >
                      {atualizandoStatus
                        ? "Atualizando..."
                        : `Avançar para ${getProximoStatus(pedidoSelecionado.status)}`}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Dialog>
    </>
  )
}
