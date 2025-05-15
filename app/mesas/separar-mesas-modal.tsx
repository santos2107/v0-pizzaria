"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SepararMesasModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  mesa: {
    id: number
    numero: string
    mesasCombinadas?: number[]
  }
}

export function SepararMesasModal({ isOpen, onClose, onSuccess, mesa }: SepararMesasModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSepararMesas = async () => {
    setIsLoading(true)

    try {
      // Chamar a API para separar as mesas
      const response = await fetch(`/api/mesas/separar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mesaId: mesa.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao separar mesas")
      }

      toast({
        title: "Mesas separadas",
        description: "As mesas foram separadas com sucesso",
      })

      onSuccess()
    } catch (error) {
      console.error("Erro ao separar mesas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível separar as mesas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Separar Mesas Combinadas</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            Você está prestes a separar a mesa combinada <strong>#{mesa.numero}</strong>.
          </p>
          <p className="mt-2">
            Isso irá restaurar todas as mesas originais que foram combinadas para formar esta mesa.
          </p>
          <p className="mt-2 text-red-500">Atenção: Esta ação não pode ser desfeita.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleSepararMesas} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Separar Mesas"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
