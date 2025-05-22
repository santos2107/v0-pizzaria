"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

// Interfaces
interface Transacao {
  id: string;
  tipo: 'venda' | 'despesa' | 'suprimento' | 'sangria';
  valor: number;
  descricao: string;
  formaPagamento?: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'outro';
  pedidoId?: string;
  data: string;
  registradoPor: string;
  caixaId?: string;
}

interface Caixa {
  id: string;
  dataAbertura: string;
  dataFechamento?: string;
  saldoInicial: number;
  saldoFinal?: number;
  saldoFinalEsperado?: number;
  diferenca?: number;
  status: 'aberto' | 'fechado';
  observacoes?: string;
  abertoPor: string;
  fechadoPor?: string;
}

interface RelatorioCaixa {
  caixa: Caixa;
  transacoes: Transacao[];
  resumo: {
    totalVendas: number;
    totalDespesas: number;
    totalSuprimentos: number;
    totalSangrias: number;
    saldoInicial: number;
    saldoFinalEsperado: number;
    saldoFinal?: number;
    diferenca?: number;
  };
}

export default function RelatorioCaixaPage() {
  const { toast } = useToast();
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  const [caixaSelecionado, setCaixaSelecionado] = useState<string>("");
  const [relatorio, setRelatorio] = useState<RelatorioCaixa | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar lista de caixas ao carregar a página
  useEffect(() => {
    const fetchCaixas = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/financeiro/caixa");
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setCaixas(data.data || []);
      } catch (error) {
        console.error("Erro ao buscar caixas:", error);
        setError("Erro ao carregar lista de caixas");
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de caixas",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaixas();
  }, []);

  // Buscar relatório de caixa
  const fetchRelatorioCaixa = async (caixaId: string) => {
    if (!caixaId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/financeiro/relatorios?tipo=caixa&caixaId=${caixaId}`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setRelatorio(data.data);
    } catch (error) {
      console.error("Erro ao buscar relatório de caixa:", error);
      setError("Erro ao carregar relatório de caixa");
      toast({
        title: "Erro",
        description: "Não foi possível carregar o relatório de caixa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quando o caixa selecionado mudar, buscar o relatório
  useEffect(() => {
    if (caixaSelecionado) {
      fetchRelatorioCaixa(caixaSelecionado);
    } else {
      setRelatorio(null);
    }
  }, [caixaSelecionado]);

  // Formatar data
  const formatarData = (dataString: string) => {
    try {
      return format(new Date(dataString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (error) {
      return dataString;
    }
  };

  // Formatar valor monetário
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  // Simular impressão do relatório
  const handleImprimirRelatorio = () => {
    toast({
      title: "Impressão",
      description: "Enviando relatório para impressão...",
    });
    
    // Em uma implementação real, aqui seria chamada a API de impressão
    setTimeout(() => {
      toast({
        title: "Sucesso",
        description: "Relatório enviado para impressão com sucesso!",
      });
    }, 1500);
  };

  return (
    <main className="min-h-screen">
      <div className="p-4 md:p-6">
        <div className="flex flex-col space-y-4">
          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild>
                <Link href="/financeiro">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Relatório de Caixa</h1>
            </div>
            {relatorio && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleImprimirRelatorio}
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Relatório
              </Button>
            )}
          </div>

          {/* Seleção de Caixa */}
          <Card>
            <CardHeader>
              <CardTitle>Selecione um Caixa</CardTitle>
              <CardDescription>
                Escolha um caixa para visualizar seu relatório detalhado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                value={caixaSelecionado} 
                onValueChange={setCaixaSelecionado}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um caixa" />
                </SelectTrigger>
                <SelectContent>
                  {caixas.map((caixa) => (
                    <SelectItem key={caixa.id} value={caixa.id}>
                      {caixa.status === 'aberto' ? 'Caixa Atual (Aberto)' : `Caixa ${caixa.id} - ${formatarData(caixa.dataAbertura)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Relatório */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          ) : relatorio ? (
            <>
              {/* Resumo do Caixa */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {relatorio.caixa.status === 'aberto' ? 'Caixa Atual (Aberto)' : 'Caixa Fechado'}
                  </CardTitle>
                  <CardDescription>
                    {relatorio.caixa.status === 'aberto' 
                      ? `Aberto em ${formatarData(relatorio.caixa.dataAbertura)} por ${relatorio.caixa.abertoPor}`
                      : `Aberto em ${formatarData(relatorio.caixa.dataAbertura)} e fechado em ${formatarData(relatorio.caixa.dataFechamento || '')}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Saldo Inicial</h3>
                      <p className="text-lg font-semibold">{formatarValor(relatorio.resumo.saldoInicial)}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Saldo Final Esperado</h3>
                      <p className="text-lg font-semibold">{formatarValor(relatorio.resumo.saldoFinalEsperado)}</p>
                    </div>
                    {relatorio.caixa.status === 'fechado' && (
                      <>
                        <div className="p-4 bg-muted rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Saldo Final Informado</h3>
                          <p className="text-lg font-semibold">{formatarValor(relatorio.resumo.saldoFinal || 0)}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">Diferença</h3>
                          <p className={`text-lg font-semibold ${(relatorio.resumo.diferenca || 0) < 0 ? 'text-red-600' : (relatorio.resumo.diferenca || 0) > 0 ? 'text-green-600' : ''}`}>
                            {formatarValor(relatorio.resumo.diferenca || 0)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resumo de Transações */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Transações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="text-sm font-medium text-green-800 mb-1">Total de Vendas</h3>
                      <p className="text-lg font-semibold text-green-700">{formatarValor(relatorio.resumo.totalVendas)}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h3 className="text-sm font-medium text-red-800 mb-1">Total de Despesas</h3>
                      <p className="text-lg font-semibold text-red-700">{formatarValor(relatorio.resumo.totalDespesas)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-sm font-medium text-blue-800 mb-1">Total de Suprimentos</h3>
                      <p className="text-lg font-semibold text-blue-700">{formatarValor(relatorio.resumo.totalSuprimentos)}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <h3 className="text-sm font-medium text-yellow-800 mb-1">Total de Sangrias</h3>
                      <p className="text-lg font-semibold text-yellow-700">{formatarValor(relatorio.resumo.totalSangrias)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Transações */}
              <Card>
                <CardHeader>
                  <CardTitle>Transações do Caixa</CardTitle>
                  <CardDescription>
                    Todas as transações registradas neste caixa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {relatorio.transacoes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma transação registrada neste caixa
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2">Tipo</th>
                            <th className="text-left py-2 px-2">Descrição</th>
                            <th className="text-left py-2 px-2">Valor</th>
                            <th className="text-left py-2 px-2">Data</th>
                            <th className="text-left py-2 px-2">Registrado Por</th>
                          </tr>
                        </thead>
                        <tbody>
                          {relatorio.transacoes.map((transacao) => (
                            <tr key={transacao.id} className="border-b hover:bg-muted/50">
                              <td className="py-2 px-2">
                                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                  transacao.tipo === 'venda' ? 'bg-green-100 text-green-800' :
                                  transacao.tipo === 'despesa' ? 'bg-red-100 text-red-800' :
                                  transacao.tipo === 'suprimento' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {transacao.tipo === 'venda' ? 'Venda' :
                                   transacao.tipo === 'despesa' ? 'Despesa' :
                                   transacao.tipo === 'suprimento' ? 'Suprimento' : 'Sangria'}
                                </span>
                              </td>
                              <td className="py-2 px-2">{transacao.descricao}</td>
                              <td className="py-2 px-2">
                                <span className={transacao.tipo === 'despesa' || transacao.tipo === 'sangria' ? 'text-red-600' : 'text-green-600'}>
                                  {formatarValor(transacao.valor)}
                                </span>
                              </td>
                              <td className="py-2 px-2">{formatarData(transacao.data)}</td>
                              <td className="py-2 px-2">{transacao.registradoPor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>Selecione um caixa para visualizar seu relatório</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
