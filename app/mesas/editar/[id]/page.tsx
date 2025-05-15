"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Simulação de dados
const mesas = [
  {
    id: "1",
    numero: 1,
    capacidade: 4,
    localizacao: "interno",
    observacoes: "Próxima à janela",
  },
  {
    id: "2",
    numero: 2,
    capacidade: 2,
    localizacao: "interno",
    observacoes: "",
  },
]

export default function EditarMesaPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { toast } = useToast()
  const router = useRouter()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [mesas, setMesas] = useState([])
  const [mesaComPedido, setMesaComPedido] = useState<Record<number, boolean>>({})

  const [mesa, setMesa] = useState({
    numero: 0,
    capacidade: 0,
    localizacao: "",
    observacoes: "",
  })

  useEffect(() => {
    async function carregarMesa() {
      try {
        setCarregando(true)
        const response = await fetch(`/api/mesas/${id}`)

        if (!response.ok) {
          throw new Error(`Erro ao buscar mesa: ${response.statusText}`)
        }

        const mesaData = await response.json()

        if (mesaData) {
          setMesa({
            numero: mesaData.numero || 0,
            capacidade: mesaData.capacidade || 0,
            localizacao: mesaData.localizacao || "",
            observacoes: mesaData.observacoes || "",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar mesa:", error)
        setErro("Não foi possível carregar os dados da mesa")
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da mesa",
          variant: "destructive",
        })
      } finally {
        setCarregando(false)
      }
    }

    carregarMesa()
  }, [id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setCarregando(true)

      const response = await fetch(`/api/mesas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mesa),
      })

      if (!response.ok) {
        throw new Error(`Erro ao atualizar mesa: ${response.statusText}`)
      }

      toast({
        title: "Mesa atualizada",
        description: `A Mesa ${mesa.numero} foi atualizada com sucesso.`,
      })

      router.push("/mesas")
    } catch (error) {
      console.error("Erro ao atualizar mesa:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a mesa",
        variant: "destructive",
      })
    } finally {
      setCarregando(false)
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
        <h1 className="text-3xl font-bold">Editar Mesa</h1>
      </div>

      {carregando ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : erro ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">{erro}</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Informações da Mesa</CardTitle>
            <CardDescription>Atualize os dados da mesa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número da Mesa</Label>
                  <Input
                    id="numero"
                    type="number"
                    value={mesa.numero}
                    onChange={(e) => setMesa({ ...mesa, numero: Number.parseInt(e.target.value) })}
                    placeholder="Ex: 10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacidade">Capacidade (pessoas)</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    value={mesa.capacidade}
                    onChange={(e) => setMesa({ ...mesa, capacidade: Number.parseInt(e.target.value) })}
                    placeholder="Ex: 4"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <Label htmlFor="localizacao">Localização</Label>
                <Select value={mesa.localizacao} onValueChange={(value) => setMesa({ ...mesa, localizacao: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a localização" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interno">Ambiente Interno</SelectItem>
                    <SelectItem value="externo">Ambiente Externo</SelectItem>
                    <SelectItem value="varanda">Varanda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 mt-6">
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={mesa.observacoes}
                  onChange={(e) => setMesa({ ...mesa, observacoes: e.target.value })}
                  placeholder="Informações adicionais sobre a mesa"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <Button variant="outline" type="button" asChild>
                  <Link href="/mesas">Cancelar</Link>
                </Button>
                <Button type="submit" disabled={carregando}>
                  {carregando ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
