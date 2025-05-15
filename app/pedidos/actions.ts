"use server"

import { revalidatePath } from "next/cache"
import { atualizarStatusMesa } from "./data/mesas"

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
  mesaId?: number | null
  tipoAtendimento: string
  statusUpdatedAt?: Record<string, string> // Registro de quando cada status foi atingido
  clienteId?: string | null
  clienteEmail?: string | null
  clienteTelefone?: string | null
}

// Lista de pedidos (simulando um banco de dados)
let pedidosData: Pedido[] = []

// Modificar a função adicionarPedido para garantir que o pedido comece como Pendente
export async function adicionarPedido(pedido: Pedido) {
  const now = new Date().toISOString()

  // Garantir que o pedido comece como Pendente
  const novoPedido = {
    ...pedido,
    status: "Pendente",
    startTime: now,
    statusUpdatedAt: {
      Pendente: now,
    },
    tipoAtendimento: pedido.tipoAtendimento || "delivery", // Garantir que o tipo de atendimento seja armazenado
  }

  // Adicionar o pedido à lista
  pedidosData = [novoPedido, ...pedidosData]

  // Se for um pedido para mesa, atualizar o status da mesa para "Ocupada"
  if (novoPedido.tipoAtendimento === "mesa" && novoPedido.mesaId) {
    // Atualizar o status da mesa para "Ocupada"
    atualizarStatusMesa(novoPedido.mesaId, "Ocupada")
    console.log(`Mesa ${novoPedido.mesaId} atualizada para status: Ocupada`)
  }

  // Revalidar a página de pedidos para atualizar os dados
  revalidatePath("/pedidos")
  revalidatePath("/mesas")
  revalidatePath("/cozinha")
  revalidatePath("/pedidos/novo")

  return { success: true, pedido: novoPedido }
}

// Função para obter todos os pedidos
export async function obterPedidos() {
  return pedidosData
}

// Função para atualizar o status de um pedido
export async function atualizarStatusPedido(id: string, novoStatus: string) {
  const now = new Date().toISOString()
  const pedidoAtual = pedidosData.find((pedido) => pedido.id === id)

  pedidosData = pedidosData.map((pedido) => {
    if (pedido.id === id) {
      // Atualizar o status e registrar quando foi atualizado
      const statusUpdatedAt = { ...pedido.statusUpdatedAt } || {}
      statusUpdatedAt[novoStatus] = now

      return {
        ...pedido,
        status: novoStatus,
        statusUpdatedAt,
      }
    }
    return pedido
  })

  // Se o pedido for concluído e for de mesa, liberar a mesa
  if (novoStatus === "Concluído" && pedidoAtual?.tipoAtendimento === "mesa" && pedidoAtual?.mesaId) {
    atualizarStatusMesa(pedidoAtual.mesaId, "Disponível")
    console.log(`Mesa ${pedidoAtual.mesaId} atualizada para status: Disponível`)
  }

  revalidatePath("/pedidos")
  revalidatePath("/mesas")
  revalidatePath("/cozinha")
  revalidatePath("/pedidos/novo")
  return { success: true }
}

// Função para obter pedidos por mesa
export async function obterPedidosPorMesa(mesaId: number) {
  return pedidosData.filter(
    (pedido) => pedido.mesaId === mesaId && pedido.status !== "Concluído" && pedido.tipoAtendimento === "mesa",
  )
}

// Função para verificar se uma mesa está ocupada
export async function verificarMesaOcupada(mesaId: number) {
  const pedidosMesa = await obterPedidosPorMesa(mesaId)
  return pedidosMesa.length > 0
}

// Função para atualizar um pedido
export async function atualizarPedido(id: string, pedidoAtualizado: Pedido) {
  pedidosData = pedidosData.map((pedido) => (pedido.id === id ? pedidoAtualizado : pedido))

  revalidatePath("/pedidos")
  revalidatePath("/mesas")
  revalidatePath("/cozinha")
  revalidatePath("/pedidos/novo")
  return { success: true, pedido: pedidoAtualizado }
}

// Adicionar uma nova função para fechar a conta de uma mesa
export async function fecharContaMesa(mesaId: number) {
  const now = new Date().toISOString()

  // Encontrar todos os pedidos ativos da mesa
  const pedidosMesa = pedidosData.filter(
    (pedido) => pedido.mesaId === mesaId && pedido.status !== "Concluído" && pedido.tipoAtendimento === "mesa",
  )

  // Marcar todos os pedidos da mesa como concluídos
  pedidosData = pedidosData.map((pedido) => {
    if (pedido.mesaId === mesaId && pedido.status !== "Concluído" && pedido.tipoAtendimento === "mesa") {
      const statusUpdatedAt = { ...pedido.statusUpdatedAt } || {}
      statusUpdatedAt["Concluído"] = now

      return {
        ...pedido,
        status: "Concluído",
        statusUpdatedAt,
      }
    }
    return pedido
  })

  // Liberar a mesa
  atualizarStatusMesa(mesaId, "Disponível")
  console.log(`Mesa ${mesaId} atualizada para status: Disponível`)

  revalidatePath("/pedidos")
  revalidatePath("/mesas")
  revalidatePath("/cozinha")
  revalidatePath("/pedidos/novo")

  return { success: true, pedidosConcluidos: pedidosMesa.length }
}

// Função para obter pedidos por cliente
export async function obterPedidosPorCliente(clienteId: string) {
  return pedidosData.filter((pedido) => pedido.clienteId === clienteId)
}

// Adicione uma função para buscar pedidos por mesa
export async function getPedidosByMesa(mesaId: string) {
  try {
    const response = await fetch(`/api/mesas/${mesaId}`)
    if (!response.ok) {
      throw new Error("Erro ao buscar pedidos da mesa")
    }
    const data = await response.json()
    return data.pedidos || []
  } catch (error) {
    console.error("Erro ao buscar pedidos da mesa:", error)
    return []
  }
}
