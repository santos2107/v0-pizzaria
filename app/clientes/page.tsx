"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, UserPlus } from "lucide-react"
import Link from "next/link"
import { ClienteCard } from "./cliente-card"
import { useEffect, useState } from "react"
import type { Cliente } from "./types"

// Simulação de API para buscar clientes
async function fetchClientes(): Promise<Cliente[]> {
  // Em um ambiente real, isso seria uma chamada de API
  return [
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
    {
      id: 3,
      nome: "Ana Costa",
      telefone: "(11) 96543-2109",
      email: "ana.costa@email.com",
      endereco: "Rua do Comércio, 789",
      bairro: "Vila Mariana",
      cidade: "São Paulo",
      cep: "04567-890",
      observacoes: "Prefere entregas aos finais de semana",
      pedidos: 12,
      ultimoPedido: "Hoje",
      valorTotal: 645.8,
    },
    {
      id: 4,
      nome: "Carlos Santos",
      telefone: "(11) 95432-1098",
      email: "carlos.santos@email.com",
      endereco: "Av. Central, 1010",
      bairro: "Moema",
      cidade: "São Paulo",
      cep: "04567-123",
      observacoes: "",
      pedidos: 3,
      ultimoPedido: "3 dias atrás",
      valorTotal: 156.2,
    },
    {
      id: 5,
      nome: "Fernanda Lima",
      telefone: "(11) 94321-0987",
      email: "fernanda.lima@email.com",
      endereco: "Rua das Flores, 123",
      bairro: "Pinheiros",
      cidade: "São Paulo",
      cep: "05678-901",
      observacoes: "Alérgica a camarão",
      pedidos: 7,
      ultimoPedido: "Ontem",
      valorTotal: 378.9,
    },
  ]
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadClientes() {
      try {
        const data = await fetchClientes()
        setClientes(data)
        setFilteredClientes(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao carregar clientes:", error)
        setIsLoading(false)
      }
    }

    loadClientes()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClientes(clientes)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = clientes.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(term) ||
          cliente.telefone.includes(term) ||
          cliente.email.toLowerCase().includes(term),
      )
      setFilteredClientes(filtered)
    }
  }, [searchTerm, clientes])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button asChild>
          <Link href="/clientes/novo">
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar clientes por nome, telefone ou email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-16 bg-gray-200 animate-pulse rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredClientes.length > 0 ? (
        <div className="space-y-4">
          {filteredClientes.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              onDelete={() => {
                // Simulação de exclusão
                setClientes(clientes.filter((c) => c.id !== cliente.id))
                setFilteredClientes(filteredClientes.filter((c) => c.id !== cliente.id))
              }}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Nenhum cliente encontrado.</p>
            {searchTerm && (
              <Button variant="link" onClick={() => setSearchTerm("")} className="mt-2">
                Limpar busca
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
