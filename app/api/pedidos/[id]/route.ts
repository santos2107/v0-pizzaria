import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/middleware/api-auth"
import { obterPedidos, atualizarPedido, atualizarStatusPedido } from "@/app/pedidos/actions"

// GET /api/pedidos/[id] - Obter um pedido específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Validar API key
  const authError = await validateApiKey(request)
  if (authError) return authError

  const id = params.id

  try {
    const pedidos = await obterPedidos()
    const pedido = pedidos.find((p) => p.id === id)

    if (!pedido) {
      return NextResponse.json(
        {
          success: false,
          error: "Pedido não encontrado",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: pedido,
    })
  } catch (error) {
    console.error("Erro ao obter pedido:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}

// PUT /api/pedidos/[id] - Atualizar um pedido
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Validar API key
  const authError = await validateApiKey(request)
  if (authError) return authError

  const id = params.id

  try {
    const pedidoData = await request.json()

    // Verificar se o pedido existe
    const pedidos = await obterPedidos()
    const pedidoExistente = pedidos.find((p) => p.id === id)

    if (!pedidoExistente) {
      return NextResponse.json(
        {
          success: false,
          error: "Pedido não encontrado",
        },
        { status: 404 },
      )
    }

    // Se apenas o status estiver sendo atualizado, use a função específica
    if (Object.keys(pedidoData).length === 1 && pedidoData.status) {
      const resultado = await atualizarStatusPedido(id, pedidoData.status)

      if (resultado.success) {
        return NextResponse.json({
          success: true,
          message: `Status do pedido atualizado para ${pedidoData.status}`,
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Erro ao atualizar status do pedido",
          },
          { status: 500 },
        )
      }
    }

    // Caso contrário, atualizar o pedido completo
    const pedidoAtualizado = {
      ...pedidoExistente,
      ...pedidoData,
      id, // Garantir que o ID não seja alterado
    }

    const resultado = await atualizarPedido(id, pedidoAtualizado)

    if (resultado.success) {
      return NextResponse.json({
        success: true,
        data: resultado.pedido,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao atualizar pedido",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}
