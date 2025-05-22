// app/api/financeiro/financeiroService.ts

export interface Transacao {
  id: string;
  tipo: 'venda' | 'despesa' | 'suprimento' | 'sangria';
  valor: number;
  descricao: string;
  formaPagamento?: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'outro';
  pedidoId?: string; // Referência ao pedido, se for uma venda
  data: string; // ISO Date string
  registradoPor: string; // ID ou nome do usuário que registrou
  caixaId?: string; // ID do caixa ao qual a transação está associada
}

export interface Caixa {
  id: string;
  dataAbertura: string; // ISO Date string
  dataFechamento?: string; // ISO Date string
  saldoInicial: number;
  saldoFinal?: number;
  saldoFinalEsperado?: number;
  diferenca?: number; // saldoFinal - saldoFinalEsperado
  status: 'aberto' | 'fechado';
  observacoes?: string;
  abertoPor: string; // ID ou nome do usuário que abriu
  fechadoPor?: string; // ID ou nome do usuário que fechou
  transacoes?: string[]; // IDs das transações associadas a este caixa
}

// Simulação de banco de dados em memória
let transacoes: Transacao[] = [];
let caixas: Caixa[] = [];

// Contadores para IDs
let proximoIdTransacao = 1;
let proximoIdCaixa = 1;

// Funções para gerenciar transações
export const listarTransacoes = (filtros?: { 
  tipo?: string; 
  dataInicio?: string; 
  dataFim?: string;
  caixaId?: string;
}): Transacao[] => {
  let transacoesFiltradas = [...transacoes];
  
  if (filtros) {
    if (filtros.tipo) {
      transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo === filtros.tipo);
    }
    
    if (filtros.dataInicio) {
      const dataInicio = new Date(filtros.dataInicio);
      transacoesFiltradas = transacoesFiltradas.filter(t => new Date(t.data) >= dataInicio);
    }
    
    if (filtros.dataFim) {
      const dataFim = new Date(filtros.dataFim);
      dataFim.setHours(23, 59, 59, 999); // Final do dia
      transacoesFiltradas = transacoesFiltradas.filter(t => new Date(t.data) <= dataFim);
    }
    
    if (filtros.caixaId) {
      transacoesFiltradas = transacoesFiltradas.filter(t => t.caixaId === filtros.caixaId);
    }
  }
  
  // Ordenar transações da mais recente para a mais antiga
  transacoesFiltradas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  
  return transacoesFiltradas;
};

export const obterTransacaoPorId = (id: string): Transacao | undefined => {
  return transacoes.find(t => t.id === id);
};

export const registrarTransacao = (dadosTransacao: Omit<Transacao, 'id'>): Transacao => {
  // Se não foi fornecido um caixaId, tenta associar ao caixa aberto atual
  if (!dadosTransacao.caixaId) {
    const caixaAtual = obterCaixaAtual();
    if (caixaAtual) {
      dadosTransacao.caixaId = caixaAtual.id;
    }
  }
  
  const novaTransacao: Transacao = {
    ...dadosTransacao,
    id: `transacao_${Date.now()}_${proximoIdTransacao++}`,
  };
  
  transacoes.push(novaTransacao);
  
  // Se houver um caixa aberto e a transação estiver associada a ele, atualizar a lista de transações do caixa
  if (dadosTransacao.caixaId) {
    const caixa = caixas.find(c => c.id === dadosTransacao.caixaId);
    if (caixa) {
      if (!caixa.transacoes) {
        caixa.transacoes = [];
      }
      caixa.transacoes.push(novaTransacao.id);
      
      // Log para debug
      console.log(`Transação ${novaTransacao.id} associada ao caixa ${caixa.id}. Total de transações: ${caixa.transacoes.length}`);
    }
  }
  
  return novaTransacao;
};

export const atualizarTransacao = (id: string, dadosAtualizados: Partial<Omit<Transacao, 'id'>>): Transacao | null => {
  const index = transacoes.findIndex(t => t.id === id);
  if (index !== -1) {
    transacoes[index] = { ...transacoes[index], ...dadosAtualizados };
    return transacoes[index];
  }
  return null;
};

