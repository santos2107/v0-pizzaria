"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CreditCard } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { pt } from "date-fns/locale"
import { FecharContaModal } from "./fechar-conta-modal"

interface MesaCardProps {
  pedido: any
  mesa: any
}

export function MesaCardComponent({ pedido, mesa }: MesaCardProps) {
  const [mostrarModal, setMostrarModal] = useState(false)

  // Calcular tempo decorrido
  const tempoDecorrido = pedido.startTime
    ? formatDistanceToNow(new Date(pedido.startTime), { locale: pt, addSuffix: true })
    : "tempo desconhecido"

  // Função para formatar o valor total
  const formatarValor = (valor: number) => {
    return `R$ ${valor.toFixed(2)}`
  }

  // Mostrar modal de fechar conta
  const abrirModalFecharConta = () => {
    setMostrarModal(true)
  }

  // Fechar modal
  const fecharModal = () => {
    setMostrarModal(false)
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col">
            <div className="flex justify-between items-start">
              <h2 className="font-bold text-lg">Mesa {mesa.numero}</h2>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">{pedido.status}</Badge>
            </div>

            <div className="mt-2 text-sm text-gray-600 flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{tempoDecorrido}</span>
            </div>

            <div className="mt-2">
              <p className="font-medium">Itens: {pedido.itens.length}</p>
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  <p className="font-bold">{formatarValor(pedido.total)}</p>
                </div>
                <Button size="sm" onClick={abrirModalFecharConta}>
                  Fechar Conta
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {mostrarModal && <FecharContaModal pedido={pedido} onClose={fecharModal} />}
    </>
  )
}
