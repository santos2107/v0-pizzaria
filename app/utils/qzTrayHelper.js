"use client";

/**
 * Utilitário para integração com QZ Tray para impressão em impressoras térmicas
 * Baseado na documentação oficial: https://qz.io/wiki/getting-started
 */

// Verificar se estamos no ambiente do navegador
const isBrowser = typeof window !== 'undefined';

// Função para carregar os scripts do QZ Tray
export const loadQZTray = async () => {
  if (!isBrowser) return false;
  
  // Verificar se o QZ Tray já foi carregado
  if (window.qz) return true;
  
  try {
    // Carregar os scripts necessários
    await loadScript('https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.min.js');
    await loadScript('https://cdn.jsdelivr.net/npm/rsvp@4.8.5/dist/rsvp.min.js');
    
    // Verificar se o QZ Tray foi carregado corretamente
    if (!window.qz) {
      console.error('QZ Tray não foi carregado corretamente');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao carregar QZ Tray:', error);
    return false;
  }
};

// Função auxiliar para carregar scripts
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Função para conectar ao QZ Tray
export const connectQZTray = async () => {
  if (!isBrowser || !window.qz) return false;
  
  try {
    // Verificar se já está conectado
    if (window.qz.websocket.isActive()) {
      return true;
    }
    
    // Conectar ao QZ Tray
    await window.qz.websocket.connect();
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao QZ Tray:', error);
    return false;
  }
};

// Função para obter a lista de impressoras disponíveis
export const getPrinters = async () => {
  if (!isBrowser || !window.qz) return [];
  
  try {
    // Garantir que estamos conectados
    if (!window.qz.websocket.isActive()) {
      await connectQZTray();
    }
    
    // Obter a lista de impressoras
    const printers = await window.qz.printers.find();
    return printers || [];
  } catch (error) {
    console.error('Erro ao obter lista de impressoras:', error);
    return [];
  }
};

// Função para imprimir uma comanda em uma impressora térmica
export const printComanda = async (printerName, comandaData, isKitchenCopy = false) => {
  if (!isBrowser || !window.qz) return { success: false, error: 'QZ Tray não está disponível' };
  
  try {
    // Garantir que estamos conectados
    if (!window.qz.websocket.isActive()) {
      await connectQZTray();
    }
    
    // Configurar a impressora
    const config = window.qz.configs.create(printerName, {
      altPrinting: false,
      encoding: "UTF-8",
      margins: { top: 0, right: 0, bottom: 0, left: 0 },
      colorType: "color",
      copies: 1,
      density: 0,
      duplex: false,
      interpolation: "bicubic",
      jobName: isKitchenCopy ? "Comanda Cozinha" : "Comanda Entrega",
      legacy: false,
      pageSize: null,
      paperThickness: null,
      printerTray: null,
      rasterize: false,
      rotation: 0,
      scaleContent: true,
      size: null,
      units: "in"
    });
    
    // Gerar o conteúdo da comanda
    const content = generateComandaContent(comandaData, isKitchenCopy);
    
    // Enviar para impressão
    await window.qz.print(config, content);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao imprimir comanda:', error);
    return { success: false, error: error.message || 'Erro ao imprimir comanda' };
  }
};

// Função para gerar o conteúdo da comanda
const generateComandaContent = (comandaData, isKitchenCopy) => {
  const { pedido, itens, cliente, mesa, data } = comandaData;
  
  // Formatar data
  const dataFormatada = new Date(data).toLocaleString('pt-BR');
  
  // Largura padrão para impressoras térmicas de 80mm (aproximadamente 48 caracteres)
  const width = 48;
  
  // Função para centralizar texto
  const center = (text) => {
    const spaces = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(spaces) + text;
  };
  
  // Função para criar linha divisória
  const divider = '-'.repeat(width);
  
  // Iniciar o conteúdo
  let content = [];
  
  // Cabeçalho
  content.push(center('PIZZARIA KASSIO'));
  content.push(center('COMANDA ' + (isKitchenCopy ? 'COZINHA' : 'ENTREGA')));
  content.push(divider);
  
  // Informações do pedido
  content.push(`PEDIDO: #${pedido.id}`);
  content.push(`DATA: ${dataFormatada}`);
  
  // Informações específicas para cada tipo de comanda
  if (isKitchenCopy) {
    // Comanda para cozinha - foco nos itens e observações
    content.push(divider);
    content.push(center('ITENS DO PEDIDO'));
    content.push(divider);
    
    // Listar itens
    itens.forEach((item, index) => {
      content.push(`${item.quantidade}x ${item.nome}`);
      if (item.observacao) {
        content.push(`   OBS: ${item.observacao}`);
      }
      if (index < itens.length - 1) {
        content.push('');
      }
    });
    
    // Observações gerais do pedido
    if (pedido.observacao) {
      content.push(divider);
      content.push('OBSERVAÇÕES:');
      content.push(pedido.observacao);
    }
  } else {
    // Comanda para entrega - informações completas
    if (mesa) {
      content.push(`MESA: ${mesa.numero}`);
    }
    
    if (cliente) {
      content.push(`CLIENTE: ${cliente.nome}`);
      if (cliente.telefone) {
        content.push(`TELEFONE: ${cliente.telefone}`);
      }
    }
    
    content.push(divider);
    content.push(center('ITENS DO PEDIDO'));
    content.push(divider);
    
    // Listar itens com preços
    itens.forEach((item) => {
      const precoTotal = (item.preco * item.quantidade).toFixed(2);
      const itemLine = `${item.quantidade}x ${item.nome}`;
      const priceLine = `R$ ${precoTotal}`;
      const spaces = width - itemLine.length - priceLine.length;
      
      content.push(`${itemLine}${' '.repeat(Math.max(1, spaces))}${priceLine}`);
      if (item.observacao) {
        content.push(`   OBS: ${item.observacao}`);
      }
    });
    
    // Total
    content.push(divider);
    const totalLine = 'TOTAL:';
    const totalValue = `R$ ${pedido.valorTotal.toFixed(2)}`;
    const totalSpaces = width - totalLine.length - totalValue.length;
    content.push(`${totalLine}${' '.repeat(totalSpaces)}${totalValue}`);
    
    // Forma de pagamento
    if (pedido.formaPagamento) {
      content.push(`FORMA DE PAGAMENTO: ${pedido.formaPagamento}`);
    }
    
    // Observações gerais do pedido
    if (pedido.observacao) {
      content.push(divider);
      content.push('OBSERVAÇÕES:');
      content.push(pedido.observacao);
    }
  }
  
  // Rodapé
  content.push(divider);
  content.push(center('Obrigado pela preferência!'));
  content.push('\n\n\n\n'); // Espaço para corte
  
  // Retornar como array de strings para o QZ Tray
  return content;
};

// Função para desconectar do QZ Tray
export const disconnectQZTray = async () => {
  if (!isBrowser || !window.qz) return;
  
  try {
    if (window.qz.websocket.isActive()) {
      await window.qz.websocket.disconnect();
    }
  } catch (error) {
    console.error('Erro ao desconectar do QZ Tray:', error);
  }
};

// Função para imprimir comandas em duas vias (cozinha e entrega)
export const printComandaDuasVias = async (printerName, comandaData) => {
  try {
    // Imprimir via de entrega
    const entregaResult = await printComanda(printerName, comandaData, false);
    if (!entregaResult.success) {
      return entregaResult;
    }
    
    // Pequeno delay entre impressões
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Imprimir via da cozinha
    const cozinhaResult = await printComanda(printerName, comandaData, true);
    return cozinhaResult;
  } catch (error) {
    console.error('Erro ao imprimir comandas em duas vias:', error);
    return { success: false, error: error.message || 'Erro ao imprimir comandas' };
  }
};