export const deletarTransacao = (id: string): Transacao | null => {
  const index = transacoes.findIndex(t => t.id === id);
  if (index !== -1) {
    const transacaoDeletada = transacoes.splice(index, 1)[0];
    
    // Se a transação estiver associada a um caixa, remover da lista de transações do caixa
    if (transacaoDeletada.caixaId) {
      const caixa = caixas.find(c => c.id === transacaoDeletada.caixaId);
      if (caixa && caixa.transacoes) {
        caixa.transacoes = caixa.transacoes.filter(tId => tId !== id);
      }
    }
    
    return transacaoDeletada;
  }
  return null;
};

// Funções para gerenciar caixas
export const listarCaixas = (filtros?: { 
  status?: string; 
  dataInicio?: string; 
  dataFim?: string;
}): Caixa[] => {
  let caixasFiltrados = [...caixas];
  
  if (filtros) {
    if (filtros.status) {
      caixasFiltrados = caixasFiltrados.filter(c => c.status === filtros.status);
    }
    
    if (filtros.dataInicio) {
      const dataInicio = new Date(filtros.dataInicio);
      caixasFiltrados = caixasFiltrados.filter(c => new Date(c.dataAbertura) >= dataInicio);
    }
    
    if (filtros.dataFim) {
      const dataFim = new Date(filtros.dataFim);
      dataFim.setHours(23, 59, 59, 999); // Final do dia
      caixasFiltrados = caixasFiltrados.filter(c => {
        const dataReferencia = c.dataFechamento ? new Date(c.dataFechamento) : new Date(c.dataAbertura);
        return dataReferencia <= dataFim;
      });
    }
  }
  
  // Ordenar caixas do mais recente para o mais antigo
  caixasFiltrados.sort((a, b) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime());
  
  return caixasFiltrados;
};

export const obterCaixaPorId = (id: string): Caixa | undefined => {
  return caixas.find(c => c.id === id);
};

export const obterCaixaAtual = (): Caixa | undefined => {
  return caixas.find(c => c.status === 'aberto');
};

export const abrirCaixa = (dadosCaixa: { 
  saldoInicial: number; 
  abertoPor: string; 
  observacoes?: string;
}): Caixa | { error: string } => {
  // Verificar se já existe um caixa aberto
  const caixaAberto = obterCaixaAtual();
  if (caixaAberto) {
    return { error: `Já existe um caixa aberto (ID: ${caixaAberto.id}). Feche-o antes de abrir um novo.` };
  }
  
  const novoCaixa: Caixa = {
    id: `caixa_${Date.now()}_${proximoIdCaixa++}`,
    dataAbertura: new Date().toISOString(),
    saldoInicial: dadosCaixa.saldoInicial,
    status: 'aberto',
    abertoPor: dadosCaixa.abertoPor,
    observacoes: dadosCaixa.observacoes,
    transacoes: [],
  };
  
  caixas.push(novoCaixa);
  
  // Se não houver nenhum caixa aberto, criar um automaticamente para testes
  if (caixas.length === 0) {
    const caixaInicial: Caixa = {
      id: `caixa_${Date.now()}_${proximoIdCaixa++}`,
      dataAbertura: new Date().toISOString(),
      saldoInicial: 100,
      status: 'aberto',
      abertoPor: 'Sistema',
      observacoes: 'Caixa inicial criado automaticamente',
      transacoes: [],
    };
    caixas.push(caixaInicial);
    console.log('Caixa inicial criado automaticamente:', caixaInicial);
  }
  
  return novoCaixa;
};

