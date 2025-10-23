const express = require("express");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ✅ Configuração central para o modo ADMIN
const GEMINI_ADMIN_CONFIG = {
  model: "gemini-2.0-flash",
  generationConfig: {
    temperature: 0.1, // 🔥 Controla criatividade
    topP: 0.8,        // Diversidade
    maxOutputTokens: 512, // Limita tamanho da resposta
  }
};

// ======================================================
// ✅ ENDPOINT PARA CLIENTES (mantém configuração própria)
// ======================================================
router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mensagem é obrigatória" });
  }

  try {
    const prompt = `Você é um especialista em café artesanal chamado Cafecito.
Responda de forma amigável, curta e direta em português.

Pergunta: ${message}
Responda:`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    let replyText = "Desculpe, não consegui gerar uma resposta.";

    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      replyText = result.candidates[0].content.parts[0].text;
    }

    res.json({ reply: replyText, success: true });

  } catch (err) {
    console.error("❌ Erro detalhado:", err);
    res.status(500).json({
      error: "Erro interno do servidor",
      details: err.message,
      reply: "Desculpe, estou com problemas técnicos. Tente novamente em alguns instantes."
    });
  }
});


// ======================================================
// ✅ ENDPOINT PARA ADMIN (usa GEMINI_ADMIN_CONFIG)
// ======================================================
router.post("/admin", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt é obrigatório" });
  }

  try {
    const detectionPrompt = `
    Classifique o tipo de solicitação do usuário. 
    Escolha APENAS uma das opções:

    - criar_curso → quando o usuário fala em "criar", "adicionar", "cadastrar" ou "novo curso"
    - consultar_cursos → quando fala em "ver", "listar" ou "buscar cursos"
    - admin → quando menciona "estoque", "preço", "relatório" ou "funcionário"
    - outros → para qualquer outro assunto

    Prompt do usuário: "${prompt}"

    Responda apenas com: criar_curso, consultar_cursos, admin ou outros.
    `;

    const detectionResult = await ai.models.generateContent({
      ...GEMINI_ADMIN_CONFIG,
      contents: detectionPrompt,
    });

    const intent = detectionResult.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    let response;
    switch (intent) {
      case 'criar_curso':
        response = await processarCriacaoCurso(prompt);
        break;
      case 'consultar_cursos':
        response = await processarConsultaCursos(prompt);
        break;
      case 'admin':
        response = await processarAdmin(prompt);
        break;
      default:
        response = await processarGeral(prompt);
    }

    res.json(response);

  } catch (err) {
    console.error("❌ Erro Chatbot:", err);
    res.status(500).json({ error: "Erro no processamento", details: err.message });
  }
});


// ======================================================
// 🔧 Funções auxiliares — todas usam GEMINI_ADMIN_CONFIG
// ======================================================
async function processarCriacaoCurso(prompt) {
  const regexCampos = /Nivel:(.*)\nDescricao:(.*)\nDataCurso:(.*)\nDuracaoEmMinutos:(.*)\nCategoria:(.*)/i;
  const match = prompt.match(regexCampos);

  if (match) {
    const payload = {
      Nivel: match[1].trim(),
      Descricao: match[2].trim(),
      DataCurso: match[3].trim(),
      DuracaoEmMinutos: parseInt(match[4].trim(), 10),
      Categoria: match[5].trim(),
    };

    try {
      const response = await fetch("http://localhost:3000/api/cursos/novo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      return await response.json();
    } catch (err) {
      console.error("Erro ao criar curso via API:", err);
      return { success: false, error: "Falha ao criar o curso no servidor." };
    }
  }

  return {
    response_text: `
🎯 Vamos criar seu curso!
Envie as informações a seguir exatamente neste formato:

Nivel: (Iniciante | Intermediário | Avançado)
Descricao: (Nome do curso)
DataCurso: (YYYY-MM-DD HH:mm)
DuracaoEmMinutos: (Ex: 90)
Categoria: (Barista | Torra | Degustação | Outro)

💡 Exemplo:
Nivel: Iniciante
Descricao: Curso de Café Expresso
DataCurso: 2024-12-20 10:00
DuracaoEmMinutos: 90
Categoria: Barista
`,
    success: true
  };
}


async function processarConsultaCursos() {
  const result = await ai.models.generateContent({
    ...GEMINI_ADMIN_CONFIG,
    contents: "Liste todos os cursos disponíveis e seus níveis.",
  });

  const replyText = result.candidates?.[0]?.content?.parts?.[0]?.text || 
    "📚 Função de consulta de cursos em desenvolvimento...";

  return { response_text: replyText, success: true };
}


async function processarAdmin(prompt) {
  const adminPrompt = `
Você é um assistente administrativo para cafeteria.
Responda em português de forma profissional.

Tarefa: ${prompt}
Resposta:`;

  const result = await ai.models.generateContent({
    ...GEMINI_ADMIN_CONFIG,
    contents: adminPrompt,
  });

  const replyText = result.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Ação administrativa processada.";

  return { response_text: replyText, success: true };
}


async function processarGeral(prompt) {
  const geralPrompt = `
Você é um assistente geral para cafeteria.
Responda em português de forma amigável e útil.

Pergunta: ${prompt}
Resposta:`;

  const result = await ai.models.generateContent({
    ...GEMINI_ADMIN_CONFIG,
    contents: geralPrompt,
  });

  const replyText = result.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Não entendi sua solicitação. Como posso ajudar?";

  return { response_text: replyText, success: true };
}


// ======================================================
// ✅ Health check
// ======================================================
router.get("/health", (req, res) => {
  res.json({
    status: "online",
    message: "Chatbot API funcionando",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
