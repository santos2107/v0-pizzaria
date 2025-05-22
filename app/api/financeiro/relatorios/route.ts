import { type NextRequest, NextResponse } from "next/server";
import {
  obterResumoFinanceiroPorPeriodo,
  gerarRelatorioCaixa
} from "../financeiroService";

// GET /api/financeiro/relatorios - Obter relatórios financeiros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get("tipo"); // "periodo" ou "caixa"
    const caixaId = searchParams.get("caixaId");
    const dataInicio = searchParams.get("dataInicio");
    const dataFim = searchParams.get("dataFim");

    // Validar parâmetros
    if (!tipo) {
      return NextResponse.json(
        {
          success: false,
          error: "Parâmetro 'tipo' não fornecido. Deve ser 'periodo' ou 'caixa'.",
        },
        { status: 400 }
      );
    }

    // Relatório de caixa específico
    if (tipo === "caixa") {
      if (!caixaId) {
        return NextResponse.json(
          {
            success: false,
            error: "Parâmetro 'caixaId' não fornecido para relatório de caixa.",
          },
          { status: 400 }
        );
      }

      const relatorioCaixa = gerarRelatorioCaixa(caixaId);
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

    // Relatório por período
    if (tipo === "periodo") {
      if (!dataInicio || !dataFim) {
        return NextResponse.json(
          {
            success: false,
            error: "Parâmetros 'dataInicio' e 'dataFim' são obrigatórios para relatório por período.",
          },
          { status: 400 }
        );
      }

      const resumoFinanceiro = obterResumoFinanceiroPorPeriodo(dataInicio, dataFim);

      return NextResponse.json({
        success: true,
        data: resumoFinanceiro,
      });
    }

    // Tipo de relatório inválido
    return NextResponse.json(
      {
        success: false,
        error: "Tipo de relatório inválido. Deve ser 'periodo' ou 'caixa'.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao processar a requisição",
      },
      { status: 500 }
    );
  }
}