export const fecharCaixa = (id: string, dadosFechamento: { 
  saldoFinal: number; 
  fechadoPor: string; 
  observacoes?: string;
}): Caixa | { error: string } => {
  const caixa = obterCaixaPorId(id);
  if (!caixa) {
    return { error: `Caixa com ID ${id} não encontrado.` };
  }
  
  if (caixa.status === 'fechado') {
    return { error: `Caixa com ID ${id} já está fechado.` };
  }
  
  // Calcular o saldo final esperado
  let saldoFinalEsperado = caixa.saldoInicial;
  
  // Se houver transações associadas ao caixa, calcular o saldo final esperado
  if (caixa.transacoes && caixa.transacoes.length > 0) {
    const transacoesDoCaixa = caixa.transacoes.map(tId => obterTransacaoPorId(tId)).filter(t => t !== undefined) as Transacao[];
    
    for (const transacao of transacoesDoCaixa) {
      if (transacao.tipo === 'venda' || transacao.tipo === 'suprimento') {
        saldoFinalEsperado += transacao.valor;
      } else if (transacao.tipo === 'despesa' || transacao.tipo === 'sangria') {
        saldoFinalEsperado -= transacao.valor;
      }
    }
  }
  
  // Atualizar o caixa
  const caixaAtualizado: Caixa = {
    ...caixa,
    dataFechamento: new Date().toISOString(),
    saldoFinal: dadosFechamento.saldoFinal,
    saldoFinalEsperado,
    diferenca: dadosFechamento.saldoFinal - saldoFinalEsperado,
    status: 'fechado',
    fechadoPor: dadosFechamento.fechadoPor,
    observacoes: dadosFechamento.observacoes ? 
      (caixa.observacoes ? `${caixa.observacoes}\n${dadosFechamento.observacoes}` : dadosFechamento.observacoes) : 
      caixa.observacoes,
  };
  
  // Atualizar o caixa na lista
  const index = caixas.findIndex(c => c.id === id);
  caixas[index] = caixaAtualizado;
  
  return caixaAtualizado;
};

// Função para gerar relatório de caixa
export const gerarRelatorioCaixa = (caixaId: string): { 
  caixa: Caixa; 
  transacoes: Transacao[];
  resumo: {
    totalVendas: number;
    totalDespesas: number;
    totalSuprimentos: number;
    totalSangrias: number;
    saldoInicial: number;
    saldoFinalEsperado: number;
    saldoFinal?: number;
    diferenca?: number;
  };
} | { error: string } => {
  const caixa = obterCaixaPorId(caixaId);
  if (!caixa) {
    return { error: `Caixa com ID ${caixaId} não encontrado.` };
  }
  
  // Obter todas as transações associadas ao caixa
  const transacoesDoCaixa = caixa.transacoes ? 
    caixa.transacoes.map(tId => obterTransacaoPorId(tId)).filter(t => t !== undefined) as Transacao[] : 
    [];
  
  // Calcular totais
  let totalVendas = 0;
  let totalDespesas = 0;
  let totalSuprimentos = 0;
  let totalSangrias = 0;
  
  for (const transacao of transacoesDoCaixa) {
    switch (transacao.tipo) {
      case 'venda':
        totalVendas += transacao.valor;
        break;
      case 'despesa':
        totalDespesas += transacao.valor;
        break;
      case 'suprimento':
        totalSuprimentos += transacao.valor;
        break;
      case 'sangria':
        totalSangrias += transacao.valor;
        break;
    }
  }
  
  const saldoFinalEsperado = caixa.saldoInicial + totalVendas + totalSuprimentos - totalDespesas - totalSangrias;
  
  return {
    caixa,
    transacoes: transacoesDoCaixa,
    resumo: {
      totalVendas,
      totalDespesas,
      totalSuprimentos,
      totalSangrias,
      saldoInicial: caixa.saldoInicial,
      saldoFinalEsperado,
      saldoFinal: caixa.saldoFinal,
      diferenca: caixa.diferenca,
    }
  };
};

