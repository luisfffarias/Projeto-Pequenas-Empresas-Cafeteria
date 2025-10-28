const express = require("express");
require("dotenv").config();

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { RunnableSequence } = require("@langchain/core/runnables");
const jwt = require("jsonwebtoken");

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ======================================================
// ✅ Modelo LangChain
// ======================================================
const langchainModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: GEMINI_API_KEY,
  temperature: 0.1,
  maxOutputTokens: 150,
  streaming: true,
});

// ======================================================
// ✅ Memory simples por sessão
// ======================================================
const memories = new Map();

function getMemory(sessionId = "default") {
  if (!memories.has(sessionId)) memories.set(sessionId, []);
  return memories.get(sessionId);
}

function formatHistory(messages) {
  if (!messages || messages.length === 0) return "";
  return messages.map(msg => `${msg.role}: ${msg.content}`).join("\n");
}

// ======================================================
// ✅ SISTEMA DE ESTADOS PARA FLUXO GUIADO
// ======================================================
const userStates = new Map();

function getUserState(sessionId) {
  if (!userStates.has(sessionId)) {
    userStates.set(sessionId, { state: 'idle', data: {} });
  }
  return userStates.get(sessionId);
}

function resetUserState(sessionId) {
  userStates.set(sessionId, { state: 'idle', data: {} });
}

// ======================================================
// ✅ FUNÇÕES PARA API DE PRODUTOS
// ======================================================
async function buscarProdutosPorNome(nome) {
  try {
    const baseUrl = 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/produtos/buscar/${encodeURIComponent(nome)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, message: "Nenhum produto encontrado." };
      }
      throw new Error(`Erro: ${response.status}`);
    }
    
    const produtos = await response.json();
    return { success: true, data: produtos };
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return { success: false, message: "Erro ao conectar com a API." };
  }
}

async function cadastrarProduto(dados) {
  try {
    const baseUrl = 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/produtos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    
    if (!response.ok) {
      throw new Error(`Erro: ${response.status}`);
    }
    
    const produto = await response.json();
    return { success: true, data: produto };
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    return { success: false, message: "Erro ao cadastrar produto." };
  }
}

