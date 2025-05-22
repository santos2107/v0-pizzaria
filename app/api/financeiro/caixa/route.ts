import { type NextRequest, NextResponse } from "next/server";
import {
  listarCaixas,
  obterCaixaPorId,
  obterCaixaAtual,
  abrirCaixa,
  fecharCaixa,
  gerarRelatorioCaixa
} from "../financeiroService";

// GET /api/financeiro/caixa - Listar caixas ou obter caixa atual
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const atual = searchParams.get("atual");
    const relatorio = searchParams.get("relatorio");
    const status = searchParams.get("status") || undefined;
    const dataInicio = searchParams.get("dataInicio") || undefined;
    const dataFim = searchParams.get("dataFim") || undefined;

    // Se for solicitado um caixa específico por ID
    if (id) {
      const caixa = obterCaixaPorId(id);
      if (!caixa) {
        return NextResponse.json(
          {
            success: false,
            error: `Caixa com ID ${id} não encontrado.`,
          },
          { status: 404 }
        );
      }

      // Se for solicitado o relatório do caixa
      if (relatorio === "true") {
        const relatorioCaixa = gerarRelatorioCaixa(id);
        if ('error' in relatorioCaixa) {
          return NextResponse.json(
            {
              success: false,
              error: relatorioCaixa.error,
            },
            { status: 400 }
          );
        }
        return NextResponse.json({
          success: true,
          data: relatorioCaixa,
        });
      }

      return NextResponse.json({
        success: true,
        data: caixa,
      });
    }

    // Se for solicitado o caixa atual (aberto)
    if (atual === "true") {
      const caixaAtual = obterCaixaAtual();
      return NextResponse.json({
        success: true,
        data: caixaAtual || null,
      });
    }

    // Caso contrário, listar caixas com filtros opcionais
    const filtros: any = {};
    if (status) filtros.status = status;
    if (dataInicio) filtros.dataInicio = dataInicio;
    if (dataFim) filtros.dataFim = dataFim;

    const caixas = listarCaixas(Object.keys(filtros).length > 0 ? filtros : undefined);

    return NextResponse.json({
      success: true,
      count: caixas.length,
      data: caixas,
    });
  } catch (error) {
    console.error("Erro ao processar requisição de caixa:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 }
    );
  }
}

// POST /api/financeiro/caixa - Abrir novo caixa
export async function POST(request: NextRequest) {
  try {
    const dadosCaixa = await request.json();

    // Validar dados obrigatórios
    if (dadosCaixa.saldoInicial === undefined || !dadosCaixa.abertoPor) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados obrigatórios não fornecidos: saldoInicial, abertoPor",
        },
        { status: 400 }
      );
    }

    // Abrir o caixa
    const resultado = abrirCaixa({
      saldoInicial: Number(dadosCaixa.saldoInicial),
      abertoPor: dadosCaixa.abertoPor,
      observacoes: dadosCaixa.observacoes,
    });

    if ('error' in resultado) {
      return NextResponse.json(
        {
          success: false,
          error: resultado.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error("Erro ao abrir caixa:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 }
    );
  }
}

// PUT /api/financeiro/caixa - Fechar caixa
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID do caixa não fornecido",
        },
        { status: 400 }
      );
    }

    const dadosFechamento = await request.json();

    // Validar dados obrigatórios
    if (dadosFechamento.saldoFinal === undefined || !dadosFechamento.fechadoPor) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados obrigatórios não fornecidos: saldoFinal, fechadoPor",
        },
        { status: 400 }
      );
    }

    // Fechar o caixa
    const resultado = fecharCaixa(id, {
      saldoFinal: Number(dadosFechamento.saldoFinal),
      fechadoPor: dadosFechamento.fechadoPor,
      observacoes: dadosFechamento.observacoes,
    });

    if ('error' in resultado) {
      return NextResponse.json(
        {
          success: false,
          error: resultado.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error("Erro ao fechar caixa:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 }
    );
  }
}