// Função para obter resumo financeiro por período
export const obterResumoFinanceiroPorPeriodo = (dataInicio: string, dataFim: string): {
  totalVendas: number;
  totalDespesas: number;
  totalSuprimentos: number;
  totalSangrias: number;
  lucroLiquido: number; // totalVendas - totalDespesas
  fluxoCaixa: number; // totalVendas + totalSuprimentos - totalDespesas - totalSangrias
  transacoesPorTipo: {
    vendas: Transacao[];
    despesas: Transacao[];
    suprimentos: Transacao[];
    sangrias: Transacao[];
  };
} => {
  const transacoesFiltradas = listarTransacoes({
    dataInicio,
    dataFim,
  });
  
  let totalVendas = 0;
  let totalDespesas = 0;
  let totalSuprimentos = 0;
  let totalSangrias = 0;
  
  const transacoesPorTipo = {
    vendas: [] as Transacao[],
    despesas: [] as Transacao[],
    suprimentos: [] as Transacao[],
    sangrias: [] as Transacao[],
  };
  
  for (const transacao of transacoesFiltradas) {
    switch (transacao.tipo) {
      case 'venda':
        totalVendas += transacao.valor;
        transacoesPorTipo.vendas.push(transacao);
        break;
      case 'despesa':
        totalDespesas += transacao.valor;
        transacoesPorTipo.despesas.push(transacao);
        break;
      case 'suprimento':
        totalSuprimentos += transacao.valor;
        transacoesPorTipo.suprimentos.push(transacao);
        break;
      case 'sangria':
        totalSangrias += transacao.valor;
        transacoesPorTipo.sangrias.push(transacao);
        break;
    }
  }
  
  const lucroLiquido = totalVendas - totalDespesas;
  const fluxoCaixa = totalVendas + totalSuprimentos - totalDespesas - totalSangrias;
  
  return {
    totalVendas,
    totalDespesas,
    totalSuprimentos,
    totalSangrias,
    lucroLiquido,
    fluxoCaixa,
    transacoesPorTipo,
  };
};

// Função para associar um pedido como uma transação de venda
export const registrarVendaDePedido = (
  pedidoId: string, 
  valor: number, 
  formaPagamento: 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'pix' | 'outro',
  registradoPor: string
): Transacao | { error: string } => {
  // Verificar se já existe um caixa aberto
  const caixaAberto = obterCaixaAtual();
  if (!caixaAberto) {
    // Criar um caixa automaticamente para garantir que as vendas sejam registradas
    const novoCaixa = abrirCaixa({
      saldoInicial: 0,
      abertoPor: 'Sistema',
      observacoes: 'Caixa aberto automaticamente para registrar vendas'
    });
    
    if ('error' in novoCaixa) {
      return { error: "Não há caixa aberto para registrar a venda e não foi possível criar um automaticamente." };
    }
    
    console.log('Caixa aberto automaticamente:', novoCaixa);
  }
  
  // Obter o caixa aberto novamente (pode ser o que acabou de ser criado)
  const caixa = obterCaixaAtual();
  if (!caixa) {
    return { error: "Não há caixa aberto para registrar a venda. Abra um caixa primeiro." };
  }
  
  // Verificar se o pedido já foi registrado como venda
  const vendaExistente = transacoes.find(t => t.tipo === 'venda' && t.pedidoId === pedidoId);
  if (vendaExistente) {
    return { error: `Pedido ${pedidoId} já foi registrado como venda (ID da transação: ${vendaExistente.id}).` };
  }
  
  // Registrar a venda
  const novaVenda = registrarTransacao({
    tipo: 'venda',
    valor,
    descricao: `Venda referente ao pedido #${pedidoId}`,
    formaPagamento,
    pedidoId,
    data: new Date().toISOString(),
    registradoPor,
    caixaId: caixa.id,
  });
  
  console.log(`Venda registrada para o pedido ${pedidoId}:`, novaVenda);
  
  return novaVenda;
};

// Inicializar um caixa se não houver nenhum
if (caixas.length === 0) {
  const caixaInicial: Caixa = {
    id: `caixa_${Date.now()}_${proximoIdCaixa++}`,
    dataAbertura: new Date().toISOString(),
    saldoInicial: 100,
    status: 'aberto',
    abertoPor: 'Sistema',
    observacoes: 'Caixa inicial criado automaticamente',
    transacoes: [],
  };
  caixas.push(caixaInicial);
  console.log('Caixa inicial criado automaticamente:', caixaInicial);
}
