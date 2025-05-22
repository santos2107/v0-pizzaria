import { type NextRequest, NextResponse } from "next/server";
// import { validateApiKey } from "@/middleware/api-auth"; // Temporariamente comentado para teste
import {
  obterTodasAsMesas,
  adicionarNovaMesa,
} from "./mesasService"; 

// GET /api/mesas - Listar todas as mesas
export async function GET(request: NextRequest) {
  try {
    // const authError = await validateApiKey(request); // Temporariamente comentado para teste
    // if (authError) return authError; // Temporariamente comentado para teste

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const numero = searchParams.get("numero");
    const capacidade = searchParams.get("capacidade");

    let mesasFiltradas = obterTodasAsMesas(); 

    if (status) {
      mesasFiltradas = mesasFiltradas.filter((mesa) => mesa.status === status);
    }
    if (numero) {
      mesasFiltradas = mesasFiltradas.filter((mesa) =>
        mesa.numero.includes(numero)
      );
    }
    if (capacidade) {
      const capacidadeMin = Number.parseInt(capacidade, 10);
      if (!isNaN(capacidadeMin)) {
        mesasFiltradas = mesasFiltradas.filter(
          (mesa) => mesa.capacidade >= capacidadeMin
        );
      }
    }
    return NextResponse.json({
      success: true,
      count: mesasFiltradas.length,
      data: mesasFiltradas,
    });
  } catch (error) {
    console.error("Erro ao listar mesas:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição de listar mesas",
      },
      { status: 500 }
    );
  }
}

// POST /api/mesas - Criar uma nova mesa
export async function POST(request: NextRequest) {
  // const authError = await validateApiKey(request); // Temporariamente comentado para teste
  // if (authError) return authError; // Temporariamente comentado para teste

  try {
    const mesaData = await request.json();
    if (!mesaData.numero || !mesaData.capacidade) {
      return NextResponse.json(
        {
          success: false,
          error: "Número e capacidade são obrigatórios",
        },
        { status: 400 }
      );
    }
    const mesasExistentes = obterTodasAsMesas();
    const mesaExistente = mesasExistentes.find((m) => m.numero === mesaData.numero);
    if (mesaExistente) {
      return NextResponse.json(
        {
          success: false,
          error: "Já existe uma mesa com este número",
        },
        { status: 400 }
      );
    }
    const novaMesa = adicionarNovaMesa({
      numero: mesaData.numero,
      capacidade: Number(mesaData.capacidade),
      status: mesaData.status || "Disponível",
      localizacao: mesaData.localizacao,
      observacoes: mesaData.observacoes,
      mesasCombinadas: mesaData.mesasCombinadas,
    });
    return NextResponse.json(
      {
        success: true,
        data: novaMesa,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar mesa:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição de criar mesa",
      },
      { status: 500 }
    );
  }
}
