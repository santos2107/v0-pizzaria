import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/middleware/api-auth"
import { mesasData, separarMesasCombinadas } from "@/app/pedidos/data/mesas"

// POST /api/mesas/separar - Separar mesas combinadas
export async function POST(request: NextRequest) {
  // Validar API key
  const authError = await validateApiKey(request)
  if (authError) return authError

  try {
    const { mesaId } = await request.json()

    if (!mesaId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID da mesa é obrigatório",
        },
        { status: 400 },
      )
    }

    // Encontrar a mesa
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

    // Verificar se é uma mesa combinada
    if (!mesa.mesasCombinadas || mesa.mesasCombinadas.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Esta mesa não é uma combinação de outras mesas",
        },
        { status: 400 },
      )
    }

    // Separar as mesas
    const resultado = separarMesasCombinadas(mesaId)

    if (!resultado) {
      return NextResponse.json(
        {
          success: false,
          error: "Não foi possível separar as mesas",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Mesas separadas com sucesso",
    })
  } catch (error) {
    console.error("Erro ao separar mesas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}
