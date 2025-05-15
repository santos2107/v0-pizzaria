"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import type { Produto } from "../produtos/data"

// Modifique a interface MeiaPizzaModalProps para incluir informações sobre o tamanho selecionado
interface MeiaPizzaModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (sabor: Produto) => void
  selectedPizza?: Produto
  tamanhoSelecionado?: string
}

// Atualize a função para receber o tamanho selecionado
export function MeiaPizzaModal({ isOpen, onClose, onSelect, selectedPizza, tamanhoSelecionado }: MeiaPizzaModalProps) {
  const [pizzas, setPizzas] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPizzas = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/produtos")
        const data = await response.json()

        // Filtra apenas os produtos da categoria "Pizza"
        const pizzaProducts = data.filter((produto: Produto) => produto.categoria === "Pizza")

        setPizzas(pizzaProducts)
      } catch (error) {
        console.error("Erro ao buscar pizzas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      fetchPizzas()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecione a segunda metade da pizza</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 gap-4">
              {pizzas.map((pizza) => (
                <Card
                  key={pizza.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPizza?.id === pizza.id ? "ring-2 ring-red-500" : ""
                  }`}
                  onClick={() => onSelect(pizza)}
                >
                  {/* Modifique o CardContent para mostrar o preço baseado no tamanho selecionado */}
                  <CardContent className="p-3 flex items-center gap-3">
                    {pizza.imagem && (
                      <div className="relative h-16 w-16 rounded-md overflow-hidden">
                        <Image
                          src={pizza.imagem || "/placeholder.svg"}
                          alt={pizza.nome}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{pizza.nome}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{pizza.descricao}</p>
                      {tamanhoSelecionado && pizza.precos && pizza.precos[tamanhoSelecionado] && (
                        <p className="text-sm font-medium mt-1">
                          R$ {pizza.precos[tamanhoSelecionado].toFixed(2)}
                          {pizza.adicional > 0 && ` (+R$ ${pizza.adicional.toFixed(2)})`}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
