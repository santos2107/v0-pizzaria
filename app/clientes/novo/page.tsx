"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { ClienteFormData } from "../types"

export default function NovoClientePage() {
  const { toast } = useToast()
  const router = useRouter()
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
        title: "Cliente adicionado",
        description: `O cliente ${formData.nome} foi adicionado com sucesso.`,
      })

      router.push("/clientes")
    } catch (error) {
      toast({
        title: "Erro ao adicionar cliente",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao adicionar o cliente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-4">
          <Link href="/clientes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Novo Cliente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
          <CardDescription>Preencha os dados do novo cliente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nome">
                  Nome Completo <span className="text-red-500">*</span>
                </Label>
                <Input id="nome" placeholder="Ex: Maria Silva" required value={formData.nome} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">
                  Telefone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefone"
                  placeholder="Ex: (11) 98765-4321"
                  required
                  value={formData.telefone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="endereco">
                Endereço <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endereco"
                placeholder="Ex: Rua das Flores, 123"
                required
                value={formData.endereco}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="bairro">
                  Bairro <span className="text-red-500">*</span>
                </Label>
                <Input id="bairro" placeholder="Ex: Centro" required value={formData.bairro} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">
                  Cidade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cidade"
                  placeholder="Ex: São Paulo"
                  required
                  value={formData.cidade}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" placeholder="Ex: 00000-000" value={formData.cep} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                placeholder="Informações adicionais sobre o cliente"
                value={formData.observacoes}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button variant="outline" type="button" asChild>
                <Link href="/clientes">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Cliente"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
