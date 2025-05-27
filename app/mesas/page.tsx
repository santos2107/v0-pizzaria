"use client"

import type React from "react"

import { useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Loader2,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Utensils,
  Users,
  RefreshCw,
  CheckCircle,
  UserPlus,
  FileText,
  Coffee,
} from "lucide-react"
import { toast } from "react-hot-toast"

// Tipos
type Table = {
  id: string
  number: number
  seats: number
  status: "available" | "occupied" | "reserved"
  orderNumber?: string
  customerName?: string
  startTime?: string
  totalAmount?: number
}

export default function TablesPage() {
  const { user, isAuthenticated, loadingAuth } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<Table[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isNewTableDialogOpen, setIsNewTableDialogOpen] = useState(false)
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const router = useRouter()

  // Proteção de rota
  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      toast.error("Faça login para acessar esta página")
      router.push("/")
    }
  }, [isAuthenticated, loadingAuth, router])

  // Carregar mesas
  useEffect(() => {
    if (isAuthenticated && !loadingAuth) {
      loadTables()
    }
  }, [isAuthenticated, loadingAuth])

  // Carregar mesas (simulado)
  async function loadTables() {
    setLoading(true)
    try {
      // Simulando carregamento
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Dados simulados
      const mockTables: Table[] = [
        {
          id: "1",
          number: 1,
          seats: 4,
          status: "available",
        },
        {
          id: "2",
          number: 2,
          seats: 2,
          status: "occupied",
          orderNumber: "#1234",
          customerName: "João Silva",
          startTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
          totalAmount: 87.5,
        },
        {
          id: "3",
          number: 3,
          seats: 6,
          status: "reserved",
          customerName: "Maria Santos",
          startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          number: 4,
          seats: 4,
          status: "available",
        },
        {
          id: "5",
          number: 5,
          seats: 8,
          status: "occupied",
          orderNumber: "#1235",
          customerName: "Família Oliveira",
          startTime: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
          totalAmount: 245.8,
        },
        {
          id: "6",
          number: 6,
          seats: 2,
          status: "available",
        },
        {
          id: "7",
          number: 7,
          seats: 4,
          status: "occupied",
          orderNumber: "#1236",
          customerName: "Carlos Pereira",
          startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          totalAmount: 62.3,
        },
        {
          id: "8",
          number: 8,
          seats: 6,
          status: "available",
        },
      ]

      setTables(mockTables)
    } catch (error) {
      console.error("Erro ao carregar mesas:", error)
      toast.error("Erro ao carregar mesas")
    } finally {
      setLoading(false)
    }
  }

  // Filtrar mesas
  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      table.number.toString().includes(searchTerm) ||
      (table.customerName && table.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || table.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Adicionar nova mesa (simulado)
  function handleAddTable(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const number = Number.parseInt(formData.get("number") as string)
    const seats = Number.parseInt(formData.get("seats") as string)

    // Verificar se o número da mesa já existe
    if (tables.some((table) => table.number === number)) {
      toast.error(`A mesa ${number} já existe`)
      return
    }

    const newTable: Table = {
      id: Date.now().toString(),
      number,
      seats,
      status: "available",
    }

    setTables((prevTables) => [...prevTables, newTable])
    setIsNewTableDialogOpen(false)
    toast.success(`Mesa ${number} adicionada com sucesso!`)
  }

  // Liberar mesa
  function handleFreeTable(tableId: string) {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === tableId
          ? {
              ...table,
              status: "available",
              orderNumber: undefined,
              customerName: undefined,
              startTime: undefined,
              totalAmount: undefined,
            }
          : table,
      ),
    )
    toast.success("Mesa liberada com sucesso!")
  }

  // Adicionar pedido à mesa
  function handleAddOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedTable) return

    const formData = new FormData(event.currentTarget)
    const customerName = formData.get("customerName") as string

    setTables((prevTables) =>
      prevTables.map((table) =>
        table.id === selectedTable.id
          ? {
              ...table,
              status: "occupied",
              customerName,
              orderNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
              startTime: new Date().toISOString(),
              totalAmount: 0,
            }
          : table,
      ),
    )

    setIsAddOrderDialogOpen(false)
    toast.success(`Pedido iniciado na mesa ${selectedTable.number}!`)
  }

  // Formatar data/hora
  function formatTime(isoString?: string) {
    if (!isoString) return ""
    return new Date(isoString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Formatar tempo de ocupação
  function formatOccupationTime(startTime?: string) {
    if (!startTime) return ""

    const start = new Date(startTime).getTime()
    const now = Date.now()
    const diffMinutes = Math.floor((now - start) / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes} min`
    } else {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return `${hours}h ${minutes}m`
    }
  }

  // Formatação de preço
  function formatCurrency(value?: number) {
    if (value === undefined) return ""
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Renderização condicional
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          <span className="text-gray-600">Verificando autenticação...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Será redirecionado pelo useEffect
  }

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mesas</h1>
            <p className="text-gray-500">Gerencie as mesas da pizzaria</p>
          </div>
          <div className="flex items-center mt-4 md:mt-0 space-x-2">
            <Button variant="outline" className="text-gray-600" onClick={() => loadTables()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setIsNewTableDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Mesa
            </Button>
          </div>
        </div>

        <div className="mb-6 bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                className={statusFilter === "all" ? "bg-gray-900" : ""}
                onClick={() => setStatusFilter("all")}
              >
                Todas
              </Button>
              <Button
                variant={statusFilter === "available" ? "default" : "outline"}
                className={statusFilter === "available" ? "bg-green-600" : "text-green-600"}
                onClick={() => setStatusFilter("available")}
              >
                Disponíveis
              </Button>
              <Button
                variant={statusFilter === "occupied" ? "default" : "outline"}
                className={statusFilter === "occupied" ? "bg-red-600" : "text-red-600"}
                onClick={() => setStatusFilter("occupied")}
              >
                Ocupadas
              </Button>
              <Button
                variant={statusFilter === "reserved" ? "default" : "outline"}
                className={statusFilter === "reserved" ? "bg-blue-600" : "text-blue-600"}
                onClick={() => setStatusFilter("reserved")}
              >
                Reservadas
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              <span className="text-gray-600">Carregando mesas...</span>
            </div>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma mesa encontrada</h3>
            <p className="text-gray-500">
              {searchTerm
                ? `Não encontramos mesas que correspondam a "${searchTerm}"`
                : "Não há mesas com o status selecionado"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTables.map((table) => (
              <Card key={table.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl flex items-center">
                      Mesa {table.number}
                      <Badge
                        className={`ml-2 ${
                          table.status === "available"
                            ? "bg-green-100 text-green-800"
                            : table.status === "occupied"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {table.status === "available"
                          ? "Disponível"
                          : table.status === "occupied"
                            ? "Ocupada"
                            : "Reservada"}
                      </Badge>
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {table.status === "available" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTable(table)
                              setIsAddOrderDialogOpen(true)
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Iniciar Pedido
                          </DropdownMenuItem>
                        )}
                        {table.status === "occupied" && (
                          <>
                            <DropdownMenuItem onClick={() => toast.success(`Ver detalhes da mesa ${table.number}`)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success(`Adicionar item à mesa ${table.number}`)}>
                              <Coffee className="h-4 w-4 mr-2" />
                              Adicionar Item
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFreeTable(table.id)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Fechar Conta
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => toast.success(`Editar mesa ${table.number}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Mesa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => toast.success(`Excluir mesa ${table.number}`)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir Mesa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center text-gray-500 mb-1">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{table.seats} lugares</span>
                  </div>
                  {table.customerName && (
                    <div className="text-gray-700">
                      <p className="font-medium">{table.customerName}</p>
                      {table.orderNumber && <p className="text-sm">{table.orderNumber}</p>}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  {table.status === "occupied" && table.startTime && (
                    <div className="text-sm text-gray-500">
                      <p>Início: {formatTime(table.startTime)}</p>
                      <p>Tempo: {formatOccupationTime(table.startTime)}</p>
                    </div>
                  )}
                  {table.status === "reserved" && table.startTime && (
                    <div className="text-sm text-gray-500">
                      <p>Reserva: {formatTime(table.startTime)}</p>
                    </div>
                  )}
                  {table.totalAmount !== undefined && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-bold text-gray-900">{formatCurrency(table.totalAmount)}</p>
                    </div>
                  )}
                  {table.status === "available" && (
                    <Button
                      className="w-full mt-2 bg-green-500 hover:bg-green-600"
                      onClick={() => {
                        setSelectedTable(table)
                        setIsAddOrderDialogOpen(true)
                      }}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Iniciar Pedido
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de nova mesa */}
      <Dialog open={isNewTableDialogOpen} onOpenChange={setIsNewTableDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Nova Mesa</DialogTitle>
            <DialogDescription>Adicione uma nova mesa à pizzaria.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTable}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="number" className="text-sm font-medium">
                  Número da mesa
                </label>
                <Input id="number" name="number" type="number" min="1" placeholder="Ex: 10" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="seats" className="text-sm font-medium">
                  Capacidade (lugares)
                </label>
                <Input id="seats" name="seats" type="number" min="1" placeholder="Ex: 4" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewTableDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Adicionar Mesa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de adicionar pedido */}
      <Dialog open={isAddOrderDialogOpen} onOpenChange={setIsAddOrderDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Iniciar Pedido</DialogTitle>
            <DialogDescription>Iniciando pedido na Mesa {selectedTable?.number}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddOrder}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="customerName" className="text-sm font-medium">
                  Nome do cliente
                </label>
                <Input id="customerName" name="customerName" placeholder="Ex: João Silva" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOrderDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Iniciar Pedido
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
