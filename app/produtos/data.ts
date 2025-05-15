export interface Produto {
  id: number
  nome: string
  descricao: string
  preco?: number
  precoP?: number
  precoM?: number
  precoG?: number
  precoGG?: number
  categoria: string
  subcategoria?: string
  disponivel: boolean
  imagem: string
  sabores?: Sabor[]
  bordas?: OpcaoBorda[]
  ingredientes?: Ingrediente[]
  promocoes?: Promocao[]
  perguntas?: Pergunta[]
  tempoPreparo: number
  mostrarNoCardapio?: boolean
  emDestaque?: boolean
  exibirNaVitrine?: boolean
  sabor?: any
}

interface Sabor {
  id: string
  nome: string
  descricao: string
  disponivel: boolean
  adicional: number
  imagem: string
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

// Dados de exemplo para produtos
export const produtosData: Produto[] = [
  // Sabores de pizza como produtos individuais
  {
    id: 101,
    nome: "Pizza Margherita",
    descricao: "Molho de tomate, mussarela, manjericão fresco e azeite",
    categoria: "Pizzas",
    imagem: "/pizza-margherita.png",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: true,
    exibirNaVitrine: true,
    precoP: 35.9,
    precoM: 45.9,
    precoG: 55.9,
    precoGG: 65.9,
    tempoPreparo: 30,
  },
  {
    id: 102,
    nome: "Pizza Calabresa",
    descricao: "Molho de tomate, mussarela, calabresa fatiada e cebola",
    categoria: "Pizzas",
    imagem: "/placeholder.svg?key=91jwh",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: false,
    exibirNaVitrine: true,
    precoP: 35.9,
    precoM: 45.9,
    precoG: 55.9,
    precoGG: 65.9,
    tempoPreparo: 30,
  },
  {
    id: 103,
    nome: "Pizza Quatro Queijos",
    descricao: "Molho de tomate, mussarela, provolone, gorgonzola e parmesão",
    categoria: "Pizzas",
    imagem: "/placeholder.svg?key=ooli6",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: true,
    exibirNaVitrine: true,
    precoP: 40.9,
    precoM: 50.9,
    precoG: 60.9,
    precoGG: 70.9,
    tempoPreparo: 30,
  },
  {
    id: 104,
    nome: "Pizza Portuguesa",
    descricao: "Molho de tomate, mussarela, presunto, ovos, cebola, azeitonas e ervilhas",
    categoria: "Pizzas",
    imagem: "/placeholder.svg?key=5q7bj",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: false,
    exibirNaVitrine: true,
    precoP: 38.9,
    precoM: 48.9,
    precoG: 58.9,
    precoGG: 68.9,
    tempoPreparo: 30,
  },
  {
    id: 105,
    nome: "Pizza Frango com Catupiry",
    descricao: "Molho de tomate, mussarela, frango desfiado e catupiry",
    categoria: "Pizzas",
    imagem: "/placeholder.svg?key=eskg5",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: true,
    exibirNaVitrine: true,
    precoP: 39.9,
    precoM: 49.9,
    precoG: 59.9,
    precoGG: 69.9,
    tempoPreparo: 30,
  },
  {
    id: 106,
    nome: "Pizza Pepperoni",
    descricao: "Molho de tomate, mussarela e pepperoni",
    categoria: "Pizzas",
    imagem: "/placeholder.svg?key=ewxeu",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: false,
    exibirNaVitrine: true,
    precoP: 39.9,
    precoM: 49.9,
    precoG: 59.9,
    precoGG: 69.9,
    tempoPreparo: 30,
  },
  {
    id: 3,
    nome: "Hambúrguer Clássico",
    descricao: "Pão, hambúrguer 180g, queijo, alface, tomate e molho especial",
    preco: 32.9,
    categoria: "Hambúrgueres",
    imagem: "/placeholder.svg?key=kz9xx",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: true,
    exibirNaVitrine: true,
    tempoPreparo: 20,
  },
  {
    id: 4,
    nome: "Coca-Cola 2L",
    descricao: "Refrigerante Coca-Cola 2 litros",
    preco: 12.9,
    categoria: "Bebidas",
    subcategoria: "Refrigerantes",
    imagem: "/placeholder.svg?key=0kzty",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: false,
    exibirNaVitrine: false,
    tempoPreparo: 5,
  },
  {
    id: 5,
    nome: "Batata Frita Grande",
    descricao: "Porção de batata frita crocante com sal",
    preco: 18.9,
    categoria: "Acompanhamentos",
    imagem: "/placeholder.svg?key=vvpud",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: false,
    exibirNaVitrine: true,
  },
  {
    id: 6,
    nome: "Salada Caesar",
    descricao: "Alface americana, croutons, parmesão e molho caesar",
    preco: 25.9,
    categoria: "Saladas",
    imagem: "/placeholder.svg?key=x193q",
    disponivel: true,
    mostrarNoCardapio: false,
    emDestaque: false,
    exibirNaVitrine: false,
  },
  {
    id: 7,
    nome: "Água Mineral 500ml",
    descricao: "Água mineral sem gás 500ml",
    preco: 5.9,
    categoria: "Bebidas",
    subcategoria: "Águas",
    imagem: "/placeholder.svg?key=c4d75",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: false,
    exibirNaVitrine: false,
    tempoPreparo: 5,
  },
  {
    id: 8,
    nome: "Suco de Laranja Natural",
    descricao: "Suco de laranja natural 500ml",
    preco: 9.9,
    categoria: "Bebidas",
    subcategoria: "Sucos",
    imagem: "/placeholder.svg?height=100&width=100&query=suco laranja",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: false,
    exibirNaVitrine: false,
    tempoPreparo: 5,
  },
  {
    id: 9,
    nome: "Cerveja Heineken Long Neck",
    descricao: "Cerveja Heineken 330ml",
    preco: 12.9,
    categoria: "Bebidas",
    subcategoria: "Cervejas",
    imagem: "/placeholder.svg?height=100&width=100&query=cerveja heineken",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: false,
    exibirNaVitrine: false,
    tempoPreparo: 5,
  },
  {
    id: 10,
    nome: "Vinho Tinto Seco 750ml",
    descricao: "Vinho tinto seco 750ml",
    categoria: "Bebidas",
    subcategoria: "Vinhos",
    imagem: "/placeholder.svg?height=100&width=100&query=vinho tinto",
    disponivel: true,
    mostrarNoCardapio: false,
    emDestaque: false,
    exibirNaVitrine: false,
    tempoPreparo: 5,
  },
  {
    id: 11,
    nome: "Caipirinha",
    descricao: "Caipirinha de limão com cachaça artesanal",
    categoria: "Bebidas",
    subcategoria: "Drinks",
    imagem: "/placeholder.svg?height=100&width=100&query=caipirinha",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: false,
    exibirNaVitrine: false,
    tempoPreparo: 10,
  },
  {
    id: 12,
    nome: "Café Expresso",
    descricao: "Café expresso 50ml",
    categoria: "Bebidas",
    subcategoria: "Cafés",
    imagem: "/placeholder.svg?height=100&width=100&query=cafe expresso",
    disponivel: true,
    mostrarNoCardapio: true,
    emDestaque: false,
    exibirNaVitrine: false,
    tempoPreparo: 5,
  },
]

// Certificar a exportação dos métodos para manipular os produtos
export const adicionarProduto = (produto: Produto): Produto => {
  // Gerar um ID único para o novo produto
  const novoId = Math.max(...produtosData.map((p) => p.id)) + 1
  const novoProduto = { ...produto, id: novoId }
  produtosData.push(novoProduto)
  return novoProduto
}

export const atualizarProduto = (id: number, dadosAtualizados: Partial<Produto>): Produto | null => {
  const index = produtosData.findIndex((p) => p.id === id)
  if (index !== -1) {
    produtosData[index] = { ...produtosData[index], ...dadosAtualizados }
    return produtosData[index]
  }
  return null
}

export const excluirProduto = (id: number): Produto | null => {
  const index = produtosData.findIndex((p) => p.id === id)
  if (index !== -1) {
    const produtoExcluido = produtosData[index]
    produtosData.splice(index, 1)
    return produtoExcluido
  }
  return null
}
