// assets/js/admin-receitas.js
import receitasFactory from './receitasFactory.js'; // Usa a fábrica de receitas

// --- ELEMENTOS DO DOM ---
const receitasTableBody = document.getElementById('receitas-table-body');
const listReceitasMessage = document.getElementById('list-receitas-message');
const modal = document.getElementById('receita-modal');
const modalTitle = document.getElementById('modal-title');
const receitaForm = document.getElementById('receita-form');
const modalMessage = document.getElementById('modal-message');
const btnShowAddModal = document.getElementById('btn-show-add-modal');
const btnCloseModal = document.querySelector('.close-modal-btn');
const receitaIdInput = document.getElementById('receitaId');

/**
 * Função principal
 */
document.addEventListener('DOMContentLoaded', () => {
    carregarReceitas();

    // Listeners Modal
    if (btnShowAddModal) btnShowAddModal.addEventListener('click', () => abrirModal());
    if (btnCloseModal) btnCloseModal.addEventListener('click', fecharModal);
    window.addEventListener('click', (event) => { if (event.target == modal) fecharModal(); });
    if (receitaForm) receitaForm.addEventListener('submit', handleReceitaFormSubmit);
});

/**
 * Busca receitas e preenche a tabela
 */
async function carregarReceitas() {
    if (!receitasTableBody) return;
    receitasTableBody.innerHTML = '<tr><td colspan="6">A carregar receitas...</td></tr>';
    setMessage(listReceitasMessage);

    try {
        const receitas = await receitasFactory.getTodasReceitas();
        renderizarTabelaReceitas(receitas);
    } catch (error) {
        setMessage(listReceitasMessage, `Erro ao carregar receitas: ${error.message}`, 'error');
        receitasTableBody.innerHTML = '<tr><td colspan="6">Falha ao carregar.</td></tr>';
    }
}

/**
 * Renderiza a tabela de receitas
 */
function renderizarTabelaReceitas(receitas) {
    if (!receitasTableBody) return;
    receitasTableBody.innerHTML = '';

    if (!receitas || receitas.length === 0) {
        receitasTableBody.innerHTML = '<tr><td colspan="6">Nenhuma receita encontrada.</td></tr>';
        return;
    }

    receitas.forEach(rec => {
        const row = receitasTableBody.insertRow();
        row.dataset.receitaId = rec.IdReceita;

        row.innerHTML = `
            <td>${rec.IdReceita}</td>
            <td>${escapeHtml(rec.Nome)}</td>
            <td>${escapeHtml(rec.Tipo || '-')}</td>
            <td>${escapeHtml(rec.Dificuldade || '-')}</td>
            <td>${rec.TempoPreparoMin || '-'}</td>
            <td class="actions-column">
                <button class="btn btn-secondary btn-small btn-edit" data-id="${rec.IdReceita}">Editar</button>
                <button class="btn btn-danger btn-small btn-delete" data-id="${rec.IdReceita}">Excluir</button>
            </td>
        `;

        // Add listeners
        row.querySelector('.btn-edit').addEventListener('click', handleEditReceita);
        row.querySelector('.btn-delete').addEventListener('click', handleDeleteReceita);
    });
}

/**
 * Abre o Modal (para Adicionar ou Editar)
 */
function abrirModal(receita = null) {
    if (!modal || !receitaForm) return;
    receitaForm.reset();
    setMessage(modalMessage);
    receitaIdInput.value = '';

    if (receita) {
        // Modo Edição
        modalTitle.textContent = 'Editar Receita';
        receitaIdInput.value = receita.IdReceita;
        document.getElementById('nomeReceita').value = receita.Nome || '';
        document.getElementById('tipoReceita').value = receita.Tipo || '';
        document.getElementById('dificuldadeReceita').value = receita.Dificuldade || '';
        document.getElementById('tempoReceita').value = receita.TempoPreparoMin || '';
        document.getElementById('imagemReceita').value = receita.ImagemURL || '';
        document.getElementById('descReceita').value = receita.Descricao || '';
        document.getElementById('ingredientesReceita').value = receita.Ingredientes || '';
        document.getElementById('preparoReceita').value = receita.ModoPreparo || '';
    } else {
        // Modo Adição
        modalTitle.textContent = 'Adicionar Nova Receita';
    }
    modal.style.display = 'block';
}

