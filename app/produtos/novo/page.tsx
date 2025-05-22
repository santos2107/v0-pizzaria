"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Upload, Loader2, Trash2, Plus, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

// Tipos para as novas funcionalidades
interface Sabor {
  id: string
  nome: string
  descricao: string
  disponivel: boolean
  adicional: number
}

interface OpcaoBorda {
  id: string
  nome: string
  preco: number
  disponivel: boolean
}

interface Ingrediente {
  id: string
  nome: string
  preco: number
  disponivel: boolean
}

interface Promocao {
  id: string
  nome: string
  descricao: string
  diasSemana: string[]
  desconto: number
  ativa: boolean
}

interface Pergunta {
  id: string
  texto: string
  obrigatoria: boolean
  tipo: "radio" | "checkbox"
  opcoes: { id: string; texto: string; preco: number }[]
}

// Dados para os dias da semana
const diasSemana = [
  { id: "0", nome: "Domingo" },
  { id: "1", nome: "Segunda" },
  { id: "2", nome: "Terça" },
  { id: "3", nome: "Quarta" },
  { id: "4", nome: "Quinta" },
  { id: "5", nome: "Sexta" },
  { id: "6", nome: "Sábado" },
]

// Subcategorias de bebidas
const subcategoriasBebidas = [
  "Refrigerantes",
  "Águas",
  "Sucos",
  "Cervejas",
  "Vinhos",
  "Drinks",
  "Cafés",
  "Chás",
  "Energéticos",
  "Outros",
]

