"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Minus, Plus, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface AddToCartModalProps {
  produto: any
  onClose: () => void
  onAddToCart: (quantidade: number, observacoes: string, respostasPerguntas?: any[]) => void
}

export function AddToCartModal({ produto, onClose, onAddToCart }: AddToCartModalProps) {
  const [quantidade, setQuantidade] = useState(1)
  const [observacoes, setObservacoes] = useState("")
  const [respostasPerguntas, setRespostasPerguntas] = useState<any[]>([])

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

  // Calcular preço com desconto
  const calcularPrecoComDesconto = () => {
    const promocao = getPromocaoAtiva()
    if (!promocao) return produto.preco

    const desconto = promocao.desconto || 0
    return produto.preco * (1 - desconto / 100)
  }

  // Calcular preço total
  const calcularPrecoTotal = () => {
    let precoBase = temPromocaoAtiva() ? calcularPrecoComDesconto() : produto.preco

    // Adicionar preço das opções selecionadas
    if (respostasPerguntas.length > 0) {
      respostasPerguntas.forEach((resposta) => {
        if (resposta.opcoes) {
          resposta.opcoes.forEach((opcao) => {
            precoBase += opcao.preco || 0
          })
        }
      })
    }

    return precoBase * quantidade
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

  const handleAddToCart = () => {
    onAddToCart(quantidade, observacoes, respostasPerguntas)
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar ao Carrinho</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Imagem e detalhes básicos */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
              {produto.imagem ? (
                <img
                  src={produto.imagem || "/placeholder.svg"}
                  alt={produto.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-xs text-center">Sem imagem</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{produto.nome}</h3>
                {temPromocaoAtiva() && <Badge variant="destructive">Promoção</Badge>}
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{produto.descricao}</p>
              <div className="flex items-center gap-2 mt-1">
                {temPromocaoAtiva() && (
                  <span className="text-sm text-gray-500 line-through">R$ {produto.preco.toFixed(2)}</span>
                )}
                <span className="font-bold">
                  R$ {temPromocaoAtiva() ? calcularPrecoComDesconto().toFixed(2) : produto.preco.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Promoções ativas */}
          {renderPromocoes()}

          {/* Informações nutricionais ou detalhes adicionais */}
          {produto.detalhes && (
            <div className="bg-gray-50 p-3 rounded-md text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Informações do produto</h4>
                  <p className="text-gray-600 text-xs">{produto.detalhes}</p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Quantidade */}
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

          {/* Perguntas configuradas */}
          {renderPerguntas()}

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Ex: sem cebola, bem passado..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Total e botão de adicionar */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-bold">Total: R$ {calcularPrecoTotal().toFixed(2)}</div>
            <Button onClick={handleAddToCart} disabled={!todasPerguntasObrigatoriasRespondidas()}>
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
