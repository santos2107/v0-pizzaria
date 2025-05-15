"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { N8nModal } from "./n8n-modal"
import { ApiInterface } from "./api-interface"
import { useThemeConfig } from "@/contexts/theme-config-context"

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const { primaryColor, secondaryColor, updateThemeColors } = useThemeConfig()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("geral")
  const [showN8nModal, setShowN8nModal] = useState(false)

  // Estado para configurações gerais
  const [nomeRestaurante, setNomeRestaurante] = useState("Pizzaria do Kassio")
  const [enderecoRestaurante, setEnderecoRestaurante] = useState("Rua das Pizzas, 123")
  const [telefoneRestaurante, setTelefoneRestaurante] = useState("(11) 99999-9999")
  const [emailRestaurante, setEmailRestaurante] = useState("contato@pizzariadokassio.com.br")

  // Estado para configurações de cardápio
  const [mostrarPrecos, setMostrarPrecos] = useState(true)
  const [mostrarDescricoes, setMostrarDescricoes] = useState(true)
  const [mostrarImagens, setMostrarImagens] = useState(true)
  const [permitirPedidosOnline, setPermitirPedidosOnline] = useState(true)

  // Estado para configurações de API
  const [apiKey, setApiKey] = useState("api_key_pizzaria_kassio_2024")
  const [webhookUrl, setWebhookUrl] = useState("")

  // Dados da empresa atual
  const [empresaData, setEmpresaData] = useState({
    nome: "Pizzaria do Kassio",
    cnpj: "12.345.678/0001-90",
    telefone: "(11) 98765-4321",
    email: "contato@pizzariadokassio.com.br",
    endereco: "Rua das Pizzas, 123 - Centro",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567",
    horarioFuncionamento: "Segunda a Domingo, das 18h às 23h",
    logo: "/placeholder.svg?height=100&width=100",
    descricao: "A melhor pizzaria da região, com mais de 50 sabores de pizzas artesanais.",
  })

  // Dados de pagamento
  const [pagamentoData, setPagamentoData] = useState({
    aceitaDinheiro: true,
    aceitaCartao: true,
    aceitaPix: true,
    chavePix: "12345678901",
    taxaEntrega: "5.00",
    valorMinimoPedido: "30.00",
  })

  // Dados de entrega
  const [entregaData, setEntregaData] = useState({
    raioEntrega: "5",
    tempoEstimadoEntrega: "45",
    entregaPropria: true,
    entregaTerceirizada: false,
    empresaEntrega: "ifood", // Definir um valor inicial válido
  })

  // Dados de personalização
  const [personalizacaoData, setPersonalizacaoData] = useState({
    corPrimaria: primaryColor,
    corSecundaria: secondaryColor,
    fontePersonalizada: false,
    tipoFonte: "Inter",
    mostrarLogo: true,
    mostrarBanner: true,
  })

  // Sincronizar as cores iniciais com o contexto de tema
  // useEffect(() => {
  //   setPersonalizacaoData((prev) => ({
  //     ...prev,
  //     corPrimaria: primaryColor,
  //     corSecundaria: secondaryColor,
  //   }))
  // }, [primaryColor, secondaryColor])

  // Dados de usuários
  const [usuarios, setUsuarios] = useState([
    { id: 1, nome: "Kassio Silva", email: "kassio@pizzariadokassio.com.br", cargo: "Administrador", ativo: true },
    { id: 2, nome: "Maria Oliveira", email: "maria@pizzariadokassio.com.br", cargo: "Atendente", ativo: true },
    { id: 3, nome: "João Santos", email: "joao@pizzariadokassio.com.br", cargo: "Entregador", ativo: false },
  ])

  // Dados do plano
  const [planoData, setPlanoData] = useState({
    nome: "Profissional",
    valor: "99.90",
    periodo: "mensal",
    dataRenovacao: "15/06/2023",
    status: "Ativo",
    recursos: [
      "Até 5 usuários",
      "Cardápio digital ilimitado",
      "Gestão de pedidos",
      "Gestão de clientes",
      "Relatórios básicos",
    ],
  })

  // Dados da API
  const baseUrl = "https://pizzaria-do-kassio.vercel.app"
  // const [apiKey, setApiKey] = useState("pk_test_51NcEZqDJ8Hd4CgTymsYpNlXVrKI2LTkFrP")
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    toast({
      title: "Chave da API copiada",
      description: "A chave da API foi copiada para a área de transferência.",
    })
  }

  const regenerateApiKey = () => {
    setShowResetConfirm(true)
  }

  const confirmRegenerateApiKey = () => {
    // Simulando a geração de uma nova chave
    const newApiKey =
      "pk_test_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setApiKey(newApiKey)

    toast({
      title: "Chave da API regenerada",
      description: "Uma nova chave de API foi gerada com sucesso.",
      variant: "default",
    })

    setShowResetConfirm(false)
  }

  const [apiData, setApiData] = useState({
    apiEnabled: true,
    apiKey: "pk_test_51NcEZqDJ8Hd4CgTymsYpNlXVrKI2LTkFrP",
    webhookUrl: "https://n8n.seudominio.com/webhook/pizzaria-kassio",
    allowExternalAccess: true,
    rateLimit: "100",
    endpoints: [
      { name: "Produtos", method: "GET", path: "/api/produtos", enabled: true },
      { name: "Pedidos", method: "GET", path: "/api/pedidos", enabled: true },
      { name: "Clientes", method: "GET", path: "/api/clientes", enabled: true },
      { name: "Novo Pedido", method: "POST", path: "/api/pedidos", enabled: true },
      { name: "Atualizar Status", method: "POST", path: "/api/pedidos/status", enabled: true },
    ],
    integrations: {
      n8n: {
        enabled: true,
        webhookUrl: "https://n8n.seudominio.com/webhook/pizzaria-kassio",
        lastSync: "2023-05-15T14:30:00Z",
        status: "connected",
      },
      ai: {
        enabled: false,
        provider: "openai",
        model: "gpt-4",
        apiKey: "",
      },
      zapier: {
        enabled: false,
        webhookUrl: "",
        status: "disconnected",
      },
    },
  })

  const [gatewayPagamento, setGatewayPagamento] = useState("mercadopago")

  // Adicionar estados para os campos de API Key e Secret Key
  const [apiKeyData, setApiKeyData] = useState({
    apiKey: "••••••••••••••••••••••",
    secretKey: "••••••••••••••••••••••",
  })

  // Função para salvar configurações
  const salvarConfiguracoes = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram salvas com sucesso.",
    })
  }

  // Função para gerar nova API key
  const gerarNovaApiKey = () => {
    const novaApiKey = `api_key_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`
    setApiKey(novaApiKey)
    toast({
      title: "Nova API key gerada",
      description: "Sua nova API key foi gerada com sucesso.",
    })
  }

  // Função para salvar as configurações
  const salvarConfiguracoesAntiga = async () => {
    setSaving(true)

    // Atualizar as cores do tema quando salvar
    updateThemeColors(personalizacaoData.corPrimaria, personalizacaoData.corSecundaria)

    // Simulando uma chamada de API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Configurações salvas",
      description: "As alterações foram salvas com sucesso.",
      variant: "default",
    })

    setSaving(false)
  }

  // Função para regenerar a chave da API
  // const regenerateApiKey = () => {
  //   // Simulando a geração de uma nova chave
  //   const newApiKey =
  //     "pk_test_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  //   setApiData({ ...apiData, apiKey: newApiKey })

  //   toast({
  //     title: "Chave da API regenerada",
  //     description: "Uma nova chave de API foi gerada com sucesso.",
  //     variant: "default",
  //   })
  // }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="cardapio">Cardápio</TabsTrigger>
          <TabsTrigger value="integracao">API e Integração</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Restaurante</CardTitle>
              <CardDescription>Configure as informações básicas do seu restaurante.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Restaurante</Label>
                <Input id="nome" value={nomeRestaurante} onChange={(e) => setNomeRestaurante(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={enderecoRestaurante}
                  onChange={(e) => setEnderecoRestaurante(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={telefoneRestaurante}
                  onChange={(e) => setTelefoneRestaurante(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailRestaurante}
                  onChange={(e) => setEmailRestaurante(e.target.value)}
                />
              </div>
              <Button onClick={salvarConfiguracoes}>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Cardápio */}
        <TabsContent value="cardapio">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Cardápio</CardTitle>
              <CardDescription>Personalize como seu cardápio é exibido para os clientes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="mostrar-precos">Mostrar preços no cardápio</Label>
                <Switch id="mostrar-precos" checked={mostrarPrecos} onCheckedChange={setMostrarPrecos} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mostrar-descricoes">Mostrar descrições dos produtos</Label>
                <Switch id="mostrar-descricoes" checked={mostrarDescricoes} onCheckedChange={setMostrarDescricoes} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mostrar-imagens">Mostrar imagens dos produtos</Label>
                <Switch id="mostrar-imagens" checked={mostrarImagens} onCheckedChange={setMostrarImagens} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="permitir-pedidos">Permitir pedidos online</Label>
                <Switch
                  id="permitir-pedidos"
                  checked={permitirPedidosOnline}
                  onCheckedChange={setPermitirPedidosOnline}
                />
              </div>
              <Button onClick={salvarConfiguracoes}>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Integração */}
        <TabsContent value="integracao">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>API e Integrações</CardTitle>
              <CardDescription>
                Gerencie sua API key, configure webhooks e integre com serviços externos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input id="api-key" value={apiKey} readOnly className="font-mono" />
                  <Button variant="outline" onClick={gerarNovaApiKey}>
                    Gerar Nova
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Esta chave é necessária para autenticar solicitações à API.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://seu-servico.com/webhook"
                />
                <p className="text-sm text-muted-foreground">
                  Receba notificações de eventos como novos pedidos, atualizações de status, etc.
                </p>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Integrações</h3>

                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <h4 className="text-md font-medium">n8n</h4>
                    <p className="text-sm text-muted-foreground">
                      Integre com n8n para automação de fluxos de trabalho.
                    </p>
                    <Button onClick={() => setShowN8nModal(true)}>Configurar n8n</Button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-md font-medium">Inteligência Artificial</h4>
                    <p className="text-sm text-muted-foreground">
                      Configure a integração com IA para processamento de pedidos por voz e texto.
                    </p>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ativar-ia">Ativar processamento por IA</Label>
                      <Switch id="ativar-ia" />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={salvarConfiguracoes}>Salvar Configurações</Button>
            </CardContent>
          </Card>

          {/* Interface da API */}
          <ApiInterface apiKey={apiKey} />
        </TabsContent>
      </Tabs>

      {/* Modal de configuração do n8n */}
      {showN8nModal && <N8nModal apiKey={apiKey} onClose={() => setShowN8nModal(false)} />}
    </div>
  )
}
