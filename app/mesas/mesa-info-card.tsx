"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Users, Calendar, ClipboardList } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Reserva } from "@/app/reservas/types"

interface MesaInfoCardProps {
  mesaId: number
  mesaNumero: string
  capacidade: number
  reservas: Reserva[]
  onNovaReserva?: (mesaId: number) => void
  onEditarReserva?: (reservaId: number) => void
}

export function MesaInfoCard({
  mesaId,
  mesaNumero,
  capacidade,
  reservas,
  onNovaReserva,
  onEditarReserva,
}: MesaInfoCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  // Filtrar apenas reservas confirmadas ou pendentes
  const reservasAtivas = reservas.filter((reserva) => reserva.status === "confirmada" || reserva.status === "pendente")

  // Ordenar por data e hora
  const reservasOrdenadas = [...reservasAtivas].sort((a, b) => {
    const dataComparison = a.data.localeCompare(b.data)
    if (dataComparison !== 0) return dataComparison
    return a.hora.localeCompare(b.hora)
  })

  // Obter próximas 3 reservas
  const proximasReservas = reservasOrdenadas.slice(0, 3)

  const formatarData = (data: string) => {
    try {
      const dataObj = new Date(data)
      return format(dataObj, "dd 'de' MMMM", { locale: ptBR })
    } catch (error) {
      return data
    }
  }

  const handleNovaReserva = () => {
    if (onNovaReserva) {
      onNovaReserva(mesaId)
    } else {
      setLoading("novaReserva")
      router.push(`/reservas/nova?mesaId=${mesaId}`)
    }
  }

  const handleVerTodasReservas = () => {
    setLoading("verReservas")
    router.push(`/mesas/reservas?mesaId=${mesaId}`)
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold">Mesa {mesaNumero}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Users className="h-4 w-4 mr-2" />
              <span>Capacidade: {capacidade} pessoas</span>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {reservasOrdenadas.length} {reservasOrdenadas.length === 1 ? "Reserva" : "Reservas"}
          </Badge>
        </div>

        {proximasReservas.length > 0 ? (
          <div className="space-y-3 mt-4">
            <h4 className="font-medium text-sm">Próximas reservas:</h4>
            {proximasReservas.map((reserva) => (
              <div
                key={reserva.id}
                className="p-2 border rounded-md hover:bg-muted transition-colors cursor-pointer"
                onClick={() => (onEditarReserva ? onEditarReserva(reserva.id) : router.push(`/reservas/${reserva.id}`))}
              >
                <div className="flex justify-between">
                  <div className="font-medium">{reserva.clienteNome}</div>
                  <div className="text-sm text-muted-foreground">{reserva.pessoas} pessoas</div>
                </div>
                <div className="flex items-center text-sm mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {formatarData(reserva.data)} às {reserva.hora}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-muted/50 rounded-md text-center text-muted-foreground mt-2">
            <p>Nenhuma reserva agendada</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 justify-between pt-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleVerTodasReservas}
          disabled={loading === "verReservas"}
        >
          {loading === "verReservas" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ClipboardList className="h-4 w-4 mr-2" />
          )}
          Ver Todas
        </Button>
        <Button variant="default" className="flex-1" onClick={handleNovaReserva} disabled={loading === "novaReserva"}>
          {loading === "novaReserva" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Calendar className="h-4 w-4 mr-2" />
          )}
          Nova Reserva
        </Button>
      </CardFooter>
    </Card>
  )
}
