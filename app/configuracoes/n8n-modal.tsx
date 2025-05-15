"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Copy, ExternalLink, Info } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface N8nModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiKey: string
  webhookUrl: string
}

export function N8nModal({ open, onOpenChange, apiKey, webhookUrl }: N8nModalProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("configuracao")
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState("https://seu-n8n.exemplo.com/webhook/123456")
  const [testResult, setTestResult] = useState<null | "success" | "error">(null)

  const baseUrl = "https://api.pizzariadokassio.com.br"

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast({
      description: message,
      duration: 2000,
    })
  }

  const testConnection = () => {
    setTestResult(null)

    // Mostrar toast de teste em andamento
    toast({
      title: "Testando conexão",
      description: "Aguarde enquanto testamos a conexão com o n8n...",
      duration: 1500,
    })

    // Simulação de teste de conexão
    setTimeout(() => {
      // Verificar se a URL do webhook foi preenchida
      if (!n8nWebhookUrl || !n8nWebhookUrl.startsWith("http")) {
        setTestResult("error")
        toast({
          title: "Erro na conexão",
          description: "Por favor, insira uma URL válida para o webhook do n8n.",
          variant: "destructive",
          duration: 3000,
        })
        return
      }

      setTestResult("success")
      toast({
        title: "Conexão bem-sucedida",
        description: "A conexão com o n8n foi estabelecida com sucesso.",
        duration: 3000,
      })
    }, 1500)
  }

  const exampleGetProductsNode = `
{
  "parameters": {
    "url": "${baseUrl}/api/produtos",
    "authentication": "headerAuth",
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "Bearer ${apiKey}"
        }
      ]
    }
  }
}
`

  const exampleCreateOrderNode = `
{
  "parameters": {
    "url": "${baseUrl}/api/pedidos",
    "method": "POST",
    "authentication": "headerAuth",
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "Bearer ${apiKey}"
        },
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ]
    },
    "bodyParameters": {
      "parameters": [
        {
          "name": "cliente_id",
          "value": "={{ $json.cliente_id }}"
        },
        {
          "name": "itens",
          "value": "={{ $json.itens }}"
        },
        {
          "name": "endereco_entrega",
          "value": "={{ $json.endereco }}"
        },
        {
          "name": "forma_pagamento",
          "value": "={{ $json.pagamento }}"
        }
      ]
    }
  }
}
`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Integração com n8n</DialogTitle>
          <DialogDescription>
            Configure a integração entre a Pizzaria do Kassio e o n8n para automação de fluxos de trabalho.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="configuracao">Configuração</TabsTrigger>
            <TabsTrigger value="exemplos">Exemplos</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
          </TabsList>

          <TabsContent value="configuracao" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">Chave da API</Label>
              <div className="flex gap-2">
                <Input id="apiKey" value={apiKey} readOnly className="flex-1 font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(apiKey, "Chave da API copiada para a área de transferência")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Use esta chave para autenticar suas solicitações no n8n.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUrl">URL Base da API</Label>
              <div className="flex gap-2">
                <Input id="baseUrl" value={baseUrl} readOnly className="flex-1 font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(baseUrl, "URL base copiada para a área de transferência")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="n8nUrl">URL do seu n8n</Label>
              <Input
                id="n8nUrl"
                value={n8nWebhookUrl}
                onChange={(e) => setN8nWebhookUrl(e.target.value)}
                placeholder="https://seu-n8n.exemplo.com"
              />
              <p className="text-xs text-muted-foreground">Insira a URL do seu servidor n8n para testar a conexão.</p>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={testConnection}>
                Testar Conexão
              </Button>
              {testResult === "success" && (
                <div className="flex items-center text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="text-sm">Conexão estabelecida</span>
                </div>
              )}
              {testResult === "error" && (
                <div className="flex items-center text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Falha na conexão</span>
                </div>
              )}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Para configurar o n8n, você precisará criar nós HTTP Request para cada endpoint que deseja acessar.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="exemplos" className="space-y-4">
            <div className="space-y-2">
              <Label>Exemplo: Obter Produtos</Label>
              <Textarea readOnly value={exampleGetProductsNode} className="font-mono text-sm h-32" />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      exampleGetProductsNode,
                      "Configuração do nó HTTP Request copiada para a área de transferência",
                    )
                  }
                >
                  <Copy className="h-3 w-3 mr-1" /> Copiar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Exemplo: Criar Pedido</Label>
              <Textarea readOnly value={exampleCreateOrderNode} className="font-mono text-sm h-48" />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      exampleCreateOrderNode,
                      "Configuração do nó HTTP Request copiada para a área de transferência",
                    )
                  }
                >
                  <Copy className="h-3 w-3 mr-1" /> Copiar
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" className="w-full" asChild>
                <a
                  href="https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.http/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Documentação do nó HTTP Request
                </a>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">URL do Webhook</Label>
              <div className="flex gap-2">
                <Input id="webhookUrl" value={webhookUrl} readOnly className="flex-1 font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrl, "URL do webhook copiada para a área de transferência")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Configure esta URL no n8n para receber notificações de eventos do sistema.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Eventos Disponíveis</Label>
              <div className="border rounded-md p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Novo Pedido</p>
                    <p className="text-xs text-muted-foreground">Disparado quando um novo pedido é criado</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Testar
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Atualização de Status</p>
                    <p className="text-xs text-muted-foreground">Disparado quando o status de um pedido é alterado</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Testar
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Novo Cliente</p>
                    <p className="text-xs text-muted-foreground">Disparado quando um novo cliente é cadastrado</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Testar
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No n8n, crie um nó Webhook para receber estes eventos e acione seus fluxos de trabalho automaticamente.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={() => onOpenChange(false)}>Salvar Configurações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
