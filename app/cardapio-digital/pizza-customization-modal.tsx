"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Pizza, Info } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"
import type { Produto } from "../produtos/data"
import { useToast } from "@/components/ui/use-toast"

interface PizzaCustomizationModalProps {
  isOpen: boolean
  onClose: () => void
  onAddToCart: (produto: any) => void
  produto: Produto
}

export function PizzaCustomizationModal({ isOpen, onClose, onAddToCart, produto }: PizzaCustomizationModalProps) {
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<string>("")
  const [meiaPizza, setMeiaPizza] = useState(false)
  const [segundaMetade, setSegundaMetade] = useState<Produto | null>(null)
  const [observacoes, setObservacoes] = useState("")
  const [pizzas, setPizzas] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSabores, setShowSabores] = useState(false)
  const [quantidade, setQuantidade] = useState(1)
  const [activeTab, setActiveTab] = useState("tamanho")
  const [respostasPerguntas, setRespostasPerguntas] = useState<any[]>([])

  // Estados para bordas e adicionais
  const [bordaSelecionada, setBordaSelecionada] = useState<any>(null)
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<any[]>([])

  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && produto.precos) {
      // Seleciona o primeiro tamanho disponível por padrão
      const tamanhos = Object.keys(produto.precos)
      if (tamanhos.length > 0) {
        setTamanhoSelecionado(tamanhos[0])
      }
    }
  }, [isOpen, produto])

  // Resetar as seleções quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setBordaSelecionada(null)
      setAdicionaisSelecionados([])
      setQuantidade(1)
      setMeiaPizza(false)
      setSegundaMetade(null)
      setObservacoes("")
      setShowSabores(false)
      setActiveTab("tamanho")
      setRespostasPerguntas([])
    }
  }, [isOpen])

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/produtos")
        if (!response.ok) {
          throw new Error("Erro ao buscar pizzas")
        }

        const responseData = await response.json()

        // Extrair o array de produtos da resposta da API
        const produtos = responseData.data || (Array.isArray(responseData) ? responseData : [])

        // Filtrar apenas pizzas
        const pizzas = produtos.filter(
          (produto) => (produto.categoria === "Pizza" || produto.categoria === "Pizzas") && produto.disponivel,
        )

        setPizzas(pizzas)
      } catch (error) {
        console.error("Erro ao buscar pizzas:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as opções de pizza",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPizzas()
  }, [meiaPizza, showSabores, toast])

  // Verificar se o produto tem promoções ativas hoje
  const temPromocaoAtiva = () => {
    if (!produto.promocoes || produto.promocoes.length === 0) return false

    const hoje = new Date()
    const diaSemana = hoje.toLocaleDateString("pt-BR", { weekday: "long" }).toLowerCase()

    return produto.promocoes.some((promocao: any) => {
      return promocao.ativa && promocao.diasSemana.includes(diaSemana)
    })
  }

  // Obter a promoção ativa
  const getPromocaoAtiva = () => {
    if (!produto.promocoes || produto.promocoes.length === 0) return null

    const hoje = new Date()
    const diaSemana = hoje.toLocaleDateString("pt-BR", { weekday: "long" }).toLowerCase()

    return produto.promocoes.find((promocao: any) => {
      return promocao.ativa && promocao.diasSemana.includes(diaSemana)
    })
  }

  // Função para alternar a seleção de adicionais
  const toggleAdicional = (adicional: any) => {
    if (adicionaisSelecionados.some((a) => a.id === adicional.id)) {
      setAdicionaisSelecionados(adicionaisSelecionados.filter((a) => a.id !== adicional.id))
    } else {
      setAdicionaisSelecionados([...adicionaisSelecionados, adicional])
    }
  }

  // Lidar com a resposta de uma pergunta de tipo radio
  const handleRadioResposta = (perguntaId: string, opcaoId: string, opcao: any) => {
    const novasRespostas = respostasPerguntas.filter((r) => r.perguntaId !== perguntaId)
    novasRespostas.push({
      perguntaId,
      opcoes: [{ id: opcaoId, ...opcao }],
    })
    setRespostasPerguntas(novasRespostas)
  }

  // Lidar com a resposta de uma pergunta de tipo checkbox
  const handleCheckboxResposta = (perguntaId: string, opcaoId: string, opcao: any, checked: boolean) => {
    const respostaExistente = respostasPerguntas.find((r) => r.perguntaId === perguntaId)

    if (checked) {
      // Adicionar opção
      if (respostaExistente) {
        // Atualizar resposta existente
        const novasRespostas = respostasPerguntas.map((r) => {
          if (r.perguntaId === perguntaId) {
            return {
              ...r,
              opcoes: [...r.opcoes, { id: opcaoId, ...opcao }],
            }
          }
          return r
        })
        setRespostasPerguntas(novasRespostas)
      } else {
        // Criar nova resposta
        setRespostasPerguntas([
          ...respostasPerguntas,
          {
            perguntaId,
            opcoes: [{ id: opcaoId, ...opcao }],
          },
        ])
      }
    } else {
      // Remover opção
      if (respostaExistente) {
        const novasOpcoes = respostaExistente.opcoes.filter((o) => o.id !== opcaoId)

        if (novasOpcoes.length === 0) {
          // Remover resposta inteira se não houver mais opções
          setRespostasPerguntas(respostasPerguntas.filter((r) => r.perguntaId !== perguntaId))
        } else {
          // Atualizar opções da resposta
          const novasRespostas = respostasPerguntas.map((r) => {
            if (r.perguntaId === perguntaId) {
              return {
                ...r,
                opcoes: novasOpcoes,
              }
            }
            return r
          })
          setRespostasPerguntas(novasRespostas)
        }
      }
    }
  }

  // Verificar se todas as perguntas obrigatórias foram respondidas
  const todasPerguntasObrigatoriasRespondidas = () => {
    if (!produto.perguntas || produto.perguntas.length === 0) return true

    const perguntasObrigatorias = produto.perguntas.filter((p: any) => p.obrigatoria)

    return perguntasObrigatorias.every((pergunta: any) => {
      return respostasPerguntas.some((r) => r.perguntaId === pergunta.id)
    })
  }

  // Calcular preço com desconto
  const calcularPrecoComDesconto = () => {
    if (!tamanhoSelecionado) return 0

    const precoBase = produto[`preco${tamanhoSelecionado}`] || 0
    const promocao = getPromocaoAtiva()
    if (!promocao) return precoBase

    const desconto = promocao.desconto || 0
    return precoBase * (1 - desconto / 100)
  }

  // Calcular preço total
  const calcularPrecoTotal = () => {
    if (!tamanhoSelecionado) return 0

    let precoBase = temPromocaoAtiva() ? calcularPrecoComDesconto() : produto[`preco${tamanhoSelecionado}`] || 0

    // Adicionar preço da borda
    if (bordaSelecionada) {
      precoBase += bordaSelecionada.preco || 0
    }

    // Adicionar preço dos adicionais
    adicionaisSelecionados.forEach((adicional) => {
      precoBase += adicional.preco || 0
    })

    // Adicionar preço das respostas às perguntas
    if (respostasPerguntas.length > 0) {
      respostasPerguntas.forEach((resposta) => {
        if (resposta.opcoes) {
          resposta.opcoes.forEach((opcao: any) => {
            precoBase += opcao.preco || 0
          })
        }
      })
    }

    return precoBase * quantidade
  }

  // Função para adicionar ao carrinho
  const handleAddToCart = () => {
    if (!tamanhoSelecionado || !todasPerguntasObrigatoriasRespondidas()) return

    const produtoParaCarrinho = {
      id: Date.now().toString(),
      produtoId: produto.id,
      nome: produto.nome,
      imagem: produto.imagem,
      tamanho: tamanhoSelecionado,
      quantidade,
      precoUnitario: calcularPrecoTotal() / quantidade,
      observacoes,
      meiaPizza,
      segundaMetade: segundaMetade
        ? {
            id: segundaMetade.id,
            nome: segundaMetade.nome,
            imagem: segundaMetade.imagem,
          }
        : null,
      borda: bordaSelecionada,
      adicionais: adicionaisSelecionados,
      respostasPerguntas,
    }

    onAddToCart(produtoParaCarrinho)
  }

  const handleSelectSegundaMetade = (pizza: Produto) => {
    setSegundaMetade(pizza)
    setShowSabores(false)
  }

  // Renderizar visualização da pizza
  const renderPizzaVisualization = () => {
    return (
      <div className="relative w-full aspect-square max-w-[200px] mx-auto mb-4">
        <div className="absolute inset-0 rounded-full bg-yellow-100 border-4 border-yellow-300 overflow-hidden">
          {meiaPizza && segundaMetade ? (
            <>
              <div className="absolute top-0 left-0 w-1/2 h-full bg-yellow-200 overflow-hidden">
                {produto.imagem && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${produto.imagem})` }}
                  ></div>
                )}
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-yellow-200 overflow-hidden">
                {segundaMetade.imagem && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${segundaMetade.imagem})` }}
                  ></div>
                )}
              </div>
              <div className="absolute top-0 left-1/2 w-1 h-full bg-yellow-400 transform -translate-x-1/2"></div>
            </>
          ) : (
            <div className="absolute inset-0 bg-yellow-200 overflow-hidden">
              {produto.imagem && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${produto.imagem})` }}
                ></div>
              )}
            </div>
          )}

          {/* Borda */}
          {bordaSelecionada && (
            <div className="absolute inset-0 rounded-full border-8 border-yellow-600 pointer-events-none"></div>
          )}
        </div>
      </div>
    )
  }

  // Renderizar perguntas do produto
  const renderPerguntas = () => {
    if (!produto.perguntas || produto.perguntas.length === 0) return null

    return (
      <div className="space-y-4 mt-4">
        <Separator />
        <h3 className="font-medium">Opções adicionais</h3>

        {produto.perguntas.map((pergunta: any) => {
          const respostaExistente = respostasPerguntas.find((r) => r.perguntaId === pergunta.id)

          return (
            <div key={pergunta.id} className="space-y-2">
              <Label className="flex items-center">
                {pergunta.texto}
                {pergunta.obrigatoria && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {pergunta.tipo === "radio" ? (
                <RadioGroup
                  value={respostaExistente?.opcoes?.[0]?.id}
                  onValueChange={(value) => {
                    const opcao = pergunta.opcoes.find((o: any) => o.id === value)
                    handleRadioResposta(pergunta.id, value, opcao)
                  }}
                >
                  <div className="space-y-2">
                    {pergunta.opcoes.map((opcao: any) => (
                      <div key={opcao.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={opcao.id} id={`${pergunta.id}-${opcao.id}`} />
                        <Label
                          htmlFor={`${pergunta.id}-${opcao.id}`}
                          className="flex items-center justify-between w-full"
                        >
                          <span>{opcao.texto}</span>
                          {opcao.preco > 0 && (
                            <span className="text-sm text-gray-500">+R$ {opcao.preco.toFixed(2)}</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {pergunta.opcoes.map((opcao: any) => {
                    const isChecked = respostaExistente?.opcoes?.some((o) => o.id === opcao.id) || false

                    return (
                      <div key={opcao.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${pergunta.id}-${opcao.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            handleCheckboxResposta(pergunta.id, opcao.id, opcao, checked as boolean)
                          }}
                        />
                        <Label
                          htmlFor={`${pergunta.id}-${opcao.id}`}
                          className="flex items-center justify-between w-full"
                        >
                          <span>{opcao.texto}</span>
                          {opcao.preco > 0 && (
                            <span className="text-sm text-gray-500">+R$ {opcao.preco.toFixed(2)}</span>
                          )}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Renderizar promoções ativas
  const renderPromocoes = () => {
    const promocaoAtiva = getPromocaoAtiva()
    if (!promocaoAtiva) return null

    return (
      <div className="bg-green-50 p-3 rounded-md text-sm mt-4">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm text-green-700">{promocaoAtiva.nome}</h4>
            <p className="text-green-600 text-xs">{promocaoAtiva.descricao}</p>
            <p className="text-green-700 text-xs font-medium mt-1">Desconto de {promocaoAtiva.desconto}%</p>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar conteúdo principal
  const renderMainContent = () => {
    if (showSabores) {
      return (
        <div className="space-y-4">
          <h3 className="font-medium">Selecione a segunda metade da pizza</h3>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 gap-4">
                {pizzas.length > 0 ? (
                  pizzas.map((pizza) => (
                    <Card
                      key={pizza.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        segundaMetade?.id === pizza.id ? "ring-2 ring-red-500" : ""
                      }`}
                      onClick={() => handleSelectSegundaMetade(pizza)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        {pizza.imagem && (
                          <div className="relative h-16 w-16 rounded-md overflow-hidden">
                            <Image
                              src={pizza.imagem || "/placeholder.svg"}
                              alt={pizza.nome}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{pizza.nome}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{pizza.descricao || ""}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma pizza encontrada</p>
                    <p className="text-sm mt-2">Tente novamente mais tarde</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowSabores(false)}>
              Voltar
            </Button>
          </div>
        </div>
      )
    }

    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="tamanho">Tamanho</TabsTrigger>
          <TabsTrigger value="adicionais">Adicionais</TabsTrigger>
          <TabsTrigger value="observacoes">Observações</TabsTrigger>
        </TabsList>

        <TabsContent value="tamanho" className="space-y-4">
          {renderPizzaVisualization()}

          {/* Promoções ativas */}
          {renderPromocoes()}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tamanho</Label>
              <div className="grid grid-cols-3 gap-2">
                {produto.precos &&
                  Object.entries(produto.precos).map(([tamanho, preco]) => (
                    <Button
                      key={tamanho}
                      variant={tamanhoSelecionado === tamanho ? "default" : "outline"}
                      className="flex flex-col items-center py-3"
                      onClick={() => setTamanhoSelecionado(tamanho)}
                    >
                      <span className="text-lg font-bold">{tamanho}</span>
                      <span className="text-xs">
                        {tamanho === "P" ? "Pequena" : tamanho === "M" ? "Média" : "Grande"}
                      </span>
                      <span className="text-sm mt-1">
                        {temPromocaoAtiva() ? (
                          <>
                            <span className="line-through text-gray-500 mr-1">R$ {preco.toFixed(2)}</span>
                            <span className="text-green-600">
                              R$ {(preco * (1 - (getPromocaoAtiva()?.desconto || 0) / 100)).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          `R$ ${preco.toFixed(2)}`
                        )}
                      </span>
                    </Button>
                  ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="meia-pizza"
                checked={meiaPizza}
                onCheckedChange={(checked) => {
                  setMeiaPizza(checked)
                  if (checked) {
                    setShowSabores(true)
                  } else {
                    setSegundaMetade(null)
                  }
                }}
              />
              <Label htmlFor="meia-pizza">Meia Pizza</Label>
            </div>

            {meiaPizza && segundaMetade && (
              <div className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {segundaMetade.imagem && (
                      <div className="relative h-12 w-12 rounded-md overflow-hidden">
                        <Image
                          src={segundaMetade.imagem || "/placeholder.svg"}
                          alt={segundaMetade.nome}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium">Segunda metade: {segundaMetade.nome}</h4>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowSabores(true)}>
                    Trocar
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("adicionais")}>Próximo</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="adicionais" className="space-y-4">
          {/* Opções de borda */}
          {produto.bordas && produto.bordas.length > 0 && (
            <div className="space-y-2">
              <Label>Borda</Label>
              <div className="grid grid-cols-2 gap-2">
                {produto.bordas.map((borda: any) => (
                  <Button
                    key={borda.id}
                    variant={bordaSelecionada?.id === borda.id ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setBordaSelecionada(bordaSelecionada?.id === borda.id ? null : borda)}
                  >
                    {borda.nome}
                    {borda.preco > 0 && ` (+R$ ${borda.preco.toFixed(2)})`}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Adicionais/ingredientes extras */}
          {produto.adicionais && produto.adicionais.length > 0 && (
            <div className="space-y-2">
              <Label>Adicionais</Label>
              <div className="grid grid-cols-2 gap-2">
                {produto.adicionais.map((adicional: any) => (
                  <Button
                    key={adicional.id}
                    variant={adicionaisSelecionados.some((a) => a.id === adicional.id) ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => toggleAdicional(adicional)}
                  >
                    {adicional.nome}
                    {` (+R$ ${adicional.preco.toFixed(2)})`}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Perguntas configuradas */}
          {renderPerguntas()}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("tamanho")}>
              Voltar
            </Button>
            <Button onClick={() => setActiveTab("observacoes")}>Próximo</Button>
          </div>
        </TabsContent>

        <TabsContent value="observacoes" className="space-y-4">
          <div className="space-y-2">
            <Label>Quantidade</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => quantidade > 1 && setQuantidade(quantidade - 1)}
                disabled={quantidade <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{quantidade}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantidade(quantidade + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Ex: Sem cebola, borda recheada, etc."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <h3 className="font-medium">Resumo do pedido</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Pizza className="h-5 w-5 text-red-600" />
                <span className="font-medium">{produto.nome}</span>
                {meiaPizza && segundaMetade && <Badge variant="outline">Meia {segundaMetade.nome}</Badge>}
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Tamanho:</span>
                  <span>{tamanhoSelecionado}</span>
                </div>

                {bordaSelecionada && (
                  <div className="flex justify-between">
                    <span>Borda:</span>
                    <span>{bordaSelecionada.nome}</span>
                  </div>
                )}

                {adicionaisSelecionados.length > 0 && (
                  <div className="flex justify-between">
                    <span>Adicionais:</span>
                    <span>{adicionaisSelecionados.map((a) => a.nome).join(", ")}</span>
                  </div>
                )}

                {respostasPerguntas.length > 0 && (
                  <div className="flex justify-between">
                    <span>Opções adicionais:</span>
                    <span>{respostasPerguntas.flatMap((r) => r.opcoes.map((o: any) => o.texto)).join(", ")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Quantidade:</span>
                  <span>{quantidade}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>R$ {calcularPrecoTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("adicionais")}>
              Voltar
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={
                !tamanhoSelecionado || (meiaPizza && !segundaMetade) || !todasPerguntasObrigatoriasRespondidas()
              }
            >
              Adicionar ao Carrinho
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar Pizza</DialogTitle>
        </DialogHeader>

        {renderMainContent()}
      </DialogContent>
    </Dialog>
  )
}
