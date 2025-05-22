"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshCw, DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet } from "lucide-react";
import Link from "next/link";

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

interface ResumoFinanceiro {
  totalVendas: number;
  totalDespesas: number;
  totalSuprimentos: number;
  totalSangrias: number;
  saldoInicial: number;
  saldoAtual: number;
}

export default function FinanceiroPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("transacoes");
  const [caixaAtual, setCaixaAtual] = useState<Caixa | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para formulários
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: "despesa" as 'venda' | 'despesa' | 'suprimento' | 'sangria',
    valor: "",
    descricao: "",
    formaPagamento: "dinheiro" as 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'outro',
  });

  const [novoCaixa, setNovoCaixa] = useState({
    saldoInicial: "",
    observacoes: "",
  });

  const [fechamentoCaixa, setFechamentoCaixa] = useState({
    saldoFinal: "",
    observacoes: "",
  });

  // Constante para usuário (em um sistema real, viria da autenticação)
  const usuarioAtual = "Operador";

  // Buscar caixa atual e transações ao carregar a página
  useEffect(() => {
    const fetchDados = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchCaixaAtual();
        await fetchTransacoes();
        await fetchResumoFinanceiro();
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setError("Erro ao carregar dados financeiros");
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados financeiros",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDados();
  }, []);

  // Buscar caixa atual
  const fetchCaixaAtual = async () => {
    try {
      const response = await fetch("/api/financeiro/caixa?atual=true");
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setCaixaAtual(data.data);
      
      // Se não houver caixa aberto, tentar abrir um automaticamente
      if (!data.data) {
        try {
          const abrirResponse = await fetch("/api/financeiro/caixa", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              saldoInicial: 100,
              abertoPor: "Sistema",
              observacoes: "Caixa aberto automaticamente",
            }),
          });
          
          if (abrirResponse.ok) {
            const novoCaixaData = await abrirResponse.json();
            setCaixaAtual(novoCaixaData.data);
            toast({
              title: "Caixa aberto",
              description: "Um caixa foi aberto automaticamente para você",
            });
          }
        } catch (error) {
          console.error("Erro ao abrir caixa automaticamente:", error);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar caixa atual:", error);
      throw error;
    }
  };

  // Buscar transações
  const fetchTransacoes = async (filtros?: any) => {
    try {
      let url = "/api/financeiro/transacoes";
      if (filtros) {
        const params = new URLSearchParams();
        Object.entries(filtros).forEach(([key, value]) => {
          if (value) params.append(key, value as string);
        });
        if (params.toString()) url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setTransacoes(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      throw error;
    }
  };
  
  // Buscar resumo financeiro
  const fetchResumoFinanceiro = async () => {
    try {
      // Obter data atual no formato ISO
      const hoje = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`/api/financeiro/relatorios?dataInicio=${hoje}&dataFim=${hoje}`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Calcular saldo atual
      const saldoInicial = caixaAtual?.saldoInicial || 0;
      const saldoAtual = saldoInicial + 
                        (data.data?.totalVendas || 0) + 
                        (data.data?.totalSuprimentos || 0) - 
                        (data.data?.totalDespesas || 0) - 
                        (data.data?.totalSangrias || 0);
      
      setResumo({
        totalVendas: data.data?.totalVendas || 0,
        totalDespesas: data.data?.totalDespesas || 0,
        totalSuprimentos: data.data?.totalSuprimentos || 0,
        totalSangrias: data.data?.totalSangrias || 0,
        saldoInicial: saldoInicial,
        saldoAtual: saldoAtual
      });
    } catch (error) {
      console.error("Erro ao buscar resumo financeiro:", error);
      throw error;
    }
  };

  // Atualizar todos os dados
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await fetchCaixaAtual();
      await fetchTransacoes();
      await fetchResumoFinanceiro();
      toast({
        title: "Dados atualizados",
        description: "Os dados financeiros foram atualizados com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os dados financeiros",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Abrir caixa
  const handleAbrirCaixa = async () => {
    if (!novoCaixa.saldoInicial) {
      toast({
        title: "Erro",
        description: "Informe o saldo inicial",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/financeiro/caixa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          saldoInicial: parseFloat(novoCaixa.saldoInicial),
          abertoPor: usuarioAtual,
          observacoes: novoCaixa.observacoes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCaixaAtual(data.data);
      setNovoCaixa({ saldoInicial: "", observacoes: "" });
      toast({
        title: "Sucesso",
        description: "Caixa aberto com sucesso",
      });
      
      // Atualizar resumo financeiro
      await fetchResumoFinanceiro();
    } catch (error) {
      console.error("Erro ao abrir caixa:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao abrir caixa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fechar caixa
  const handleFecharCaixa = async () => {
    if (!caixaAtual) {
      toast({
        title: "Erro",
        description: "Não há caixa aberto para fechar",
        variant: "destructive",
      });
      return;
    }

    if (!fechamentoCaixa.saldoFinal) {
      toast({
        title: "Erro",
        description: "Informe o saldo final",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/financeiro/caixa?id=${caixaAtual.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          saldoFinal: parseFloat(fechamentoCaixa.saldoFinal),
          fechadoPor: usuarioAtual,
          observacoes: fechamentoCaixa.observacoes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCaixaAtual(data.data);
      setFechamentoCaixa({ saldoFinal: "", observacoes: "" });
      toast({
        title: "Sucesso",
        description: "Caixa fechado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fechar caixa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Registrar transação
  const handleRegistrarTransacao = async () => {
    if (!caixaAtual || caixaAtual.status !== 'aberto') {
      toast({
        title: "Erro",
        description: "É necessário ter um caixa aberto para registrar transações",
        variant: "destructive",
      });
      return;
    }

    if (!novaTransacao.valor || !novaTransacao.descricao) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/financeiro/transacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: novaTransacao.tipo,
          valor: parseFloat(novaTransacao.valor),
          descricao: novaTransacao.descricao,
          formaPagamento: novaTransacao.formaPagamento,
          registradoPor: usuarioAtual,
          caixaId: caixaAtual.id,
          data: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      await fetchTransacoes({ caixaId: caixaAtual.id });
      await fetchResumoFinanceiro();
      
      setNovaTransacao({
        tipo: "despesa",
        valor: "",
        descricao: "",
        formaPagamento: "dinheiro",
      });
      toast({
        title: "Sucesso",
        description: "Transação registrada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao registrar transação:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao registrar transação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  // Obter ícone para forma de pagamento
  const getFormaPagamentoIcon = (formaPagamento?: string) => {
    switch (formaPagamento) {
      case 'dinheiro':
        return <DollarSign className="h-4 w-4" />;
      case 'cartao_credito':
      case 'cartao_debito':
        return <CreditCard className="h-4 w-4" />;
      case 'pix':
        return <Wallet className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Obter cor para tipo de transação
  const getTipoTransacaoColor = (tipo: string) => {
    switch (tipo) {
      case 'venda':
        return 'text-green-600';
      case 'despesa':
        return 'text-red-600';
      case 'suprimento':
        return 'text-blue-600';
      case 'sangria':
        return 'text-orange-600';
      default:
        return '';
    }
  };

  // Obter ícone para tipo de transação
  const getTipoTransacaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'venda':
        return <TrendingUp className="h-4 w-4" />;
      case 'despesa':
        return <TrendingDown className="h-4 w-4" />;
      case 'suprimento':
        return <TrendingUp className="h-4 w-4" />;
      case 'sangria':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen">
      <div className="p-4 md:p-6">
        <div className="flex flex-col space-y-4">
          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">Módulo Financeiro</h1>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}
              </Button>
              {caixaAtual ? (
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-md text-sm font-medium ${
                    caixaAtual.status === 'aberto' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {caixaAtual.status === 'aberto' ? 'Caixa Aberto' : 'Caixa Fechado'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab("caixa")}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => setActiveTab("caixa")}
                >
                  Abrir Caixa
                </Button>
              )}
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saldo do Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    formatarValor(resumo?.saldoAtual || 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Saldo inicial: {formatarValor(resumo?.saldoInicial || 0)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    formatarValor(resumo?.totalVendas || 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de vendas do dia
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    formatarValor(resumo?.totalDespesas || 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de despesas do dia
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Suprimentos/Sangrias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    formatarValor((resumo?.totalSuprimentos || 0) - (resumo?.totalSangrias || 0))
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Suprimentos: {formatarValor(resumo?.totalSuprimentos || 0)} | 
                  Sangrias: {formatarValor(resumo?.totalSangrias || 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="transacoes">Transações</TabsTrigger>
              <TabsTrigger value="caixa">Caixa</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            </TabsList>

            {/* Aba de Transações */}
            <TabsContent value="transacoes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Registrar Nova Transação</CardTitle>
                  <CardDescription>
                    Registre despesas, suprimentos ou sangrias no caixa atual
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Transação</Label>
                      <Select 
                        value={novaTransacao.tipo} 
                        onValueChange={(value) => setNovaTransacao({...novaTransacao, tipo: value as any})}
                      >
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="despesa">Despesa</SelectItem>
                          <SelectItem value="suprimento">Suprimento</SelectItem>
                          <SelectItem value="sangria">Sangria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor (R$)</Label>
                      <Input 
                        id="valor" 
                        type="number" 
                        step="0.01" 
                        min="0.01" 
                        placeholder="0,00" 
                        value={novaTransacao.valor}
                        onChange={(e) => setNovaTransacao({...novaTransacao, valor: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea 
                      id="descricao" 
                      placeholder="Descreva a transação" 
                      value={novaTransacao.descricao}
                      onChange={(e) => setNovaTransacao({...novaTransacao, descricao: e.target.value})}
                    />
                  </div>
                  {(novaTransacao.tipo === 'suprimento') && (
                    <div className="space-y-2">
                      <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                      <Select 
                        value={novaTransacao.formaPagamento} 
                        onValueChange={(value) => setNovaTransacao({...novaTransacao, formaPagamento: value as any})}
                      >
                        <SelectTrigger id="formaPagamento">
                          <SelectValue placeholder="Selecione a forma de pagamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                          <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleRegistrarTransacao} 
                    disabled={isLoading || !caixaAtual || caixaAtual.status !== 'aberto'}
                  >
                    {isLoading ? "Registrando..." : "Registrar Transação"}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Transações</CardTitle>
                  <CardDescription>
                    Transações do caixa atual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : transacoes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma transação registrada
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2">Data/Hora</th>
                            <th className="text-left py-2 px-2">Tipo</th>
                            <th className="text-left py-2 px-2">Descrição</th>
                            <th className="text-right py-2 px-2">Valor</th>
                            <th className="text-center py-2 px-2">Pagamento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transacoes.map((transacao) => (
                            <tr key={transacao.id} className="border-b hover:bg-muted/50">
                              <td className="py-2 px-2 text-sm">{formatarData(transacao.data)}</td>
                              <td className="py-2 px-2">
                                <div className={`flex items-center ${getTipoTransacaoColor(transacao.tipo)}`}>
                                  {getTipoTransacaoIcon(transacao.tipo)}
                                  <span className="ml-1 capitalize">{transacao.tipo}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2">
                                <div>
                                  <p className="font-medium">{transacao.descricao}</p>
                                  {transacao.pedidoId && (
                                    <p className="text-xs text-muted-foreground">Pedido: {transacao.pedidoId}</p>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-2 text-right font-medium">
                                {(transacao.tipo === 'venda' || transacao.tipo === 'suprimento') ? (
                                  <span className="text-green-600">+{formatarValor(transacao.valor)}</span>
                                ) : (
                                  <span className="text-red-600">-{formatarValor(transacao.valor)}</span>
                                )}
                              </td>
                              <td className="py-2 px-2 text-center">
                                {transacao.formaPagamento && (
                                  <div className="flex items-center justify-center" title={transacao.formaPagamento.replace('_', ' ')}>
                                    {getFormaPagamentoIcon(transacao.formaPagamento)}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba de Caixa */}
            <TabsContent value="caixa" className="space-y-4">
              {caixaAtual ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes do Caixa {caixaAtual.status === 'aberto' ? 'Atual' : ''}</CardTitle>
                    <CardDescription>
                      {caixaAtual.status === 'aberto' ? 'Caixa aberto em ' : 'Caixa fechado em '}
                      {formatarData(caixaAtual.status === 'aberto' ? caixaAtual.dataAbertura : caixaAtual.dataFechamento || caixaAtual.dataAbertura)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Informações Gerais</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between py-1 border-b">
                            <span>Status:</span>
                            <span className={`font-medium ${caixaAtual.status === 'aberto' ? 'text-green-600' : 'text-gray-600'}`}>
                              {caixaAtual.status === 'aberto' ? 'Aberto' : 'Fechado'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b">
                            <span>Data de Abertura:</span>
                            <span className="font-medium">{formatarData(caixaAtual.dataAbertura)}</span>
                          </div>
                          {caixaAtual.dataFechamento && (
                            <div className="flex justify-between py-1 border-b">
                              <span>Data de Fechamento:</span>
                              <span className="font-medium">{formatarData(caixaAtual.dataFechamento)}</span>
                            </div>
                          )}
                          <div className="flex justify-between py-1 border-b">
                            <span>Aberto por:</span>
                            <span className="font-medium">{caixaAtual.abertoPor}</span>
                          </div>
                          {caixaAtual.fechadoPor && (
                            <div className="flex justify-between py-1 border-b">
                              <span>Fechado por:</span>
                              <span className="font-medium">{caixaAtual.fechadoPor}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Valores</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between py-1 border-b">
                            <span>Saldo Inicial:</span>
                            <span className="font-medium">{formatarValor(caixaAtual.saldoInicial)}</span>
                          </div>
                          {caixaAtual.status === 'fechado' ? (
                            <>
                              <div className="flex justify-between py-1 border-b">
                                <span>Saldo Final Esperado:</span>
                                <span className="font-medium">{formatarValor(caixaAtual.saldoFinalEsperado || 0)}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b">
                                <span>Saldo Final Informado:</span>
                                <span className="font-medium">{formatarValor(caixaAtual.saldoFinal || 0)}</span>
                              </div>
                              <div className="flex justify-between py-1 border-b">
                                <span>Diferença:</span>
                                <span className={`font-medium ${(caixaAtual.diferenca || 0) < 0 ? 'text-red-600' : (caixaAtual.diferenca || 0) > 0 ? 'text-green-600' : ''}`}>
                                  {formatarValor(caixaAtual.diferenca || 0)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between py-1 border-b">
                              <span>Saldo Atual Estimado:</span>
                              <span className="font-medium">{formatarValor(resumo?.saldoAtual || 0)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {caixaAtual.observacoes && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Observações</h3>
                        <p className="text-sm p-2 bg-muted rounded-md">{caixaAtual.observacoes}</p>
                      </div>
                    )}
                    
                    {caixaAtual.status === 'aberto' && (
                      <div className="pt-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Fechar Caixa</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="saldoFinal">Saldo Final (R$)</Label>
                            <Input 
                              id="saldoFinal" 
                              type="number" 
                              step="0.01" 
                              min="0" 
                              placeholder="0,00" 
                              value={fechamentoCaixa.saldoFinal}
                              onChange={(e) => setFechamentoCaixa({...fechamentoCaixa, saldoFinal: e.target.value})}
                            />
                            <p className="text-xs text-muted-foreground">
                              Saldo esperado: {formatarValor(resumo?.saldoAtual || 0)}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="observacoesFechamento">Observações</Label>
                            <Textarea 
                              id="observacoesFechamento" 
                              placeholder="Observações sobre o fechamento do caixa" 
                              value={fechamentoCaixa.observacoes}
                              onChange={(e) => setFechamentoCaixa({...fechamentoCaixa, observacoes: e.target.value})}
                            />
                          </div>
                          <Button 
                            onClick={handleFecharCaixa} 
                            disabled={isLoading}
                            variant="destructive"
                          >
                            {isLoading ? "Fechando..." : "Fechar Caixa"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Abrir Novo Caixa</CardTitle>
                    <CardDescription>
                      Não há caixa aberto no momento. Abra um novo caixa para começar a registrar transações.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="saldoInicial">Saldo Inicial (R$)</Label>
                      <Input 
                        id="saldoInicial" 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0,00" 
                        value={novoCaixa.saldoInicial}
                        onChange={(e) => setNovoCaixa({...novoCaixa, saldoInicial: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea 
                        id="observacoes" 
                        placeholder="Observações sobre a abertura do caixa" 
                        value={novoCaixa.observacoes}
                        onChange={(e) => setNovoCaixa({...novoCaixa, observacoes: e.target.value})}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleAbrirCaixa} 
                      disabled={isLoading}
                    >
                      {isLoading ? "Abrindo..." : "Abrir Caixa"}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>

            {/* Aba de Relatórios */}
            <TabsContent value="relatorios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Financeiros</CardTitle>
                  <CardDescription>
                    Acesse relatórios detalhados sobre as finanças do seu negócio
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Relatório de Caixa</CardTitle>
                        <CardDescription>
                          Detalhes sobre abertura e fechamento de caixa
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Visualize informações detalhadas sobre cada caixa, incluindo transações, saldos e diferenças.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button asChild>
                          <Link href="/financeiro/relatorio-caixa">
                            Ver Relatório de Caixa
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Relatório de Vendas</CardTitle>
                        <CardDescription>
                          Análise de vendas por período
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Acompanhe o desempenho das vendas por dia, semana ou mês, com gráficos e estatísticas.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" disabled>
                          Em breve
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
