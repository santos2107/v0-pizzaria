"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, Phone } from "lucide-react"

interface AuthModalProps {
  onClose: () => void
  onSave: (clienteInfo: any) => void
}

export function AuthModal({ onClose, onSave }: AuthModalProps) {
  const { toast } = useToast()
  const [clienteInfo, setClienteInfo] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    complemento: "",
    referencia: "",
  })
  const [activeTab, setActiveTab] = useState("dados")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!clienteInfo.nome || !clienteInfo.telefone || !clienteInfo.endereco) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    onSave(clienteInfo)
    toast({
      title: "Dados salvos",
      description: "Seus dados foram salvos com sucesso!",
    })
  }

  const handleNextTab = () => {
    if (activeTab === "dados") {
      if (!clienteInfo.nome || !clienteInfo.telefone) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha seu nome e telefone.",
          variant: "destructive",
        })
        return
      }
      setActiveTab("endereco")
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Seus Dados</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="dados" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Nome Completo *
                </Label>
                <Input
                  id="nome"
                  value={clienteInfo.nome}
                  onChange={(e) => setClienteInfo({ ...clienteInfo, nome: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Telefone *
                </Label>
                <Input
                  id="telefone"
                  value={clienteInfo.telefone}
                  onChange={(e) => setClienteInfo({ ...clienteInfo, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="button" onClick={handleNextTab}>
                  Próximo
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="endereco" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endereco" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Endereço de Entrega *
                </Label>
                <Textarea
                  id="endereco"
                  value={clienteInfo.endereco}
                  onChange={(e) => setClienteInfo({ ...clienteInfo, endereco: e.target.value })}
                  placeholder="Rua, número, bairro, cidade"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={clienteInfo.complemento}
                  onChange={(e) => setClienteInfo({ ...clienteInfo, complemento: e.target.value })}
                  placeholder="Apartamento, bloco, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referencia">Ponto de Referência</Label>
                <Input
                  id="referencia"
                  value={clienteInfo.referencia}
                  onChange={(e) => setClienteInfo({ ...clienteInfo, referencia: e.target.value })}
                  placeholder="Próximo a..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setActiveTab("dados")}>
                  Voltar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
