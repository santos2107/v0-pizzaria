"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Clock, Filter, Loader2, Phone, Plus, Search, User } from "lucide-react"
import Link from "next/link"
import type { Reserva } from "./types"

export default function ReservasPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [filteredReservas, setFilteredReservas] = useState<Reserva[]>([])
  const [activeTab, setActiveTab] = useState("todas")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDate, setFilterDate] = useState<Date | undefined>(new Date())
  const [filterStatus, setFilterStatus] = useState<string>("todas")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReservas = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Adicionando um timestamp para evitar cache
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/reservas?_=${timestamp}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          throw new Error(errorData?.error || `Erro na requisição: ${response.status} ${response.statusText}`)
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
        setError(error instanceof Error ? error.message : "Erro desconhecido")
        toast({
          title: "Erro",
          description: "Não foi possível carregar as reservas. Tente novamente mais tarde.",
          variant: "destructive",
        })

        // Definir dados vazios para evitar erros de renderização
        setReservas([])
        setFilteredReservas([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchReservas()
  }, [toast])

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

  // Exibir mensagem de erro se houver um problema
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Reservas</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Erro ao carregar reservas</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-300 hover:bg-red-100"
          >
            Tentar novamente
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/reservas/nova">
              <Plus className="h-4 w-4 mr-2" />
              Nova Reserva
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Reservas</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link href="/reservas/calendario">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendário
            </Link>
          </Button>
          <Button asChild>
            <Link href="/reservas/dashboard">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link href="/reservas/nova">
              <Plus className="h-4 w-4 mr-2" />
              Nova Reserva
            </Link>
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
                <p className="text-lg text-muted-foreground">Nenhuma reserva encontrada</p>
                <Button className="mt-4" asChild>
                  <Link href="/reservas/nova">Criar Nova Reserva</Link>
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
                            <CardDescription>Mesa {reserva.mesaNumero}</CardDescription>
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
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <div>Ver detalhes</div>
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Conteúdo para as outras abas (hoje, amanhã, próximos 7 dias) */}
          <TabsContent value="hoje" className="mt-0">
            {filteredReservas.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-lg text-muted-foreground">Nenhuma reserva para hoje</p>
                <Button className="mt-4" asChild>
                  <Link href="/reservas/nova">Criar Nova Reserva</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReservas.map((reserva) => (
                  <Link key={reserva.id} href={`/reservas/${reserva.id}`} className="block">
                    <Card className="h-full hover:shadow-md transition-shadow">
                      {/* Conteúdo do card (igual ao da aba "todas") */}
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{reserva.clienteNome}</CardTitle>
                            <CardDescription>Mesa {reserva.mesaNumero}</CardDescription>
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
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <div>Ver detalhes</div>
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="amanha" className="mt-0">
            {filteredReservas.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-lg text-muted-foreground">Nenhuma reserva para amanhã</p>
                <Button className="mt-4" asChild>
                  <Link href="/reservas/nova">Criar Nova Reserva</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReservas.map((reserva) => (
                  <Link key={reserva.id} href={`/reservas/${reserva.id}`} className="block">
                    <Card className="h-full hover:shadow-md transition-shadow">
                      {/* Conteúdo do card (igual ao da aba "todas") */}
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{reserva.clienteNome}</CardTitle>
                            <CardDescription>Mesa {reserva.mesaNumero}</CardDescription>
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
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <div>Ver detalhes</div>
                        </Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="proximos7dias" className="mt-0">
            {filteredReservas.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-lg text-muted-foreground">Nenhuma reserva para os próximos 7 dias</p>
                <Button className="mt-4" asChild>
                  <Link href="/reservas/nova">Criar Nova Reserva</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReservas.map((reserva) => (
                  <Link key={reserva.id} href={`/reservas/${reserva.id}`} className="block">
                    <Card className="h-full hover:shadow-md transition-shadow">
                      {/* Conteúdo do card (igual ao da aba "todas") */}
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{reserva.clienteNome}</CardTitle>
                            <CardDescription>Mesa {reserva.mesaNumero}</CardDescription>
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
                      <CardFooter>
                        <Button variant="ghost" size="sm" className="w-full" asChild>
                          <div>Ver detalhes</div>
                        </Button>
                      </CardFooter>
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
