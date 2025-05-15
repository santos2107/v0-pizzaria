"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { atualizarStatusPedido } from "./actions"

interface FecharContaModalProps {
  pedido: any
  onClose: () => void
}

export function FecharContaModal({ pedido, onClose }: FecharContaModalProps) {
  const { toast } = useToast()
  const [formaPagamento, setFormaPagamento] = useState(pedido.pagamento?.split(" (")[0] || "")
  const [carregando, setCarregando] = useState(false)

  // Tipos de pagamento
  const tiposPagamento = ["Dinheiro", "Cartão de Crédito", "Cartão de Débito", "PIX", "Vale Refeição"]

  // Calcular total do pedido
  const total = pedido.total || 0

  // Formatar itens para exibição
  const itensPedido = pedido.itens || []

  // Fechar a conta
  const fecharConta = async () => {
    if (!formaPagamento) {
      toast({
        title: "Forma de pagamento não selecionada",
        description: "Selecione uma forma de pagamento para continuar.",
        variant: "destructive",
      })
      return
    }

    try {
      setCarregando(true)

      // Atualizar o status do pedido para concluído
      await atualizarStatusPedido(pedido.id, "Concluído")

      toast({
        title: "Conta fechada com sucesso!",
        description: `Pedido ${pedido.id} foi finalizado.`,
      })

      onClose()
    } catch (error) {
      console.error("Erro ao fechar conta:", error)
      toast({
        title: "Erro ao fechar conta",
        description: "Ocorreu um erro ao tentar fechar a conta.",
        variant: "destructive",
      })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Fechar Conta - {pedido.cliente}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Resumo do Pedido</h3>
            <div className="flex justify-between text-sm">
              <span>Data:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Hora:</span>
              <span>{pedido.horario}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cliente:</span>
              <span>{pedido.cliente}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Itens Consumidos</h3>
            <ScrollArea className="h-56">
              {itensPedido.map((item: string, index: number) => (
                <div key={index} className="py-2 border-b last:border-0">
                  <p>{item}</p>
                </div>
              ))}
            </ScrollArea>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-medium">Forma de Pagamento</h3>
            <Select value={formaPagamento} onValueChange={setFormaPagamento}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {tiposPagamento.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 pt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={carregando}>
            Cancelar
          </Button>
          <Button onClick={fecharConta} disabled={carregando}>
            {carregando ? "Processando..." : "Finalizar Pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
