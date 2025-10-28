// ====================================================
// ESTADO GLOBAL
// ====================================================
let currentUser = null;
let GEMINI_ENDPOINT = "/api/chatbot";

// ====================================================
// FUNÇÃO PARA DEFINIR USUÁRIO
// ====================================================
function setUser(user) {
    currentUser = user;
    console.log("Usuário logado:", currentUser);

    // Atualizar interface
    updateAuthButtons();
    
    // Fechar modal
    closeModal();

    GEMINI_ENDPOINT = "/api/chatbot";
   
}

// Atualizar botões de autenticação
function updateAuthButtons() {
    const authButtons = document.querySelector('.auth-buttons');
    if (currentUser) {
        authButtons.innerHTML = `
            <span class="text-amber-700 mr-4 px-6 py-3">  Olá, ${currentUser.nome}</span>
            <a href="#" class="btn btn-logout" onclick="logout()">Sair</a>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="#" class="btn btn-login">Login</a>
            <a href="#" class="btn btn-cadastro">Cadastro</a>
        `;
        // Re-adicionar event listeners
        document.querySelector('.btn-login').addEventListener('click', () => {
            modal.classList.add("show");
            showLogin();
        });
        document.querySelector('.btn-cadastro').addEventListener('click', () => {
            modal.classList.add("show");
            showRegister();
        });
    }
}

// Logout
function logout() {
    // Zera o estado global
    currentUser = null;
    GEMINI_ENDPOINT = "/api/chatbot";

    // Remove dados do localStorage
    localStorage.clear(); // limpa tudo (token, user, etc.)

    // Atualiza interface de autenticação
    updateAuthButtons();

    // Limpa o chat
    const chatBox = document.getElementById("chat-box");
    if (chatBox) chatBox.innerHTML = ""; // remove todas as mensagens

    alert('Logout realizado com sucesso!');

    // Recarrega a página para resetar qualquer estado
    location.reload();
}

// ====================================================
// MODAL LOGIN / CADASTRO
// ====================================================
const modal = document.getElementById("formModal");

// Abrir modal de login
document.querySelector(".btn-login").addEventListener("click", () => {
    modal.classList.add("show");
    showLogin();
});

// Abrir modal de cadastro
document.querySelector(".btn-cadastro").addEventListener("click", () => {
    modal.classList.add("show");
    showRegister();
});

// Fechar modal
function closeModal() {
    modal.classList.remove("show");
}

// Alternar entre login e cadastro
function showLogin() {
    document.getElementById("login").style.display = "block";
    document.getElementById("register").style.display = "none";
}

function showRegister() {
    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "block";
}

// Fecha modal ao clicar fora da caixa de formulário
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// ====================================================
// FORMULÁRIOS LOGIN / CADASTRO
// ====================================================
document.getElementById("formLogin").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("txt_emailLogin").value;
    const senha = document.getElementById("txt_senhaLogin").value;

    try {
        const res = await fetch("/api/usuarios/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha }),
        });
        const data = await res.json();
        
        if (data.success) {
            // Armazenar token no localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
        } else {
            alert(data.error || "Falha no login");
        }
    } catch (err) {
        console.error(err);
        alert("Erro de conexão. Tente novamente.");
    }
});

document.getElementById("formCadastro").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("txt_nome").value;
    const email = document.getElementById("txt_email").value;
    const senha = document.getElementById("txt_senha").value;
    const confSenha = document.getElementById("txt_senhaConfirmar").value;

    if (senha !== confSenha) {
        alert("Senhas não conferem!");
        return;
    }

    try {
        const res = await fetch("/api/usuarios/cadastro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, senha }),
        });
        const data = await res.json();
        
        if (data.success) {
            // ✅ APENAS MOSTRA MENSAGEM E VAI PARA O LOGIN
            alert('Cadastro realizado com sucesso! Faça login para continuar.');
            
            // Limpa os campos do cadastro
            document.getElementById("txt_nome").value = '';
            document.getElementById("txt_email").value = '';
            document.getElementById("txt_senha").value = '';
            document.getElementById("txt_senhaConfirmar").value = '';
            
            // Vai para a tela de login
            showLogin();
            
        } else {
            alert(data.error || "Falha no cadastro");
        }
    } catch (err) {
        console.error(err);
        alert("Erro de conexão. Tente novamente.");
    }
});

// ====================================================
// VERIFICAR USUÁRIO AO CARREGAR A PÁGINA
// ====================================================
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
        try {
            const user = JSON.parse(userData);
            setUser(user);
        } catch (err) {
            console.error('Erro ao recuperar dados do usuário:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
});

// ====================================================
// CHAT CAFECITO
// ====================================================
const chatWidget = document.getElementById("chat-widget");
const toggleBtn = document.getElementById("chat-toggle");
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

toggleBtn.addEventListener("click", () => chatWidget.classList.toggle("hidden"));
input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    const userMessage = input.value.trim();
    if (!userMessage) return;

    appendMessage("Você", userMessage);
    input.value = "";
    input.disabled = true;
    getBotResponse(userMessage);
}

async function getBotResponse(userMessage) {
    const loadingMsgId = Date.now();
    appendLoadingMessage(loadingMsgId);

    try {
        // Adicionar token de autenticação se existir
        const headers = { "Content-Type": "application/json" };
        const token = localStorage.getItem('token');
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(GEMINI_ENDPOINT, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({ message: userMessage }),
        });
        
        const data = await response.json();
        removeLoadingMessage(loadingMsgId);

        if (response.ok && data.reply) {
            appendMessage("Cafecito", data.reply);
        } else {
            appendMessage("Cafecito", `❌ Erro: ${data.error || "desconhecido"}`);
        }
    } catch (err) {
        removeLoadingMessage(loadingMsgId);
        console.error(err);
        appendMessage("Cafecito", "⚠️ Erro de rede. Tente novamente.");
    } finally {
        input.disabled = false;
        input.focus();
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function appendLoadingMessage(id) {
    const msg = document.createElement("div");
    msg.id = "loading-" + id;
    msg.className = "text-left mb-1";
    msg.innerHTML = `<div class="inline-block px-3 py-2 rounded-lg bg-gray-200 text-gray-800 italic"><strong>Cafecito</strong>: Digitando...</div>`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeLoadingMessage(id) {
    const loadingMsg = document.getElementById("loading-" + id);
    if (loadingMsg) loadingMsg.remove();
}

function appendMessage(sender, message) {
    const isUser = sender === "Você";
    const msg = document.createElement("div");
    const userClasses = "bg-amber-700 text-white";
    const botClasses = "bg-gray-200 text-gray-800";

    msg.className = (isUser ? "text-right" : "text-left") + " mb-2";
    
    // ✅ Adicionar whitespace-pre-line para manter quebras de linha
    msg.innerHTML = `<div class="inline-block max-w-[80%] px-3 py-2 rounded-lg shadow-sm whitespace-pre-line ${
        isUser ? userClasses : botClasses
    }">${isUser ? "" : "<strong>Cafecito</strong>: "}${message}</div>`;

    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ====================================================
// AJUSTE DE IFRAME
// ====================================================
const iframe = document.querySelector('iframe[name="conteudo"]');
function ajustarAlturaIframe() {
    try {
        const alturaConteudo = iframe.contentWindow.document.body.scrollHeight;
        if (alturaConteudo > 0) iframe.style.height = alturaConteudo + 30 + "px";
    } catch (e) {
        console.warn("Não foi possível ajustar altura do iframe:", e);
    }
}

if (iframe) {
    iframe.onload = ajustarAlturaIframe;
    setInterval(ajustarAlturaIframe, 1000);
}