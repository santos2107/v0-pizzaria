import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/middleware/api-auth"
import { produtosData, atualizarProduto, excluirProduto } from "@/app/produtos/data"

// GET /api/produtos/[id] - Obter um produto específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

  const produto = produtosData.find((p) => p.id === id)

  if (!produto) {
    return NextResponse.json(
      {
        success: false,
        error: "Produto não encontrado",
      },
      { status: 404 },
    )
  }

  return NextResponse.json({
    success: true,
    data: produto,
  })
}

// PUT /api/produtos/[id] - Atualizar um produto
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
    const produtoData = await request.json()
    const produtoAtualizado = atualizarProduto(id, produtoData)

    if (!produtoAtualizado) {
      return NextResponse.json(
        {
          success: false,
          error: "Produto não encontrado",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      data: produtoAtualizado,
    })
  } catch (error) {
    console.error("Erro ao atualizar produto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/produtos/[id] - Excluir um produto
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

  const produtoExcluido = excluirProduto(id)

  if (!produtoExcluido) {
    return NextResponse.json(
      {
        success: false,
        error: "Produto não encontrado",
      },
      { status: 404 },
    )
  }

  return NextResponse.json({
    success: true,
    message: "Produto excluído com sucesso",
    data: produtoExcluido,
  })
}
