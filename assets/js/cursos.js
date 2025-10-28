// assets/js/cursos.js
import cursosFactory from './cursosFactory.js'; 

// --- NOVAS VARIÁVEIS GLOBAIS ---
let todosOsCursos = []; // Guarda a lista completa
let filtrosAtivos = {
    tipo: [],
    modalidade: []
};

// --- ELEMENTOS DO DOM (ATUALIZADOS) ---
const container = document.getElementById('cursos-container'); // Este agora é o .cursos-grid
const loadingMessage = document.getElementById('loading-message-cursos');
// Novos elementos do filtro
const filtroTipoContainer = document.getElementById('filtro-tipo-curso');
const filtroModalidadeContainer = document.getElementById('filtro-modalidade-curso');

/**
 * Função principal (ATUALIZADA)
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Busca os cursos e armazena na variável global
    todosOsCursos = await cursosFactory.getTodosCursos();

    if (todosOsCursos.length === 0) {
        loadingMessage.innerText = 'Falha ao carregar cursos. Tente novamente mais tarde.';
        return;
    }
    
    loadingMessage.style.display = 'none';

    // 2. NOVAS FUNÇÕES: Gerar os filtros e renderizar
    gerarFiltrosDinamicos(todosOsCursos);
    renderizarCursos(todosOsCursos); // Renderiza todos pela primeira vez
});


// --- NOVA FUNÇÃO: Gerar Filtros ---
/**
 * Pega a lista de cursos e cria os checkboxes de filtro
 */
function gerarFiltrosDinamicos(cursos) {
    // Extrai valores únicos
    const tipos = [...new Set(cursos.map(c => c.Tipo).filter(Boolean))];
    const modalidades = [...new Set(cursos.map(c => c.Modalidade).filter(Boolean))];

    // Função auxiliar (copiada do catalogo.js)
    const criarCheckboxes = (container, listaItens, grupoFiltro) => {
        if (!container) return; // Segurança
        listaItens.sort().forEach(item => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.value = item;
            input.dataset.grupo = grupoFiltro;
            
            // Adiciona o listener que chama aplicarFiltros
            input.addEventListener('change', aplicarFiltros);

            label.appendChild(input);
            label.appendChild(document.createTextNode(` ${item}`));
            container.appendChild(label);
        });
    };

    // Cria os checkboxes para cada grupo
    criarCheckboxes(filtroTipoContainer, tipos, 'tipo');
    criarCheckboxes(filtroModalidadeContainer, modalidades, 'modalidade');
}

// --- NOVA FUNÇÃO: Aplicar Filtros ---
/**
 * Chamado toda vez que um checkbox de filtro é clicado
 */
function aplicarFiltros() {
    // 1. Atualiza o objeto 'filtrosAtivos'
    filtrosAtivos = {
        tipo: [],
        modalidade: []
    };

    const checkboxesMarcados = document.querySelectorAll('.filtro-grupo input[type="checkbox"]:checked');
    
    checkboxesMarcados.forEach(check => {
        const grupo = check.dataset.grupo; // 'tipo' ou 'modalidade'
        const valor = check.value;
        if (filtrosAtivos[grupo]) {
            filtrosAtivos[grupo].push(valor);
        }
    });

    // 2. Filtra a lista 'todosOsCursos'
    let cursosFiltrados = todosOsCursos.filter(curso => {
        const passaTipo = filtrosAtivos.tipo.length === 0 || filtrosAtivos.tipo.includes(curso.Tipo);
        const passaModalidade = filtrosAtivos.modalidade.length === 0 || filtrosAtivos.modalidade.includes(curso.Modalidade);

        return passaTipo && passaModalidade;
    });

    // 3. Renderiza apenas os cursos filtrados
    renderizarCursos(cursosFiltrados);
}


/**
 * Recebe uma lista de cursos e os desenha na tela
 * (Função principal ATUALIZADA)
 */
function renderizarCursos(cursos) {
    container.innerHTML = ''; // Limpa o grid

    // --- NOVO: Mensagem se o filtro não retornar nada ---
    if (cursos.length === 0) {
        container.innerHTML = '<p class="nenhum-curso">Nenhum curso encontrado com estes filtros.</p>';
        return;
    }

    cursos.forEach(curso => {
        const card = document.createElement('div');
        card.className = 'curso-card';
        
        // Formatações (código existente)
        const precoFormatado = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(curso.Preco);
        const imagemSrc = curso.Imagem || '../assets/images/cafe-placeholder.jpg'; 

        // Monta o HTML (código existente)
        card.innerHTML = `
            <a href="curso-detalhe.html?id=${curso.IdCurso}" class="curso-link-imagem">
                <img src="${imagemSrc}" alt="${curso.Nome}">
            </a>
            <div class="curso-info">
                <a href="curso-detalhe.html?id=${curso.IdCurso}" class="curso-link-titulo">
                    <h3>${curso.Nome}</h3>
                </a>

                <p class="curso-descricao-basica">${curso.DescricaoBasica || 'Descrição não disponível.'}</p>
                
                <div class="curso-meta">
                    <span class="duracao">
                        <i class="fas fa-clock"></i> ${curso.DuracaoHoras || 'N/A'} horas
                    </span>
                    <span class="modalidade">${curso.Modalidade || 'N/A'}</span>
                </div>

                <div class="curso-footer">
                    <span class="curso-preco">${precoFormatado}</span>
                    <a href="curso-detalhe.html?id=${curso.IdCurso}" class="curso-btn-detalhes">
                        Ver detalhes
                    </a>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}