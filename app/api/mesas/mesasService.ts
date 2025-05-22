// app/api/mesas/mesasService.ts

interface Mesa {
  id: number
  numero: string
  capacidade: number
  status: string // "Disponível", "Ocupada", "Reservada", "Em uso combinado", "Manutenção"
  localizacao?: string
  observacoes?: string
  mesasCombinadas?: string[]
  mesaCombinadaPai?: string // ID da mesa principal se esta for uma mesa combinada
}

// Simulação de um banco de dados em memória
export const mesas: Mesa[] = [
  // Dados iniciais para teste, se necessário
  {
    id: 1,
    numero: "01",
    capacidade: 4,
    status: "Disponível",
    localizacao: "Salão Principal",
  },
  {
    id: 2,
    numero: "02",
    capacidade: 2,
    status: "Ocupada",
    localizacao: "Varanda",
  },
  {
    id: 3,
    numero: "03",
    capacidade: 6,
    status: "Reservada",
    localizacao: "Salão Principal",
  },
]

let proximoIdMesa = 4

export const obterTodasAsMesas = () => {
  return [...mesas]
}

export const obterMesaPorId = (id: number) => {
  return mesas.find((mesa) => mesa.id === id)
}

export const adicionarNovaMesa = (novaMesaData: Omit<Mesa, "id">) => {
  const novaMesa: Mesa = {
    ...novaMesaData,
    id: proximoIdMesa++,
  }
  mesas.push(novaMesa)
  return novaMesa
}

export const atualizarMesaExistente = (id: number, dadosAtualizados: Partial<Omit<Mesa, "id">>) => {
  const index = mesas.findIndex((mesa) => mesa.id === id)
  if (index !== -1) {
    mesas[index] = { ...mesas[index], ...dadosAtualizados }
    return mesas[index]
  }
  return null
}

export const deletarMesa = (id: number) => {
  const index = mesas.findIndex((mesa) => mesa.id === id)
  if (index !== -1) {
    const mesaDeletada = mesas.splice(index, 1)[0]
    return mesaDeletada
  }
  return null
}

// Função para juntar mesas (exemplo simplificado)
export const juntarMesas = (idsMesasParaJuntar: number[], numeroMesaPrincipal: string) => {
  let capacidadeTotal = 0
  const numerosMesasJuntadas: string[] = []
  let mesaPrincipal: Mesa | undefined

  idsMesasParaJuntar.forEach((id) => {
    const mesa = obterMesaPorId(id)
    if (mesa && (mesa.status === "Disponível" || mesa.status === "Reservada")) {
      capacidadeTotal += mesa.capacidade
      numerosMesasJuntadas.push(mesa.numero)
      // Marcar mesas como parte de uma combinação, exceto a principal
      if (mesa.numero !== numeroMesaPrincipal) {
        atualizarMesaExistente(id, { status: "Em uso combinado", mesaCombinadaPai: numeroMesaPrincipal })
      } else {
        mesaPrincipal = mesa
      }
    }
  })

  if (mesaPrincipal && numerosMesasJuntadas.length > 1) {
    return atualizarMesaExistente(mesaPrincipal.id, {
      status: "Em uso combinado",
      capacidade: capacidadeTotal,
      mesasCombinadas: numerosMesasJuntadas.filter((n) => n !== numeroMesaPrincipal),
      observacoes:
        `${mesaPrincipal.observacoes || ""} (Combinada com: ${numerosMesasJuntadas.filter((n) => n !== numeroMesaPrincipal).join(", ")})`.trim(),
    })
  }
  return null // Ou lançar um erro se a junção não for possível
}

export const separarMesas = (idMesaPrincipal: number) => {
  const mesaPrincipal = obterMesaPorId(idMesaPrincipal)
  if (mesaPrincipal && mesaPrincipal.mesasCombinadas && mesaPrincipal.mesasCombinadas.length > 0) {
    // Restaurar mesas combinadas para Disponível (ou seu status original, se armazenado)
    mesaPrincipal.mesasCombinadas.forEach((numeroMesaCombinada) => {
      const mesaCombinada = mesas.find((m) => m.numero === numeroMesaCombinada)
      if (mesaCombinada) {
        // Aqui, idealmente, você restauraria a capacidade original também
        atualizarMesaExistente(mesaCombinada.id, {
          status: "Disponível",
          mesaCombinadaPai: undefined,
          mesasCombinadas: [],
        })
      }
    })
    // Restaurar mesa principal
    // Idealmente, restaurar capacidade original
    return atualizarMesaExistente(idMesaPrincipal, {
      status: "Disponível",
      mesasCombinadas: [],
      observacoes: mesaPrincipal.observacoes?.replace(/$$Combinada com:.*?$$/, "").trim(),
    })
  }
  return null
}
