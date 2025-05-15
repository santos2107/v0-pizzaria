import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/middleware/api-auth"
import { mesasData, adicionarMesa } from "@/app/pedidos/data/mesas"

// GET /api/mesas - Listar todas as mesas
export async function GET(request: NextRequest) {
  try {
    // Validar API key
    const authError = await validateApiKey(request)
    if (authError) return authError

    // Verificar se há filtros
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const numero = searchParams.get("numero")
    const capacidade = searchParams.get("capacidade")

    let mesasFiltradas = [...mesasData]

    // Aplicar filtros
    if (status) {
      mesasFiltradas = mesasFiltradas.filter((mesa) => mesa.status === status)
    }

    if (numero) {
      mesasFiltradas = mesasFiltradas.filter((mesa) => mesa.numero.includes(numero))
    }

    if (capacidade) {
      const capacidadeMin = Number.parseInt(capacidade, 10)
      if (!isNaN(capacidadeMin)) {
        mesasFiltradas = mesasFiltradas.filter((mesa) => mesa.capacidade >= capacidadeMin)
      }
    }

    return NextResponse.json({
      success: true,
      count: mesasFiltradas.length,
      data: mesasFiltradas,
    })
  } catch (error) {
    console.error("Erro ao listar mesas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}

// POST /api/mesas - Criar uma nova mesa
export async function POST(request: NextRequest) {
  // Validar API key
  const authError = await validateApiKey(request)
  if (authError) return authError

  try {
    const mesaData = await request.json()

    // Validar dados obrigatórios
    if (!mesaData.numero || !mesaData.capacidade) {
      return NextResponse.json(
        {
          success: false,
          error: "Número e capacidade são obrigatórios",
        },
        { status: 400 },
      )
    }

    // Verificar se já existe uma mesa com o mesmo número
    const mesaExistente = mesasData.find((m) => m.numero === mesaData.numero)
    if (mesaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: "Já existe uma mesa com este número",
        },
        { status: 400 },
      )
    }

    // Adicionar a nova mesa
    const novaMesa = adicionarMesa({
      numero: mesaData.numero,
      capacidade: Number(mesaData.capacidade),
      status: mesaData.status || "Disponível",
      localizacao: mesaData.localizacao,
      observacoes: mesaData.observacoes,
      mesasCombinadas: mesaData.mesasCombinadas,
    })

    return NextResponse.json({
      success: true,
      data: novaMesa,
    })
  } catch (error) {
    console.error("Erro ao criar mesa:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 },
    )
  }
}
