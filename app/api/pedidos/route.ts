import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/middleware/api-auth"
import { obterPedidos, adicionarPedido } from "@/app/pedidos/actions"

// GET /api/pedidos - Listar todos os pedidos
export async function GET(request: NextRequest) {
  // Validar API key
  const authError = await validateApiKey(request)
  if (authError) return authError

  try {
    const pedidos = await obterPedidos()

    // Processar parâmetros de consulta para filtros
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const clienteId = url.searchParams.get("cliente_id")

    let pedidosFiltrados = pedidos

    // Aplicar filtros se fornecidos
    if (status) {
      pedidosFiltrados = pedidosFiltrados.filter((p) => p.status.toLowerCase() === status.toLowerCase())
    }

    if (clienteId) {
      pedidosFiltrados = pedidosFiltrados.filter((p) => p.clienteId === clienteId)
    }

    return NextResponse.json({
      success: true,
      count: pedidosFiltrados.length,
      data: pedidosFiltrados,
    })
  } catch (error) {
    console.error("Erro ao obter pedidos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}

// POST /api/pedidos - Criar um novo pedido
export async function POST(request: NextRequest) {
  // Validar API key
  const authError = await validateApiKey(request)
  if (authError) return authError

  try {
    const pedidoData = await request.json()

    // Validação básica
    if (!pedidoData.itens || !Array.isArray(pedidoData.itens) || pedidoData.itens.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "O pedido deve conter pelo menos um item",
        },
        { status: 400 },
      )
    }

    // Gerar ID único para o pedido
    const id = `pedido_${Date.now()}`
    const novoPedido = {
      id,
      ...pedidoData,
      horario: new Date().toISOString(),
    }

    // Adicionar o pedido
    const resultado = await adicionarPedido(novoPedido)

    if (resultado.success) {
      return NextResponse.json(
        {
          success: true,
          data: resultado.pedido,
        },
        { status: 201 },
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao criar pedido",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Erro ao criar pedido:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}
