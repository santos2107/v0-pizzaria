import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/middleware/api-auth"
import {
  reservasData,
  atualizarReserva,
  excluirReserva,
  verificarDisponibilidadeMesa,
} from "@/app/reservas/data/reservas"
import { mesasData } from "@/app/pedidos/data/mesas"

// GET /api/reservas/[id] - Obter uma reserva específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Validar API key
    const authError = await validateApiKey(request)
    if (authError) return authError

    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "ID inválido",
        },
        { status: 400 },
      )
    }

    const reserva = reservasData.find((r) => r.id === id)

    if (!reserva) {
      return NextResponse.json(
        {
          success: false,
          error: "Reserva não encontrada",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: reserva,
    })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}

// PUT /api/reservas/[id] - Atualizar uma reserva
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Validar API key
  const authError = await validateApiKey(request)
  if (authError) return authError

  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json(
      {
        success: false,
        error: "ID inválido",
      },
      { status: 400 },
    )
  }

  try {
    const reservaData = await request.json()
    const reservaExistente = reservasData.find((r) => r.id === id)

    if (!reservaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: "Reserva não encontrada",
        },
        { status: 404 },
      )
    }

    // Se estiver alterando a mesa, data ou hora, verificar disponibilidade
    if (
      (reservaData.mesaId && reservaData.mesaId !== reservaExistente.mesaId) ||
      (reservaData.data && reservaData.data !== reservaExistente.data) ||
      (reservaData.hora && reservaData.hora !== reservaExistente.hora) ||
      (reservaData.duracao && reservaData.duracao !== reservaExistente.duracao)
    ) {
      const mesaId = reservaData.mesaId || reservaExistente.mesaId
      const data = reservaData.data || reservaExistente.data
      const hora = reservaData.hora || reservaExistente.hora
      const duracao = reservaData.duracao || reservaExistente.duracao

      // Verificar se a mesa existe
      const mesa = mesasData.find((m) => m.id === mesaId)
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
      const pessoas = reservaData.pessoas || reservaExistente.pessoas
      if (mesa.capacidade < pessoas) {
        return NextResponse.json(
          {
            success: false,
            error: `A mesa ${mesa.numero} tem capacidade para apenas ${mesa.capacidade} pessoas`,
          },
          { status: 400 },
        )
      }

      // Verificar disponibilidade da mesa (excluindo a própria reserva)
      const disponivel = verificarDisponibilidadeMesa(mesaId, data, hora, duracao, id)

      if (!disponivel) {
        return NextResponse.json(
          {
            success: false,
            error: "Mesa não disponível no horário selecionado",
          },
          { status: 400 },
        )
      }

      // Se a mesa mudou, atualizar o número da mesa
      if (reservaData.mesaId && reservaData.mesaId !== reservaExistente.mesaId) {
        reservaData.mesaNumero = mesa.numero
      }
    }

    // Atualizar a reserva
    const reservaAtualizada = atualizarReserva(id, reservaData)

    return NextResponse.json({
      success: true,
      data: reservaAtualizada,
    })
  } catch (error) {
    console.error("Erro ao atualizar reserva:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/reservas/[id] - Excluir uma reserva
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Validar API key
  const authError = await validateApiKey(request)
  if (authError) return authError

  const id = Number.parseInt(params.id)

  if (isNaN(id)) {
    return NextResponse.json(
      {
        success: false,
        error: "ID inválido",
      },
      { status: 400 },
    )
  }

  const sucesso = excluirReserva(id)

  if (!sucesso) {
    return NextResponse.json(
      {
        success: false,
        error: "Reserva não encontrada",
      },
      { status: 404 },
    )
  }

  return NextResponse.json({
    success: true,
    message: "Reserva excluída com sucesso",
  })
}
