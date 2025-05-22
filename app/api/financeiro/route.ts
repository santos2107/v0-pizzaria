import { type NextRequest, NextResponse } from "next/server";
import {
  listarTransacoes,
  registrarTransacao,
  obterTransacaoPorId,
  atualizarTransacao,
  deletarTransacao,
  listarCaixas,
  obterCaixaPorId,
  obterCaixaAtual,
  abrirCaixa,
  fecharCaixa,
  gerarRelatorioCaixa,
  obterResumoFinanceiroPorPeriodo,
  registrarVendaDePedido
} from "./financeiroService";

// GET /api/financeiro/transacoes - Listar transações
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo") || undefined;
    const dataInicio = searchParams.get("dataInicio") || undefined;
    const dataFim = searchParams.get("dataFim") || undefined;
    const caixaId = searchParams.get("caixaId") || undefined;

    const filtros: any = {};
    if (tipo) filtros.tipo = tipo;
    if (dataInicio) filtros.dataInicio = dataInicio;
    if (dataFim) filtros.dataFim = dataFim;
    if (caixaId) filtros.caixaId = caixaId;

    const transacoes = listarTransacoes(Object.keys(filtros).length > 0 ? filtros : undefined);

    return NextResponse.json({
      success: true,
      count: transacoes.length,
      data: transacoes,
    });
  } catch (error) {
    console.error("Erro ao listar transações:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 }
    );
  }
}

// POST /api/financeiro/transacoes - Registrar nova transação
export async function POST(request: NextRequest) {
  try {
    const dadosTransacao = await request.json();

    // Validar dados obrigatórios
    if (!dadosTransacao.tipo || !dadosTransacao.valor || !dadosTransacao.descricao || !dadosTransacao.registradoPor) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados obrigatórios não fornecidos: tipo, valor, descricao, registradoPor",
        },
        { status: 400 }
      );
    }

    // Validar tipo de transação
    if (!['venda', 'despesa', 'suprimento', 'sangria'].includes(dadosTransacao.tipo)) {
      return NextResponse.json(
        {
          success: false,
          error: "Tipo de transação inválido. Deve ser: venda, despesa, suprimento ou sangria",
        },
        { status: 400 }
      );
    }

    // Registrar a transação
    const novaTransacao = registrarTransacao({
      ...dadosTransacao,
      data: dadosTransacao.data || new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: novaTransacao,
    });
  } catch (error) {
    console.error("Erro ao registrar transação:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 }
    );
  }
}