export default function NovoProdutoPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  // Estado para o produto
  const [produto, setProduto] = useState({
    nome: "",
    descricao: "",
    preco: 0,
    precoP: 0,
    precoM: 0,
    precoG: 0,
    precoGG: 0,
    categoria: "",
    subcategoria: "",
    disponivel: true,
    imagem: "/placeholder.svg?height=100&width=100", // Imagem padrão
    sabores: [] as Sabor[],
    bordas: [] as OpcaoBorda[],
    ingredientes: [] as Ingrediente[],
    promocoes: [] as Promocao[],
    perguntas: [] as Pergunta[],
    tempoPreparo: 0,
  })

  // Estados para novos itens
  const [novoSabor, setNovoSabor] = useState({ nome: "", descricao: "", adicional: 0 })
  const [novaBorda, setNovaBorda] = useState({ nome: "", preco: 0 })
  const [novoIngrediente, setNovoIngrediente] = useState({ nome: "", preco: 0 })
  const [novaPromocao, setNovaPromocao] = useState({ nome: "", descricao: "", diasSemana: [] as string[], desconto: 0 })
  const [novaPergunta, setNovaPergunta] = useState({
    texto: "",
    obrigatoria: false,
    tipo: "radio" as "radio" | "checkbox",
    opcoes: [] as { id: string; texto: string; preco: number }[],
  })
  const [novaOpcao, setNovaOpcao] = useState({ texto: "", preco: 0 })

  const categorias = ["Pizzas", "Hambúrgueres", "Bebidas", "Acompanhamentos", "Saladas", "Sobremesas"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validar campos obrigatórios
      if (!produto.nome || !produto.descricao || !produto.categoria) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      // Validar preços
      if (produto.categoria === "Pizzas") {
        if (!produto.precoP || !produto.precoM || !produto.precoG || !produto.precoGG) {
          toast({
            title: "Preços obrigatórios",
            description: "Por favor, preencha todos os preços para os tamanhos de pizza.",
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
      } else {
        if (!produto.preco) {
          toast({
            title: "Preço obrigatório",
            description: "Por favor, preencha o preço do produto.",
            variant: "destructive",
          })
          setIsSaving(false)
          return
        }
      }

      // Enviar dados para a API
      const response = await fetch("/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(produto),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.json()

      if (!responseData.success) {
        throw new Error(responseData.error || "Erro desconhecido ao criar produto")
      }

      toast({
        title: "Produto criado",
        description: `O produto "${produto.nome}" foi criado com sucesso.`,
      })

      // Redirecionar para a página de produtos
      router.push("/produtos")
    } catch (error: any) {
      console.error("Erro ao criar produto:", error)
      toast({
        title: "Erro ao criar",
        description: error.message || "Ocorreu um erro ao criar o produto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Funções para adicionar novos itens
  const adicionarSabor = () => {
    if (!novoSabor.nome) return
    const novoId = `s${Date.now()}`
    setProduto({
      ...produto,
      sabores: [...produto.sabores, { id: novoId, ...novoSabor, disponivel: true }],
    })
    setNovoSabor({ nome: "", descricao: "", adicional: 0 })
  }

  const adicionarBorda = () => {
    if (!novaBorda.nome) return
    const novoId = `b${Date.now()}`
    setProduto({
      ...produto,
      bordas: [...produto.bordas, { id: novoId, ...novaBorda, disponivel: true }],
    })
    setNovaBorda({ nome: "", preco: 0 })
  }

  const adicionarIngrediente = () => {
    if (!novoIngrediente.nome) return
    const novoId = `i${Date.now()}`
    setProduto({
      ...produto,
      ingredientes: [...produto.ingredientes, { id: novoId, ...novoIngrediente, disponivel: true }],
    })
    setNovoIngrediente({ nome: "", preco: 0 })
  }

  const adicionarPromocao = () => {
    if (!novaPromocao.nome || novaPromocao.diasSemana.length === 0) return
    const novoId = `p${Date.now()}`
    setProduto({
      ...produto,
      promocoes: [...produto.promocoes, { id: novoId, ...novaPromocao, ativa: true }],
    })
    setNovaPromocao({ nome: "", descricao: "", diasSemana: [], desconto: 0 })
  }

  const adicionarOpcaoAPergunta = () => {
    if (!novaOpcao.texto) return
    const novoId = `o${Date.now()}`
    setNovaPergunta({
      ...novaPergunta,
      opcoes: [...novaPergunta.opcoes, { id: novoId, ...novaOpcao }],
    })
    setNovaOpcao({ texto: "", preco: 0 })
  }

  const adicionarPergunta = () => {
    if (!novaPergunta.texto || novaPergunta.opcoes.length === 0) return
    const novoId = `q${Date.now()}`
    setProduto({
      ...produto,
      perguntas: [...produto.perguntas, { id: novoId, ...novaPergunta }],
    })
    setNovaPergunta({ texto: "", obrigatoria: false, tipo: "radio", opcoes: [] })
  }

  // Funções para remover itens
  const removerSabor = (id: string) => {
    setProduto({
      ...produto,
      sabores: produto.sabores.filter((sabor) => sabor.id !== id),
    })
  }

  const removerBorda = (id: string) => {
    setProduto({
      ...produto,
      bordas: produto.bordas.filter((borda) => borda.id !== id),
    })
  }

  const removerIngrediente = (id: string) => {
    setProduto({
      ...produto,
      ingredientes: produto.ingredientes.filter((ingrediente) => ingrediente.id !== id),
    })
  }

  const removerPromocao = (id: string) => {
    setProduto({
      ...produto,
      promocoes: produto.promocoes.filter((promocao) => promocao.id !== id),
    })
  }

  const removerPergunta = (id: string) => {
    setProduto({
      ...produto,
      perguntas: produto.perguntas.filter((pergunta) => pergunta.id !== id),
    })
  }

  const removerOpcaoDaPergunta = (opcaoId: string) => {
    setNovaPergunta({
      ...novaPergunta,
      opcoes: novaPergunta.opcoes.filter((opcao) => opcao.id !== opcaoId),
    })
  }

  const toggleDiaSemana = (dia: string) => {
    if (novaPromocao.diasSemana.includes(dia)) {
      setNovaPromocao({
        ...novaPromocao,
        diasSemana: novaPromocao.diasSemana.filter((d) => d !== dia),
      })
    } else {
      setNovaPromocao({
        ...novaPromocao,
        diasSemana: [...novaPromocao.diasSemana, dia],
      })
    }
  }

  // Adicionar a constante para verificar se é bebida
  const isPizza = produto.categoria === "Pizzas"
  const isBebida = produto.categoria === "Bebidas"

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-4">
          <Link href="/produtos">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Novo Produto</h1>
      </div>

      <Tabs defaultValue="informacoes" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="adicionais">Adicionais</TabsTrigger>
          <TabsTrigger value="promocoes">Promoções</TabsTrigger>
          <TabsTrigger value="perguntas">Perguntas</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          {/* Tab de Informações Básicas */}
          <TabsContent value="informacoes">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Produto</CardTitle>
                <CardDescription>Preencha os detalhes básicos do produto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Produto</Label>
                    <Input
                      id="nome"
                      value={produto.nome}
                      onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
                      placeholder="Ex: Pizza Margherita"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select
                      value={produto.categoria}
                      onValueChange={(value) => setProduto({ ...produto, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isBebida && (
                  <div className="space-y-2">
                    <Label htmlFor="subcategoria">Subcategoria de Bebida</Label>
                    <Select
                      value={produto.subcategoria}
                      onValueChange={(value) => setProduto({ ...produto, subcategoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma subcategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategoriasBebidas.map((subcategoria) => (
                          <SelectItem key={subcategoria} value={subcategoria}>
                            {subcategoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={produto.descricao}
                    onChange={(e) => setProduto({ ...produto, descricao: e.target.value })}
                    placeholder="Descreva os ingredientes e características do produto"
                    rows={3}
                    required
                  />
                </div>

                {isPizza ? (
                  <div>
                    <Label className="text-base font-medium mb-4 block">Preços por Tamanho</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="precoP">Tamanho P (R$)</Label>
                        <Input
                          id="precoP"
                          type="number"
                          step="0.01"
                          value={produto.precoP || ""}
                          onChange={(e) => setProduto({ ...produto, precoP: Number.parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="precoM">Tamanho M (R$)</Label>
                        <Input
                          id="precoM"
                          type="number"
                          step="0.01"
                          value={produto.precoM || ""}
                          onChange={(e) => setProduto({ ...produto, precoM: Number.parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="precoG">Tamanho G (R$)</Label>
                        <Input
                          id="precoG"
                          type="number"
                          step="0.01"
                          value={produto.precoG || ""}
                          onChange={(e) => setProduto({ ...produto, precoG: Number.parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="precoGG">Tamanho GG (R$)</Label>
                        <Input
                          id="precoGG"
                          type="number"
                          step="0.01"
                          value={produto.precoGG || ""}
                          onChange={(e) => setProduto({ ...produto, precoGG: Number.parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="preco">Preço (R$)</Label>
                      <Input
                        id="preco"
                        type="number"
                        step="0.01"
                        value={produto.preco || ""}
                        onChange={(e) => setProduto({ ...produto, preco: Number.parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="disponibilidade">Disponibilidade</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="disponibilidade"
                        checked={produto.disponivel}
                        onCheckedChange={(checked) => setProduto({ ...produto, disponivel: checked })}
                      />
                      <Label htmlFor="disponibilidade" className="cursor-pointer">
                        {produto.disponivel ? "Disponível" : "Indisponível"}
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Imagem do Produto</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 text-center mb-2">
                      Arraste uma imagem ou clique para fazer upload
                    </p>
                    <p className="text-xs text-gray-400 text-center">PNG, JPG ou WEBP (máx. 2MB)</p>
                    <Button type="button" variant="outline" size="sm" className="mt-4">
                      Selecionar Arquivo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Adicionais */}
          <TabsContent value="adicionais">
            <Card>
              <CardHeader>
                <CardTitle>Ingredientes Adicionais</CardTitle>
                <CardDescription>Gerencie os ingredientes extras disponíveis para este produto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="novoIngredienteNome">Nome do Ingrediente</Label>
                      <Input
                        id="novoIngredienteNome"
                        value={novoIngrediente.nome}
                        onChange={(e) => setNovoIngrediente({ ...novoIngrediente, nome: e.target.value })}
                        placeholder="Ex: Queijo Extra"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="novoIngredientePreco">Preço (R$)</Label>
                      <div className="flex">
                        <Input
                          id="novoIngredientePreco"
                          type="number"
                          step="0.01"
                          value={novoIngrediente.preco || ""}
                          onChange={(e) =>
                            setNovoIngrediente({ ...novoIngrediente, preco: Number.parseFloat(e.target.value) || 0 })
                          }
                          placeholder="0.00"
                        />
                        <Button type="button" onClick={adicionarIngrediente} className="ml-2">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Ingredientes Cadastrados</h3>
                    {produto.ingredientes && produto.ingredientes.length > 0 ? (
                      <div className="space-y-3">
                        {produto.ingredientes.map((ingrediente) => (
                          <div key={ingrediente.id} className="flex items-start justify-between border-b pb-2">
                            <div>
                              <h4 className="font-medium">{ingrediente.nome}</h4>
                              <Badge variant="outline">+R$ {ingrediente.preco.toFixed(2)}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={ingrediente.disponivel}
                                onCheckedChange={(checked) => {
                                  setProduto({
                                    ...produto,
                                    ingredientes: produto.ingredientes?.map((i) =>
                                      i.id === ingrediente.id ? { ...i, disponivel: checked } : i,
                                    ),
                                  })
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removerIngrediente(ingrediente.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhum ingrediente cadastrado.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Promoções */}
          <TabsContent value="promocoes">
            <Card>
              <CardHeader>
                <CardTitle>Promoções</CardTitle>
                <CardDescription>Gerencie as promoções aplicáveis a este produto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="novaPromocaoNome">Nome da Promoção</Label>
                      <Input
                        id="novaPromocaoNome"
                        value={novaPromocao.nome}
                        onChange={(e) => setNovaPromocao({ ...novaPromocao, nome: e.target.value })}
                        placeholder="Ex: Happy Hour"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="novaPromocaoDesconto">Desconto (%)</Label>
                      <Input
                        id="novaPromocaoDesconto"
                        type="number"
                        value={novaPromocao.desconto || ""}
                        onChange={(e) =>
                          setNovaPromocao({ ...novaPromocao, desconto: Number.parseFloat(e.target.value) || 0 })
                        }
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="novaPromocaoDescricao">Descrição</Label>
                    <Input
                      id="novaPromocaoDescricao"
                      value={novaPromocao.descricao}
                      onChange={(e) => setNovaPromocao({ ...novaPromocao, descricao: e.target.value })}
                      placeholder="Descrição da promoção"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dias da Semana</Label>
                    <div className="flex flex-wrap gap-2">
                      {diasSemana.map((dia) => (
                        <Button
                          key={dia.id}
                          type="button"
                          variant={novaPromocao.diasSemana.includes(dia.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleDiaSemana(dia.id)}
                        >
                          {dia.nome}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button type="button" onClick={adicionarPromocao}>
                    Adicionar Promoção
                  </Button>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Promoções Cadastradas</h3>
                    {produto.promocoes && produto.promocoes.length > 0 ? (
                      <div className="space-y-3">
                        {produto.promocoes.map((promocao) => (
                          <div key={promocao.id} className="flex items-start justify-between border-b pb-2">
                            <div>
                              <h4 className="font-medium">{promocao.nome}</h4>
                              <p className="text-sm text-gray-500">{promocao.descricao}</p>
                              <div className="flex gap-1 mt-1">
                                {promocao.diasSemana.map((diaId) => {
                                  const dia = diasSemana.find((d) => d.id === diaId)
                                  return dia ? (
                                    <Badge key={diaId} variant="outline">
                                      {dia.nome.substring(0, 3)}
                                    </Badge>
                                  ) : null
                                })}
                              </div>
                              <Badge variant="secondary" className="mt-1">
                                {promocao.desconto}% de desconto
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={promocao.ativa}
                                onCheckedChange={(checked) => {
                                  setProduto({
                                    ...produto,
                                    promocoes: produto.promocoes?.map((p) =>
                                      p.id === promocao.id ? { ...p, ativa: checked } : p,
                                    ),
                                  })
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removerPromocao(promocao.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma promoção cadastrada.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Perguntas */}
          <TabsContent value="perguntas">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas ao Cliente</CardTitle>
                <CardDescription>Configure perguntas que serão feitas ao cliente no momento do pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Nova Pergunta</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="novaPerguntaTexto">Pergunta</Label>
                          <Input
                            id="novaPerguntaTexto"
                            value={novaPergunta.texto}
                            onChange={(e) => setNovaPergunta({ ...novaPergunta, texto: e.target.value })}
                            placeholder="Ex: Como deseja a sua pizza?"
                          />
                        </div>
                        <div className="flex items-end gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="obrigatoria"
                              checked={novaPergunta.obrigatoria}
                              onCheckedChange={(checked) =>
                                setNovaPergunta({ ...novaPergunta, obrigatoria: Boolean(checked) })
                              }
                            />
                            <Label htmlFor="obrigatoria">Obrigatória</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label>Tipo:</Label>
                            <Select
                              value={novaPergunta.tipo}
                              onValueChange={(value) =>
                                setNovaPergunta({ ...novaPergunta, tipo: value as "radio" | "checkbox" })
                              }
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="radio">Escolha única</SelectItem>
                                <SelectItem value="checkbox">Múltipla escolha</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Opções</Label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Ex: Sem cebola"
                              value={novaOpcao.texto}
                              onChange={(e) => setNovaOpcao({ ...novaOpcao, texto: e.target.value })}
                            />
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Preço adicional"
                              className="w-32"
                              value={novaOpcao.preco || ""}
                              onChange={(e) =>
                                setNovaOpcao({ ...novaOpcao, preco: Number.parseFloat(e.target.value) || 0 })
                              }
                            />
                            <Button type="button" onClick={adicionarOpcaoAPergunta} className="shrink-0">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {novaPergunta.opcoes.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {novaPergunta.opcoes.map((opcao) => (
                                <div
                                  key={opcao.id}
                                  className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                                >
                                  <span>
                                    {opcao.texto} {opcao.preco > 0 && `(+R$ ${opcao.preco.toFixed(2)})`}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removerOpcaoDaPergunta(opcao.id)}
                                    className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={adicionarPergunta}
                        disabled={!novaPergunta.texto || novaPergunta.opcoes.length === 0}
                      >
                        Adicionar Pergunta
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Perguntas Cadastradas</h3>
                    {produto.perguntas && produto.perguntas.length > 0 ? (
                      <div className="space-y-4">
                        {produto.perguntas.map((pergunta) => (
                          <div key={pergunta.id} className="border-b pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium flex items-center">
                                  {pergunta.texto}
                                  {pergunta.obrigatoria && <span className="text-red-500 ml-1">*</span>}
                                </h4>
                                <Badge variant="outline" className="mt-1">
                                  {pergunta.tipo === "radio" ? "Escolha única" : "Múltipla escolha"}
                                </Badge>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removerPergunta(pergunta.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="mt-2 pl-2 border-l">
                              <p className="text-sm text-gray-500 mb-1">Opções:</p>
                              <div className="space-y-1">
                                {pergunta.opcoes.map((opcao) => (
                                  <div key={opcao.id} className="text-sm">
                                    • {opcao.texto} {opcao.preco > 0 && `(+R$ ${opcao.preco.toFixed(2)})`}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma pergunta cadastrada.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Configurações */}
          <TabsContent value="configuracoes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Adicionais</CardTitle>
                <CardDescription>Configure opções adicionais para este produto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tempoPreparo">Tempo de Preparo (minutos)</Label>
                    <Input
                      id="tempoPreparo"
                      type="number"
                      value={produto.tempoPreparo || ""}
                      onChange={(e) => setProduto({ ...produto, tempoPreparo: Number.parseInt(e.target.value) || 0 })}
                      placeholder="Ex: 30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estoque">Gerenciar Estoque</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch id="estoque" />
                      <Label htmlFor="estoque" className="cursor-pointer">
                        Controlar estoque para este produto
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Visibilidade do Produto</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="mostrarNoCardapio" defaultChecked />
                      <Label htmlFor="mostrarNoCardapio">Mostrar no cardápio</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="destaque" />
                      <Label htmlFor="destaque">Destacar como produto especial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="mostrarNaVitrine" />
                      <Label htmlFor="mostrarNaVitrine">Exibir na vitrine da loja</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end space-x-4 pt-6">
            <Button variant="outline" type="button" asChild disabled={isSaving}>
              <Link href="/produtos">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Produto"
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
