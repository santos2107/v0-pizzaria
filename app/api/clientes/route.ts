import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/middleware/api-auth"
import type { Cliente } from "@/app/clientes/types"

// Simulação de banco de dados de clientes
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
  {
    id: 2,
    nome: "João Pereira",
    telefone: "(11) 97654-3210",
    email: "joao.pereira@email.com",
    endereco: "Av. Brasil, 567",
    bairro: "Centro",
    cidade: "São Paulo",
    cep: "04321-765",
    observacoes: "",
    pedidos: 5,
    ultimoPedido: "1 semana atrás",
    valorTotal: 287.3,
  },
  // Outros clientes...
]

// GET /api/clientes - Listar todos os clientes
export async function GET(request: NextRequest) {
  // Validar API key
  const authError = await validateApiKey(request)
  if (authError) return authError

  // Processar parâmetros de consulta para filtros
  const url = new URL(request.url)
  const nome = url.searchParams.get("nome")
  const email = url.searchParams.get("email")
  const telefone = url.searchParams.get("telefone")

  let clientes = [...clientesData]

  // Aplicar filtros se fornecidos
  if (nome) {
    clientes = clientes.filter((c) => c.nome.toLowerCase().includes(nome.toLowerCase()))
  }

  if (email) {
    clientes = clientes.filter((c) => c.email.toLowerCase().includes(email.toLowerCase()))
  }

  if (telefone) {
    clientes = clientes.filter((c) => c.telefone.includes(telefone))
  }

  return NextResponse.json({
    success: true,
    count: clientes.length,
    data: clientes,
  })
}

// POST /api/clientes - Criar um novo cliente
export async function POST(request: NextRequest) {
  // Validar API key
  const authError = await validateApiKey(request)
  if (authError) return authError

  try {
    const clienteData = await request.json()

    // Validação básica
    if (!clienteData.nome || !clienteData.telefone) {
      return NextResponse.json(
        {
          success: false,
          error: "Nome e telefone são campos obrigatórios",
        },
        { status: 400 },
      )
    }

    // Gerar ID único para o cliente
    const id = Math.max(...clientesData.map((c) => c.id)) + 1

    const novoCliente: Cliente = {
      id,
      ...clienteData,
      pedidos: 0,
      ultimoPedido: "Nunca",
      valorTotal: 0,
    }

    // Adicionar o cliente
    clientesData.push(novoCliente)

    return NextResponse.json(
      {
        success: true,
        data: novoCliente,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erro ao criar cliente:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}
