"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface ProdutoCardProps {
  produto: any
  onDelete: () => void
  onToggleDisponibilidade: (disponivel: boolean) => void
}

export function ProdutoCard({ produto, onDelete, onToggleDisponibilidade }: ProdutoCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Função para formatar o preço
  const formatarPreco = (preco: number) => {
    return preco ? `R$ ${preco.toFixed(2)}` : "-"
  }

  // Função para exibir o preço correto com base na categoria
  const exibirPreco = () => {
    if (produto.categoria === "Pizzas") {
      return (
        <div className="text-sm">
          <span className="font-medium">Preços: </span>
          <span>P: {formatarPreco(produto.precoP)}, </span>
          <span>M: {formatarPreco(produto.precoM)}, </span>
          <span>G: {formatarPreco(produto.precoG)}, </span>
          <span>GG: {formatarPreco(produto.precoGG)}</span>
        </div>
      )
    }
    return <div className="text-sm font-medium">Preço: {formatarPreco(produto.preco)}</div>
  }

  // Função para exibir informações do sabor (para pizzas)
  const exibirSabor = () => {
    if (produto.categoria === "Pizzas" && produto.sabor) {
      return (
        <div className="mt-2">
          <span className="text-sm font-medium">Sabor: </span>
          <Badge variant="outline" className={!produto.sabor.disponivel ? "opacity-50" : ""}>
            {produto.sabor.nome}
            {produto.sabor.adicional > 0 && ` (+R$${produto.sabor.adicional.toFixed(2)})`}
          </Badge>
        </div>
      )
    }
    return null
  }

  return (
    <>
      <Card className={`overflow-hidden ${!produto.disponivel ? "opacity-75" : ""}`}>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-32 h-32 bg-gray-200 flex-shrink-0">
              {produto.imagem ? (
                <img
                  src={produto.imagem || "/placeholder.svg"}
                  alt={produto.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Sem imagem</div>
              )}
            </div>
            <div className="p-4 flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{produto.nome}</h3>
                    {!produto.disponivel && (
                      <Badge variant="outline" className="text-red-500 border-red-200">
                        Indisponível
                      </Badge>
                    )}
                    {produto.categoria === "Bebidas" && produto.subcategoria && (
                      <Badge variant="secondary">{produto.subcategoria}</Badge>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2">{produto.descricao}</p>
                  <div className="mt-1">
                    <Badge>{produto.categoria}</Badge>
                  </div>
                  {exibirPreco()}
                  {exibirSabor()}
                </div>
                <div className="flex flex-row md:flex-col gap-2 mt-2 md:mt-0">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/produtos/editar/${produto.id}`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={produto.disponivel ? "text-green-600" : "text-red-600"}
                    onClick={() => onToggleDisponibilidade(!produto.disponivel)}
                  >
                    {produto.disponivel ? (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Ativo
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Inativo
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{produto.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
