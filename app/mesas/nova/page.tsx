"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NovaMesaPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [formData, setFormData] = useState({
    numero: "",
    capacidade: "4",
    localizacao: "interno",
    observacoes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      localizacao: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Enviar dados para a API
      const response = await fetch("/api/mesas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero: formData.numero,
          capacidade: Number.parseInt(formData.capacidade),
          localizacao: formData.localizacao,
          observacoes: formData.observacoes,
          status: "Disponível",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao adicionar mesa")
      }

      toast({
        title: "Mesa adicionada",
        description: "A nova mesa foi adicionada com sucesso.",
      })
      router.push("/mesas")
    } catch (error) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar a mesa",
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
          <Link href="/mesas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Nova Mesa</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Mesa</CardTitle>
          <CardDescription>Preencha os dados da nova mesa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numero">Número da Mesa</Label>
                <Input
                  id="numero"
                  type="text"
                  placeholder="Ex: 10"
                  required
                  value={formData.numero}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidade">Capacidade (pessoas)</Label>
                <Input
                  id="capacidade"
                  type="number"
                  placeholder="Ex: 4"
                  required
                  min="1"
                  value={formData.capacidade}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="localizacao">Localização</Label>
              <Select value={formData.localizacao} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a localização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interno">Ambiente Interno</SelectItem>
                  <SelectItem value="externo">Ambiente Externo</SelectItem>
                  <SelectItem value="varanda">Varanda</SelectItem>
                  <SelectItem value="terraco">Terraço</SelectItem>
                  <SelectItem value="vip">Área VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                placeholder="Informações adicionais sobre a mesa"
                value={formData.observacoes}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button variant="outline" type="button" asChild>
                <Link href="/mesas">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Salvando...</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Salvar Mesa"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
