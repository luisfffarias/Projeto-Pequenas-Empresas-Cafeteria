// assets/js/receitas.js
import receitasFactory from './receitasFactory.js';

// --- VARIÁVEIS GLOBAIS ---
let todasAsReceitas = [];
let receitasFiltradas = [];
let receitasVisiveis = 0;
const receitasPorPagina = 5;
let filtrosAtivos = { tipo: [], dificuldade: [] };

// --- ELEMENTOS DO DOM ---
const container = document.getElementById('receitas-container');
const loadingMessage = document.getElementById('loading-message-receitas');
const loadMoreBtn = document.getElementById('load-more-btn'); // Pega o botão do HTML
const filtroTipoContainer = document.getElementById('filtro-tipo-receita');
const filtroDificuldadeContainer = document.getElementById('filtro-dificuldade-receita');

/**
 * Função principal
 */
document.addEventListener('DOMContentLoaded', async () => {
    todasAsReceitas = await receitasFactory.getTodasReceitas();

    if (todasAsReceitas.length === 0) {
        if(loadingMessage) loadingMessage.innerText = 'Nenhuma receita encontrada no momento.';
        if(loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }

    if(loadingMessage) loadingMessage.style.display = 'none';

    gerarFiltrosDinamicos(todasAsReceitas);

    // Adiciona o listener ao botão DEPOIS que ele existe no DOM
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', mostrarProximasReceitas);
        // Garante que o botão está inicialmente escondido até sabermos se há mais
        loadMoreBtn.style.display = 'none';
    }

    // Aplica filtro inicial e mostra os primeiros resultados
    aplicarFiltros();
});

// --- Funções de Filtro (gerarFiltrosDinamicos, aplicarFiltros) ---
// (Mantenha as funções gerarFiltrosDinamicos e aplicarFiltros
// exatamente como na versão anterior que funcionava)

function gerarFiltrosDinamicos(receitas) {
    const tipos = [...new Set(receitas.map(r => r.Tipo).filter(Boolean))].sort();
    const dificuldades = [...new Set(receitas.map(r => r.Dificuldade).filter(Boolean))].sort();

    const criarCheckboxes = (container, listaItens, grupoFiltro) => {
        if (!container) return;
        container.innerHTML = '';
         const titulo = document.createElement('h4');
         titulo.textContent = container.id === 'filtro-tipo-receita' ? 'Tipo' : 'Dificuldade';
         container.appendChild(titulo);

        listaItens.forEach(item => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.value = item;
            input.dataset.grupo = grupoFiltro;
            input.addEventListener('change', aplicarFiltros);

            label.appendChild(input);
            label.appendChild(document.createTextNode(` ${item}`));
            container.appendChild(label);
        });
    };

    criarCheckboxes(filtroTipoContainer, tipos, 'tipo');
    criarCheckboxes(filtroDificuldadeContainer, dificuldades, 'dificuldade');
}

function aplicarFiltros() {
    filtrosAtivos = { tipo: [], dificuldade: [] };
    const checkboxesMarcados = document.querySelectorAll('.filtro-grupo input[type="checkbox"]:checked');
    checkboxesMarcados.forEach(check => {
        const grupo = check.dataset.grupo;
        const valor = check.value;
        if (filtrosAtivos[grupo]) filtrosAtivos[grupo].push(valor);
    });

    receitasFiltradas = todasAsReceitas.filter(receita => {
        const passaTipo = filtrosAtivos.tipo.length === 0 || filtrosAtivos.tipo.includes(receita.Tipo);
        const passaDificuldade = filtrosAtivos.dificuldade.length === 0 || filtrosAtivos.dificuldade.includes(receita.Dificuldade);
        return passaTipo && passaDificuldade;
    });

    if(container) container.innerHTML = ''; // Limpa o container para novos resultados
    receitasVisiveis = 0; // Reseta a contagem

    mostrarProximasReceitas(); // Mostra o primeiro bloco filtrado

    // Exibe mensagem se nenhum resultado for encontrado
    if (receitasFiltradas.length === 0 && container) {
         container.innerHTML = '<p class="nenhuma-receita">Nenhuma receita encontrada com estes filtros.</p>';
         if (loadMoreBtn) loadMoreBtn.style.display = 'none'; // Esconde botão se não há resultados
    }
}


/**
 * Mostra o próximo bloco de receitas e atualiza o botão
 */
function mostrarProximasReceitas() {
    const inicio = receitasVisiveis;
    const fim = inicio + receitasPorPagina;
    const receitasParaMostrar = receitasFiltradas.slice(inicio, fim);

    renderizarReceitas(receitasParaMostrar); // Adiciona os novos cards

    receitasVisiveis += receitasParaMostrar.length;

    // Atualiza o estado do botão (lógica adaptada de updateLoadMoreButton e showNoMoreNews)
    atualizarBotaoCarregarMais();
}

/**
 * NOVO: Atualiza o texto e estado do botão "Carregar Mais"
 * (Adaptado de updateLoadMoreButton e showNoMoreNews)
 */
function atualizarBotaoCarregarMais() {
    if (!loadMoreBtn) return; // Se o botão não existir, sai

    if (receitasVisiveis >= receitasFiltradas.length) {
        // Chegou ao fim
        loadMoreBtn.innerHTML = '🎉 Todas as receitas carregadas!';
        loadMoreBtn.disabled = true;
        loadMoreBtn.style.display = 'block'; // Garante que a mensagem final seja visível
    } else {
        // Ainda há mais receitas
        const restantes = receitasFiltradas.length - receitasVisiveis;
        const paraMostrar = Math.min(restantes, receitasPorPagina);
        loadMoreBtn.innerHTML = `Mais Receita${paraMostrar > 1 ? 's' : ''}`;
        loadMoreBtn.disabled = false;
        loadMoreBtn.style.display = 'block'; // Garante que o botão está visível
    }
}


/**
 * Recebe uma lista de receitas e ADICIONA seus cards ao container
 */
function renderizarReceitas(receitas) {
    // (Esta função continua a mesma da versão anterior, apenas adiciona os cards)
    if (!container || receitas.length === 0) return;
    const fragment = document.createDocumentFragment();
    receitas.forEach(receita => {
        const card = document.createElement('div');
        card.className = 'receita-card-horizontal';
        const imagemSrc = receita.ImagemURL || '../assets/images/cafe-placeholder.jpg';
        card.innerHTML = `
            <div class="receita-imagem-container">
                <a href="receita-detalhe.html?id=${receita.IdReceita}" class="receita-link-imagem">
                    <img src="${imagemSrc}" alt="${receita.Nome}">
                </a>
            </div>
            <div class="receita-info">
                <a href="receita-detalhe.html?id=${receita.IdReceita}" class="receita-link-titulo">
                    <h3>${receita.Nome}</h3>
                </a>
                <div class="receita-meta">
                    <span class="tipo"><i class="fas ${receita.Tipo === 'Bebida' ? 'fa-coffee' : 'fa-utensils'}"></i> ${receita.Tipo || ''}</span>
                    <span class="dificuldade"><i class="fas fa-signal"></i> ${receita.Dificuldade || 'N/A'}</span>
                    <span class="tempo"><i class="fas fa-clock"></i> ${receita.TempoPreparoMin ? receita.TempoPreparoMin + ' min' : 'N/A'}</span>
                </div>
                <p class="receita-descricao-curta">${receita.Descricao || 'Sem descrição breve.'}</p>
                <div class="receita-footer">
                    <a href="receita-detalhe.html?id=${receita.IdReceita}" class="receita-btn-ver">
                        Ver Receita
                    </a>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
}