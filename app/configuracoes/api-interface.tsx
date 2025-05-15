"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Rocket } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface ApiInterfaceProps {
  apiKey: string
}

export function ApiInterface({ apiKey }: ApiInterfaceProps) {
  const { toast } = useToast()
  const [selectedEntity, setSelectedEntity] = useState("produtos")
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")
  const [selectedOperation, setSelectedOperation] = useState("read")

  // Usar o URL real da aplicação
  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "https://api.pizzariadokassio.com.br"

  // Melhorar a função copyToClipboard para incluir feedback visual
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast({
      description: message,
      duration: 2000,
    })

    // Adicionar feedback visual temporário
    const button = document.activeElement as HTMLButtonElement
    if (button) {
      const originalText = button.innerHTML
      button.innerHTML =
        '<span class="flex items-center"><svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"></path></svg>Copiado!</span>'
      setTimeout(() => {
        button.innerHTML = originalText
      }, 2000)
    }
  }

  const getCodeExample = () => {
    const examples = {
      javascript: {
        produtos: {
          read: `// JavaScript Example: Listando Produtos
async function fetchProdutos() {
  const response = await fetch("${baseUrl}/api/produtos", {
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(data);
}`,
          update: `// JavaScript Example: Atualizando um Produto
async function updateProduto(produtoId, updateData) {
  const response = await fetch("${baseUrl}/api/produtos/" + produtoId, {
    method: "PUT",
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  
  const data = await response.json();
  console.log(data);
}`,
          create: `// JavaScript Example: Criando um Produto
async function createProduto(produtoData) {
  const response = await fetch("${baseUrl}/api/produtos", {
    method: "POST",
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(produtoData)
  });
  
  const data = await response.json();
  console.log(data);
}`,
          delete: `// JavaScript Example: Excluindo um Produto
async function deleteProduto(produtoId) {
  const response = await fetch("${baseUrl}/api/produtos/" + produtoId, {
    method: "DELETE",
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(data);
}`,
        },
        pedidos: {
          read: `// JavaScript Example: Listando Pedidos
async function fetchPedidos() {
  const response = await fetch("${baseUrl}/api/pedidos", {
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(data);
}`,
          update: `// JavaScript Example: Atualizando um Pedido
async function updatePedido(pedidoId, updateData) {
  const response = await fetch("${baseUrl}/api/pedidos/" + pedidoId, {
    method: "PUT",
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  
  const data = await response.json();
  console.log(data);
}`,
          create: `// JavaScript Example: Criando um Pedido
async function createPedido(pedidoData) {
  const response = await fetch("${baseUrl}/api/pedidos", {
    method: "POST",
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pedidoData)
  });
  
  const data = await response.json();
  console.log(data);
}`,
          delete: `// JavaScript Example: Excluindo um Pedido
async function deletePedido(pedidoId) {
  const response = await fetch("${baseUrl}/api/pedidos/" + pedidoId, {
    method: "DELETE",
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(data);
}`,
        },
        clientes: {
          read: `// JavaScript Example: Listando Clientes
async function fetchClientes() {
  const response = await fetch("${baseUrl}/api/clientes", {
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(data);
}`,
          update: `// JavaScript Example: Atualizando um Cliente
async function updateCliente(clienteId, updateData) {
  const response = await fetch("${baseUrl}/api/clientes/" + clienteId, {
    method: "PUT",
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  
  const data = await response.json();
  console.log(data);
}`,
          create: `// JavaScript Example: Criando um Cliente
async function createCliente(clienteData) {
  const response = await fetch("${baseUrl}/api/clientes", {
    method: "POST",
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(clienteData)
  });
  
  const data = await response.json();
  console.log(data);
}`,
          delete: `// JavaScript Example: Excluindo um Cliente
async function deleteCliente(clienteId) {
  const response = await fetch("${baseUrl}/api/clientes/" + clienteId, {
    method: "DELETE",
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(data);
}`,
        },
        mesas: {
          read: `// JavaScript Example: Listando Mesas
async function fetchMesas() {
  const response = await fetch("${baseUrl}/api/mesas", {
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(data);
}`,
          update: `// JavaScript Example: Atualizando uma Mesa
async function updateMesa(mesaId, updateData) {
  const response = await fetch("${baseUrl}/api/mesas/" + mesaId, {
    method: "PUT",
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
  
  const data = await response.json();
  console.log(data);
}`,
          create: `// JavaScript Example: Criando uma Mesa
async function createMesa(mesaData) {
  const response = await fetch("${baseUrl}/api/mesas", {
    method: "POST",
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(mesaData)
  });
  
  const data = await response.json();
  console.log(data);
}`,
          delete: `// JavaScript Example: Excluindo uma Mesa
async function deleteMesa(mesaId) {
  const response = await fetch("${baseUrl}/api/mesas/" + mesaId, {
    method: "DELETE",
    headers: {
      'api_key': '${apiKey}',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(data);
}`,
        },
      },
      python: {
        produtos: {
          read: `# Python Example: Listando Produtos
import requests

def fetch_produtos():
    url = "${baseUrl}/api/produtos"
    headers = {
        'api_key': '${apiKey}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(url, headers=headers)
    data = response.json()
    print(data)`,
          update: `# Python Example: Atualizando um Produto
import requests
import json

def update_produto(produto_id, update_data):
    url = f"${baseUrl}/api/produtos/{produto_id}"
    headers = {
        'api_key': '${apiKey}',
        'Content-Type': 'application/json'
    }
    
    response = requests.put(url, headers=headers, data=json.dumps(update_data))
    data = response.json()
    print(data)`,
          create: `# Python Example: Criando um Produto
import requests
import json

def create_produto(produto_data):
    url = "${baseUrl}/api/produtos"
    headers = {
        'api_key': '${apiKey}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(url, headers=headers, data=json.dumps(produto_data))
    data = response.json()
    print(data)`,
          delete: `# Python Example: Excluindo um Produto
import requests

def delete_produto(produto_id):
    url = f"${baseUrl}/api/produtos/{produto_id}"
    headers = {
        'api_key': '${apiKey}',
        'Content-Type': 'application/json'
    }
    
    response = requests.delete(url, headers=headers)
    data = response.json()
    print(data)`,
        },
        // Outros exemplos em Python para pedidos, clientes e mesas...
      },
    }

    return examples[selectedLanguage][selectedEntity][selectedOperation]
  }

  const getEntitySchema = () => {
    const schemas = {
      produtos: `{
  "nome": "Pizza Margherita",
  "descricao": "Pizza tradicional com molho de tomate, queijo mussarela e manjericão",
  "preco": 42.90,
  "categoria": "pizza",
  "disponivel": true,
  "imagem": "https://exemplo.com/margherita.jpg"
}`,
      pedidos: `{
  "cliente_id": "client_123",
  "itens": [
    {
      "produto_id": "prod_456",
      "quantidade": 1,
      "observacoes": "Sem cebola"
    }
  ],
  "endereco_entrega": {
    "rua": "Av. Principal",
    "numero": "123",
    "complemento": "Apto 45",
    "bairro": "Centro",
    "cidade": "São Paulo"
  },
  "forma_pagamento": "cartao"
}`,
      clientes: `{
  "nome": "João Silva",
  "telefone": "11999998888",
  "email": "joao@email.com",
  "enderecos": [
    {
      "rua": "Av. Principal",
      "numero": "123",
      "complemento": "Apto 45",
      "bairro": "Centro",
      "cidade": "São Paulo"
    }
  ]
}`,
      mesas: `{
  "numero": 5,
  "capacidade": 4,
  "status": "disponivel",
  "localizacao": "área interna"
}`,
    }

    return schemas[selectedEntity]
  }

  const getFilterableFields = () => {
    const fields = {
      produtos: "nome, categoria, disponivel, preco",
      pedidos: "status, cliente_id, data_criacao",
      clientes: "nome, email, telefone",
      mesas: "numero, status, capacidade",
    }

    return fields[selectedEntity]
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          {/* Melhorar o título do componente para refletir a unificação */}
          <div className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-red-500" />
            <h2 className="text-2xl font-bold">API e Integração</h2>
          </div>

          {/* Adicionar uma descrição mais completa */}
          <p className="text-sm text-muted-foreground mb-4">
            Use nossa API para integrar a Pizzaria do Kassio com seus sistemas e aplicativos. Selecione uma entidade
            para gerar exemplos de código para leitura, atualização e criação:
          </p>

          <div className="w-64">
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="produtos">Produto</SelectItem>
                <SelectItem value="pedidos">Pedido</SelectItem>
                <SelectItem value="clientes">Cliente</SelectItem>
                <SelectItem value="mesas">Mesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Campos filtráveis:</p>
            <p className="text-muted-foreground">{getFilterableFields()}</p>
          </div>

          <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage} className="w-full">
            <TabsList className="w-full max-w-[200px]">
              <TabsTrigger value="javascript" className="flex-1">
                JavaScript
              </TabsTrigger>
              <TabsTrigger value="python" className="flex-1">
                Python
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <div className="flex space-x-2 mb-2">
                <Button
                  variant={selectedOperation === "read" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedOperation("read")}
                >
                  Listar
                </Button>
                <Button
                  variant={selectedOperation === "create" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedOperation("create")}
                >
                  Criar
                </Button>
                <Button
                  variant={selectedOperation === "update" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedOperation("update")}
                >
                  Atualizar
                </Button>
                <Button
                  variant={selectedOperation === "delete" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedOperation("delete")}
                >
                  Excluir
                </Button>
              </div>

              <div className="relative">
                <pre
                  className={cn(
                    "p-4 rounded-md bg-muted font-mono text-sm overflow-x-auto",
                    selectedLanguage === "javascript" ? "language-javascript" : "language-python",
                  )}
                >
                  {getCodeExample()}
                </pre>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(getCodeExample(), "Código copiado para a área de transferência")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Tabs>

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Exemplo de Estrutura de Dados</h3>
            <div className="relative">
              <pre className="p-4 rounded-md bg-muted font-mono text-sm overflow-x-auto">{getEntitySchema()}</pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(getEntitySchema(), "Schema copiado para a área de transferência")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
