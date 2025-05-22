// app/api/reservas/reservasService.ts
import { mesas, obterMesaPorId, atualizarMesaExistente as atualizarStatusMesaNoServicoMesas } from "../mesas/mesasService"; // Importar o serviço de mesas

export interface Reserva {
  id: string; // Usar string para IDs para evitar confusão com números de mesa
  mesaId: number;
  mesaNumero?: string; // Adicionado para facilitar a exibição
  clienteId?: number; // Opcional, pode ser apenas nome e telefone
  clienteNome: string;
  clienteTelefone: string;
  data: string; // Formato YYYY-MM-DD
  hora: string; // Formato HH:MM
  duracao: number; // Em minutos
  pessoas: number;
  observacoes?: string;
  status: "pendente" | "confirmada" | "cancelada" | "concluida" | "no-show";
  criadaEm: string; // ISO Date string
}

let reservas: Reserva[] = [];
let proximoIdReserva = 1;

// Função auxiliar para verificar sobreposição de horários
const verificaSobreposicao = (reservaExistente: Reserva, novaData: string, novaHora: string, novaDuracao: number): boolean => {
  if (reservaExistente.data !== novaData) return false;

  const inicioExistente = new Date(`${reservaExistente.data}T${reservaExistente.hora}`);
  const fimExistente = new Date(inicioExistente.getTime() + reservaExistente.duracao * 60000);

  const inicioNova = new Date(`${novaData}T${novaHora}`);
  const fimNova = new Date(inicioNova.getTime() + novaDuracao * 60000);

  // Verifica se há sobreposição
  // Nova reserva começa durante a existente OU Nova reserva termina durante a existente
  // OU Existente começa durante a nova OU Existente termina durante a nova
  return (inicioNova < fimExistente && fimNova > inicioExistente);
};

export const listarReservas = (filtros?: { data?: string; status?: string; mesaId?: number }): Reserva[] => {
  let reservasFiltradas = [...reservas];
  if (filtros) {
    if (filtros.data) {
      reservasFiltradas = reservasFiltradas.filter(r => r.data === filtros.data);
    }
    if (filtros.status) {
      reservasFiltradas = reservasFiltradas.filter(r => r.status === filtros.status);
    }
    if (filtros.mesaId) {
      reservasFiltradas = reservasFiltradas.filter(r => r.mesaId === filtros.mesaId);
    }
  }
  return reservasFiltradas;
};

export const obterReservaPorId = (id: string): Reserva | undefined => {
  return reservas.find(r => r.id === id);
};

export const criarReserva = (dadosReserva: Omit<Reserva, "id" | "criadaEm" | "mesaNumero">): Reserva | { error: string } => {
  const mesa = obterMesaPorId(dadosReserva.mesaId);
  if (!mesa) {
    return { error: "Mesa não encontrada." };
  }
  if (mesa.capacidade < dadosReserva.pessoas) {
    return { error: `A mesa ${mesa.numero} tem capacidade para apenas ${mesa.capacidade} pessoas.` };
  }

  // Verificar disponibilidade no serviço de mesas e também nas reservas existentes para a mesma mesa
  const reservasDaMesaNoDia = reservas.filter(
    r => r.mesaId === dadosReserva.mesaId && 
         r.data === dadosReserva.data && 
         r.status !== "cancelada" && 
         r.status !== "concluida" && 
         r.status !== "no-show"
  );

  for (const reservaExistente of reservasDaMesaNoDia) {
    if (verificaSobreposicao(reservaExistente, dadosReserva.data, dadosReserva.hora, dadosReserva.duracao)) {
      return { error: `Mesa ${mesa.numero} já reservada ou ocupada neste horário.` };
    }
  }
  
  // Se a mesa estiver explicitamente "Ocupada" no serviço de mesas, não permitir reserva (a menos que a lógica de negócio permita)
  // Esta verificação pode ser mais complexa dependendo de como "Ocupada" é gerenciado (ex: por pedidos ativos)
  // Por ora, se o status for "Disponível" ou "Reservada" (para outro horário), prossegue.
  // Se o status for "Juntada", não permitir reserva direta na mesa original.
  if (mesa.status === "Juntada" || mesa.status === "Em uso combinado") {
      return { error: `A mesa ${mesa.numero} faz parte de uma combinação e não pode ser reservada individualmente.` };
  }

  const novaReserva: Reserva = {
    ...dadosReserva,
    id: (proximoIdReserva++).toString(),
    mesaNumero: mesa.numero,
    criadaEm: new Date().toISOString(),
  };
  reservas.push(novaReserva);

  // Atualizar status da mesa para "Reservada" se ainda estiver "Disponível"
  // A lógica de quando a mesa se torna "Reservada" pode variar.
  // Aqui, consideramos que ela se torna reservada imediatamente após a criação da reserva.
  // Se múltiplas reservas são possíveis para diferentes horários, o status "Reservada" no objeto Mesa pode ser mais um indicador geral.
  if (mesa.status === "Disponível") {
     const atualizacaoMesa = atualizarStatusMesaNoServicoMesas(mesa.id, { status: "Reservada" });
     if (!atualizacaoMesa) {
        // Rollback da reserva se a atualização da mesa falhar? Ou apenas logar?
        console.warn(`Reserva ${novaReserva.id} criada, mas falha ao atualizar status da mesa ${mesa.id} para Reservada.`);
     }
  }

  return novaReserva;
};

