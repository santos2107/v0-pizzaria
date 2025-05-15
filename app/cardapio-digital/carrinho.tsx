"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag, Clock, MapPin } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CarrinhoProps {
  aberto: boolean
  setAberto: (aberto: boolean) => void
  itens: any[]
  removerItem: (id: number) => void
  atualizarQuantidade: (id: number, quantidade: number) => void
  limparCarrinho: () => void
  total: number
  clienteInfo: any
  abrirModalAuth: () => void
}

export function Carrinho({
  aberto,
  setAberto,
  itens,
  removerItem,
  atualizarQuantidade,
  limparCarrinho,
  total,
  clienteInfo,
  abrirModalAuth,
}: CarrinhoProps) {
  const { toast } = useToast()
  const [enviandoPedido, setEnviandoPedido] = useState(false)
  const [etapaCheckout, setEtapaCheckout] = useState<"carrinho" | "entrega" | "pagamento">("carrinho")
  const [metodoPagamento, setMetodoPagamento] = useState<"dinheiro" | "cartao" | "pix">("dinheiro")
  const [troco, setTroco] = useState<string>("")

  // Função para finalizar o pedido
  const finalizarPedido = async () => {
    if (!clienteInfo) {
      abrirModalAuth()
      return
    }

    if (itens.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho para finalizar o pedido.",
        variant: "destructive",
      })
      return
    }

    try {
      setEnviandoPedido(true)

      // Simular envio do pedido
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Pedido enviado com sucesso!",
        description: `Seu pedido no valor de R$ ${total.toFixed(2)} foi enviado e será preparado em breve.`,
      })

      // Limpar carrinho após o envio
      limparCarrinho()
      setAberto(false)
      setEtapaCheckout("carrinho")
    } catch (error) {
      toast({
        title: "Erro ao enviar pedido",
        description: "Ocorreu um erro ao enviar seu pedido. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setEnviandoPedido(false)
    }
  }

  // Função para avançar para a próxima etapa do checkout
  const avancarEtapa = () => {
    if (etapaCheckout === "carrinho") {
      if (!clienteInfo) {
        abrirModalAuth()
        return
      }
      setEtapaCheckout("entrega")
    } else if (etapaCheckout === "entrega") {
      setEtapaCheckout("pagamento")
    } else {
      finalizarPedido()
    }
  }

  // Função para voltar para a etapa anterior do checkout
  const voltarEtapa = () => {
    if (etapaCheckout === "pagamento") {
      setEtapaCheckout("entrega")
    } else if (etapaCheckout === "entrega") {
      setEtapaCheckout("carrinho")
    }
  }

  // Renderizar etapa do carrinho
  const renderEtapaCarrinho = () => {
    return (
      <>
        {itens.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-lg font-medium mb-2">Seu carrinho está vazio</h3>
            <p className="text-gray-500 mb-6">Adicione itens do cardápio para fazer seu pedido</p>
            <Button variant="outline" onClick={() => setAberto(false)}>
              Ver Cardápio
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 my-4">
              <div className="space-y-4 pr-4">
                {itens.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.produto.nome}</h4>
                          <p className="text-sm text-gray-600">R$ {item.precoUnitario.toFixed(2)}</p>

                          {/* Opções do item */}
                          {item.opcoes && (
                            <div className="mt-1">
                              {item.opcoes.tamanho && (
                                <Badge variant="outline" className="mr-1">
                                  Tamanho: {item.opcoes.tamanho}
                                </Badge>
                              )}
                              {item.opcoes.borda && (
                                <Badge variant="outline" className="mr-1">
                                  Borda: {item.opcoes.borda.nome}
                                </Badge>
                              )}

                              {item.opcoes.sabores && item.opcoes.sabores.length > 1 && (
                                <div className="text-xs text-gray-600 mt-1">
                                  <span className="font-medium">Sabores:</span>{" "}
                                  {item.opcoes.sabores.map((s: any, i: number) => (
                                    <span key={s.id || i}>
                                      {i > 0 && ", "}
                                      {s.nome}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {item.opcoes.adicionais && item.opcoes.adicionais.length > 0 && (
                                <div className="text-xs text-gray-600 mt-1">
                                  <span className="font-medium">Extras:</span>{" "}
                                  {item.opcoes.adicionais.map((ing: any, i: number) => (
                                    <span key={ing.id}>
                                      {i > 0 && ", "}
                                      {ing.nome}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Observações */}
                          {item.observacoes && (
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Obs:</span> {item.observacoes}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 p-0"
                              onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm w-5 text-center">{item.quantidade}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 p-0"
                              onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 p-0 text-red-500"
                              onClick={() => removerItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-sm font-medium">
                            Total: R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Subtotal:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Taxa de entrega:</span>
                <span>Grátis</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>

              <div className="space-y-2">
                <Button className="w-full" onClick={avancarEtapa}>
                  Continuar
                </Button>
                <Button variant="outline" className="w-full" onClick={limparCarrinho}>
                  Limpar Carrinho
                </Button>
              </div>

              {!clienteInfo && (
                <div className="text-center text-sm text-gray-500">
                  <p>Você precisa informar seus dados para finalizar o pedido</p>
                </div>
              )}
            </div>
          </>
        )}
      </>
    )
  }

  // Renderizar etapa de entrega
  const renderEtapaEntrega = () => {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 my-4">
          <h3 className="font-medium text-lg mb-4">Informações de Entrega</h3>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Endereço de Entrega</h4>
                    <p className="text-sm text-gray-600">{clienteInfo.endereco}</p>
                    {clienteInfo.complemento && (
                      <p className="text-sm text-gray-600">Complemento: {clienteInfo.complemento}</p>
                    )}
                    {clienteInfo.referencia && (
                      <p className="text-sm text-gray-600">Referência: {clienteInfo.referencia}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Tempo Estimado de Entrega</h4>
                    <p className="text-sm text-gray-600">30-45 minutos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-lg mb-2">Resumo do Pedido</h3>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{itens.length} itens</span>
                    <span className="text-sm">R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa de entrega</span>
                    <span className="text-sm">Grátis</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Button className="w-full" onClick={avancarEtapa}>
            Continuar para Pagamento
          </Button>
          <Button variant="outline" className="w-full" onClick={voltarEtapa}>
            Voltar para o Carrinho
          </Button>
        </div>
      </div>
    )
  }

  // Renderizar etapa de pagamento
  const renderEtapaPagamento = () => {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 my-4">
          <h3 className="font-medium text-lg mb-4">Forma de Pagamento</h3>

          <Tabs defaultValue="dinheiro" onValueChange={(value) => setMetodoPagamento(value as any)}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="dinheiro">Dinheiro</TabsTrigger>
              <TabsTrigger value="cartao">Cartão</TabsTrigger>
              <TabsTrigger value="pix">PIX</TabsTrigger>
            </TabsList>

            <TabsContent value="dinheiro" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Pagamento em Dinheiro</h4>
                    <p className="text-sm text-gray-600">Precisa de troco?</p>
                    <div className="flex gap-2">
                      <Button variant={troco === "" ? "default" : "outline"} size="sm" onClick={() => setTroco("")}>
                        Não
                      </Button>
                      <Button variant={troco === "50" ? "default" : "outline"} size="sm" onClick={() => setTroco("50")}>
                        R$ 50,00
                      </Button>
                      <Button
                        variant={troco === "100" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTroco("100")}
                      >
                        R$ 100,00
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cartao" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Pagamento com Cartão</h4>
                    <p className="text-sm text-gray-600">O entregador levará a máquina de cartão</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">Crédito</Badge>
                      <Badge variant="outline">Débito</Badge>
                      <Badge variant="outline">Alimentação</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pix" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Pagamento via PIX</h4>
                    <p className="text-sm text-gray-600">
                      Você receberá as informações para pagamento após confirmar o pedido
                    </p>
                    <div className="bg-gray-100 p-4 rounded-md mt-2 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm font-medium mb-1">QR Code PIX</p>
                        <div className="w-32 h-32 bg-white border border-gray-300 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <h3 className="font-medium text-lg mb-2">Resumo do Pedido</h3>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{itens.length} itens</span>
                    <span className="text-sm">R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa de entrega</span>
                    <span className="text-sm">Grátis</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <Button className="w-full" onClick={finalizarPedido} disabled={enviandoPedido}>
            {enviandoPedido ? "Enviando..." : "Finalizar Pedido"}
          </Button>
          <Button variant="outline" className="w-full" onClick={voltarEtapa}>
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {etapaCheckout === "carrinho" && "Seu Carrinho"}
            {etapaCheckout === "entrega" && "Entrega"}
            {etapaCheckout === "pagamento" && "Pagamento"}
          </SheetTitle>
        </SheetHeader>

        {etapaCheckout === "carrinho" && renderEtapaCarrinho()}
        {etapaCheckout === "entrega" && renderEtapaEntrega()}
        {etapaCheckout === "pagamento" && renderEtapaPagamento()}

        <SheetFooter className="mt-auto pt-2 border-t text-xs text-gray-500">
          <div className="flex items-center justify-center w-full gap-2">
            <ShoppingBag className="h-3 w-3" />
            <span>Pizzaria do Kassio - Cardápio Digital</span>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
