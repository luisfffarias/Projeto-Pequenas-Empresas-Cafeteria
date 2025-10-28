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
    console.error('❌ Erro ao buscar produtos:', error);
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
    console.error('❌ Erro ao cadastrar produto:', error);
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
    console.error('❌ Erro ao atualizar estoque:', error);
    return { success: false, message: "Erro ao atualizar estoque." };
  }
}

// ======================================================
// ✅ PROCESSAR DADOS DOS PRODUTOS (FORMATO SIMPLES)
// ======================================================
function processarDadosSimples(texto) {
  const partes = texto.split(',').map(parte => parte.trim());
  
  // Exemplo: "cafe baggio caramelo, 10, brasil, forte, 30.23, 250g, cafe moido com aroma de caramelo, 20/10/2028, pó"
  const dados = {
    nome: partes[0] || '',
    quantidade: parseInt(partes[1]) || 0,
    origem: partes[2] || null,
    intensidade: partes[3] || null,
    preco: parseFloat(partes[4]) || 0,
    peso: partes[5] || null,
    descricao: partes[6] || null,
    datadevalidade: partes[7] || null,
    tipo: partes[8] || null
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
    return `🔍 Nenhum produto encontrado com "${termo}".`;
  }

  let resposta = `🔍 **Produtos encontrados:**\n\n`;
  resultado.data.forEach(produto => {
    resposta += `🆔 ${produto.IdProduto} | ${produto.Nome} | R$ ${produto.Preco} | 📦 ${produto.Quantidade} unidades\n`;
  });
  resposta += `\n📊 Total: ${resultado.data.length} produto(s)`;
  
  return resposta;
}

async function executarCadastro(dadosTexto) {
  const produtoData = processarDadosSimples(dadosTexto);
  
  if (!produtoData.nome || !produtoData.preco) {
    return "❌ **Faltam informações!** Precisa pelo menos do **nome** e **preço** do produto.";
  }

  const resultado = await cadastrarProduto(produtoData);
  
  if (!resultado.success) {
    return resultado.message;
  }

  return `✅ **Produto cadastrado!**\n\n📦 ${resultado.data.Nome}\n💰 R$ ${resultado.data.Preco}\n📦 ${resultado.data.Quantidade} unidades\n🆔 ID: ${resultado.data.IdProduto}`;
}

async function executarAtualizacaoEstoque(id, quantidade) {
  const resultado = await atualizarEstoque(id, quantidade);
  
  if (!resultado.success) {
    return resultado.message;
  }

  return `✅ **Estoque atualizado!**\n\n📦 ${resultado.data.Nome}\n🔄 Nova quantidade: ${resultado.data.Quantidade} unidades\n🆔 ID: ${resultado.data.IdProduto}`;
}

// ======================================================
// ✅ PROCESSAR COMANDOS SIMPLES
// ======================================================
function processarComandoSimples(message, sessionId) {
  const lower = message.toLowerCase().trim();
  const userState = getUserState(sessionId);
  
  if (userState.state !== 'idle') {
    return null;
  }
  
  if (lower === 'cadastrar' || lower === 'cadastro' || lower === 'adicionar' || lower === 'novo') {
    userState.state = 'aguardando_dados';
    userState.data = {};
    return `➕ **CADASTRAR PRODUTO**\n\n📝 Digite os dados na ordem:\n\n` +
           `**nome, quantidade, origem, intensidade, preço, peso, descrição, data_validade, tipo**\n\n` +
           `💡 **Exemplo:** cafe baggio caramelo, 10, brasil, forte, 30.23, 250g, cafe moido com aroma de caramelo, 20/10/2028, pó\n\n` +
           `⚠️ **Apenas nome e preço são obrigatórios!**`;
  }
  
  if (lower === 'buscar' || lower === 'procurar' || lower === 'pesquisar') {
    userState.state = 'aguardando_busca';
    return `🔍 **BUSCAR PRODUTO**\n\n📝 Digite o **nome** do produto que deseja buscar:`;
  }
  
  if (lower === 'atualizar' || lower === 'estoque' || lower === 'quantidade') {
    userState.state = 'aguardando_id_estoque';
    return `📦 **ATUALIZAR ESTOQUE**\n\n📝 Digite o **ID** do produto:`;
  }
  
  if (lower === 'ajuda' || lower === 'help' || lower === 'comandos') {
      return `🔧 **SISTEMA ADMINISTRATIVO**\n\nComandos disponíveis:\n\n` +
           `➕ **CADASTRAR** - Adicionar novo produto\n` +
           `🔍 **BUSCAR** - Procurar produtos\n` +
           `📦 **ESTOQUE** - Atualizar quantidade em estoque\n\n` +
           `💡 **Dica:** Digite o comando desejado para iniciar o fluxo guiado!`;
  }
  
  return null;
}

// ======================================================
// ✅ PROCESSAR ESTADOS DO FLUXO
// ======================================================
async function processarEstadoUsuario(message, sessionId) {
  const userState = getUserState(sessionId);
  
  switch (userState.state) {
    
    // 🔄 FLUXO DE CADASTRO SIMPLES
    case 'aguardando_dados':
      try {
        const resultado = await executarCadastro(message);
        resetUserState(sessionId);
        return resultado;
      } catch (error) {
        resetUserState(sessionId);
        return `❌ **Erro no cadastro:** ${error.message}`;
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
        return `❌ ID inválido! Digite um número válido:`;
      }
      userState.data.id = id;
      userState.state = 'aguardando_nova_quantidade';
      return `✏️ Atualizando estoque do produto ID: **${id}**\n\n📦 Digite a **nova quantidade**:`;
    
    case 'aguardando_nova_quantidade':
      const quantidade = parseInt(message);
      if (isNaN(quantidade) || quantidade < 0) {
        return `❌ Quantidade inválida! Digite um número positivo:`;
      }
      
      const resultadoEstoque = await executarAtualizacaoEstoque(userState.data.id, quantidade);
      resetUserState(sessionId);
      return resultadoEstoque;
    
    default:
      return null;
  }
}

