// assets/js/admin-cursos.js
import cursosFactory from './cursosFactory.js';

// --- ELEMENTOS DO DOM ---
const cursosTableBody = document.getElementById('cursos-table-body');
const listCursosMessage = document.getElementById('list-cursos-message');
const modal = document.getElementById('curso-modal');
const modalTitle = document.getElementById('modal-title');
const cursoForm = document.getElementById('curso-form');
const modalMessage = document.getElementById('modal-message');
const btnShowAddModal = document.getElementById('btn-show-add-modal');
const btnCloseModal = document.querySelector('.close-modal-btn');
const cursoIdInput = document.getElementById('cursoId');

/**
 * Função principal
 */
document.addEventListener('DOMContentLoaded', () => {
    carregarCursos();

    // Listeners Modal
    if (btnShowAddModal) btnShowAddModal.addEventListener('click', () => abrirModal());
    if (btnCloseModal) btnCloseModal.addEventListener('click', fecharModal);
    window.addEventListener('click', (event) => { if (event.target == modal) fecharModal(); });
    if (cursoForm) cursoForm.addEventListener('submit', handleCursoFormSubmit);
});

/**
 * Busca cursos e preenche a tabela
 */
async function carregarCursos() {
    if (!cursosTableBody) return;
    cursosTableBody.innerHTML = '<tr><td colspan="7">A carregar cursos...</td></tr>';
    setMessage(listCursosMessage); // Limpa mensagens

    try {
        const cursos = await cursosFactory.getTodosCursos();
        renderizarTabelaCursos(cursos);
    } catch (error) {
        setMessage(listCursosMessage, `Erro ao carregar cursos: ${error.message}`, 'error');
        cursosTableBody.innerHTML = '<tr><td colspan="7">Falha ao carregar.</td></tr>';
    }
}

/**
 * Renderiza a tabela de cursos
 */
function renderizarTabelaCursos(cursos) {
    if (!cursosTableBody) return;
    cursosTableBody.innerHTML = '';

    if (!cursos || cursos.length === 0) {
        cursosTableBody.innerHTML = '<tr><td colspan="7">Nenhum curso encontrado.</td></tr>';
        return;
    }

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    cursos.forEach(curso => {
        const row = cursosTableBody.insertRow();
        row.dataset.cursoId = curso.IdCurso;

        row.innerHTML = `
            <td>${curso.IdCurso}</td>
            <td>${escapeHtml(curso.Nome)}</td>
            <td>${formatCurrency(curso.Preco)}</td>
            <td>${curso.DuracaoHoras || '-'}</td>
            <td>${escapeHtml(curso.Tipo || '-')}</td>
            <td>${escapeHtml(curso.Modalidade || '-')}</td>
            <td class="actions-column">
                <button class="btn btn-secondary btn-small btn-edit" data-id="${curso.IdCurso}">Editar</button>
                <button class="btn btn-danger btn-small btn-delete" data-id="${curso.IdCurso}">Excluir</button>
            </td>
        `;

        // Add listeners
        row.querySelector('.btn-edit').addEventListener('click', handleEditCurso);
        row.querySelector('.btn-delete').addEventListener('click', handleDeleteCurso);
    });
}

/**
 * Abre o Modal (para Adicionar ou Editar)
 */
function abrirModal(curso = null) {
    if (!modal || !cursoForm) return;
    cursoForm.reset();
    setMessage(modalMessage);
    cursoIdInput.value = '';

    if (curso) {
        // Modo Edição
        modalTitle.textContent = 'Editar Curso';
        cursoIdInput.value = curso.IdCurso;
        document.getElementById('nomeCurso').value = curso.Nome || '';
        document.getElementById('precoCurso').value = curso.Preco || '';
        document.getElementById('duracaoCurso').value = curso.DuracaoHoras || '';
        document.getElementById('tipoCurso').value = curso.Tipo || '';
        document.getElementById('modalidadeCurso').value = curso.Modalidade || '';
        document.getElementById('imagemCurso').value = curso.Imagem || '';
        document.getElementById('descBasicaCurso').value = curso.DescricaoBasica || '';
        document.getElementById('descCompletaCurso').value = curso.DescricaoCompleta || '';
    } else {
        // Modo Adição
        modalTitle.textContent = 'Adicionar Novo Curso';
    }
    modal.style.display = 'block';
}

