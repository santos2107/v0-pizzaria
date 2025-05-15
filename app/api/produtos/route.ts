import { type NextRequest, NextResponse } from "next/server"
import { produtosData, adicionarProduto } from "@/app/produtos/data"

// GET /api/produtos - Listar todos os produtos
export async function GET(request: NextRequest) {
  try {
    // Comentado temporariamente para fins de desenvolvimento
    // const authError = await validateApiKey(request)
    // if (authError) return authError

    // Processar parâmetros de consulta para filtros
    const url = new URL(request.url)
    const categoria = url.searchParams.get("categoria")
    const disponivel = url.searchParams.get("disponivel")
    const nome = url.searchParams.get("nome")

    let produtos = [...produtosData]

    // Aplicar filtros se fornecidos
    if (categoria) {
      produtos = produtos.filter((p) => p.categoria.toLowerCase() === categoria.toLowerCase())
    }

    if (disponivel !== null) {
      const isDisponivel = disponivel === "true"
      produtos = produtos.filter((p) => p.disponivel === isDisponivel)
    }

    if (nome) {
      produtos = produtos.filter((p) => p.nome.toLowerCase().includes(nome.toLowerCase()))
    }

    return NextResponse.json({
      success: true,
      count: produtos.length,
      data: produtos,
    })
  } catch (error) {
    console.error("Erro ao processar requisição de produtos:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno ao processar a requisição",
      },
      { status: 500 },
    )
  }
}

// POST /api/produtos - Criar um novo produto
export async function POST(request: NextRequest) {
  try {
    // Comentado temporariamente para fins de desenvolvimento
    // const authError = await validateApiKey(request)
    // if (authError) return authError

    const produtoData = await request.json()

    // Validação básica
    if (!produtoData.nome || !produtoData.categoria) {
      return NextResponse.json(
        {
          success: false,
          error: "Nome e categoria são campos obrigatórios",
        },
        { status: 400 },
      )
    }

    // Adicionar o produto
    const novoProduto = adicionarProduto(produtoData)

    return NextResponse.json(
      {
        success: true,
        data: novoProduto,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao criar produto:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}
