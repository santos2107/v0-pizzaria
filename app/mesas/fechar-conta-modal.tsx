"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { fecharContaMesa, obterPedidosPorMesa } from "@/app/pedidos/actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface FecharContaModalProps {
  mesaId: number | null
  mesaNumero: string
  onClose: () => void
}

export function FecharContaModal({ mesaId, mesaNumero, onClose }: FecharContaModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [pedidos, setPedidos] = useState<any[]>([])
  const [processando, setProcessando] = useState(false)

  // Carregar pedidos da mesa
  useState(() => {
    async function carregarPedidos() {
      if (!mesaId) return

      setCarregando(true)
      try {
        const pedidosMesa = await obterPedidosPorMesa(mesaId)
        setPedidos(pedidosMesa)
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os pedidos desta mesa.",
          variant: "destructive",
        })
      } finally {
        setCarregando(false)
      }
    }

    carregarPedidos()
  }, [mesaId, toast])

  // Calcular total da conta
  const totalConta = pedidos.reduce((total, pedido) => total + pedido.total, 0)

  // Fechar a conta
  const handleFecharConta = async () => {
    if (!mesaId) return

    setProcessando(true)
    try {
      const resultado = await fecharContaMesa(mesaId)

      if (resultado.success) {
        toast({
          title: "Conta fechada com sucesso!",
          description: `A mesa ${mesaNumero} foi liberada.`,
        })
        onClose()
        router.refresh()
      }
    } catch (error) {
      console.error("Erro ao fechar conta:", error)
      toast({
        title: "Erro",
        description: "Não foi possível fechar a conta desta mesa.",
        variant: "destructive",
      })
    } finally {
      setProcessando(false)
    }
  }

  return (
    <Dialog open={!!mesaId} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Fechar Conta - Mesa {mesaNumero}</DialogTitle>
          <DialogDescription>Revise os pedidos e confirme o fechamento da conta.</DialogDescription>
        </DialogHeader>

        {carregando ? (
          <div className="py-6 text-center">Carregando pedidos...</div>
        ) : pedidos.length === 0 ? (
          <div className="py-6 text-center">Nenhum pedido encontrado para esta mesa.</div>
        ) : (
          <>
            <ScrollArea className="max-h-[300px] pr-4">
              <div className="space-y-4">
                {pedidos.map((pedido) => (
                  <div key={pedido.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Pedido #{pedido.id}</span>
                      <span>R$ {pedido.total.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {pedido.horario} - {pedido.status}
                    </div>
                    <div className="text-sm">
                      {pedido.itens.map((item: string, index: number) => (
                        <div key={index} className="pl-2 border-l-2 border-gray-200">
                          {item}
                        </div>
                      ))}
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-4 border-t">
              <div className="flex justify-between font-bold text-lg">
                <span>Total da Conta:</span>
                <span>R$ {totalConta.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={processando}>
            Cancelar
          </Button>
          <Button onClick={handleFecharConta} disabled={carregando || pedidos.length === 0 || processando}>
            {processando ? "Processando..." : "Fechar Conta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
