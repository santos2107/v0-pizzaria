"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Check, Printer } from "lucide-react";
import ImpressaoComandaComponent from "@/app/components/impressao-comanda";

export default function FinalizarPedidoPage({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const { id } = params;
  
  const [pedido, setPedido] = useState(null);
  const [itens, setItens] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [mesa, setMesa] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");
  const [observacoes, setObservacoes] = useState("");
  const [troco, setTroco] = useState("");
  const [valorRecebido, setValorRecebido] = useState("");
  const [finalizando, setFinalizando] = useState(false);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(false);

  // Buscar dados do pedido
  useEffect(() => {
    const fetchPedido = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Buscar pedido
        const response = await fetch(`/api/pedidos/${id}`);
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setPedido(data.data);
        
        // Buscar itens do pedido
        const itensResponse = await fetch(`/api/pedidos/${id}/itens`);
        if (!itensResponse.ok) {
          throw new Error(`Erro ao buscar itens: ${itensResponse.statusText}`);
        }
        const itensData = await itensResponse.json();
        setItens(itensData.data || []);
        
        // Se tiver cliente, buscar dados
        if (data.data.clienteId) {
          const clienteResponse = await fetch(`/api/clientes/${data.data.clienteId}`);
          if (clienteResponse.ok) {
            const clienteData = await clienteResponse.json();
            setCliente(clienteData.data);
          }
        }
        
        // Se tiver mesa, buscar dados
        if (data.data.mesaId) {
          const mesaResponse = await fetch(`/api/mesas/${data.data.mesaId}`);
          if (mesaResponse.ok) {
            const mesaData = await mesaResponse.json();
            setMesa(mesaData.data);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do pedido:", error);
        setError("Não foi possível carregar os dados do pedido");
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do pedido",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPedido();
    }
  }, [id, toast]);

  // Calcular troco quando valor recebido mudar
  useEffect(() => {
    if (valorRecebido && pedido) {
      const troco = parseFloat(valorRecebido) - pedido.valorTotal;
      setTroco(troco > 0 ? troco.toFixed(2) : "0.00");
    } else {
      setTroco("0.00");
    }
  }, [valorRecebido, pedido]);

  // Finalizar pedido
  const handleFinalizarPedido = async () => {
    if (!formaPagamento) {
      toast({
        title: "Forma de pagamento obrigatória",
        description: "Selecione uma forma de pagamento para continuar",
        variant: "destructive",
      });
      return;
    }

    setFinalizando(true);
    try {
      // Atualizar status do pedido para "Concluído" (corrigido de "finalizado" para "Concluído")
      const response = await fetch(`/api/pedidos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "Concluído", // Corrigido para usar o mesmo status que o sistema espera
          formaPagamento,
          observacoes: observacoes || pedido.observacoes,
          valorPago: valorRecebido ? parseFloat(valorRecebido) : pedido.valorTotal,
          troco: parseFloat(troco),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      // Se o pedido tiver mesa associada, atualizar status da mesa para "Disponível"
      if (pedido.mesaId) {
        await fetch(`/api/mesas/${pedido.mesaId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "Disponível",
          }),
        });
      }

      try {
        // Registrar venda no módulo financeiro
        const financeiroResponse = await fetch("/api/financeiro/transacoes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tipo: "venda",
            valor: pedido.valorTotal,
            descricao: `Venda referente ao pedido #${id}`,
            formaPagamento,
            pedidoId: id,
            registradoPor: "Sistema",
            // Adicionar data para garantir que seja registrado no dia correto
            data: new Date().toISOString(),
            // Adicionar caixaId se disponível
            caixaId: "caixa_atual", // Idealmente, buscar o ID do caixa aberto
          }),
        });
        
        if (!financeiroResponse.ok) {
          console.error("Erro ao registrar venda no financeiro:", await financeiroResponse.text());
          toast({
            title: "Aviso",
            description: "Pedido finalizado, mas houve um erro ao registrar no financeiro",
            variant: "warning",
          });
        }
      } catch (financeiroError) {
        console.error("Erro ao registrar venda no financeiro:", financeiroError);
        toast({
          title: "Aviso",
          description: "Pedido finalizado, mas houve um erro ao registrar no financeiro",
          variant: "warning",
        });
      }

      // Forçar revalidação da página de cozinha
      await fetch("/api/revalidate?path=/cozinha", {
        method: "POST",
      }).catch(err => console.error("Erro ao revalidar cozinha:", err));

      toast({
        title: "Pedido finalizado",
        description: "O pedido foi finalizado com sucesso",
      });
      
      setPedidoFinalizado(true);
      
      // Atualizar o pedido local para refletir o novo status
      setPedido({
        ...pedido,
        status: "Concluído"
      });
      
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar o pedido",
        variant: "destructive",
      });
    } finally {
      setFinalizando(false);
    }
  };

  // Formatar valor monetário
  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  // Preparar dados para impressão da comanda
  const prepararDadosComanda = () => {
    return {
      pedido: {
        id,
        valorTotal: pedido.valorTotal,
        formaPagamento,
        observacao: observacoes || pedido.observacoes,
      },
      itens: itens.map(item => ({
        quantidade: item.quantidade,
        nome: item.produto?.nome || item.produtoNome || "Produto sem nome",
        preco: item.valorUnitario,
        observacao: item.observacao,
      })),
      cliente,
      mesa,
      data: new Date().toISOString(),
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
          <h2 className="text-lg font-semibold">Erro</h2>
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/pedidos')}
          >
            Voltar para Pedidos
          </Button>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
          <h2 className="text-lg font-semibold">Pedido não encontrado</h2>
          <p>O pedido solicitado não foi encontrado.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/pedidos')}
          >
            Voltar para Pedidos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="p-4 md:p-6">
        <div className="flex flex-col space-y-4">
          {/* Cabeçalho */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" asChild>
                <Link href="/pedidos">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Finalizar Pedido #{id}</h1>
            </div>
            {pedidoFinalizado && (
              <div className="flex gap-2">
                <ImpressaoComandaComponent pedidoData={prepararDadosComanda()} />
                <Button asChild>
                  <Link href="/pedidos">
                    Voltar para Pedidos
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Coluna 1: Resumo do Pedido */}
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                  <CardDescription>
                    Detalhes dos itens e valores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {itens.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum item no pedido
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-2">Item</th>
                              <th className="text-center py-2 px-2">Qtd</th>
                              <th className="text-right py-2 px-2">Valor Unit.</th>
                              <th className="text-right py-2 px-2">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {itens.map((item) => (
                              <tr key={item.id} className="border-b hover:bg-muted/50">
                                <td className="py-2 px-2">
                                  <div>
                                    <p className="font-medium">{item.produto?.nome || item.produtoNome || "Produto sem nome"}</p>
                                    {item.observacao && (
                                      <p className="text-sm text-muted-foreground">Obs: {item.observacao}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 px-2 text-center">{item.quantidade}</td>
                                <td className="py-2 px-2 text-right">{formatarValor(item.valorUnitario)}</td>
                                <td className="py-2 px-2 text-right">{formatarValor(item.valorUnitario * item.quantidade)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2">
                              <td colSpan={3} className="py-2 px-2 text-right font-semibold">Total:</td>
                              <td className="py-2 px-2 text-right font-semibold">{formatarValor(pedido.valorTotal)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Informações adicionais */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {cliente && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Cliente</h3>
                            <p className="font-medium">{cliente.nome}</p>
                            {cliente.telefone && <p className="text-sm">{cliente.telefone}</p>}
                          </div>
                        )}
                        {mesa && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Mesa</h3>
                            <p className="font-medium">Mesa {mesa.numero}</p>
                            <p className="text-sm">Capacidade: {mesa.capacidade} pessoas</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Coluna 2: Finalização */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Finalizar Pagamento</CardTitle>
                  <CardDescription>
                    {pedidoFinalizado 
                      ? "Pedido finalizado com sucesso" 
                      : "Complete as informações para finalizar o pedido"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pedidoFinalizado ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium">Pedido Finalizado</h3>
                      <p className="text-center text-muted-foreground">
                        O pedido foi finalizado com sucesso e registrado no sistema financeiro.
                      </p>
                      <div className="w-full pt-4">
                        <div className="flex justify-between py-2 border-b">
                          <span>Forma de Pagamento:</span>
                          <span className="font-medium">{formaPagamento}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span>Valor Total:</span>
                          <span className="font-medium">{formatarValor(pedido.valorTotal)}</span>
                        </div>
                        {valorRecebido && (
                          <>
                            <div className="flex justify-between py-2 border-b">
                              <span>Valor Recebido:</span>
                              <span className="font-medium">{formatarValor(parseFloat(valorRecebido))}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                              <span>Troco:</span>
                              <span className="font-medium">{formatarValor(parseFloat(troco))}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                        <Select 
                          value={formaPagamento} 
                          onValueChange={setFormaPagamento}
                          disabled={pedidoFinalizado}
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
                      {formaPagamento === "dinheiro" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="valorRecebido">Valor Recebido (R$)</Label>
                            <Input 
                              id="valorRecebido" 
                              type="number" 
                              step="0.01" 
                              min={pedido.valorTotal} 
                              placeholder="0,00" 
                              value={valorRecebido}
                              onChange={(e) => setValorRecebido(e.target.value)}
                              disabled={pedidoFinalizado}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="troco">Troco (R$)</Label>
                            <Input 
                              id="troco" 
                              type="text" 
                              value={troco}
                              readOnly
                              disabled
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea 
                          id="observacoes" 
                          placeholder="Observações sobre o pagamento ou entrega" 
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          disabled={pedidoFinalizado}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {!pedidoFinalizado ? (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => router.push('/pedidos')}
                        disabled={finalizando}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleFinalizarPedido} 
                        disabled={finalizando}
                      >
                        {finalizando ? "Finalizando..." : "Finalizar Pedido"}
                      </Button>
                    </>
                  ) : (
                    <ImpressaoComandaComponent pedidoData={prepararDadosComanda()} />
                  )}
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