/** Fecha o Modal */
function fecharModal() { if (modal) modal.style.display = 'none'; }

/**
 * Lida com o submit do formulário do Modal (Adicionar ou Editar)
 */
async function handleReceitaFormSubmit(event) {
    event.preventDefault();
    setMessage(modalMessage);

    const formData = new FormData(receitaForm);
    const dadosReceita = Object.fromEntries(formData.entries());
    const idReceita = receitaIdInput.value;

    // Converte/Trata campos
    dadosReceita.TempoPreparoMin = dadosReceita.TempoPreparoMin ? parseInt(dadosReceita.TempoPreparoMin, 10) : null;
    // Garante que campos vazios opcionais sejam null
    dadosReceita.Descricao = dadosReceita.Descricao || null;
    dadosReceita.Ingredientes = dadosReceita.Ingredientes || null;
    dadosReceita.ModoPreparo = dadosReceita.ModoPreparo || null;
    dadosReceita.ImagemURL = dadosReceita.ImagemURL || null;
    dadosReceita.Dificuldade = dadosReceita.Dificuldade || null;


    if (!dadosReceita.Nome || !dadosReceita.Tipo) {
        setMessage(modalMessage, 'Nome e Tipo são obrigatórios.', 'error');
        return;
    }

    try {
        let receitaSalva;
        if (idReceita) {
            receitaSalva = await receitasFactory.atualizarReceita(idReceita, dadosReceita);
            setMessage(listReceitasMessage, `Receita "${escapeHtml(receitaSalva.Nome)}" atualizada!`, 'success');
        } else {
            receitaSalva = await receitasFactory.criarReceita(dadosReceita);
            setMessage(listReceitasMessage, `Receita "${escapeHtml(receitaSalva.Nome)}" adicionada!`, 'success');
        }
        fecharModal();
        setTimeout(carregarReceitas, 500); // Recarrega após delay
    } catch (error) {
        setMessage(modalMessage, `Erro ao salvar: ${error.message}`, 'error');
    }
}

/**
 * Lida com o clique no botão Editar
 */
async function handleEditReceita(event) {
    const receitaId = event.target.dataset.id;
    setMessage(listReceitasMessage);
    try {
        const receita = await receitasFactory.getReceitaPorId(receitaId);
        if (receita) abrirModal(receita);
        else setMessage(listReceitasMessage, 'Não foi possível carregar dados da receita.', 'error');
    } catch (error) {
         setMessage(listReceitasMessage, `Erro ao buscar receita: ${error.message}`, 'error');
    }
}

/**
 * Lida com o clique no botão Excluir
 */
async function handleDeleteReceita(event) {
    const receitaId = event.target.dataset.id;
    const receitaName = event.target.closest('tr').cells[1].textContent;

    if (confirm(`Tem a certeza que deseja excluir a receita "${escapeHtml(receitaName)}" (ID: ${receitaId})?`)) {
        setMessage(listReceitasMessage);
        try {
            await receitasFactory.excluirReceita(receitaId);
            setMessage(listReceitasMessage, `Receita "${escapeHtml(receitaName)}" excluída.`, 'success');
            setTimeout(carregarReceitas, 1500); // Delay para ver a msg
        } catch (error) {
             setMessage(listReceitasMessage, `Erro ao excluir: ${error.message}`, 'error');
        }
    } else {
        console.log("Exclusão cancelada.");
    }
}

// --- Funções Auxiliares ---
function setMessage(element, text = '', type = '') {
    if (!element) return;
    element.textContent = text;
    element.className = 'message';
    if (type) element.classList.add(type);
    element.style.display = text ? 'block' : 'none';
}
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}