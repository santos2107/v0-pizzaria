export interface Cliente {
  id: number
  nome: string
  telefone: string
  email?: string
}

export interface Reserva {
  id: number
  mesaId: number
  mesaNumero: string
  clienteId?: number
  clienteNome: string
  clienteTelefone: string
  data: string // formato ISO: YYYY-MM-DD
  hora: string // formato: HH:MM
  duracao: number // duração em minutos
  pessoas: number
  status: "confirmada" | "pendente" | "cancelada" | "concluida"
  observacoes?: string
  criadoEm: string // ISO date string
  atualizadoEm: string // ISO date string
}

export interface ReservaFormData {
  mesaId: number
  mesaNumero: string
  clienteId?: number
  clienteNome: string
  clienteTelefone: string
  clienteEmail?: string
  data: string
  hora: string
  duracao: number
  pessoas: number
  observacoes?: string
}