async function atualizarEstoque(id, novaQuantidade) {
  try {
    const baseUrl = 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/produtos/${id}/estoque`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ novaQuantidade })
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, message: "Produto não encontrado." };
      }
      if (response.status === 400) {
        return { success: false, message: "Quantidade inválida." };
      }
      throw new Error(`Erro: ${response.status}`);
    }
    
    const produto = await response.json();
    return { success: true, data: produto };
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    return { success: false, message: "Erro ao atualizar estoque." };
  }
}

// ======================================================
// ✅ VALIDAÇÃO DE DADOS DO PRODUTO
// ======================================================
function validarDadosProduto(dados) {
  const erros = [];
  
  if (!dados.nome || dados.nome.trim().length === 0) {
    erros.push("Nome do produto é obrigatório");
  }
  
  if (!dados.preco || isNaN(dados.preco) || dados.preco <= 0) {
    erros.push("Preço deve ser um número maior que zero");
  }
  
  if (dados.quantidade !== undefined && (isNaN(dados.quantidade) || dados.quantidade < 0)) {
    erros.push("Quantidade deve ser um número positivo");
  }
  
  return erros;
}

// ======================================================
// ✅ PROCESSAR DADOS DOS PRODUTOS (FORMATO SIMPLES)
// ======================================================
function processarDadosSimples(texto) {
  const partes = texto.split(',').map(parte => parte.trim());
  
  // Processa a imagem se for fornecida
  let imagem = null;
  if (partes[9] && partes[9].trim() !== '') {
    const nomeArquivo = partes[9].trim();
    imagem = `../assets/images/${nomeArquivo}`;
  }
  
  const dados = {
    nome: partes[0] || '',
    quantidade: parseInt(partes[1]) || 0,
    origem: partes[2] || null,
    intensidade: partes[3] || null,
    preco: parseFloat(partes[4]) || 0,
    peso: partes[5] || null,
    descricao: partes[6] || null,
    datadevalidade: partes[7] || null,
    tipo: partes[8] || null,
    imagem: imagem
  };

  return dados;
}

// ======================================================
// ✅ EXECUTAR AÇÕES
// ======================================================
async function executarBusca(termo) {
  const resultado = await buscarProdutosPorNome(termo);
  
  if (!resultado.success) {
    return resultado.message;
  }

  if (resultado.data.length === 0) {
    return `Nenhum produto encontrado com "${termo}".`;
  }

  let resposta = `Produtos encontrados:\n\n`;
  resultado.data.forEach(produto => {
    resposta += `ID ${produto.IdProduto} | ${produto.Nome} | R$ ${produto.Preco} | ${produto.Quantidade} unidades\n`;
  });
  resposta += `\nTotal: ${resultado.data.length} produto(s)`;
  
  return resposta;
}

async function executarCadastro(dadosProduto) {
  const erros = validarDadosProduto(dadosProduto);
  if (erros.length > 0) {
    return `Erros de validação:\n${erros.map(erro => `• ${erro}`).join('\n')}`;
  }

  const resultado = await cadastrarProduto(dadosProduto);
  
  if (!resultado.success) {
    return resultado.message;
  }

  return `Produto cadastrado com sucesso!\n\n${resultado.data.Nome}\nR$ ${resultado.data.Preco}\n${resultado.data.Quantidade} unidades\nImagem: ${resultado.data.Imagem || 'Padrão'}\nID: ${resultado.data.IdProduto}`;
}

async function executarAtualizacaoEstoque(id, quantidade) {
  const resultado = await atualizarEstoque(id, quantidade);
  
  if (!resultado.success) {
    return resultado.message;
  }

  return `Estoque atualizado!\n\n${resultado.data.Nome}\nNova quantidade: ${resultado.data.Quantidade} unidades\nID: ${resultado.data.IdProduto}`;
}

// ======================================================
// ✅ DETECTOR DE INTENÇÕES INTELIGENTE
// ======================================================
function detectarIntencao(message) {
  const lower = message.toLowerCase().trim();
  
  // Intenções de cadastro
  if (lower.includes('cadastrar') || lower.includes('adicionar') || lower.includes('novo') || 
      lower.includes('criar') || lower.includes('registrar')) {
    return 'cadastrar';
  }
  
  // Intenções de busca
  if (lower.includes('buscar') || lower.includes('procurar') || lower.includes('pesquisar') ||
      lower.includes('encontrar') || lower.includes('localizar')) {
    return 'buscar';
  }
  
  // Intenções de estoque
  if (lower.includes('estoque') || lower.includes('quantidade') || lower.includes('inventário') ||
      lower.includes('atualizar') || lower.includes('alterar estoque')) {
    return 'estoque';
  }
  
  // Intenções de ajuda
  if (lower.includes('ajuda') || lower.includes('help') || lower.includes('comandos') ||
      lower.includes('opções') || lower.includes('o que pode fazer')) {
    return 'ajuda';
  }
  
  // Intenções de cancelamento
  if (lower.includes('cancelar') || lower.includes('parar') || lower.includes('sair') ||
      lower.includes('voltar')) {
    return 'cancelar';
  }
  
  return null;
}

// ======================================================
// ✅ PROCESSAR COMANDOS INTELIGENTES
// ======================================================
function processarComandoInteligente(message, sessionId) {
  const userState = getUserState(sessionId);
  
  // Se já está em um fluxo, continua nele
  if (userState.state !== 'idle') {
    return null;
  }
  
  const intencao = detectarIntencao(message);
  
  switch (intencao) {
    case 'cadastrar':
      userState.state = 'cadastro_nome';
      userState.data = {};
      return `Vamos cadastrar um novo produto!\n\nQual é o nome do produto?`;
      
    case 'buscar':
      userState.state = 'aguardando_busca';
      return `Vou ajudar você a buscar produtos!\n\nQual produto você está procurando?`;
      
    case 'estoque':
      userState.state = 'aguardando_id_estoque';
      return `Atualização de estoque\n\nQual é o ID do produto que deseja atualizar?`;
      
    case 'ajuda':
      return `🔧 Como posso ajudar você?\n\nPosso ajudar com:\n\n` +
             `➕ Cadastrar novos produtos\n` +
             `🔍 Buscar produtos no sistema\n` +
             `📦 Atualizar quantidades em estoque\n\n` +
             `Exemplos:\n"Quero cadastrar um novo café"\n"Preciso buscar um produto"\n"Como atualizar o estoque?"`;
      
    case 'cancelar':
      resetUserState(sessionId);
      return `Voltando ao menu principal.\n\nEm que mais posso ajudar?`;
      
    default:
      return null;
  }
}

// ======================================================
// ✅ PROCESSAR ESTADOS DO FLUXO (ATUALIZADO)
// ======================================================
async function processarEstadoUsuario(message, sessionId) {
  const userState = getUserState(sessionId);
  
  switch (userState.state) {
    
    // 🔄 FLUXO DE CADASTRO PASSO A PASSO
    case 'cadastro_nome':
      if (!message || message.trim().length === 0) {
        return `Preciso saber o nome do produto.\n\nQual é o nome?`;
      }
      userState.data.nome = message.trim();
      userState.state = 'cadastro_preco';
      return `Nome: ${userState.data.nome}\n\nQual é o preço do produto?`;
    
    case 'cadastro_preco':
      const preco = parseFloat(message.replace(',', '.'));
      if (isNaN(preco) || preco <= 0) {
        return `Preço inválido. Digite um valor como 29.90:\n\nQual é o preço?`;
      }
      userState.data.preco = preco;
      userState.state = 'cadastro_quantidade';
      return `Preço: R$ ${preco.toFixed(2)}\n\nQuantas unidades temos em estoque?`;
    
    case 'cadastro_quantidade':
      const quantidade = parseInt(message);
      if (isNaN(quantidade) || quantidade < 0) {
        return `Quantidade inválida. Digite um número:\n\nQuantas unidades?`;
      }
      userState.data.quantidade = quantidade;
      userState.state = 'cadastro_peso';
      return `Quantidade: ${quantidade} unidades\n\nQual é o peso? (ex: 250g, 1kg)`;
    
    case 'cadastro_peso':
      userState.data.peso = message.trim() || null;
      userState.state = 'cadastro_origem';
      return `Peso: ${userState.data.peso || 'Não informado'}\n\nDe onde é este produto? (ou "pular")`;
    
    case 'cadastro_origem':
      if (message.toLowerCase() !== 'pular') {
        userState.data.origem = message.trim();
      }
      userState.state = 'cadastro_intensidade';
      return `Origem: ${userState.data.origem || 'Não informada'}\n\nQual a intensidade? (Suave, Médio, Forte - ou "pular")`;
    
    case 'cadastro_intensidade':
      if (message.toLowerCase() !== 'pular') {
        userState.data.intensidade = message.trim();
      }
      userState.state = 'cadastro_tipo';
      return `Intensidade: ${userState.data.intensidade || 'Não informada'}\n\nQual o tipo? (Grão, Moído, Cápsula - ou "pular")`;
    
    case 'cadastro_tipo':
      if (message.toLowerCase() !== 'pular') {
        userState.data.tipo = message.trim();
      }
      userState.state = 'cadastro_descricao';
      return `Tipo: ${userState.data.tipo || 'Não informado'}\n\nAlguma descrição especial? (ou "pular")`;
    
    case 'cadastro_descricao':
      if (message.toLowerCase() !== 'pular') {
        userState.data.descricao = message.trim();
      }
      userState.state = 'cadastro_validade';
      return `Descrição: ${userState.data.descricao || 'Não informada'}\n\nData de validade? (DD/MM/AAAA ou "pular")`;
    
    case 'cadastro_validade':
      if (message.toLowerCase() !== 'pular') {
        const dataRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (dataRegex.test(message)) {
          userState.data.datadevalidade = message;
        } else {
          userState.data.datadevalidade = null;
        }
      }
      userState.state = 'cadastro_imagem';
      return `Validade: ${userState.data.datadevalidade || 'Não informada'}\n\nNome da imagem? (ex: cafepreto.jpg ou "pular")`;
    
    case 'cadastro_imagem':
      if (message.toLowerCase() !== 'pular' && message.trim() !== '') {
        const nomeArquivo = message.trim();
        userState.data.imagem = `../assets/images/${nomeArquivo}`;
      } else {
        userState.data.imagem = null;
      }
      userState.state = 'cadastro_confirmacao';
      return `Resumo do produto:\n\n` +
             `Nome: ${userState.data.nome}\n` +
             `Preço: R$ ${userState.data.preco.toFixed(2)}\n` +
             `Estoque: ${userState.data.quantidade} unidades\n` +
             `Peso: ${userState.data.peso || 'Não informado'}\n` +
             `Origem: ${userState.data.origem || 'Não informada'}\n` +
             `Intensidade: ${userState.data.intensidade || 'Não informada'}\n` +
             `Tipo: ${userState.data.tipo || 'Não informado'}\n` +
             `Descrição: ${userState.data.descricao || 'Não informada'}\n` +
             `Validade: ${userState.data.datadevalidade || 'Não informada'}\n` +
             `Imagem: ${userState.data.imagem ? 'Personalizada' : 'Padrão'}\n\n` +
             `Confirmar cadastro? (sim/não)`;
    
    case 'cadastro_confirmacao':
      if (message.toLowerCase() === 'sim' || message.toLowerCase() === 's' || message.toLowerCase() === 'yes') {
        try {
          const resultado = await executarCadastro(userState.data);
          resetUserState(sessionId);
          return resultado;
        } catch (error) {
          resetUserState(sessionId);
          return `Erro no cadastro: ${error.message}`;
        }
      } else if (message.toLowerCase() === 'não' || message.toLowerCase() === 'nao' || message.toLowerCase() === 'n' || message.toLowerCase() === 'no') {
        resetUserState(sessionId);
        return `Cadastro cancelado.\n\nVoltando ao menu principal.`;
      } else {
        // Se não é sim/não, trata como conversa normal
        const intencao = detectarIntencao(message);
        if (intencao === 'cancelar') {
          resetUserState(sessionId);
          return `Cadastro cancelado.\n\nVoltando ao menu principal.`;
        }
        return `Não entendi. Confirmar cadastro? (sim/não)`;
      }
    
    // 🔄 FLUXO DE BUSCA
    case 'aguardando_busca':
      const resultadoBusca = await executarBusca(message.trim());
      resetUserState(sessionId);
      return resultadoBusca;
    
    // 🔄 FLUXO DE ATUALIZAÇÃO DE ESTOQUE
    case 'aguardando_id_estoque':
      const id = parseInt(message);
      if (isNaN(id) || id <= 0) {
        return `ID inválido. Digite um número:\n\nQual o ID do produto?`;
      }
      userState.data.id = id;
      userState.state = 'aguardando_nova_quantidade';
      return `Produto ID: ${id}\n\nQual a nova quantidade em estoque?`;
    
    case 'aguardando_nova_quantidade':
      const quantidadeEstoque = parseInt(message);
      if (isNaN(quantidadeEstoque) || quantidadeEstoque < 0) {
        return `Quantidade inválida. Digite um número:\n\nNova quantidade?`;
      }
      
      const resultadoEstoque = await executarAtualizacaoEstoque(userState.data.id, quantidadeEstoque);
      resetUserState(sessionId);
      return resultadoEstoque;
    
    default:
      return null;
  }
}

// ======================================================
// ✅ MIDDLEWARE PARA VERIFICAR TOKEN
// ======================================================
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'SEU_SEGREDO_JWT_FALLBACK', (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
}

// ======================================================
// ✅ PROMPT DIFERENCIADO PARA ADMIN (ATUALIZADO)
// ======================================================
function createPromptTemplate(isAdmin = false) {
  if (isAdmin) {
    return PromptTemplate.fromTemplate(`
Você é o Cafecito, assistente especializado em cafés.

MODO ADMIN ATIVADO - Você pode:

• Cadastrar novos produtos (guia passo a passo)
• Buscar produtos no sistema  
• Atualizar quantidades em estoque
• Cancelar operações a qualquer momento

IMPORTANTE: Se o usuário demonstrar intenção de realizar alguma ação administrativa (cadastrar, buscar, estoque), inicie o fluxo guiado apropriado.

Para outras conversas, seja natural e útil.

Sistema automático de imagens: usuário digita "nome.jpg" → sistema converte para "../assets/images/nome.jpg"

Histórico:
{history}

Usuário: {input}

Cafecito:
`);
  }

  return PromptTemplate.fromTemplate(`
Você é o Cafecito, assistente especializado em cafés artesanais.

Seja direto e objetivo. Máximo 2-3 frases.

Histórico:
{history}

Usuário: {input}

Cafecito:
`);
}

// ======================================================
// ✅ ENDPOINT ÚNICO (ATUALIZADO)
// ======================================================
router.post("/", verificarToken, async (req, res) => {
  const { message, sessionId = "default" } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Mensagem é obrigatória" });
  }

  try {
    const memory = getMemory(sessionId);
    const history = formatHistory(memory);
    const isAdmin = req.user && req.user.isAdmin;

    // 🛠️ Se for admin, processar sistema INTELIGENTE
    if (isAdmin) {
      // 1. Primeiro tenta processar estados em andamento (fluxo guiado)
      const respostaEstado = await processarEstadoUsuario(message, sessionId);
      if (respostaEstado) {
        memory.push({ role: "user", content: message });
        memory.push({ role: "assistant", content: respostaEstado });
        return res.json({ reply: respostaEstado, success: true, isAdmin: true });
      }
      
      // 2. Depois tenta detectar intenções para iniciar fluxos
      const respostaInteligente = processarComandoInteligente(message, sessionId);
      if (respostaInteligente) {
        memory.push({ role: "user", content: message });
        memory.push({ role: "assistant", content: respostaInteligente });
        return res.json({ reply: respostaInteligente, success: true, isAdmin: true });
      }
    }

    // 💬 Chat normal com LangChain (para não-admin ou conversas naturais)
    const promptTemplate = createPromptTemplate(isAdmin);
    const chain = RunnableSequence.from([
      promptTemplate,
      langchainModel,
      new StringOutputParser(),
    ]);

    const replyText = await chain.invoke({ history, input: message });

    memory.push({ role: "user", content: message });
    memory.push({ role: "assistant", content: replyText });

    if (memory.length > 8) memory.splice(0, 2);

    res.json({ 
      reply: replyText, 
      success: true,
      isAdmin: isAdmin || false
    });

  } catch (err) {
    console.error("Erro Chatbot:", err);
    res.status(500).json({
      error: "Erro no processamento",
    });
  }
});

// ======================================================
// ✅ Endpoints para memory e estado
// ======================================================
router.post("/clear-memory", (req, res) => {
  const { sessionId = "default" } = req.body;
  memories.delete(sessionId);
  userStates.delete(sessionId);
  res.json({ success: true, message: "Memory e estado limpos" });
});

router.post("/reset-state", (req, res) => {
  const { sessionId = "default" } = req.body;
  resetUserState(sessionId);
  res.json({ success: true, message: "Estado resetado" });
});

router.get("/memory/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const memory = getMemory(sessionId);
  const state = getUserState(sessionId);
  res.json({ sessionId, memory, state, history: formatHistory(memory) });
});

// ======================================================
// ✅ Health Check
// ======================================================
router.get("/health", (req, res) => {
  res.json({
    status: "online",
    message: "Chatbot Cafecito - Sistema Completo",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;