export const atualizarReserva = (id: string, dadosAtualizacao: Partial<Omit<Reserva, "id" | "criadaEm" | "mesaId" | "mesaNumero">>): Reserva | { error: string } => {
  const index = reservas.findIndex(r => r.id === id);
  if (index === -1) {
    return { error: "Reserva não encontrada." };
  }
  const reservaExistente = reservas[index];

  // Verificar disponibilidade se data, hora ou duração mudarem
  if (dadosAtualizacao.data || dadosAtualizacao.hora || dadosAtualizacao.duracao) {
    const novaData = dadosAtualizacao.data || reservaExistente.data;
    const novaHora = dadosAtualizacao.hora || reservaExistente.hora;
    const novaDuracao = dadosAtualizacao.duracao || reservaExistente.duracao;

    const outrasReservasDaMesa = reservas.filter(
      r => r.id !== id && 
           r.mesaId === reservaExistente.mesaId && 
           r.data === novaData && 
           r.status !== "cancelada" && r.status !== "concluida" && r.status !== "no-show"
    );

    for (const outraReserva of outrasReservasDaMesa) {
      if (verificaSobreposicao(outraReserva, novaData, novaHora, novaDuracao)) {
        const mesa = obterMesaPorId(reservaExistente.mesaId);
        return { error: `Mesa ${mesa?.numero || reservaExistente.mesaId} já reservada ou ocupada neste novo horário.` };
      }
    }
  }
  
  const reservaAtualizada = { ...reservaExistente, ...dadosAtualizacao };
  reservas[index] = reservaAtualizada;

  // Se a reserva for confirmada e a mesa estava Disponível, pode-se mudar para Reservada.
  if (dadosAtualizacao.status === "confirmada") {
    const mesa = obterMesaPorId(reservaExistente.mesaId);
    if (mesa && mesa.status === "Disponível") {
      atualizarStatusMesaNoServicoMesas(reservaExistente.mesaId, { status: "Reservada" });
    }
  }
  // Se a reserva for cancelada, a mesa pode voltar a ser Disponível se não houver outras reservas ativas para ela.
  else if (dadosAtualizacao.status === "cancelada" || dadosAtualizacao.status === "no-show") {
    const mesa = obterMesaPorId(reservaExistente.mesaId);
    if (mesa) {
        const outrasReservasAtivasParaMesa = reservas.some(
            r => r.id !== id && 
                 r.mesaId === reservaExistente.mesaId && 
                 r.status !== "cancelada" && 
                 r.status !== "concluida" && 
                 r.status !== "no-show"
          );
          if (!outrasReservasAtivasParaMesa && mesa.status === "Reservada") {
            atualizarStatusMesaNoServicoMesas(reservaExistente.mesaId, { status: "Disponível" });
          }
    }
  }

  return reservaAtualizada;
};

export const cancelarReserva = (id: string): Reserva | { error: string } => {
  return atualizarReserva(id, { status: "cancelada" });
};

// Função para simular a passagem do tempo e atualizar status (ex: para "concluida" ou "no-show")
// Esta função seria chamada periodicamente em um cenário real.
export const processarReservasPassadas = () => {
  const agora = new Date();
  reservas.forEach(reserva => {
    if (reserva.status === "pendente" || reserva.status === "confirmada") {
      const fimReserva = new Date(`${reserva.data}T${reserva.hora}`);
      fimReserva.setMinutes(fimReserva.getMinutes() + reserva.duracao);
      if (fimReserva < agora) {
        // Lógica para determinar se foi "concluida" ou "no-show"
        // Por simplicidade, vamos marcar como "concluida" se estava confirmada, senão "no-show"
        const novoStatus = reserva.status === "confirmada" ? "concluida" : "no-show";
        atualizarReserva(reserva.id, { status: novoStatus });
      }
    }
  });
};
