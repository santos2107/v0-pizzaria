// app/api/reservas/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import {
  obterReservaPorId,
  atualizarReserva,
  cancelarReserva,
  Reserva,
} from "../reservasService"; // Corrigido: caminho relativo para o diretório pai
// import { validateApiKey } from "@/middleware/api-auth"; // Manter comentado por enquanto

interface RouteParams {
  params: { id: string };
}

// GET /api/reservas/[id] - Obter uma reserva específica
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // const authError = await validateApiKey(request);
    // if (authError) return authError;

    const { id } = params;
    const reserva = obterReservaPorId(id);

    if (!reserva) {
      return NextResponse.json(
        { success: false, error: "Reserva não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: reserva });
  } catch (error) {
    console.error(`Erro ao buscar reserva ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/reservas/[id] - Atualizar uma reserva existente
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // const authError = await validateApiKey(request);
    // if (authError) return authError;

    const { id } = params;
    const dadosAtualizacao = await request.json();

    // Remover campos não permitidos para atualização direta ou que são gerenciados pelo serviço
    delete dadosAtualizacao.id;
    delete dadosAtualizacao.criadaEm;
    delete dadosAtualizacao.mesaId; // Geralmente não se muda a mesa de uma reserva, mas sim cancela e cria outra.
                                  // Se for permitido, o serviço precisa de lógica para validar a nova mesa.
    delete dadosAtualizacao.mesaNumero;

    const resultado = atualizarReserva(id, dadosAtualizacao as Partial<Omit<Reserva, "id" | "criadaEm" | "mesaId" | "mesaNumero">>);

    if ("error" in resultado) {
      let statusCode = 400;
      if (resultado.error.includes("não encontrada")) {
        statusCode = 404;
      }
      return NextResponse.json(
        { success: false, error: resultado.error },
        { status: statusCode }
      );
    }

    return NextResponse.json({ success: true, data: resultado });
  } catch (error) {
    console.error(`Erro ao atualizar reserva ${params.id}:`, error);
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

// DELETE /api/reservas/[id] - Cancelar uma reserva (geralmente é uma atualização de status)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // const authError = await validateApiKey(request);
    // if (authError) return authError;

    const { id } = params;
    // Em vez de deletar, geralmente se atualiza o status para "cancelada"
    const resultado = cancelarReserva(id);

    if ("error" in resultado) {
      let statusCode = 400;
      if (resultado.error.includes("não encontrada")) {
        statusCode = 404;
      }
      return NextResponse.json(
        { success: false, error: resultado.error },
        { status: statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reserva cancelada com sucesso",
      data: resultado,
    });
  } catch (error) {
    console.error(`Erro ao cancelar reserva ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: "Erro interno ao processar a requisição" },
      { status: 500 }
    );
  }
}
