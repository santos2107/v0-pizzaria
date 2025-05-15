"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Users, MapPin, Coffee, ClipboardList, Edit, PlusCircle, Calendar, DollarSign } from "lucide-react"
import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { AdicionarProdutosModal } from "./adicionar-produtos-modal"
import { FecharContaModal } from "./fechar-conta-modal"
import { SepararMesasModal } from "./separar-mesas-modal"
import { format } from "date-fns"
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

interface Pedido {
  id: string
  mesaId: string
  clienteId?: string
  clienteNome?: string
  status: string
  itens: {
    id: string
    produtoId: string
    nome: string
    preco: number
    quantidade: number
    observacao?: string
    opcoes?: {
      tamanho?: { id: string; nome: string; preco: number }
      sabores?: { id: string; nome: string; preco: number }[]
      borda?: { id: string; nome: string; preco: number }
      adicionais?: { id: string; nome: string; preco: number }[]
    }
  }[]
  total: number
  createdAt: string
  updatedAt: string
}

interface MesaCardProps {
  mesa: {
    id: number
    numero: string
    capacidade: number
    status:
      | "livre"
      | "ocupada"
      | "reservada"
      | "indisponivel"
      | "Disponível"
      | "Ocupada"
      | "Reservada"
      | "Em uso combinado"
      | "Manutenção"
    pedidos?: any[]
    mesasCombinadas?: string[]
  }
  pedidoAtivo?: Pedido | null
  onUpdate?: () => void
  onStatusChange?: (id: number, status: string) => void
  onAddProdutos?: (mesaId: number) => void
  onFecharConta?: (mesaId: number) => void
  onVerReservas?: (mesaId: number) => void
  reservas?: Reserva[]
}

