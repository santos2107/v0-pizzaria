import type { Reserva } from "../types"

// Dados de exemplo para reservas
export const reservasData: Reserva[] = [
  {
    id: 1,
    mesaId: 3,
    mesaNumero: "03",
    clienteNome: "João Silva",
    clienteTelefone: "(11) 98765-4321",
    data: "2023-05-15",
    hora: "19:30",
    duracao: 120,
    pessoas: 4,
    status: "confirmada",
    observacoes: "Aniversário de 30 anos",
    criadoEm: "2023-05-10T14:30:00Z",
    atualizadoEm: "2023-05-10T14:30:00Z",
  },
  {
    id: 2,
    mesaId: 5,
    mesaNumero: "05",
    clienteNome: "Maria Oliveira",
    clienteTelefone: "(11) 91234-5678",
    data: "2023-05-16",
    hora: "20:00",
    duracao: 90,
    pessoas: 2,
    status: "pendente",
    criadoEm: "2023-05-11T10:15:00Z",
    atualizadoEm: "2023-05-11T10:15:00Z",
  },
]

// Função para obter o próximo ID disponível
export function getNextReservaId(): number {
  return Math.max(0, ...reservasData.map((reserva) => reserva.id)) + 1
}

// Função para adicionar uma nova reserva
export function adicionarReserva(novaReserva: Omit<Reserva, "id" | "criadoEm" | "atualizadoEm">): Reserva {
  const id = getNextReservaId()
  const agora = new Date().toISOString()

  const reserva: Reserva = {
    ...novaReserva,
    id,
    criadoEm: agora,
    atualizadoEm: agora,
  }

  reservasData.push(reserva)
  return reserva
}

// Função para atualizar uma reserva existente
export function atualizarReserva(id: number, dadosAtualizados: Partial<Reserva>): Reserva | null {
  const index = reservasData.findIndex((reserva) => reserva.id === id)

  if (index === -1) return null

  reservasData[index] = {
    ...reservasData[index],
    ...dadosAtualizados,
    atualizadoEm: new Date().toISOString(),
  }

  return reservasData[index]
}

// Função para excluir uma reserva
export function excluirReserva(id: number): boolean {
  const index = reservasData.findIndex((reserva) => reserva.id === id)

  if (index === -1) return false

  reservasData.splice(index, 1)
  return true
}

// Função para verificar disponibilidade de mesa
export function verificarDisponibilidadeMesa(
  mesaId: number,
  data: string,
  hora: string,
  duracao: number,
  reservaIdExcluir?: number,
): boolean {
  // Converter hora de início para minutos desde meia-noite
  const [horaInicio, minutoInicio] = hora.split(":").map(Number)
  const inicioEmMinutos = horaInicio * 60 + minutoInicio
  const fimEmMinutos = inicioEmMinutos + duracao

  // Filtrar reservas para a mesma mesa e data
  const reservasNaMesmaData = reservasData.filter(
    (reserva) =>
      reserva.mesaId === mesaId &&
      reserva.data === data &&
      reserva.status !== "cancelada" &&
      (reservaIdExcluir === undefined || reserva.id !== reservaIdExcluir),
  )

  // Verificar se há sobreposição de horários
  for (const reserva of reservasNaMesmaData) {
    const [horaReserva, minutoReserva] = reserva.hora.split(":").map(Number)
    const reservaInicioEmMinutos = horaReserva * 60 + minutoReserva
    const reservaFimEmMinutos = reservaInicioEmMinutos + reserva.duracao

    // Verificar sobreposição
    if (
      (inicioEmMinutos >= reservaInicioEmMinutos && inicioEmMinutos < reservaFimEmMinutos) ||
      (fimEmMinutos > reservaInicioEmMinutos && fimEmMinutos <= reservaFimEmMinutos) ||
      (inicioEmMinutos <= reservaInicioEmMinutos && fimEmMinutos >= reservaFimEmMinutos)
    ) {
      return false // Há sobreposição, mesa não disponível
    }
  }

  return true // Não há sobreposição, mesa disponível
}

// Função para obter reservas por data
export function obterReservasPorData(data: string): Reserva[] {
  return reservasData.filter((reserva) => reserva.data === data)
}

// Função para obter reservas por mesa
export function obterReservasPorMesa(mesaId: number): Reserva[] {
  return reservasData.filter((reserva) => reserva.mesaId === mesaId)
}

// Função para obter reservas por cliente
export function obterReservasPorCliente(clienteId: number): Reserva[] {
  return reservasData.filter((reserva) => reserva.clienteId === clienteId)
}

// Função para obter reservas por status
export function obterReservasPorStatus(status: Reserva["status"]): Reserva[] {
  return reservasData.filter((reserva) => reserva.status === status)
}
