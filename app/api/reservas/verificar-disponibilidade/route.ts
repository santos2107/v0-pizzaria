import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/middleware/api-auth"
import { verificarDisponibilidadeMesa } from "@/app/reservas/data/reservas"

// GET /api/reservas/verificar-disponibilidade - Verificar disponibilidade de mesa
export async function GET(request: NextRequest) {
  // Validar API key
  const authError = await validateApiKey(request)
  if (authError) return authError

  const { searchParams } = new URL(request.url)
  const mesaId = searchParams.get("mesaId")
  const data = searchParams.get("data")
  const hora = searchParams.get("hora")
  const duracao = searchParams.get("duracao")
  const reservaId = searchParams.get("reservaId")

  // Validar parâmetros
  if (!mesaId || !data || !hora || !duracao) {
    return NextResponse.json(
      {
        success: false,
        error: "Parâmetros incompletos. Informe mesaId, data, hora e duracao.",
      },
      { status: 400 },
    )
  }

  try {
    const mesaIdNum = Number.parseInt(mesaId)
    const duracaoNum = Number.parseInt(duracao)
    const reservaIdNum = reservaId ? Number.parseInt(reservaId) : undefined

    if (isNaN(mesaIdNum) || isNaN(duracaoNum) || (reservaId && isNaN(reservaIdNum))) {
      return NextResponse.json(
        {
          success: false,
          error: "Parâmetros inválidos. mesaId, duracao e reservaId (se fornecido) devem ser números.",
        },
        { status: 400 },
      )
    }

    const disponivel = verificarDisponibilidadeMesa(mesaIdNum, data, hora, duracaoNum, reservaIdNum)

    return NextResponse.json({
      success: true,
      disponivel,
    })
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}
