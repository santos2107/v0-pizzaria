export interface Cliente {
  id: number
  nome: string
  telefone: string
  endereco: string
  bairro: string
  cidade: string
  cep: string
  observacoes: string
  pedidos: number
  ultimoPedido: string
  valorTotal: number
}

export interface ClienteFormData {
  nome: string
  telefone: string
  endereco: string
  bairro: string
  cidade: string
  cep: string
  observacoes: string
}
