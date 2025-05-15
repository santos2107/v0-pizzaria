"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { Cliente, ClienteFormData } from "../../types"

// Simulação de API para buscar cliente por ID
async function fetchClienteById(id: string): Promise<Cliente | null> {
  // Em um ambiente real, isso seria uma chamada de API
  const clientes = [
    {
      id: 1,
      nome: "Maria Silva",
      telefone: "(11) 98765-4321",
      email: "maria.silva@email.com",
      endereco: "Rua das Palmeiras, 234",
      bairro: "Jardim Europa",
      cidade: "São Paulo",
      cep: "01234-567",
      observacoes: "Cliente VIP",
      pedidos: 8,
      ultimoPedido: "2 dias atrás",
      valorTotal: 432.5,
    },
    {
      id: 2,
      nome: "João Pereira",
      telefone: "(11) 97654-3210",
      email: "joao.pereira@email.com",
      endereco: "Av. Brasil, 567",
      bairro: "Centro",
      cidade: "São Paulo",
      cep: "04321-765",
      observacoes: "",
      pedidos: 5,
      ultimoPedido: "1 semana atrás",
      valorTotal: 287.3,
    },
  ]

  const cliente = clientes.find((c) => c.id === Number.parseInt(id))
  return cliente || null
}

export default function EditarClientePage({ params }: { params: { id: string } }) {
  const { id } = params
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ClienteFormData>({
    nome: "",
    telefone: "",
    email: "",
    endereco: "",
    bairro: "",
    cidade: "",
    cep: "",
    observacoes: "",
  })

  useEffect(() => {
    async function loadCliente() {
      try {
        const cliente = await fetchClienteById(id)
        if (cliente) {
          setFormData({
            nome: cliente.nome,
            telefone: cliente.telefone,
            email: cliente.email,
            endereco: cliente.endereco,
            bairro: cliente.bairro,
            cidade: cliente.cidade,
            cep: cliente.cep,
            observacoes: cliente.observacoes,
          })
        } else {
          toast({
            title: "Cliente não encontrado",
            description: "Não foi possível encontrar o cliente solicitado.",
            variant: "destructive",
          })
          router.push("/clientes")
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar cliente",
          description: "Ocorreu um erro ao carregar os dados do cliente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCliente()
  }, [id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulando envio para API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Validação básica
      if (!formData.nome.trim() || !formData.telefone.trim() || !formData.endereco.trim()) {
        throw new Error("Preencha todos os campos obrigatórios")
      }

      toast({
        title: "Cliente atualizado",
        description: `Os dados de "${formData.nome}" foram atualizados com sucesso.`,
      })

      router.push("/clientes")
    } catch (error) {
      toast({
        title: "Erro ao atualizar cliente",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar o cliente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link href="/clientes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Editar Cliente</h1>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-4">
          <Link href="/clientes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Editar Cliente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
          <CardDescription>Atualize os dados do cliente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input id="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: Maria Silva" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">
                  Telefone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="Ex: (11) 98765-4321"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="endereco">
                Endereço <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={handleChange}
                placeholder="Ex: Rua das Flores, 123"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="bairro">
                  Bairro <span className="text-red-500">*</span>
                </Label>
                <Input id="bairro" value={formData.bairro} onChange={handleChange} placeholder="Ex: Centro" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">
                  Cidade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  placeholder="Ex: São Paulo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" value={formData.cep} onChange={handleChange} placeholder="Ex: 00000-000" />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Informações adicionais sobre o cliente"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button variant="outline" type="button" asChild>
                <Link href="/clientes">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
