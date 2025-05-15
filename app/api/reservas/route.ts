import { type NextRequest, NextResponse } from "next/server"
import {
  reservasData,
  adicionarReserva,
  verificarDisponibilidadeMesa,
  obterReservasPorData,
} from "@/app/reservas/data/reservas"
import { mesasData } from "@/app/pedidos/data/mesas"

// GET /api/reservas - Listar todas as reservas
export async function GET(request: NextRequest) {
  try {
    // Comentando temporariamente a validação da API key para fins de desenvolvimento
    // const authError = await validateApiKey(request)
    // if (authError) return authError

    // Verificar se há filtros
    const { searchParams } = new URL(request.url)
    const data = searchParams.get("data")
    const status = searchParams.get("status")
    const mesaId = searchParams.get("mesaId")
    const clienteId = searchParams.get("clienteId")

    let reservasFiltradas = [...reservasData]

    // Aplicar filtros
    if (data) {
      reservasFiltradas = obterReservasPorData(data)
    }

    if (status) {
      reservasFiltradas = reservasFiltradas.filter((reserva) => reserva.status === status)
    }

    if (mesaId) {
      const mesaIdNum = Number.parseInt(mesaId)
      reservasFiltradas = reservasFiltradas.filter((reserva) => reserva.mesaId === mesaIdNum)
    }

    if (clienteId) {
      const clienteIdNum = Number.parseInt(clienteId)
      reservasFiltradas = reservasFiltradas.filter((reserva) => reserva.clienteId === clienteIdNum)
    }

    return NextResponse.json({
      success: true,
      count: reservasFiltradas.length,
      data: reservasFiltradas,
    })
  } catch (error) {
    console.error("Erro ao processar requisição de reservas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno ao processar requisição",
      },
      { status: 500 },
    )
  }
}

// POST /api/reservas - Criar uma nova reserva
export async function POST(request: NextRequest) {
  try {
    // Comentando temporariamente a validação da API key para fins de desenvolvimento
    // const authError = await validateApiKey(request)
    // if (authError) return authError

    const reservaData = await request.json()

    // Validar dados obrigatórios
    const camposObrigatorios = ["mesaId", "clienteNome", "clienteTelefone", "data", "hora", "duracao", "pessoas"]

    for (const campo of camposObrigatorios) {
      if (!reservaData[campo]) {
        return NextResponse.json(
          {
            success: false,
            error: `Campo obrigatório não informado: ${campo}`,
          },
          { status: 400 },
        )
      }
    }

    // Verificar se a mesa existe
    const mesa = mesasData.find((m) => m.id === reservaData.mesaId)
    if (!mesa) {
      return NextResponse.json(
        {
          success: false,
          error: "Mesa não encontrada",
        },
        { status: 404 },
      )
    }

    // Verificar se a capacidade da mesa é suficiente
    if (mesa.capacidade < reservaData.pessoas) {
      return NextResponse.json(
        {
          success: false,
          error: `A mesa ${mesa.numero} tem capacidade para apenas ${mesa.capacidade} pessoas`,
        },
        { status: 400 },
      )
    }

    // Verificar disponibilidade da mesa
    const disponivel = verificarDisponibilidadeMesa(
      reservaData.mesaId,
      reservaData.data,
      reservaData.hora,
      reservaData.duracao,
    )

    if (!disponivel) {
      return NextResponse.json(
        {
          success: false,
          error: "Mesa não disponível no horário selecionado",
        },
        { status: 400 },
      )
    }

    // Adicionar número da mesa
    reservaData.mesaNumero = mesa.numero

    // Definir status padrão se não informado
    if (!reservaData.status) {
      reservaData.status = "pendente"
    }

    // Criar a reserva
    const novaReserva = adicionarReserva(reservaData)

    return NextResponse.json({
      success: true,
      data: novaReserva,
    })
  } catch (error) {
    console.error("Erro ao criar reserva:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}
