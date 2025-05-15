"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isSameDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, CalendarDays, Clock, Users, Utensils } from "lucide-react"
import Link from "next/link"
import type { Reserva } from "../types"

export default function DashboardReservasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mesAtual] = useState(new Date())

  // Buscar todas as reservas
  const fetchReservas = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/reservas")
      if (!response.ok) {
        throw new Error("Erro ao buscar reservas")
      }

      const data = await response.json()
      setReservas(data.data || [])
    } catch (error) {
      console.error("Erro ao buscar reservas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as reservas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReservas()
  }, [])

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const total = reservas.length
    const confirmadas = reservas.filter((r) => r.status === "confirmada").length
    const pendentes = reservas.filter((r) => r.status === "pendente").length
    const canceladas = reservas.filter((r) => r.status === "cancelada").length
    const concluidas = reservas.filter((r) => r.status === "concluida").length

    // Calcular taxa de ocupação do mês atual
    const diasDoMes = eachDayOfInterval({
      start: startOfMonth(mesAtual),
      end: endOfMonth(mesAtual),
    })

    // Reservas do mês atual
    const reservasDoMes = reservas.filter((r) => {
      const dataReserva = parseISO(r.data)
      return diasDoMes.some((dia) => isSameDay(dia, dataReserva))
    })

    // Média de pessoas por reserva
    const totalPessoas = reservas.reduce((acc, r) => acc + r.pessoas, 0)
    const mediaPessoas = total > 0 ? (totalPessoas / total).toFixed(1) : "0"

    // Horários mais populares
    const horarios: Record<string, number> = {}
    reservas.forEach((r) => {
      if (!horarios[r.hora]) horarios[r.hora] = 0
      horarios[r.hora]++
    })

    const horariosMaisPopulares = Object.entries(horarios)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hora, count]) => ({ hora, count }))

    return {
      total,
      confirmadas,
      pendentes,
      canceladas,
      concluidas,
      reservasDoMes: reservasDoMes.length,
      mediaPessoas,
      horariosMaisPopulares,
    }
  }, [reservas, mesAtual])

  // Próximas reservas (hoje e amanhã)
  const proximasReservas = useMemo(() => {
    const hoje = format(new Date(), "yyyy-MM-dd")
    const amanha = format(new Date(new Date().setDate(new Date().getDate() + 1)), "yyyy-MM-dd")

    return reservas
      .filter((r) => (r.data === hoje || r.data === amanha) && r.status !== "cancelada")
      .sort((a, b) => {
        // Primeiro ordenar por data
        if (a.data < b.data) return -1
        if (a.data > b.data) return 1

        // Se mesma data, ordenar por hora
        if (a.hora < b.hora) return -1
        if (a.hora > b.hora) return 1

        return 0
      })
      .slice(0, 5)
  }, [reservas])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-4">
          <Link href="/reservas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Dashboard de Reservas</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{estatisticas.total}</div>
            <p className="text-xs text-muted-foreground mt-1">{estatisticas.reservasDoMes} neste mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reservas Confirmadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{estatisticas.confirmadas}</div>
            <p className="text-xs text-muted-foreground mt-1">{estatisticas.pendentes} pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Média de Pessoas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{estatisticas.mediaPessoas}</div>
            <p className="text-xs text-muted-foreground mt-1">pessoas por reserva</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Cancelamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {estatisticas.total > 0 ? `${((estatisticas.canceladas / estatisticas.total) * 100).toFixed(1)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{estatisticas.canceladas} reservas canceladas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Próximas Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            {proximasReservas.length === 0 ? (
              <p className="text-muted-foreground">Não há reservas para hoje ou amanhã</p>
            ) : (
              <div className="space-y-4">
                {proximasReservas.map((reserva) => (
                  <div
                    key={reserva.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => router.push(`/reservas/${reserva.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-10 rounded-full ${
                          reserva.status === "confirmada"
                            ? "bg-green-500"
                            : reserva.status === "pendente"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{reserva.clienteNome}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" /> {reserva.pessoas} pessoas
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {reserva.hora}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> {format(parseISO(reserva.data), "dd/MM")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium flex items-center gap-1">
                        <Utensils className="h-4 w-4" /> Mesa {reserva.mesaNumero}
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full mt-2" onClick={() => router.push("/reservas")}>
                  Ver todas as reservas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horários Populares</CardTitle>
          </CardHeader>
          <CardContent>
            {estatisticas.horariosMaisPopulares.length === 0 ? (
              <p className="text-muted-foreground">Não há dados suficientes</p>
            ) : (
              <div className="space-y-4">
                {estatisticas.horariosMaisPopulares.map(({ hora, count }, index) => (
                  <div key={hora} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-amber-100 text-amber-700"
                            : index === 1
                              ? "bg-gray-100 text-gray-700"
                              : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium">{hora}</span>
                    </div>
                    <span className="text-muted-foreground">{count} reservas</span>
                  </div>
                ))}

                <div className="pt-4 mt-4 border-t">
                  <Button variant="outline" className="w-full" onClick={() => router.push("/reservas/calendario")}>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Ver calendário
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