const MesaCardComponent = ({
  mesa,
  pedidoAtivo,
  onUpdate,
  onStatusChange,
  onAddProdutos,
  onFecharConta,
  onVerReservas,
  reservas = [],
}: MesaCardProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdicionarProdutosOpen, setIsAdicionarProdutosOpen] = useState(false)
  const [isFecharContaOpen, setIsFecharContaOpen] = useState(false)
  const [isSepararMesasOpen, setIsSepararMesasOpen] = useState(false)

  const { toast } = useToast()

  // Verificar se a mesa tem reserva para hoje
  const hoje = format(new Date(), "yyyy-MM-dd")
  const reservasHoje = reservas.filter(
    (r) => r.mesaId === mesa.id && r.data === hoje && (r.status === "confirmada" || r.status === "pendente"),
  )
  const temReservaHoje = reservasHoje.length > 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disponível":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Ocupada":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "Reservada":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "Manutenção":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      case "Em uso combinado":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const handleNovoPedido = () => {
    if (mesa.status !== "Disponível") {
      toast({
        title: "Mesa não disponível",
        description: "Esta mesa não está disponível para novos pedidos.",
        variant: "destructive",
      })
      return
    }

    setLoading("novoPedido")
    router.push(`/pedidos/novo?mesaId=${mesa.id}&tab=produtos`)
  }

  const handleAdicionarProdutos = async (produtos: any[]) => {
    setIsLoading(true)

    try {
      // Criar um novo pedido com os produtos selecionados
      const novoPedido = {
        mesaId: mesa.id,
        clienteId: null,
        tipoAtendimento: "mesa",
        status: "Pendente",
        itens: produtos,
        observacoes: "",
        horaPedido: new Date().toISOString(),
        tempoEstimado: 30, // Tempo padrão em minutos
      }

      toast({
        title: "Sucesso",
        description: "Produtos adicionados à mesa e enviados para a cozinha",
      })

      // Recarregar os dados da mesa
      onUpdate && onUpdate()
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar os produtos à mesa",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsAdicionarProdutosOpen(false)
    }
  }

  const handleVerPedido = () => {
    if (!pedidoAtivo) {
      toast({
        title: "Nenhum pedido ativo",
        description: "Esta mesa não possui um pedido ativo.",
        variant: "destructive",
      })
      return
    }

    setLoading("verPedido")
    router.push(`/pedidos/${pedidoAtivo.id}`)
  }

  const handleEditarMesa = () => {
    setLoading("editarMesa")
    router.push(`/mesas/editar/${mesa.id}`)
  }

  const handleFecharConta = () => {
    setIsFecharContaOpen(true)
  }

  const handleSepararMesas = () => {
    if (mesa.status !== "Em uso combinado") {
      toast({
        title: "Operação não permitida",
        description: "Apenas mesas combinadas podem ser separadas.",
        variant: "destructive",
      })
      return
    }

    setIsSepararMesasOpen(true)
  }

  const handleSepararMesasSuccess = () => {
    setIsSepararMesasOpen(false)
    toast({
      title: "Mesas separadas",
      description: "As mesas foram separadas com sucesso.",
    })
    onUpdate && onUpdate()
  }

  const handleVerReservas = () => {
    if (typeof onVerReservas === "function") {
      onVerReservas(mesa.id)
    } else {
      setLoading("verReservas")
      router.push(`/mesas/reservas?mesaId=${mesa.id}`)
    }
  }

  const isMesaCombinada = mesa.status === "Em uso combinado"

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div
        className={`h-2 ${
          mesa.status === "Disponível"
            ? "bg-green-500"
            : mesa.status === "Ocupada"
              ? "bg-red-500"
              : mesa.status === "Reservada"
                ? "bg-yellow-500"
                : mesa.status === "Em uso combinado"
                  ? "bg-blue-500"
                  : "bg-gray-500"
        }`}
      />
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold">Mesa {mesa.numero}</h3>
            <div className="flex items-center text-xs text-muted-foreground mt-0.5">
              <Users className="h-3 w-3 mr-1" />
              <span>{mesa.capacidade} pessoas</span>
              {mesa.localizacao && (
                <>
                  <span className="mx-1">•</span>
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{mesa.localizacao}</span>
                </>
              )}
            </div>
            {temReservaHoje && (
              <div className="mt-1">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs py-0">
                  {reservasHoje.length} {reservasHoje.length === 1 ? "Reserva" : "Reservas"} hoje
                </Badge>
              </div>
            )}
          </div>
          <Badge className={`${getStatusColor(mesa.status.toString())} text-xs`}>{mesa.status}</Badge>
        </div>

        {mesa.observacoes && <p className="text-xs text-muted-foreground italic mb-2">{mesa.observacoes}</p>}
      </CardContent>

      <CardFooter className="flex flex-col gap-1.5 p-3 pt-0 border-t">
        {mesa.status === "Disponível" && (
          <>
            <Button
              onClick={handleNovoPedido}
              disabled={loading === "novoPedido"}
              className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs"
            >
              {loading === "novoPedido" ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Carregando...
                </>
              ) : (
                <>
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Novo Pedido
                </>
              )}
            </Button>

            <Button
              onClick={() => {
                setLoading("reservarMesa")
                router.push(`/reservas/nova?mesaId=${mesa.id}`)
              }}
              disabled={loading === "reservarMesa"}
              className="w-full bg-purple-600 hover:bg-purple-700 h-8 text-xs"
            >
              {loading === "reservarMesa" ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Carregando...
                </>
              ) : (
                <>
                  <Calendar className="h-3 w-3 mr-1" />
                  Reservar Mesa
                </>
              )}
            </Button>
          </>
        )}

        {mesa.status === "Ocupada" && (
          <>
            <div className="grid grid-cols-2 gap-1.5 w-full">
              <Button
                onClick={() => setIsAdicionarProdutosOpen(true)}
                disabled={loading === "adicionarProdutos"}
                className="h-8 text-xs"
                variant="outline"
              >
                {loading === "adicionarProdutos" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Coffee className="h-3 w-3 mr-1" />
                    Adicionar
                  </>
                )}
              </Button>

              <Button
                onClick={handleVerPedido}
                disabled={loading === "verPedido"}
                className="h-8 text-xs"
                variant="outline"
              >
                {loading === "verPedido" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <ClipboardList className="h-3 w-3 mr-1" />
                    Ver Pedido
                  </>
                )}
              </Button>
            </div>

            <Button
              onClick={handleFecharConta}
              disabled={loading === "fecharConta"}
              className="w-full bg-red-600 hover:bg-red-700 h-8 text-xs"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Fechar Conta
            </Button>
          </>
        )}

        {isMesaCombinada && (
          <Button onClick={handleSepararMesas} className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs">
            Separar Mesas
          </Button>
        )}

        <Button
          onClick={handleVerReservas}
          disabled={loading === "verReservas"}
          className="w-full h-8 text-xs"
          variant="outline"
        >
          {loading === "verReservas" ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <>
              <Calendar className="h-3 w-3 mr-1" />
              Ver Reservas
            </>
          )}
        </Button>

        <Button
          onClick={handleEditarMesa}
          disabled={loading === "editarMesa"}
          className="w-full h-7 text-xs"
          variant="ghost"
        >
          {loading === "editarMesa" ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : (
            <>
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </>
          )}
        </Button>
      </CardFooter>

      {/* Modal de adicionar produtos */}
      {isAdicionarProdutosOpen && (
        <AdicionarProdutosModal
          isOpen={isAdicionarProdutosOpen}
          onClose={() => setIsAdicionarProdutosOpen(false)}
          mesa={mesa}
          onAddProdutos={handleAdicionarProdutos}
          mesaId={mesa.numero}
        />
      )}

      {/* Modal de fechar conta */}
      {isFecharContaOpen && (
        <FecharContaModal mesaId={mesa.id} mesaNumero={mesa.numero} onClose={() => setIsFecharContaOpen(false)} />
      )}

      {/* Modal de separar mesas */}
      {isSepararMesasOpen && (
        <SepararMesasModal
          isOpen={isSepararMesasOpen}
          onClose={() => setIsSepararMesasOpen(false)}
          onSuccess={handleSepararMesasSuccess}
          mesa={mesa}
        />
      )}
    </Card>
  )
}

export const MesaCard = memo(MesaCardComponent)
