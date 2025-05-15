"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, QrCode } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function CardapioPage() {
  // Dados de exemplo
  const categorias = ["Pizzas", "Hambúrgueres", "Bebidas", "Acompanhamentos", "Saladas"]

  const produtos = {
    Pizzas: [
      {
        id: 1,
        nome: "Pizza Margherita",
        descricao: "Molho de tomate, mussarela, manjericão fresco e azeite",
        preco: 45.9,
        imagem: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 2,
        nome: "Pizza Pepperoni",
        descricao: "Molho de tomate, mussarela e pepperoni",
        preco: 49.9,
        imagem: "/placeholder.svg?height=100&width=100",
      },
    ],
    Hambúrgueres: [
      {
        id: 3,
        nome: "Hambúrguer Clássico",
        descricao: "Pão, hambúrguer 180g, queijo, alface, tomate e molho especial",
        preco: 32.9,
        imagem: "/placeholder.svg?height=100&width=100",
      },
    ],
    Bebidas: [
      {
        id: 4,
        nome: "Coca-Cola 2L",
        descricao: "Refrigerante Coca-Cola 2 litros",
        preco: 12.9,
        imagem: "/placeholder.svg?height=100&width=100",
      },
      {
        id: 5,
        nome: "Água Mineral 500ml",
        descricao: "Água mineral sem gás 500ml",
        preco: 5.9,
        imagem: "/placeholder.svg?height=100&width=100",
      },
    ],
    Acompanhamentos: [
      {
        id: 6,
        nome: "Batata Frita Grande",
        descricao: "Porção de batata frita crocante com sal",
        preco: 18.9,
        imagem: "/placeholder.svg?height=100&width=100",
      },
    ],
    Saladas: [
      {
        id: 7,
        nome: "Salada Caesar",
        descricao: "Alface americana, croutons, parmesão e molho caesar",
        preco: 25.9,
        imagem: "/placeholder.svg?height=100&width=100",
      },
    ],
  }

  // URL atualizada do cardápio digital
  const cardapioDigitalUrl = "https://pizzaria-kassio.vercel.app/cardapio-digital"

  return (
    <main className="min-h-screen">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Cardápio Digital</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/cardapio/personalizar">
                <Edit className="h-4 w-4 mr-2" />
                Personalizar
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 space-y-4">
                <div className="bg-white border rounded-lg p-4 text-center">
                  <div className="mx-auto w-32 h-32 relative mb-4">
                    <QrCode className="w-full h-full text-gray-800" />
                  </div>
                  <h3 className="font-medium">QR Code do Cardápio</h3>
                  <p className="text-sm text-gray-500 mt-1">Escaneie para acessar o cardápio digital</p>
                  <div className="flex flex-col gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      Baixar QR Code
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/cardapio-digital" target="_blank">
                        Acessar Cardápio Digital
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Link do Cardápio</h3>
                  <div className="flex">
                    <Input value={cardapioDigitalUrl} readOnly className="rounded-r-none" />
                    <Button
                      variant="outline"
                      className="rounded-l-none border-l-0"
                      onClick={() => {
                        navigator.clipboard.writeText(cardapioDigitalUrl)
                        // Aqui você poderia adicionar uma notificação de "Copiado!"
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Compartilhe este link com seus clientes</p>
                </div>
              </div>

              <div className="md:w-2/3">
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Visualização do Cardápio</h3>
                  </div>

                  <Tabs defaultValue={categorias[0]}>
                    <TabsList className="w-full flex overflow-x-auto">
                      {categorias.map((categoria) => (
                        <TabsTrigger key={categoria} value={categoria} className="flex-1">
                          {categoria}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {categorias.map((categoria) => (
                      <TabsContent key={categoria} value={categoria} className="mt-4">
                        <div className="space-y-4">
                          {produtos[categoria].map((produto) => (
                            <div key={produto.id} className="flex border-b pb-4">
                              <div className="relative h-16 w-16 rounded-md overflow-hidden mr-4 flex-shrink-0">
                                <Image
                                  src={produto.imagem || "/placeholder.svg"}
                                  alt={produto.nome}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-medium">{produto.nome}</h4>
                                  <span className="font-bold text-green-600">R$ {produto.preco.toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2">{produto.descricao}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
