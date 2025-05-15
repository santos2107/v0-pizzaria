"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, parseISO, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CalendarIcon, ChevronLeft, ChevronRight, Plus, RefreshCcw } from "lucide-react"
import Link from "next/link"
import type { Reserva } from "../types"

export default function CalendarioReservasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [view, setView] = useState<"dia" | "semana">("dia")

  // Calcular dias da semana atual
  const diasDaSemana = useMemo(() => {
    const inicio = startOfWeek(currentDate, { weekStartsOn: 0 })
    const fim = endOfWeek(currentDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: inicio, end: fim })
  }, [currentDate])

  // Buscar reservas
  const fetchReservas = async () => {
    setIsLoading(true)
    try {
      let url = "/api/reservas"

      // Se estiver na visualização diária, filtrar por data selecionada
      if (view === "dia" && selectedDate) {
        const dataFormatada = format(selectedDate, "yyyy-MM-dd")
        url += `?data=${dataFormatada}`
      }
      // Se estiver na visualização semanal, buscar todas as reservas da semana
      else if (view === "semana") {
        const inicioSemana = format(diasDaSemana[0], "yyyy-MM-dd")
        const fimSemana = format(diasDaSemana[6], "yyyy-MM-dd")
        // Não filtramos por data na API, vamos filtrar os resultados depois
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Erro ao buscar reservas")
      }

      const data = await response.json()

      // Se estiver na visualização semanal, filtrar as reservas para a semana atual
      if (view === "semana") {
        const reservasDaSemana = data.data.filter((reserva: Reserva) => {
          const dataReserva = parseISO(reserva.data)
          return diasDaSemana.some((dia) => isSameDay(dia, dataReserva))
        })
        setReservas(reservasDaSemana)
      } else {
        setReservas(data.data || [])
      }
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
  }, [view, selectedDate, currentDate])

  // Navegar para o dia/semana anterior
  const navegarAnterior = () => {
    if (view === "dia") {
      const novaData = addDays(currentDate, -1)
      setCurrentDate(novaData)
      setSelectedDate(novaData)
    } else {
      const novaData = addDays(currentDate, -7)
      setCurrentDate(novaData)
    }
  }

  // Navegar para o próximo dia/semana
  const navegarProximo = () => {
    if (view === "dia") {
      const novaData = addDays(currentDate, 1)
      setCurrentDate(novaData)
      setSelectedDate(novaData)
    } else {
      const novaData = addDays(currentDate, 7)
      setCurrentDate(novaData)
    }
  }

  // Navegar para hoje
  const navegarHoje = () => {
    const hoje = new Date()
    setCurrentDate(hoje)
    setSelectedDate(hoje)
  }

  // Agrupar reservas por hora
  const reservasPorHora = useMemo(() => {
    const horarios: Record<string, Reserva[]> = {}

    reservas.forEach((reserva) => {
      const hora = reserva.hora
      if (!horarios[hora]) {
        horarios[hora] = []
      }
      horarios[hora].push(reserva)
    })

    // Ordenar as horas
    return Object.keys(horarios)
      .sort()
      .map((hora) => ({
        hora,
        reservas: horarios[hora],
      }))
  }, [reservas])

  // Agrupar reservas por dia e hora para visualização semanal
  const reservasPorDiaEHora = useMemo(() => {
    const resultado: Record<string, Record<string, Reserva[]>> = {}

    // Inicializar dias da semana
    diasDaSemana.forEach((dia) => {
      const dataFormatada = format(dia, "yyyy-MM-dd")
      resultado[dataFormatada] = {}
    })

    // Agrupar reservas por dia e hora
    reservas.forEach((reserva) => {
      const { data, hora } = reserva

      if (!resultado[data]) {
        resultado[data] = {}
      }

      if (!resultado[data][hora]) {
        resultado[data][hora] = []
      }

      resultado[data][hora].push(reserva)
    })

    return resultado
  }, [reservas, diasDaSemana])

  // Gerar horários para exibição
  const horariosExibicao = [
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
  ]

  // Obter cor do status da reserva
  const getStatusColor = (status: Reserva["status"]) => {
    switch (status) {
      case "confirmada":
        return "bg-green-100 text-green-800 border-green-200"
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelada":
        return "bg-red-100 text-red-800 border-red-200"
      case "concluida":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link href="/reservas">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Calendário de Reservas</h1>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Button onClick={() => router.push("/reservas/nova")}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Reserva
          </Button>
          <Button variant="outline" onClick={fetchReservas}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navegarAnterior}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={navegarHoje}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={navegarProximo}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {view === "dia" && (
            <h2 className="text-xl font-semibold ml-2">
              {format(selectedDate || currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
          )}

          {view === "semana" && (
            <h2 className="text-xl font-semibold ml-2">
              {format(diasDaSemana[0], "dd/MM")} - {format(diasDaSemana[6], "dd/MM/yyyy")}
            </h2>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Tabs value={view} onValueChange={(v) => setView(v as "dia" | "semana")} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dia">Dia</TabsTrigger>
              <TabsTrigger value="semana">Semana</TabsTrigger>
            </TabsList>
          </Tabs>

          {view === "dia" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Selecionar Data
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    if (date) setCurrentDate(date)
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <TabsContent value="dia" className="mt-0">
            {reservasPorHora.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">Nenhuma reserva para esta data</p>
                <Button className="mt-4" onClick={() => router.push("/reservas/nova")}>
                  Criar Nova Reserva
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {horariosExibicao.map((horario) => {
                  const slot = reservasPorHora.find((item) => item.hora === horario)

                  if (!slot && view === "dia") {
                    return (
                      <div key={horario} className="p-4 flex items-center hover:bg-gray-50">
                        <div className="w-20 font-medium text-gray-500">{horario}</div>
                        <div className="flex-1 pl-4">
                          <Button
                            variant="ghost"
                            className="text-muted-foreground border border-dashed border-gray-200 w-full justify-start h-auto py-2"
                            onClick={() => {
                              // Pré-preencher o formulário de nova reserva com esta data e hora
                              const dataFormatada = format(selectedDate || currentDate, "yyyy-MM-dd")
                              router.push(`/reservas/nova?data=${dataFormatada}&hora=${horario}`)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar reserva
                          </Button>
                        </div>
                      </div>
                    )
                  }

                  if (!slot) return null

                  return (
                    <div key={horario} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="w-20 font-medium text-gray-500">{horario}</div>
                        <div className="flex-1 pl-4 space-y-2">
                          {slot.reservas.map((reserva) => (
                            <Card
                              key={reserva.id}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => router.push(`/reservas/${reserva.id}`)}
                            >
                              <CardContent className="p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">{reserva.clienteNome}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Mesa {reserva.mesaNumero} • {reserva.pessoas} pessoas
                                    </div>
                                  </div>
                                  <Badge className={getStatusColor(reserva.status)}>
                                    {reserva.status === "confirmada" && "Confirmada"}
                                    {reserva.status === "pendente" && "Pendente"}
                                    {reserva.status === "cancelada" && "Cancelada"}
                                    {reserva.status === "concluida" && "Concluída"}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="semana" className="mt-0">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                {/* Cabeçalho com os dias da semana */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-4 font-medium text-gray-500 border-r">Horário</div>
                  {diasDaSemana.map((dia, index) => (
                    <div
                      key={index}
                      className={`p-4 text-center font-medium ${isSameDay(dia, new Date()) ? "bg-primary/10" : ""}`}
                    >
                      <div>{format(dia, "EEE", { locale: ptBR })}</div>
                      <div>{format(dia, "dd/MM")}</div>
                    </div>
                  ))}
                </div>

                {/* Linhas de horários */}
                {horariosExibicao.map((horario) => (
                  <div key={horario} className="grid grid-cols-8 border-b hover:bg-gray-50">
                    <div className="p-4 font-medium text-gray-500 border-r">{horario}</div>

                    {diasDaSemana.map((dia, index) => {
                      const dataFormatada = format(dia, "yyyy-MM-dd")
                      const reservasNesseHorario = reservasPorDiaEHora[dataFormatada]?.[horario] || []

                      return (
                        <div key={index} className={`p-2 ${isSameDay(dia, new Date()) ? "bg-primary/10" : ""}`}>
                          {reservasNesseHorario.length > 0 ? (
                            <div className="space-y-1">
                              {reservasNesseHorario.map((reserva) => (
                                <div
                                  key={reserva.id}
                                  className={`p-1 rounded text-xs cursor-pointer ${
                                    reserva.status === "confirmada"
                                      ? "bg-green-100"
                                      : reserva.status === "pendente"
                                        ? "bg-yellow-100"
                                        : reserva.status === "cancelada"
                                          ? "bg-red-100"
                                          : "bg-blue-100"
                                  }`}
                                  onClick={() => router.push(`/reservas/${reserva.id}`)}
                                >
                                  <div className="font-medium truncate">{reserva.clienteNome}</div>
                                  <div className="truncate">Mesa {reserva.mesaNumero}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-8 text-xs text-muted-foreground border border-dashed border-gray-200"
                              onClick={() => {
                                router.push(`/reservas/nova?data=${dataFormatada}&hora=${horario}`)
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Reservar
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      )}
    </div>
  )
}
