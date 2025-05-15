"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Clock, Filter, Loader2, Phone, Plus, Search, User, ArrowLeft } from "lucide-react"
import type { Reserva } from "@/app/reservas/types"

// API key constante para desenvolvimento
const API_KEY = "api_key_pizzaria_kassio_2024"

export default function MesasReservasPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mesaId = searchParams.get("mesaId")
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [filteredReservas, setFilteredReservas] = useState<Reserva[]>([])
  const [activeTab, setActiveTab] = useState("todas")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDate, setFilterDate] = useState<Date | undefined>(new Date())
  const [filterStatus, setFilterStatus] = useState<string>("todas")
  const [mesaInfo, setMesaInfo] = useState<{ numero: string; capacidade: number } | null>(null)

  useEffect(() => {
    const fetchMesaInfo = async () => {
      if (!mesaId) return

      try {
        const response = await fetch(`/api/mesas/${mesaId}`, {
          headers: {
            api_key: API_KEY,
          },
        })

        if (!response.ok) {
          throw new Error("Erro ao buscar informações da mesa")
        }

        const data = await response.json()
        if (data.success && data.data) {
          setMesaInfo({
            numero: data.data.numero,
            capacidade: data.data.capacidade,
          })
        }
      } catch (error) {
        console.error("Erro ao buscar informações da mesa:", error)
      }
    }

    fetchMesaInfo()
  }, [mesaId])

  useEffect(() => {
    const fetchReservas = async () => {
      setIsLoading(true)
      try {
        // Se tiver mesaId, busca apenas reservas dessa mesa
        const url = mesaId ? `/api/reservas?mesaId=${mesaId}` : "/api/reservas"

        const response = await fetch(url, {
          headers: {
            api_key: API_KEY,
          },
        })

        if (!response.ok) {
          throw new Error("Erro ao buscar reservas")
        }

        const data = await response.json()

        // Verificar se a resposta tem a estrutura esperada
        if (data.success && Array.isArray(data.data)) {
          setReservas(data.data)
          setFilteredReservas(data.data)
        } else {
          console.error("Formato de resposta inesperado:", data)
          throw new Error("Formato de resposta inesperado")
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

    fetchReservas()
  }, [toast, mesaId])

  useEffect(() => {
    applyFilters()
  }, [activeTab, searchTerm, filterDate, filterStatus, reservas])

  const applyFilters = () => {
    let filtered = [...reservas]

    // Filtrar por tab
    if (activeTab === "hoje") {
      filtered = filtered.filter((reserva) => isToday(new Date(reserva.data)))
    } else if (activeTab === "amanha") {
      filtered = filtered.filter((reserva) => isTomorrow(new Date(reserva.data)))
    } else if (activeTab === "proximos7dias") {
      const hoje = new Date()
      const em7Dias = addDays(hoje, 7)
      filtered = filtered.filter((reserva) => {
        const dataReserva = new Date(reserva.data)
        return dataReserva >= hoje && dataReserva <= em7Dias
      })
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (reserva) =>
          reserva.clienteNome.toLowerCase().includes(term) ||
          reserva.clienteTelefone.includes(term) ||
          reserva.mesaNumero.includes(term),
      )
    }

    // Filtrar por data específica
    if (filterDate) {
      const dataFormatada = format(filterDate, "yyyy-MM-dd")
      filtered = filtered.filter((reserva) => reserva.data === dataFormatada)
    }

    // Filtrar por status
    if (filterStatus !== "todas") {
      filtered = filtered.filter((reserva) => reserva.status === filterStatus)
    }

    setFilteredReservas(filtered)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleDateChange = (date: Date | undefined) => {
    setFilterDate(date)
  }

  const handleStatusChange = (value: string) => {
    setFilterStatus(value)
  }

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

  const formatarData = (data: string) => {
    try {
      const parsedDate = parseISO(data)
      return format(parsedDate, "dd 'de' MMMM", { locale: ptBR })
    } catch (error) {
      return data
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Carregando reservas...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Button variant="outline" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{mesaInfo ? `Reservas da Mesa ${mesaInfo.numero}` : "Reservas"}</h1>
          {mesaInfo && (
            <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">
              Capacidade: {mesaInfo.capacidade} pessoas
            </Badge>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link href={mesaId ? `/reservas/nova?mesaId=${mesaId}` : "/reservas/nova"}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Reserva
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/mesas">Voltar para Mesas</Link>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Tabs defaultValue="todas" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="hoje">Hoje</TabsTrigger>
            <TabsTrigger value="amanha">Amanhã</TabsTrigger>
            <TabsTrigger value="proximos7dias">Próximos 7 dias</TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por cliente, telefone ou mesa..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDate ? format(filterDate, "dd/MM/yyyy") : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={filterDate} onSelect={handleDateChange} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="w-full sm:w-auto">
                <Select value={filterStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="confirmada">Confirmadas</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="cancelada">Canceladas</SelectItem>
                    <SelectItem value="concluida">Concluídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <TabsContent value="todas" className="mt-0">
            {filteredReservas.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-lg text-muted-foreground">
                  {mesaInfo
                    ? `Nenhuma reserva encontrada para a Mesa ${mesaInfo.numero}`
                    : "Nenhuma reserva encontrada"}
                </p>
                <Button className="mt-4" asChild>
                  <Link href={mesaId ? `/reservas/nova?mesaId=${mesaId}` : "/reservas/nova"}>Criar Nova Reserva</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReservas.map((reserva) => (
                  <Link key={reserva.id} href={`/reservas/${reserva.id}`} className="block">
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{reserva.clienteNome}</CardTitle>
                            <div className="text-sm text-muted-foreground">Mesa {reserva.mesaNumero}</div>
                          </div>
                          <Badge className={getStatusColor(reserva.status)}>
                            {reserva.status === "confirmada" && "Confirmada"}
                            {reserva.status === "pendente" && "Pendente"}
                            {reserva.status === "cancelada" && "Cancelada"}
                            {reserva.status === "concluida" && "Concluída"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatarData(reserva.data)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.hora}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.pessoas} pessoas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.clienteTelefone}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hoje" className="mt-0">
            {/* Conteúdo idêntico, mas filtrado por data de hoje */}
            {filteredReservas.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-lg text-muted-foreground">
                  {mesaInfo ? `Nenhuma reserva para hoje na Mesa ${mesaInfo.numero}` : "Nenhuma reserva para hoje"}
                </p>
                <Button className="mt-4" asChild>
                  <Link href={mesaId ? `/reservas/nova?mesaId=${mesaId}` : "/reservas/nova"}>Criar Nova Reserva</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReservas.map((reserva) => (
                  <Link key={reserva.id} href={`/reservas/${reserva.id}`} className="block">
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{reserva.clienteNome}</CardTitle>
                            <div className="text-sm text-muted-foreground">Mesa {reserva.mesaNumero}</div>
                          </div>
                          <Badge className={getStatusColor(reserva.status)}>
                            {reserva.status === "confirmada" && "Confirmada"}
                            {reserva.status === "pendente" && "Pendente"}
                            {reserva.status === "cancelada" && "Cancelada"}
                            {reserva.status === "concluida" && "Concluída"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatarData(reserva.data)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.hora}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.pessoas} pessoas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.clienteTelefone}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="amanha" className="mt-0">
            {/* Conteúdo idêntico, mas filtrado por data de amanhã */}
            {filteredReservas.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-lg text-muted-foreground">
                  {mesaInfo ? `Nenhuma reserva para amanhã na Mesa ${mesaInfo.numero}` : "Nenhuma reserva para amanhã"}
                </p>
                <Button className="mt-4" asChild>
                  <Link href={mesaId ? `/reservas/nova?mesaId=${mesaId}` : "/reservas/nova"}>Criar Nova Reserva</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReservas.map((reserva) => (
                  <Link key={reserva.id} href={`/reservas/${reserva.id}`} className="block">
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{reserva.clienteNome}</CardTitle>
                            <div className="text-sm text-muted-foreground">Mesa {reserva.mesaNumero}</div>
                          </div>
                          <Badge className={getStatusColor(reserva.status)}>
                            {reserva.status === "confirmada" && "Confirmada"}
                            {reserva.status === "pendente" && "Pendente"}
                            {reserva.status === "cancelada" && "Cancelada"}
                            {reserva.status === "concluida" && "Concluída"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatarData(reserva.data)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.hora}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.pessoas} pessoas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.clienteTelefone}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="proximos7dias" className="mt-0">
            {/* Conteúdo idêntico, mas filtrado pelos próximos 7 dias */}
            {filteredReservas.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-lg text-muted-foreground">
                  {mesaInfo
                    ? `Nenhuma reserva para os próximos 7 dias na Mesa ${mesaInfo.numero}`
                    : "Nenhuma reserva para os próximos 7 dias"}
                </p>
                <Button className="mt-4" asChild>
                  <Link href={mesaId ? `/reservas/nova?mesaId=${mesaId}` : "/reservas/nova"}>Criar Nova Reserva</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReservas.map((reserva) => (
                  <Link key={reserva.id} href={`/reservas/${reserva.id}`} className="block">
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{reserva.clienteNome}</CardTitle>
                            <div className="text-sm text-muted-foreground">Mesa {reserva.mesaNumero}</div>
                          </div>
                          <Badge className={getStatusColor(reserva.status)}>
                            {reserva.status === "confirmada" && "Confirmada"}
                            {reserva.status === "pendente" && "Pendente"}
                            {reserva.status === "cancelada" && "Cancelada"}
                            {reserva.status === "concluida" && "Concluída"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatarData(reserva.data)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.hora}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.pessoas} pessoas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{reserva.clienteTelefone}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
