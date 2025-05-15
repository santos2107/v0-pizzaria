"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface ProdutoCardProps {
  produto: any
  onClick: () => void
  visualizacao?: "grid" | "lista"
}

export function ProdutoCard({ produto, onClick, visualizacao = "grid" }: ProdutoCardProps) {
  // Função para formatar o preço
  const formatarPreco = (preco: number) => {
    return preco ? `R$ ${preco.toFixed(2)}` : "-"
  }

  // Função para exibir o preço correto com base na categoria
  const exibirPreco = () => {
    if (produto.categoria === "Pizzas") {
      return (
        <div className="mt-2">
          <span className="font-medium">A partir de </span>
          <span className="text-lg font-bold text-green-600">{formatarPreco(produto.precoP)}</span>
          {produto.emPromocao && (
            <Badge variant="destructive" className="ml-2">
              Promoção
            </Badge>
          )}
        </div>
      )
    }
    return (
      <div className="mt-2 flex items-center">
        {produto.precoAntigo && produto.precoAntigo > produto.preco && (
          <span className="text-sm text-gray-500 line-through mr-2">{formatarPreco(produto.precoAntigo)}</span>
        )}
        <span className="text-lg font-bold text-green-600">{formatarPreco(produto.preco)}</span>
        {produto.emPromocao && (
          <Badge variant="destructive" className="ml-2">
            Promoção
          </Badge>
        )}
      </div>
    )
  }

  // Função para exibir os sabores disponíveis (para pizzas)
  const exibirSabores = () => {
    if (produto.categoria === "Pizzas" && produto.sabores && produto.sabores.length > 0) {
      return (
        <div className="mt-2">
          <span className="text-sm font-medium">Sabores disponíveis: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {produto.sabores.slice(0, 3).map((sabor: any) => (
              <Badge key={sabor.id} variant="outline" className={!sabor.disponivel ? "opacity-50" : ""}>
                {sabor.nome}
              </Badge>
            ))}
            {produto.sabores.length > 3 && <Badge variant="outline">+{produto.sabores.length - 3} mais</Badge>}
          </div>
        </div>
      )
    }
    return null
  }

  // Função para exibir a avaliação do produto
  const exibirAvaliacao = () => {
    if (produto.avaliacao) {
      const estrelas = []
      for (let i = 1; i <= 5; i++) {
        estrelas.push(
          <Star
            key={i}
            className={`h-4 w-4 ${i <= produto.avaliacao ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />,
        )
      }

      return (
        <div className="flex items-center mt-1">
          <div className="flex">{estrelas}</div>
          <span className="text-xs text-gray-500 ml-1">({produto.numeroAvaliacoes || 0})</span>
        </div>
      )
    }
    return null
  }

  // Renderização para visualização em grade
  if (visualizacao === "grid") {
    return (
      <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
        <div className="h-40 bg-gray-200 relative">
          {produto.imagem ? (
            <img src={produto.imagem || "/placeholder.svg"} alt={produto.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">Sem imagem</div>
          )}
          <Badge className="absolute top-2 right-2">{produto.categoria}</Badge>
          {produto.emDestaque && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Destaque
            </Badge>
          )}
          {produto.tempoPreparacao && (
            <Badge variant="outline" className="absolute bottom-2 right-2 bg-white">
              {produto.tempoPreparacao} min
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg">{produto.nome}</h3>
          {exibirAvaliacao()}
          <p className="text-gray-500 text-sm line-clamp-2 mt-1">{produto.descricao}</p>
          {exibirPreco()}
          {exibirSabores()}
        </CardContent>
      </Card>
    )
  }

  // Renderização para visualização em lista
  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 relative flex-shrink-0">
          {produto.imagem ? (
            <img src={produto.imagem || "/placeholder.svg"} alt={produto.nome} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">Sem imagem</div>
          )}
          {produto.emDestaque && (
            <Badge variant="secondary" className="absolute top-2 left-2">
              Destaque
            </Badge>
          )}
        </div>
        <CardContent className="p-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{produto.nome}</h3>
              <Badge className="mt-1">{produto.categoria}</Badge>
              {exibirAvaliacao()}
            </div>
            {exibirPreco()}
          </div>
          <p className="text-gray-500 text-sm line-clamp-2 mt-2">{produto.descricao}</p>
          {exibirSabores()}
          {produto.tempoPreparacao && (
            <div className="mt-2 text-sm text-gray-500">Tempo de preparo: {produto.tempoPreparacao} min</div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}
