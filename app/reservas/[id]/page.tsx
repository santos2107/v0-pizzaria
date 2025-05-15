"use client"

import { useState, useEffect } from "react"
import { useRouter, notFound } from "next/navigation"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Calendar, Clock, Edit, Loader2, MapPin, Phone, Trash, User } from "lucide-react"
import Link from "next/link"
import type { Reserva } from "../types"

export default function DetalhesReservaPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reserva, setReserva] = useState<Reserva | null>(null)

  // Check if the ID is a valid number - if not, redirect to 404
  useEffect(() => {
    if (isNaN(Number(id)) || id === "nova") {
      notFound()
    }
  }, [id])

  const fetchReserva = async () => {
    // Don't attempt to fetch if ID is invalid
    if (isNaN(Number(id)) || id === "nova") {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/reservas/${id}`, {
        headers: {
          api_key: "api_key_pizzaria_kassio_2024",
        },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar reserva")
      }

      if (data.success && data.data) {
        setReserva(data.data)
      } else {
        throw new Error("Dados da reserva não encontrados")
      }
    } catch (error) {
      console.error("Erro ao buscar reserva:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível carregar os dados da reserva",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReserva()
  }, [id, toast])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/reservas/${id}`, {
        method: "DELETE",
        headers: {
          api_key: "api_key_pizzaria_kassio_2024",
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir reserva")
      }

      toast({
        title: "Reserva excluída",
        description: "A reserva foi excluída com sucesso",
      })

      router.push("/reservas")
    } catch (error) {
      console.error("Erro ao excluir reserva:", error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir a reserva",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async (novoStatus: Reserva["status"]) => {
    try {
      const response = await fetch(`/api/reservas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          api_key: "api_key_pizzaria_kassio_2024",
        },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar status da reserva")
      }

      const data = await response.json()

      if (data.success && data.data) {
        setReserva(data.data)
        toast({
          title: "Status atualizado",
          description: `A reserva foi marcada como ${novoStatus}`,
        })
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da reserva",
        variant: "destructive",
      })
    }
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
      return format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    } catch (error) {
      return data
    }
  }

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
        <h1 className="text-3xl font-bold">Detalhes da Reserva</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{reserva.clienteNome}</CardTitle>
            <CardDescription>Reserva #{reserva.id}</CardDescription>
          </div>
          <Badge className={getStatusColor(reserva.status)}>
            {reserva.status === "confirmada" && "Confirmada"}
            {reserva.status === "pendente" && "Pendente"}
            {reserva.status === "cancelada" && "Cancelada"}
            {reserva.status === "concluida" && "Concluída"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{reserva.clienteTelefone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>{formatarData(reserva.data)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>
                  {reserva.hora} ({reserva.duracao} minutos)
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>Mesa {reserva.mesaNumero}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>{reserva.pessoas} pessoas</span>
              </div>
            </div>
          </div>

          {reserva.observacoes && (
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">Observações:</h3>
              <p>{reserva.observacoes}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Informações adicionais:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Criado em:</span>{" "}
                {format(new Date(reserva.criadoEm), "dd/MM/yyyy 'às' HH:mm")}
              </div>
              <div>
                <span className="text-muted-foreground">Última atualização:</span>{" "}
                {format(new Date(reserva.atualizadoEm), "dd/MM/yyyy 'às' HH:mm")}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none" asChild>
              <Link href={`/reservas/editar/${reserva.id}`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex-1 sm:flex-none">
                  <Trash className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Reserva</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta reserva? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Excluindo...
                      </>
                    ) : (
                      "Sim, excluir"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
            {reserva.status === "pendente" && (
              <Button
                variant="default"
                className="flex-1 sm:flex-none"
                onClick={() => handleStatusChange("confirmada")}
              >
                Confirmar Reserva
              </Button>
            )}
            {reserva.status === "confirmada" && (
              <>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => handleStatusChange("concluida")}
                >
                  Marcar como Concluída
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 sm:flex-none"
                  onClick={() => handleStatusChange("cancelada")}
                >
                  Cancelar Reserva
                </Button>
              </>
            )}
            {(reserva.status === "cancelada" || reserva.status === "concluida") && (
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => handleStatusChange("confirmada")}
              >
                Reativar Reserva
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
