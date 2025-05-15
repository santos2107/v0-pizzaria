import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/middleware/api-auth"
import { mesasData, atualizarStatusMesa } from "@/app/pedidos/data/mesas"

// GET /api/mesas/[id] - Obter uma mesa específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Buscar a mesa diretamente do array mesasData em vez de fazer uma chamada API
    const id = Number.parseInt(params.id, 10)
    const mesa = mesasData.find((m) => m.id === id)

    if (!mesa) {
      return new Response(JSON.stringify({ error: "Mesa não encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Buscar os pedidos relacionados à mesa (se necessário)
    // Nota: Podemos implementar isso posteriormente se necessário

    return new Response(
      JSON.stringify({
        success: true,
        data: mesa,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Erro ao buscar mesa:", error)
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// PUT /api/mesas/[id] - Atualizar uma mesa
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
    const mesaData = await request.json()
    const index = mesasData.findIndex((m) => m.id === id)

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Mesa não encontrada",
        },
        { status: 404 },
      )
    }

    // Se apenas o status estiver sendo atualizado, use a função específica
    if (Object.keys(mesaData).length === 1 && mesaData.status) {
      atualizarStatusMesa(id, mesaData.status)

      return NextResponse.json({
        success: true,
        message: `Status da mesa atualizado para ${mesaData.status}`,
        data: mesasData.find((m) => m.id === id),
      })
    }

    // Caso contrário, atualizar a mesa completa
    mesasData[index] = {
      ...mesasData[index],
      ...mesaData,
      id, // Garantir que o ID não seja alterado
    }

    return NextResponse.json({
      success: true,
      data: mesasData[index],
    })
  } catch (error) {
    console.error("Erro ao atualizar mesa:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/mesas/[id] - Excluir uma mesa
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

  const index = mesasData.findIndex((m) => m.id === id)

  if (index === -1) {
    return NextResponse.json(
      {
        success: false,
        error: "Mesa não encontrada",
      },
      { status: 404 },
    )
  }

  // Excluir a mesa
  const mesaExcluida = mesasData[index]
  mesasData.splice(index, 1)

  return NextResponse.json({
    success: true,
    message: "Mesa excluída com sucesso",
    data: mesaExcluida,
  })
}
