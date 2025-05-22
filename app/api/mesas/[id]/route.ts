import { type NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/middleware/api-auth";
import {
  obterMesaPorId,
  atualizarMesaExistente,
  deletarMesa,
  juntarMesas, // Adicionar se for implementar a junção aqui
  separarMesas, // Adicionar se for implementar a separação aqui
} from "../mesasService"; // Corrigido: caminho relativo para o diretório pai

// GET /api/mesas/[id] - Obter uma mesa específica
export async function GET(
  request: NextRequest, // Alterado para NextRequest para consistência e acesso a headers se necessário
  { params }: { params: { id: string } }
) {
  try {
    // Validar API key, se aplicável para GET individual
    // const authError = await validateApiKey(request);
    // if (authError) return authError;

    const id = Number.parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    const mesa = obterMesaPorId(id); // Usar o serviço

    if (!mesa) {
      return NextResponse.json(
        { success: false, error: "Mesa não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mesa,
    });
  } catch (error) {
    console.error("Erro ao buscar mesa:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/mesas/[id] - Atualizar uma mesa
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validar API key
  const authError = await validateApiKey(request);
  if (authError) return authError;

  const id = Number.parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const mesaData = await request.json();
    const mesaAtualizada = atualizarMesaExistente(id, mesaData); // Usar o serviço

    if (!mesaAtualizada) {
      return NextResponse.json(
        { success: false, error: "Mesa não encontrada para atualização" },
        { status: 404 }
      );
    }
    
    // Lógica específica para juntar ou separar mesas se vier no payload
    if (mesaData.action === "juntar" && mesaData.mesasParaJuntar && mesaData.mesaPrincipalNumero) {
      const resultadoJuncao = juntarMesas(mesaData.mesasParaJuntar, mesaData.mesaPrincipalNumero);
      if (resultadoJuncao) {
        return NextResponse.json({ success: true, data: resultadoJuncao, message: "Mesas juntadas com sucesso" });
      } else {
        return NextResponse.json({ success: false, error: "Falha ao juntar mesas" }, { status: 400 });
      }
    } else if (mesaData.action === "separar") {
      const resultadoSeparacao = separarMesas(id);
      if (resultadoSeparacao) {
        return NextResponse.json({ success: true, data: resultadoSeparacao, message: "Mesas separadas com sucesso" });
      } else {
        return NextResponse.json({ success: false, error: "Falha ao separar mesas" }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      data: mesaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar mesa:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao processar a requisição" },
      { status: 500 }
    );
  }
}

// DELETE /api/mesas/[id] - Excluir uma mesa
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validar API key
  const authError = await validateApiKey(request);
  if (authError) return authError;

  const id = Number.parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, error: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const mesaDeletada = deletarMesa(id); // Usar o serviço

    if (!mesaDeletada) {
      return NextResponse.json(
        { success: false, error: "Mesa não encontrada para exclusão" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mesa excluída com sucesso",
      data: mesaDeletada,
    });
  } catch (error) {
    console.error("Erro ao excluir mesa:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao processar a requisição" },
      { status: 500 }
    );
  }
}
