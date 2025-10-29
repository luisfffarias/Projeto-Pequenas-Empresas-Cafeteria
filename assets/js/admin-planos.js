// assets/js/admin-planos.js
import planosFactory from './planosFactory.js'; // Usa a fábrica de planos

// --- ELEMENTOS DO DOM ---
const planosTableBody = document.getElementById('planos-table-body');
const listPlanosMessage = document.getElementById('list-planos-message');
const modal = document.getElementById('plano-modal');
const modalTitle = document.getElementById('modal-title');
const planoForm = document.getElementById('plano-form');
const modalMessage = document.getElementById('modal-message');
const btnShowAddModal = document.getElementById('btn-show-add-modal');
const btnCloseModal = document.querySelector('.close-modal-btn');
const planoIdInput = document.getElementById('planoId');

/**
 * Função principal
 */
document.addEventListener('DOMContentLoaded', () => {
    carregarPlanos();

    // Listeners Modal
    if (btnShowAddModal) btnShowAddModal.addEventListener('click', () => abrirModal());
    if (btnCloseModal) btnCloseModal.addEventListener('click', fecharModal);
    window.addEventListener('click', (event) => { if (event.target == modal) fecharModal(); });
    if (planoForm) planoForm.addEventListener('submit', handlePlanoFormSubmit);
});

/**
 * Busca planos e preenche a tabela
 */
async function carregarPlanos() {
    if (!planosTableBody) return;
    planosTableBody.innerHTML = '<tr><td colspan="6">A carregar planos...</td></tr>';
    setMessage(listPlanosMessage);

    try {
        const planos = await planosFactory.getTodosPlanos();
        renderizarTabelaPlanos(planos);
    } catch (error) {
        setMessage(listPlanosMessage, `Erro ao carregar planos: ${error.message}`, 'error');
        planosTableBody.innerHTML = '<tr><td colspan="6">Falha ao carregar.</td></tr>';
    }
}

/**
 * Renderiza a tabela de planos
 */
function renderizarTabelaPlanos(planos) {
    if (!planosTableBody) return;
    planosTableBody.innerHTML = '';

    if (!planos || planos.length === 0) {
        planosTableBody.innerHTML = '<tr><td colspan="6">Nenhum plano encontrado.</td></tr>';
        return;
    }

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    planos.forEach(plano => {
        const row = planosTableBody.insertRow();
        row.dataset.planoId = plano.IdPlano;

        row.innerHTML = `
            <td>${plano.IdPlano}</td>
            <td>${escapeHtml(plano.Nome)}</td>
            <td>${formatCurrency(plano.Preco)}</td>
            <td>${escapeHtml(plano.Tipo || '-')}</td>
            <td>${escapeHtml(plano.Modalidade || '-')}</td>
            <td class="actions-column">
                <button class="btn btn-secondary btn-small btn-edit" data-id="${plano.IdPlano}">Editar</button>
                <button class="btn btn-danger btn-small btn-delete" data-id="${plano.IdPlano}">Excluir</button>
            </td>
        `;

        // Add listeners
        row.querySelector('.btn-edit').addEventListener('click', handleEditPlano);
        row.querySelector('.btn-delete').addEventListener('click', handleDeletePlano);
    });
}

/**
 * Abre o Modal (para Adicionar ou Editar)
 */
function abrirModal(plano = null) {
    if (!modal || !planoForm) return;
    planoForm.reset();
    setMessage(modalMessage);
    planoIdInput.value = '';

    if (plano) {
        // Modo Edição
        modalTitle.textContent = 'Editar Plano';
        planoIdInput.value = plano.IdPlano;
        document.getElementById('nomePlano').value = plano.Nome || '';
        document.getElementById('precoPlano').value = plano.Preco || '';
        document.getElementById('tipoPlano').value = plano.Tipo || '';
        document.getElementById('modalidadePlano').value = plano.Modalidade || '';
        document.getElementById('imagemPlano').value = plano.Imagem || ''; // Campo Imagem
        document.getElementById('descricaoPlano').value = plano.Descricao || '';
    } else {
        // Modo Adição
        modalTitle.textContent = 'Adicionar Novo Plano';
    }
    modal.style.display = 'block';
}

/** Fecha o Modal */
function fecharModal() { if (modal) modal.style.display = 'none'; }

/**
 * Lida com o submit do formulário do Modal (Adicionar ou Editar)
 */
async function handlePlanoFormSubmit(event) {
    event.preventDefault();
    setMessage(modalMessage);

    const formData = new FormData(planoForm);
    const dadosPlano = Object.fromEntries(formData.entries());
    const idPlano = planoIdInput.value;

    dadosPlano.Preco = parseFloat(dadosPlano.Preco);
    // Garante que campos vazios opcionais sejam null
    dadosPlano.Descricao = dadosPlano.Descricao || null;
    dadosPlano.Tipo = dadosPlano.Tipo || null;
    dadosPlano.Modalidade = dadosPlano.Modalidade || null;
    dadosPlano.Imagem = dadosPlano.Imagem || null; // Campo Imagem


    if (!dadosPlano.Nome || isNaN(dadosPlano.Preco) || dadosPlano.Preco < 0) {
        setMessage(modalMessage, 'Nome e Preço válido (>=0) são obrigatórios.', 'error');
        return;
    }

    try {
        let planoSalvo;
        if (idPlano) {
            planoSalvo = await planosFactory.atualizarPlano(idPlano, dadosPlano);
            setMessage(listPlanosMessage, `Plano "${escapeHtml(planoSalvo.Nome)}" atualizado!`, 'success');
        } else {
            planoSalvo = await planosFactory.criarPlano(dadosPlano);
            setMessage(listPlanosMessage, `Plano "${escapeHtml(planoSalvo.Nome)}" adicionado!`, 'success');
        }
        fecharModal();
        setTimeout(carregarPlanos, 500); // Recarrega após delay
    } catch (error) {
        setMessage(modalMessage, `Erro ao salvar: ${error.message}`, 'error');
    }
}

/**
 * Lida com o clique no botão Editar
 */
async function handleEditPlano(event) {
    const planoId = event.target.dataset.id;
    setMessage(listPlanosMessage);
    try {
        const plano = await planosFactory.getPlanoPorId(planoId);
        if (plano) abrirModal(plano);
        else setMessage(listPlanosMessage, 'Não foi possível carregar dados do plano.', 'error');
    } catch (error) {
         setMessage(listPlanosMessage, `Erro ao buscar plano: ${error.message}`, 'error');
    }
}

/**
 * Lida com o clique no botão Excluir
 */
async function handleDeletePlano(event) {
    const planoId = event.target.dataset.id;
    const planoName = event.target.closest('tr').cells[1].textContent;

    if (confirm(`Tem a certeza que deseja excluir o plano "${escapeHtml(planoName)}" (ID: ${planoId})?`)) {
        setMessage(listPlanosMessage);
        try {
            await planosFactory.excluirPlano(planoId);
            setMessage(listPlanosMessage, `Plano "${escapeHtml(planoName)}" excluído.`, 'success');
            setTimeout(carregarPlanos, 1500); // Delay para ver a msg
        } catch (error) {
             setMessage(listPlanosMessage, `Erro ao excluir: ${error.message}`, 'error');
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