import { type NextRequest, NextResponse } from "next/server";
import {
  listarReservas,
  criarReserva,
  Reserva,
} from "./reservasService"; // Importar do novo serviço
// import { validateApiKey } from "@/middleware/api-auth"; // Manter comentado por enquanto

// GET /api/reservas - Listar todas as reservas
export async function GET(request: NextRequest) {
  try {
    // const authError = await validateApiKey(request);
    // if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const data = searchParams.get("data") || undefined;
    const status = searchParams.get("status") || undefined;
    const mesaIdParam = searchParams.get("mesaId");
    const mesaId = mesaIdParam ? parseInt(mesaIdParam, 10) : undefined;

    // Validar se mesaId é um número se fornecido
    if (mesaIdParam && (isNaN(mesaId!) || mesaId === undefined)) {
        return NextResponse.json(
            { success: false, error: "Parâmetro 'mesaId' inválido." },
            { status: 400 }
        );
    }

    const filtros = { data, status, mesaId };
    // Remover chaves com valor undefined para não passar filtros vazios desnecessariamente
    Object.keys(filtros).forEach(key => filtros[key] === undefined && delete filtros[key]);

    const reservas = listarReservas(filtros);

    return NextResponse.json({
      success: true,
      count: reservas.length,
      data: reservas,
    });
  } catch (error) {
    console.error("Erro ao processar requisição de listar reservas:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno ao processar requisição",
      },
      { status: 500 }
    );
  }
}

// POST /api/reservas - Criar uma nova reserva
export async function POST(request: NextRequest) {
  try {
    // const authError = await validateApiKey(request);
    // if (authError) return authError;

    const reservaData = await request.json();    

    // Os campos obrigatórios são validados dentro do reservasService.criarReserva
    // A lógica de verificar capacidade da mesa e disponibilidade também está no serviço

    const resultado = criarReserva(reservaData as Omit<Reserva, "id" | "criadaEm" | "mesaNumero">);

    if ("error" in resultado) {
      // Determinar o status code baseado no erro
      // Ex: se for "Mesa não encontrada", poderia ser 404.
      // Por simplicidade, usando 400 para erros de validação/negócio.
      let statusCode = 400;
      if (resultado.error.includes("não encontrada")) {
        statusCode = 404;
      }
      return NextResponse.json(
        { success: false, error: resultado.error },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      { success: true, data: resultado },
      { status: 201 } // 201 Created para sucesso na criação
    );
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    // Verificar se o erro é de parsing do JSON
    if (error instanceof SyntaxError) {
        return NextResponse.json(
            { success: false, error: "JSON malformatado na requisição." },
            { status: 400 }
          );
    }
    return NextResponse.json(
      { success: false, error: "Erro interno ao processar a requisição" },
      { status: 500 }
    );
  }
}
