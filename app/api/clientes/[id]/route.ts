import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/middleware/api-auth"
import type { Cliente } from "@/app/clientes/types"

// Simulação de banco de dados de clientes (referência à mesma variável do arquivo route.ts)
// Em um ambiente real, isso seria um banco de dados
const clientesData: Cliente[] = [
  {
    id: 1,
    nome: "Maria Silva",
    telefone: "(11) 98765-4321",
    email: "maria.silva@email.com",
    endereco: "Rua das Palmeiras, 234",
    bairro: "Jardim Europa",
    cidade: "São Paulo",
    cep: "01234-567",
    observacoes: "Cliente VIP",
    pedidos: 8,
    ultimoPedido: "2 dias atrás",
    valorTotal: 432.5,
  },
  // Outros clientes...
]

// GET /api/clientes/[id] - Obter um cliente específico
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

  const cliente = clientesData.find((c) => c.id === id)

  if (!cliente) {
    return NextResponse.json(
      {
        success: false,
        error: "Cliente não encontrado",
      },
      { status: 404 },
    )
  }

  return NextResponse.json({
    success: true,
    data: cliente,
  })
}

// PUT /api/clientes/[id] - Atualizar um cliente
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
    const clienteData = await request.json()
    const index = clientesData.findIndex((c) => c.id === id)

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Cliente não encontrado",
        },
        { status: 404 },
      )
    }

    // Atualizar o cliente
    clientesData[index] = {
      ...clientesData[index],
      ...clienteData,
      id, // Garantir que o ID não seja alterado
    }

    return NextResponse.json({
      success: true,
      data: clientesData[index],
    })
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}

// DELETE /api/clientes/[id] - Excluir um cliente
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

  const index = clientesData.findIndex((c) => c.id === id)

  if (index === -1) {
    return NextResponse.json(
      {
        success: false,
        error: "Cliente não encontrado",
      },
      { status: 404 },
    )
  }

  // Excluir o cliente
  const clienteExcluido = clientesData[index]
  clientesData.splice(index, 1)

  return NextResponse.json({
    success: true,
    message: "Cliente excluído com sucesso",
    data: clienteExcluido,
  })
}
