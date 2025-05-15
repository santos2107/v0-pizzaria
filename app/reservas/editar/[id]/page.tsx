"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, CalendarIcon, Loader2 } from "lucide-react"
import Link from "next/link"
import type { Reserva, ReservaFormData } from "../../types"

interface Mesa {
  id: number
  numero: string
  capacidade: number
  status: string
}

export default function EditarReservaPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [mesasDisponiveis, setMesasDisponiveis] = useState<Mesa[]>([])
  const [reserva, setReserva] = useState<Reserva | null>(null)
  const [formData, setFormData] = useState<ReservaFormData>({
    mesaId: 0,
    mesaNumero: "",
    clienteNome: "",
    clienteTelefone: "",
    clienteEmail: "",
    data: format(new Date(), "yyyy-MM-dd"),
    hora: "19:00",
    duracao: 120,
    pessoas: 2,
    observacoes: "",
  })
  const [date, setDate] = useState<Date | undefined>(undefined)

  // Carregar dados da reserva
  useEffect(() => {
    const fetchReserva = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/reservas/${id}`)
        if (!response.ok) {
          throw new Error("Erro ao buscar reserva")
        }
        const data = await response.json()

        if (data.success && data.data) {
          setReserva(data.data)

          // Preencher o formulário com os dados da reserva
          setFormData({
            mesaId: data.data.mesaId,
            mesaNumero: data.data.mesaNumero,
            clienteNome: data.data.clienteNome,
            clienteTelefone: data.data.clienteTelefone,
            clienteEmail: data.data.clienteEmail || "",
            data: data.data.data,
            hora: data.data.hora,
            duracao: data.data.duracao,
            pessoas: data.data.pessoas,
            observacoes: data.data.observacoes || "",
          })

          // Definir a data para o componente Calendar
          if (data.data.data) {
            setDate(parseISO(data.data.data))
          }
        }
      } catch (error) {
        console.error("Erro ao buscar reserva:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da reserva",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReserva()
  }, [id, toast])

  // Carregar mesas
  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const response = await fetch("/api/mesas")
        if (!response.ok) {
          throw new Error("Erro ao buscar mesas")
        }
        const data = await response.json()
        setMesas(data.data || [])
      } catch (error) {
        console.error("Erro ao buscar mesas:", error)
      }
    }

    fetchMesas()
  }, [])

  // Verificar disponibilidade das mesas quando a data ou hora mudar
  useEffect(() => {
    const verificarDisponibilidade = async () => {
      if (!formData.data || !formData.hora || !reserva) return

      try {
        // Filtrar mesas com capacidade suficiente
        const mesasComCapacidade = mesas.filter((mesa) => mesa.capacidade >= formData.pessoas)

        // Para cada mesa, verificar disponibilidade
        const mesasDisponiveisPromises = mesasComCapacidade.map(async (mesa) => {
          // Se for a mesa atual da reserva, considerá-la disponível
          if (mesa.id === reserva.mesaId) {
            return mesa
          }

          const response = await fetch(
            `/api/reservas/verificar-disponibilidade?mesaId=${mesa.id}&data=${formData.data}&hora=${formData.hora}&duracao=${formData.duracao}&reservaId=${id}`,
          )

          if (!response.ok) {
            return null
          }

          const data = await response.json()
          return data.disponivel ? mesa : null
        })

        const resultados = await Promise.all(mesasDisponiveisPromises)
        const mesasDisponiveisArray = resultados.filter(Boolean) as Mesa[]

        setMesasDisponiveis(mesasDisponiveisArray)
      } catch (error) {
        console.error("Erro ao verificar disponibilidade:", error)
      }
    }

    if (mesas.length > 0 && reserva) {
      verificarDisponibilidade()
    }
  }, [formData.data, formData.hora, formData.duracao, formData.pessoas, mesas, reserva, id])

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDate(date)
      setFormData({
        ...formData,
        data: format(date, "yyyy-MM-dd"),
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "mesaId") {
      const mesaSelecionada = mesas.find((mesa) => mesa.id === Number(value))
      setFormData({
        ...formData,
        mesaId: Number(value),
        mesaNumero: mesaSelecionada ? mesaSelecionada.numero : "",
      })
    } else if (name === "duracao" || name === "pessoas") {
      setFormData({
        ...formData,
        [name]: Number(value),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/reservas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao atualizar reserva")
      }

      toast({
        title: "Reserva atualizada",
        description: "A reserva foi atualizada com sucesso",
      })

      router.push("/reservas")
    } catch (error) {
      console.error("Erro ao atualizar reserva:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar a reserva",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Gerar opções de horários
  const horariosDisponiveis = [
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Carregando dados da reserva...</p>
      </div>
    )
  }

  if (!reserva) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">Reserva não encontrada</div>
        <Button className="mt-4" asChild>
          <Link href="/reservas">Voltar para Reservas</Link>
        </Button>
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
        <h1 className="text-3xl font-bold">Editar Reserva</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Reserva</CardTitle>
          <CardDescription>Atualize os dados da reserva</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="clienteNome">Nome do Cliente*</Label>
                <Input
                  id="clienteNome"
                  name="clienteNome"
                  value={formData.clienteNome}
                  onChange={handleInputChange}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clienteTelefone">Telefone*</Label>
                <Input
                  id="clienteTelefone"
                  name="clienteTelefone"
                  value={formData.clienteTelefone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clienteEmail">E-mail</Label>
              <Input
                id="clienteEmail"
                name="clienteEmail"
                type="email"
                value={formData.clienteEmail}
                onChange={handleInputChange}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Data da Reserva*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      initialFocus
                      disabled={(date) => {
                        // Permitir a data atual da reserva, mesmo que seja no passado
                        if (reserva && date && format(date, "yyyy-MM-dd") === reserva.data) {
                          return false
                        }
                        // Desabilitar datas passadas
                        return date < new Date(new Date().setHours(0, 0, 0, 0))
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora">Horário*</Label>
                <Select value={formData.hora} onValueChange={(value) => handleSelectChange("hora", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {horariosDisponiveis.map((horario) => (
                      <SelectItem key={horario} value={horario}>
                        {horario}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (minutos)*</Label>
                <Select
                  value={formData.duracao.toString()}
                  onValueChange={(value) => handleSelectChange("duracao", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="150">2 horas e 30 minutos</SelectItem>
                    <SelectItem value="180">3 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pessoas">Número de Pessoas*</Label>
                <Input
                  id="pessoas"
                  name="pessoas"
                  type="number"
                  min="1"
                  value={formData.pessoas}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mesaId">Mesa*</Label>
              <Select
                value={formData.mesaId ? formData.mesaId.toString() : ""}
                onValueChange={(value) => handleSelectChange("mesaId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma mesa" />
                </SelectTrigger>
                <SelectContent>
                  {mesasDisponiveis.length === 0 ? (
                    <SelectItem value="" disabled>
                      Nenhuma mesa disponível para este horário
                    </SelectItem>
                  ) : (
                    mesasDisponiveis.map((mesa) => (
                      <SelectItem key={mesa.id} value={mesa.id.toString()}>
                        Mesa {mesa.numero} - {mesa.capacidade} pessoas
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {mesasDisponiveis.length === 0 && (
                <p className="text-sm text-destructive mt-1">
                  Não há mesas disponíveis para o horário selecionado. Tente outro horário ou data.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                placeholder="Informações adicionais sobre a reserva"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" type="button" asChild>
                <Link href="/reservas">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.mesaId}>
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
