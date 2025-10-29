// assets/js/admin-usuarios.js
import adminUserFactory from './adminUserFactory.js';

// --- ELEMENTOS DO DOM ---
const addUserForm = document.getElementById('add-user-form');
const usersTableBody = document.getElementById('users-table-body');
const addUserMessage = document.getElementById('add-user-message');
const listUsersMessage = document.getElementById('list-users-message');

/**
 * Função principal - Carrega os utilizadores ao iniciar
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Carregado. A iniciar admin-usuarios.js"); // <-- LOG 1
    carregarUsuarios();

    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUserSubmit);
    }
});

/**
 * Busca utilizadores na API e preenche a tabela
 */
async function carregarUsuarios() {
    console.log("A iniciar carregarUsuarios()..."); // <-- LOG 2
    if (!usersTableBody) {
        console.error("ERRO: Elemento usersTableBody não encontrado!"); // <-- LOG ERRO
        return;
    }

    usersTableBody.innerHTML = '<tr><td colspan="6">A carregar utilizadores...</td></tr>';
    setMessage(listUsersMessage);

    try {
        console.log("A chamar adminUserFactory.getTodosUsuarios()..."); // <-- LOG 3
        const usuarios = await adminUserFactory.getTodosUsuarios();
        console.log("Utilizadores recebidos da API:", usuarios); // <-- LOG 4 (Verifica os dados)

        renderizarTabelaUsuarios(usuarios);

    } catch (error) {
        console.error("ERRO ao carregar utilizadores:", error); // <-- LOG ERRO
        setMessage(listUsersMessage, `Erro ao carregar utilizadores: ${error.message}`, 'error');
        if (usersTableBody) { // Verifica novamente antes de alterar
             usersTableBody.innerHTML = '<tr><td colspan="6">Falha ao carregar. Tente novamente.</td></tr>';
        }
    }
}

/**
 * Preenche a tabela HTML com os dados dos utilizadores
 */
function renderizarTabelaUsuarios(usuarios) {
    console.log("A iniciar renderizarTabelaUsuarios()..."); // <-- LOG 5
    if (!usersTableBody) return;
    usersTableBody.innerHTML = '';

    if (!usuarios || usuarios.length === 0) { // Verifica se usuarios é nulo ou array vazio
        console.log("Nenhum utilizador para renderizar."); // <-- LOG 6
        usersTableBody.innerHTML = '<tr><td colspan="6">Nenhum utilizador encontrado.</td></tr>';
        return;
    }

    console.log(`A renderizar ${usuarios.length} utilizadores.`); // <-- LOG 7
    usuarios.forEach(user => {
        // ... (código existente para criar a linha da tabela) ...
         const row = usersTableBody.insertRow();
        row.dataset.userId = user.Id;

        const adminIcon = user.IsAdmin ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-times-circle"></i>';
        const assinanteIcon = user.IsAssinante ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-times-circle"></i>';

        row.innerHTML = `
            <td>${user.Id}</td>
            <td>${escapeHtml(user.Nome)}</td>
            <td>${escapeHtml(user.Email)}</td>
            <td>${adminIcon}</td>
            <td>${assinanteIcon}</td>
            <td>
                <button class="btn btn-secondary btn-small btn-edit" data-id="${user.Id}">Editar</button>
                <button class="btn btn-danger btn-small btn-delete" data-id="${user.Id}">Excluir</button>
                </td>
        `;

        row.querySelector('.btn-edit').addEventListener('click', handleEditUser);
        row.querySelector('.btn-delete').addEventListener('click', handleDeleteUser);
    });
    console.log("Renderização da tabela concluída."); // <-- LOG 8
}

// --- Funções handleAddUserSubmit, handleEditUser, handleDeleteUser, setMessage, escapeHtml ---
// Mantenha as outras funções como estavam


// Exemplo de como handleAddUserSubmit ficaria (sem alterações, apenas para contexto)
async function handleAddUserSubmit(event) {
    event.preventDefault();
    setMessage(addUserMessage);
    const formData = new FormData(addUserForm);
    const dadosUsuario = Object.fromEntries(formData.entries());
    dadosUsuario.IsAdmin = addUserForm.querySelector('#isAdmin').checked ? 1 : 0;
    dadosUsuario.IsAssinante = addUserForm.querySelector('#isAssinante').checked ? 1 : 0;

    if (!dadosUsuario.Nome || !dadosUsuario.Email || !dadosUsuario.Senha) {
         setMessage(addUserMessage, 'Por favor, preencha Nome, Email e Senha.', 'error');
         return;
    }
    try {
        const novoUsuario = await adminUserFactory.adicionarUsuario(dadosUsuario);
        setMessage(addUserMessage, `Utilizador "${escapeHtml(novoUsuario.Nome)}" adicionado com sucesso!`, 'success');
        addUserForm.reset();
        carregarUsuarios();
    } catch (error) {
        setMessage(addUserMessage, `Erro ao adicionar: ${error.message}`, 'error');
    }
}

// Mantenha as outras funções handleEditUser, handleDeleteUser, setMessage, escapeHtml como estavam
function handleEditUser(event) {
    const userId = event.target.dataset.id;
    alert(`Editar Utilizador ID: ${userId} (Funcionalidade de Modal pendente)`);
}

async function handleDeleteUser(event) {
    const userId = event.target.dataset.id;
    const userName = event.target.closest('tr').cells[1].textContent;
    if (confirm(`Tem a certeza que deseja excluir o utilizador "${escapeHtml(userName)}" (ID: ${userId})? Esta ação não pode ser desfeita.`)) {
        setMessage(listUsersMessage);
        try {
            await adminUserFactory.excluirUsuario(userId);
            setMessage(listUsersMessage, `Utilizador "${escapeHtml(userName)}" excluído com sucesso.`, 'success');
            carregarUsuarios();
        } catch (error) {
             setMessage(listUsersMessage, `Erro ao excluir: ${error.message}`, 'error');
        }
    }
}

function setMessage(element, text = '', type = '') {
    if (!element) return;
    element.textContent = text;
    element.className = `message ${type}`;
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}