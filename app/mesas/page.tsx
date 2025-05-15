"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, RefreshCcw, Grid, List } from "lucide-react"
import { MesaCard } from "./mesa-card"
import { JuntarMesasModal } from "./juntar-mesas-modal"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import type { Reserva } from "@/app/reservas/types"

interface Mesa {
  id: number
  numero: string
  capacidade: number
  status: string
  localizacao?: string
  observacoes?: string
  mesasCombinadas?: string[]
  mesaCombinada?: string
}

// API key constante para desenvolvimento
const API_KEY = "api_key_pizzaria_kassio_2024"

export default function MesasPage() {
  const { toast } = useToast()
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [filteredMesas, setFilteredMesas] = useState<Mesa[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [isLoading, setIsLoading] = useState(true)
  const [isJuntarMesasModalOpen, setIsJuntarMesasModalOpen] = useState(false)
  const [mesasDisponiveis, setMesasDisponiveis] = useState<Mesa[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchMesas = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/mesas", {
        headers: {
          api_key: API_KEY,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Extrair o array de mesas da resposta da API
      const mesasList = data.data || (Array.isArray(data) ? data : [])
      setMesas(mesasList)
      setFilteredMesas(mesasList)

      // Filtrar mesas disponíveis para junção
      const disponiveisParaJuntar = mesasList.filter(
        (mesa: Mesa) => mesa.status === "Disponível" || mesa.status === "Reservada",
      )
      setMesasDisponiveis(disponiveisParaJuntar)
    } catch (error) {
      console.error("Erro ao buscar mesas:", error)
      setError("Não foi possível carregar as mesas")
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível carregar as mesas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReservas = async () => {
    try {
      // Buscar todas as reservas futuras
      const response = await fetch(`/api/reservas`, {
        headers: {
          api_key: API_KEY,
        },
      })

      if (!response.ok) {
        console.error("Erro ao buscar reservas:", response.statusText)
        return
      }

      const reservasData = await response.json()
      // Extrair o array de reservas da resposta da API
      const reservasList = reservasData.data || (Array.isArray(reservasData) ? reservasData : [])

      // Filtrar apenas reservas futuras ou de hoje
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      const reservasFuturas = reservasList.filter((reserva: Reserva) => {
        const dataReserva = new Date(reserva.data)
        return dataReserva >= hoje && (reserva.status === "confirmada" || reserva.status === "pendente")
      })

      setReservas(reservasFuturas)
    } catch (error) {
      console.error("Erro ao buscar reservas:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        await fetchMesas()
        await fetchReservas()
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setError("Erro ao buscar dados")
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados das mesas",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  useEffect(() => {
    let filtered = mesas

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (mesa) =>
          mesa.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (mesa.observacoes && mesa.observacoes.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filtrar por status
    if (statusFilter !== "todos") {
      filtered = filtered.filter((mesa) => mesa.status === statusFilter)
    }

    setFilteredMesas(filtered)
  }, [searchTerm, statusFilter, mesas])

  const handleJuntarMesasSuccess = () => {
    setIsJuntarMesasModalOpen(false)
    fetchMesas()
    toast({
      title: "Sucesso",
      description: "Mesas combinadas com sucesso",
    })
  }

  // Agrupar mesas por status para a visualização em lista
  const mesasPorStatus = {
    Disponível: filteredMesas.filter((mesa) => mesa.status === "Disponível"),
    Ocupada: filteredMesas.filter((mesa) => mesa.status === "Ocupada"),
    Reservada: filteredMesas.filter((mesa) => mesa.status === "Reservada"),
    "Em uso combinado": filteredMesas.filter((mesa) => mesa.status === "Em uso combinado"),
    Manutenção: filteredMesas.filter((mesa) => mesa.status === "Manutenção"),
  }

  // Obter reservas para cada mesa
  const getReservasPorMesa = (mesaId: number) => {
    return reservas.filter((reserva) => reserva.mesaId === mesaId)
  }

  return (
    <main className="min-h-screen">
      <div className="p-4 md:p-6">
        <div className="flex flex-col space-y-4">
          {/* Cabeçalho e Ações */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">Gerenciamento de Mesas</h1>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                <Link href="/mesas/nova">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nova Mesa
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsJuntarMesasModalOpen(true)}>
                Juntar Mesas
              </Button>
              <Button variant="outline" size="sm" onClick={fetchMesas} className="ml-auto md:ml-0">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Filtros e Visualização */}
          <div className="bg-white rounded-md border shadow-sm p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar mesas por número ou observações..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  <SelectItem value="Ocupada">Ocupada</SelectItem>
                  <SelectItem value="Reservada">Reservada</SelectItem>
                  <SelectItem value="Em uso combinado">Em uso combinado</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none h-10 w-10"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none h-10 w-10"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Conteúdo das Mesas */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-md border shadow-sm p-6 text-center">
              <p className="text-lg text-red-600 font-medium">{error}</p>
              <p className="text-muted-foreground mt-2">Tente atualizar a página ou verifique sua conexão</p>
              <Button onClick={fetchMesas} className="mt-4" size="sm">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          ) : filteredMesas.length === 0 ? (
            <div className="bg-white rounded-md border shadow-sm p-6 text-center">
              <p className="text-lg text-muted-foreground">Nenhuma mesa encontrada</p>
              <p className="text-muted-foreground mt-2">Tente ajustar os filtros ou adicione uma nova mesa</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMesas.map((mesa) => (
                <MesaCard key={mesa.id} mesa={mesa} onUpdate={fetchMesas} reservas={reservas} />
              ))}
            </div>
          ) : (
            <Tabs defaultValue="Disponível" className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="Disponível">Disponíveis</TabsTrigger>
                <TabsTrigger value="Ocupada">Ocupadas</TabsTrigger>
                <TabsTrigger value="Reservada">Reservadas</TabsTrigger>
                <TabsTrigger value="Em uso combinado">Combinadas</TabsTrigger>
                <TabsTrigger value="Manutenção">Manutenção</TabsTrigger>
              </TabsList>
              {Object.entries(mesasPorStatus).map(([status, mesas]) => (
                <TabsContent key={status} value={status} className="mt-0">
                  <Card>
                    <CardContent className="p-4">
                      {mesas.length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground">
                          Nenhuma mesa com status {status.toLowerCase()}
                        </p>
                      ) : (
                        <div className="divide-y">
                          {mesas.map((mesa) => (
                            <div key={mesa.id} className="py-3 flex justify-between items-center">
                              <div>
                                <h3 className="font-medium">Mesa {mesa.numero}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Capacidade: {mesa.capacidade} pessoas • {mesa.localizacao || "Sem localização"}
                                </p>
                                {mesa.observacoes && <p className="text-sm italic mt-1">{mesa.observacoes}</p>}
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/mesas/editar/${mesa.id}`}>Editar</Link>
                                </Button>
                                {mesa.status === "Disponível" && (
                                  <Button size="sm" asChild>
                                    <Link href={`/pedidos/novo?mesaId=${mesa.id}&tab=produtos`}>Novo Pedido</Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>

      <JuntarMesasModal
        isOpen={isJuntarMesasModalOpen}
        onClose={() => setIsJuntarMesasModalOpen(false)}
        onSuccess={handleJuntarMesasSuccess}
        mesasDisponiveis={mesasDisponiveis}
      />
    </main>
  )
}