/** Fecha o Modal */
function fecharModal() { if (modal) modal.style.display = 'none'; }

/**
 * Lida com o submit do formulário do Modal (Adicionar ou Editar)
 */
async function handleCursoFormSubmit(event) {
    event.preventDefault();
    setMessage(modalMessage);

    const formData = new FormData(cursoForm);
    const dadosCurso = Object.fromEntries(formData.entries());
    const idCurso = cursoIdInput.value;

    dadosCurso.Preco = parseFloat(dadosCurso.Preco);
    dadosCurso.DuracaoHoras = dadosCurso.DuracaoHoras ? parseInt(dadosCurso.DuracaoHoras, 10) : null;
    dadosCurso.DescricaoBasica = dadosCurso.DescricaoBasica || null;
    dadosCurso.DescricaoCompleta = dadosCurso.DescricaoCompleta || null;
    dadosCurso.Tipo = dadosCurso.Tipo || null;
    dadosCurso.Modalidade = dadosCurso.Modalidade || null;
    dadosCurso.Imagem = dadosCurso.Imagem || null;


    if (!dadosCurso.Nome || isNaN(dadosCurso.Preco) || dadosCurso.Preco < 0) {
        setMessage(modalMessage, 'Nome e Preço válido (>=0) são obrigatórios.', 'error');
        return;
    }

    try {
        let cursoSalvo;
        if (idCurso) {
            cursoSalvo = await cursosFactory.atualizarCurso(idCurso, dadosCurso);
            setMessage(listCursosMessage, `Curso "${escapeHtml(cursoSalvo.Nome)}" atualizado!`, 'success');
        } else {
            cursoSalvo = await cursosFactory.criarCurso(dadosCurso);
            setMessage(listCursosMessage, `Curso "${escapeHtml(cursoSalvo.Nome)}" adicionado!`, 'success');
        }
        fecharModal();
        setTimeout(carregarCursos, 500);
    } catch (error) {
        setMessage(modalMessage, `Erro ao salvar: ${error.message}`, 'error');
    }
}

/**
 * Lida com o clique no botão Editar
 */
async function handleEditCurso(event) {
    const cursoId = event.target.dataset.id;
    setMessage(listCursosMessage);
    try {
        const curso = await cursosFactory.getCursoPorId(cursoId);
        if (curso) abrirModal(curso);
        else setMessage(listCursosMessage, 'Não foi possível carregar dados do curso.', 'error');
    } catch (error) {
         setMessage(listCursosMessage, `Erro ao buscar curso: ${error.message}`, 'error');
    }
}

/**
 * Lida com o clique no botão Excluir
 */
async function handleDeleteCurso(event) {
    const cursoId = event.target.dataset.id;
    const cursoName = event.target.closest('tr').cells[1].textContent;

    if (confirm(`Tem a certeza que deseja excluir o curso "${escapeHtml(cursoName)}" (ID: ${cursoId})?`)) {
        setMessage(listCursosMessage);
        try {
            await cursosFactory.excluirCurso(cursoId);
            setMessage(listCursosMessage, `Curso "${escapeHtml(cursoName)}" excluído.`, 'success');
            setTimeout(carregarCursos, 1500);
        } catch (error) {
             setMessage(listCursosMessage, `Erro ao excluir: ${error.message}`, 'error');
        }
    } else {
        console.log("Exclusão cancelada.");
    }
}

// --- Funções Auxiliares (DEFINIDAS APENAS UMA VEZ) ---
function setMessage(element, text = '', type = '') {
    if (!element) return;
    element.textContent = text;
    // Garante que a classe base 'message' sempre exista
    element.className = 'message';
    if (type) {
        element.classList.add(type); // Adiciona 'success' ou 'error'
    }
    // Mostra a mensagem (se CSS estiver a esconder por padrão)
    element.style.display = text ? 'block' : 'none';
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}