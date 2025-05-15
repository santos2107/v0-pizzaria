// Dados de exemplo para mesas
export interface Mesa {
  id: number
  numero: string
  capacidade: number
  status: string
  localizacao?: string
  observacoes?: string
  mesasCombinadas?: string[]
  mesaCombinada?: string
}

export const mesasData: Mesa[] = [
  {
    id: 1,
    numero: "01",
    capacidade: 4,
    status: "Disponível",
    localizacao: "Área interna",
  },
  {
    id: 2,
    numero: "02",
    capacidade: 2,
    status: "Ocupada",
    localizacao: "Área interna",
  },
  {
    id: 3,
    numero: "03",
    capacidade: 6,
    status: "Reservada",
    localizacao: "Área externa",
    observacoes: "Reservada para às 20h",
  },
  {
    id: 4,
    numero: "04",
    capacidade: 4,
    status: "Disponível",
    localizacao: "Área externa",
  },
  {
    id: 5,
    numero: "05",
    capacidade: 8,
    status: "Manutenção",
    localizacao: "Área interna",
    observacoes: "Cadeira quebrada",
  },
]

// Função para atualizar o status de uma mesa
export function atualizarStatusMesa(id: number, novoStatus: string): boolean {
  const index = mesasData.findIndex((mesa) => mesa.id === id)
  if (index !== -1) {
    mesasData[index].status = novoStatus
    return true
  }
  return false
}

// Função para obter o próximo ID disponível
export function getNextMesaId(): number {
  return Math.max(0, ...mesasData.map((mesa) => mesa.id)) + 1
}

// Função para adicionar uma nova mesa
export function adicionarMesa(novaMesa: Omit<Mesa, "id">): Mesa {
  const id = getNextMesaId()
  const mesa: Mesa = { ...novaMesa, id }
  mesasData.push(mesa)
  return mesa
}

// Função para excluir uma mesa
export function excluirMesa(id: number): boolean {
  const index = mesasData.findIndex((mesa) => mesa.id === id)
  if (index !== -1) {
    mesasData.splice(index, 1)
    return true
  }
  return false
}

// Função para separar mesas combinadas
export function separarMesasCombinadas(mesaCombinada: string, mesasOriginais: string[]): boolean {
  try {
    // Encontrar e excluir a mesa combinada
    const indexCombinada = mesasData.findIndex((mesa) => mesa.numero === mesaCombinada)
    if (indexCombinada !== -1) {
      mesasData.splice(indexCombinada, 1)
    }

    // Restaurar as mesas originais para "Disponível"
    for (const mesaId of mesasOriginais) {
      const id = Number.parseInt(mesaId, 10)
      const index = mesasData.findIndex((mesa) => mesa.id === id)
      if (index !== -1) {
        mesasData[index].status = "Disponível"
        delete mesasData[index].mesaCombinada
      }
    }

    return true
  } catch (error) {
    console.error("Erro ao separar mesas:", error)
    return false
  }
}
