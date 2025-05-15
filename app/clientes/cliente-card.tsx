"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Mail, MapPin, Phone, ShoppingBag, User, Trash2, Edit } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
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
import { useToast } from "@/components/ui/use-toast"
import type { Cliente } from "./types"

interface ClienteCardProps {
  cliente: Cliente
  onDelete: () => void
}

export function ClienteCard({ cliente, onDelete }: ClienteCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { toast } = useToast()

  const handleDelete = () => {
    // Simulando exclusão do cliente
    toast({
      title: "Cliente excluído",
      description: `O cliente "${cliente.nome}" foi excluído com sucesso.`,
    })
    onDelete()
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                {cliente.nome}
              </h3>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <Phone className="h-3 w-3 mr-1" />
                <p>{cliente.telefone}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-500">
                <ShoppingBag className="h-3 w-3 mr-1" />
                <p>{cliente.pedidos} pedidos</p>
              </div>
              <p className="text-xs text-gray-400">Último: {cliente.ultimoPedido}</p>
            </div>
          </div>

          {expanded && (
            <div className="mt-4 space-y-3 text-sm border-t pt-4">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <p>{cliente.email || "Não informado"}</p>
              </div>
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p>{cliente.endereco}</p>
                  <p>
                    {cliente.bairro}, {cliente.cidade} - {cliente.cep}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <ShoppingBag className="h-4 w-4 text-gray-400 mr-2" />
                <p>
                  Total gasto: <span className="font-medium text-green-600">R$ {cliente.valorTotal.toFixed(2)}</span>
                </p>
              </div>
              {cliente.observacoes && (
                <div className="bg-gray-50 p-2 rounded-md">
                  <p className="font-medium">Observações:</p>
                  <p>{cliente.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex border-t">
          <Button
            variant="ghost"
            className="flex-1 p-2 text-sm flex items-center justify-center hover:bg-gray-50 rounded-none"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Menos detalhes
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Mais detalhes
              </>
            )}
          </Button>
          <div className="w-px bg-gray-200" />
          <Button
            variant="ghost"
            className="flex-1 p-2 text-sm flex items-center justify-center hover:bg-gray-50 rounded-none"
            asChild
          >
            <Link href={`/clientes/editar/${cliente.id}`}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Link>
          </Button>
          <div className="w-px bg-gray-200" />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="flex-1 p-2 text-sm flex items-center justify-center text-red-600 hover:bg-gray-50 rounded-none"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o cliente "{cliente.nome}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