// ======================================================
// ✅ SISTEMA GUIADO COMPLETO (para compatibilidade)
// ======================================================
function processarComandoGuiado(message) {
  const lower = message.toLowerCase();
  
  // 🔍 BUSCAR PRODUTO
  const formatoBuscar = message.match(/Produto:\s*(.+)/i);
  if (formatoBuscar && formatoBuscar[1]) {
    const termo = formatoBuscar[1].trim();
    if (termo.length > 0) {
      return { tipo: 'buscar', termo: termo };
    }
  }
  
  // ➕ CADASTRAR PRODUTO (formato antigo)
  const formatoCadastrar = message.match(/Cadastrar:\s*(.+)/i);
  if (formatoCadastrar && formatoCadastrar[1]) {
    const dados = formatoCadastrar[1].trim();
    if (dados.length > 0) {
      return { tipo: 'cadastrar', dados: dados };
    }
  }
  
  // 📦 ATUALIZAR ESTOQUE (formato antigo)
  const formatoEstoque = message.match(/Estoque:\s*ID:\s*(\d+),\s*quantidade:\s*(\d+)/i);
  if (formatoEstoque && formatoEstoque[1] && formatoEstoque[2]) {
    return { 
      tipo: 'estoque', 
      id: parseInt(formatoEstoque[1]), 
      quantidade: parseInt(formatoEstoque[2]) 
    };
  }
  
  // ❓ AJUDA GERAL
  if (lower.includes('procurar') || lower.includes('buscar') || 
      lower.includes('cadastrar') || lower.includes('adicionar') ||
      lower.includes('estoque') || lower.includes('quantidade') ||
      lower.includes('como') || lower.includes('ajuda')) {
    return { tipo: 'ajuda' };
  }
  
  return null;
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
// ✅ PROMPT DIFERENCIADO PARA ADMIN
// ======================================================
function createPromptTemplate(isAdmin = false) {
  if (isAdmin) {
    return PromptTemplate.fromTemplate(`
Você é o Cafecito, assistente especializado em cafés.

**MODO ADMIN ATIVADO** - Comandos disponíveis:

➕ CADASTRAR - Adicionar novo produto
🔍 BUSCAR - Procurar produtos  
📦 ESTOQUE - Atualizar quantidade

💡 **Formato para cadastro:**
nome, quantidade, origem, intensidade, preço, peso, descrição, data_validade, tipo

📋 **Exemplo:**
cafe baggio caramelo, 10, brasil, forte, 30.23, 250g, cafe moido com aroma de caramelo, 20/10/2028, pó

Seja direto. Máximo 2-3 frases.

Histórico:
{history}

Pergunta: {input}

Resposta admin:
`);
  }

  return PromptTemplate.fromTemplate(`
Você é o Cafecito, assistente especializado em cafés artesanais.

Seja direto e objetivo. Máximo 2-3 frases.

Histórico:
{history}

Pergunta: {input}

Resposta:
`);
}

// ======================================================
// ✅ ENDPOINT ÚNICO
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

    // 🛠️ Se for admin, processar sistema guiado MELHORADO
    if (isAdmin) {
      // 1. Primeiro tenta processar comandos simples
      const respostaSimples = processarComandoSimples(message, sessionId);
      if (respostaSimples) {
        memory.push({ role: "user", content: message });
        memory.push({ role: "assistant", content: respostaSimples });
        return res.json({ reply: respostaSimples, success: true, isAdmin: true });
      }
      
      // 2. Depois tenta processar estados em andamento
      const respostaEstado = await processarEstadoUsuario(message, sessionId);
      if (respostaEstado) {
        memory.push({ role: "user", content: message });
        memory.push({ role: "assistant", content: respostaEstado });
        return res.json({ reply: respostaEstado, success: true, isAdmin: true });
      }
      
      // 3. Por último tenta o sistema de formatos antigo (para compatibilidade)
      const comando = processarComandoGuiado(message);
      if (comando) {
        let resposta;
        switch (comando.tipo) {
          case 'buscar':
            resposta = await executarBusca(comando.termo);
            break;
          case 'cadastrar':
            resposta = await executarCadastro(comando.dados);
            break;
          case 'estoque':
            resposta = await executarAtualizacaoEstoque(comando.id, comando.quantidade);
            break;
          case 'ajuda':
            resposta = `🔧 **SISTEMA ADMINISTRATIVO**\n\nComandos disponíveis:\n\n` +
                      `➕ **CADASTRAR** - Adicionar novo produto\n` +
                      `🔍 **BUSCAR** - Procurar produtos\n` +
                      `📦 **ESTOQUE** - Atualizar quantidade em estoque\n\n` +
                      `💡 **Formato para cadastro:**\n` +
                      `nome, quantidade, origem, intensidade, preço, peso, descrição, data_validade, tipo`;
            break;
        }
        
        if (resposta) {
          memory.push({ role: "user", content: message });
          memory.push({ role: "assistant", content: resposta });
          return res.json({ reply: resposta, success: true, isAdmin: true });
        }
      }
    }

    // 💬 Chat normal com LangChain (para não-admin ou mensagens não relacionadas)
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
    console.error("❌ Erro Chatbot:", err);
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
