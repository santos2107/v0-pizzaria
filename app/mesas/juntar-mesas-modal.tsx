"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface Mesa {
  id: number
  numero: string
  capacidade: number
  status: string
}

interface JuntarMesasModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  mesasDisponiveis: Array<{ id: number; numero: string; capacidade: number }>
}

export function JuntarMesasModal({ isOpen, onClose, onSuccess, mesasDisponiveis }: JuntarMesasModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [mesaPrincipal, setMesaPrincipal] = useState<string>("")
  const [mesasSecundarias, setMesasSecundarias] = useState<string[]>([])
  const [novoNumero, setNovoNumero] = useState("")
  const [capacidadeTotal, setCapacidadeTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Filtrar mesas secundárias para não incluir a mesa principal
  const mesasSecundariasDisponiveis = mesasDisponiveis.filter((mesa) => mesa.id.toString() !== mesaPrincipal)

  // Calcular capacidade total quando as mesas são selecionadas
  useEffect(() => {
    if (!mesaPrincipal) {
      setCapacidadeTotal(0)
      return
    }

    // Encontrar a mesa principal nos dados disponíveis
    const mesaPrincipalObj = mesasDisponiveis.find((m) => m.id.toString() === mesaPrincipal)
    let total = mesaPrincipalObj?.capacidade || 0

    // Somar capacidades das mesas secundárias
    mesasSecundarias.forEach((mesaId) => {
      const mesaObj = mesasDisponiveis.find((m) => m.id.toString() === mesaId)
      if (mesaObj) {
        total += mesaObj.capacidade
      }
    })

    setCapacidadeTotal(total)
  }, [mesaPrincipal, mesasSecundarias, mesasDisponiveis])

  const handleJuntarMesas = async () => {
    if (!mesaPrincipal || mesasSecundarias.length === 0 || !novoNumero) {
      setError("Preencha todos os campos obrigatórios")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. Criar uma nova mesa com a capacidade combinada
      const responseNovaMesa = await fetch("/api/mesas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          api_key: "api_key_pizzaria_kassio_2024", // Usar o nome correto do cabeçalho e um valor fixo
        },
        body: JSON.stringify({
          numero: novoNumero,
          capacidade: capacidadeTotal,
          status: "Disponível",
          observacoes: `Mesa combinada: Principal #${mesaPrincipal}, Secundárias: ${mesasSecundarias.join(", ")}`,
          mesasCombinadas: [mesaPrincipal, ...mesasSecundarias],
        }),
      })

      if (!responseNovaMesa.ok) {
        const errorData = await responseNovaMesa.json()
        throw new Error(errorData.error || "Erro ao criar mesa combinada")
      }

      // 2. Atualizar status das mesas originais para "Em uso combinado"
      const todasMesas = [mesaPrincipal, ...mesasSecundarias]

      for (const mesaId of todasMesas) {
        const response = await fetch(`/api/mesas/${mesaId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            api_key: "api_key_pizzaria_kassio_2024", // Usar o nome correto do cabeçalho e um valor fixo
          },
          body: JSON.stringify({
            status: "Em uso combinado",
            mesaCombinada: novoNumero,
          }),
        })

        if (!response.ok) {
          console.error(`Erro ao atualizar mesa ${mesaId}:`, await response.text())
        }
      }

      toast({
        title: "Mesas combinadas",
        description: `As mesas foram combinadas com sucesso em uma nova mesa #${novoNumero}`,
      })

      onSuccess()
    } catch (error) {
      console.error("Erro ao juntar mesas:", error)
      setError(error instanceof Error ? error.message : "Não foi possível juntar as mesas")
      toast({
        title: "Erro",
        description: "Não foi possível juntar as mesas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleMesaSecundaria = (mesaId: string) => {
    setMesasSecundarias((prev) => (prev.includes(mesaId) ? prev.filter((id) => id !== mesaId) : [...prev, mesaId]))
  }

  // Obter o número da mesa a partir do ID
  const getMesaNumero = (id: string) => {
    const mesa = mesasDisponiveis.find((m) => m.id.toString() === id)
    return mesa ? mesa.numero : id
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Juntar Mesas</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="mesaPrincipal">Mesa Principal</Label>
            <Select
              value={mesaPrincipal}
              onValueChange={(value) => {
                setMesaPrincipal(value)
                // Remover esta mesa das secundárias se estiver lá
                setMesasSecundarias((prev) => prev.filter((id) => id !== value))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a mesa principal" />
              </SelectTrigger>
              <SelectContent>
                {mesasDisponiveis.map((mesa) => (
                  <SelectItem key={mesa.id} value={mesa.id.toString()}>
                    Mesa {mesa.numero} (Cap: {mesa.capacidade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Mesas Secundárias</Label>
            {mesasSecundariasDisponiveis.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma mesa disponível para seleção</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {mesasSecundariasDisponiveis.map((mesa) => (
                  <Button
                    key={mesa.id}
                    type="button"
                    variant={mesasSecundarias.includes(mesa.id.toString()) ? "default" : "outline"}
                    className="h-10"
                    onClick={() => handleToggleMesaSecundaria(mesa.id.toString())}
                    disabled={!mesaPrincipal}
                  >
                    Mesa {mesa.numero}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {mesasSecundarias.length > 0 && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium mb-2">Mesas selecionadas:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-primary/10">
                  Mesa {getMesaNumero(mesaPrincipal)} (Principal)
                </Badge>
                {mesasSecundarias.map((id) => (
                  <Badge key={id} variant="outline">
                    Mesa {getMesaNumero(id)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="novoNumero">Novo Número da Mesa</Label>
            <Input
              id="novoNumero"
              value={novoNumero}
              onChange={(e) => setNovoNumero(e.target.value)}
              placeholder="Ex: 10A"
            />
          </div>

          <div className="space-y-2">
            <Label>Capacidade Total</Label>
            <div className="p-3 bg-muted rounded-md font-medium text-center">{capacidadeTotal} pessoas</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleJuntarMesas} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Juntar Mesas"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
