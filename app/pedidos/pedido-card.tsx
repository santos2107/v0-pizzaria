"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Clock, CreditCard, MapPin, Phone, User } from "lucide-react"
import { useState } from "react"
import { ProgressBar } from "./progress-bar"

interface Pedido {
  id: string
  cliente: string
  horario: string
  startTime: string // Adicionado para rastrear o tempo exato de início
  itens: string[]
  total: number
  pagamento: string
  endereco: string
  status: string
  tipoAtendimento?: string
  statusUpdatedAt?: Record<string, string>
}

interface PedidoCardProps {
  pedido: Pedido
}

// Usar memo para evitar re-renderizações desnecessárias
export const PedidoCard = memo(function PedidoCardComponent({ pedido }: PedidoCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Validar dados do pedido
  if (!pedido || !pedido.id || !pedido.cliente || !pedido.status) {
    console.error("PedidoCard recebeu dados inválidos:", pedido)
    return null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendente":
        return "bg-blue-500"
      case "Em Preparo":
        return "bg-yellow-500"
      case "Em Entrega":
        return "bg-purple-500"
      case "Concluído":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "Pendente":
        return "Aguardando preparo"
      case "Em Preparo":
        return "Sendo preparado"
      case "Em Entrega":
        return pedido.tipoAtendimento === "balcao" ? "Pronto para retirada" : "Em rota de entrega"
      case "Concluído":
        return "Entregue"
      default:
        return status
    }
  }

  // Função para calcular o tempo restante estimado
  const getTempoRestante = (status: string, startTime: string, pedido: Pedido) => {
    if (!startTime) return "Indisponível"

    const start = new Date(startTime).getTime()
    const now = Date.now()
    const elapsed = now - start

    // Tempos para cada estágio (em milissegundos)
    const pendingTime = 60 * 1000 // 1 minuto para pendente
    const preparingTime = 4 * 60 * 1000 // 4 minutos para preparo

    // Tempo de entrega varia conforme o tipo de atendimento
    const deliveryTime =
      pedido.tipoAtendimento === "balcao"
        ? 5 * 60 * 1000 // 5 minutos para balcão
        : 30 * 60 * 1000 // 30 minutos para delivery

    // Tempo total estimado para todo o processo
    const totalEstimatedTime = pendingTime + preparingTime + deliveryTime

    let remaining = 0

    if (status === "Pendente") {
      // No estágio pendente, o tempo restante é o tempo total menos o tempo decorrido
      remaining = totalEstimatedTime - elapsed
    } else if (status === "Em Preparo") {
      // No estágio de preparo, já passou pelo pendente
      // Tempo restante é (tempo de preparo + tempo de entrega) - (tempo decorrido - tempo pendente)
      const elapsedAfterPending = Math.max(0, elapsed - pendingTime)
      remaining = preparingTime + deliveryTime - elapsedAfterPending
    } else if (status === "Em Entrega") {
      // No estágio de entrega, já passou pelo pendente e preparo
      // Se tiver timestamp de quando entrou em entrega, usar ele para cálculo mais preciso
      if (pedido.statusUpdatedAt?.["Em Entrega"]) {
        const entregaTime = new Date(pedido.statusUpdatedAt["Em Entrega"]).getTime()
        const elapsedInDelivery = now - entregaTime
        remaining = deliveryTime - elapsedInDelivery
      } else {
        // Fallback para cálculo baseado no tempo total
        const elapsedAfterPreparing = Math.max(0, elapsed - pendingTime - preparingTime)
        remaining = deliveryTime - elapsedAfterPreparing
      }
    } else {
      return "Concluído"
    }

    if (remaining <= 0) {
      return pedido.tipoAtendimento === "balcao" ? "Pronto!" : "Chegando..."
    }

    // Converter para minutos
    const minutes = Math.ceil(remaining / 60000)

    if (minutes <= 1) {
      return "< 1 min"
    } else {
      return `~${minutes} min`
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className={`w-2 h-2 rounded-full mt-2 mr-2 ${getStatusColor(pedido.status)}`} />
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium">{pedido.id}</h3>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {pedido.horario || "Horário não disponível"}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <User className="h-3 w-3 text-gray-400 mr-1" />
                  <p className="text-sm">{pedido.cliente}</p>
                  {pedido.tipoAtendimento && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {pedido.tipoAtendimento === "balcao"
                        ? "Balcão"
                        : pedido.tipoAtendimento === "delivery"
                          ? "Delivery"
                          : "Mesa"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">R$ {pedido.total.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{pedido.pagamento || "Não informado"}</p>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-sm text-gray-600">
              {pedido.itens &&
                pedido.itens.slice(0, expanded ? undefined : 2).map((item, index) => (
                  <div key={index} className="mb-1">
                    {item}
                  </div>
                ))}

              {pedido.itens && !expanded && pedido.itens.length > 2 && (
                <div className="text-xs text-gray-400">+ {pedido.itens.length - 2} itens adicionais</div>
              )}

              {!pedido.itens ||
                (pedido.itens.length === 0 && <div className="text-xs text-gray-400">Nenhum item registrado</div>)}
            </div>

            {expanded && (
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{pedido.endereco || "Endereço não disponível"}</p>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <p>(11) 98765-4321</p>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <p>{pedido.pagamento || "Forma de pagamento não informada"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Barra de progresso */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{getStatusText(pedido.status)}</span>
              <span>
                {pedido.status !== "Concluído"
                  ? getTempoRestante(pedido.status, pedido.startTime, pedido)
                  : "Concluído"}
              </span>
            </div>
            <ProgressBar status={pedido.status} startTime={pedido.startTime} tipoAtendimento={pedido.tipoAtendimento} />
          </div>
        </div>

        <div className="flex border-t">
          <Button
            variant="ghost"
            className="flex-1 p-2 text-sm flex items-center justify-center hover:bg-gray-50 rounded-none"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Mostrar menos detalhes" : "Mostrar mais detalhes"}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Menos detalhes
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Mais detalhes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
