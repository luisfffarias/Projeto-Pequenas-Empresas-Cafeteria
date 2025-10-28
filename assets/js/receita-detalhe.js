// assets/js/receita-detalhe.js
import receitasFactory from './receitasFactory.js';

/**
 * Função para limpar e dividir strings por PONTO E VÍRGULA (;) - Para Ingredientes
 */
function splitAndCleanString(str) {
    if (!str) return [];
    return str
        .split(';')
        .map(item => item.trim())
        .filter(item => item.length > 0);
}

/**
 * Função principal
 */
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const receitaId = params.get('id');
    const container = document.querySelector('.receita-detalhe-container');

    if (!receitaId || !container) {
        if (container) container.innerHTML = '<h1>Erro: Receita não especificada ou container não encontrado.</h1> <a href="receitas.html">Voltar</a>';
        return;
    }

    const receita = await receitasFactory.getReceitaPorId(receitaId);

    if (!receita) {
        container.innerHTML = `<h1>Erro: Receita com ID ${receitaId} não encontrada.</h1> <a href="receitas.html">Voltar</a>`;
        return;
    }

    preencherDadosReceita(receita);
});

/**
 * Preenche o HTML com os dados da receita
 */
function preencherDadosReceita(receita) {
    // --- Preenche Cabeçalho ---
    document.title = receita.Nome;
    setTextContent('receita-nome', receita.Nome);
    setTextContent('receita-tipo', receita.Tipo || '');
    setTextContent('receita-dificuldade', receita.Dificuldade || 'N/A');
    setTextContent('receita-tempo', receita.TempoPreparoMin ? `${receita.TempoPreparoMin} min` : 'N/A');
    setTextContent('receita-descricao-breve', receita.Descricao || '');


    // --- Preenche Imagem ---
    const imgElement = document.getElementById('receita-imagem');
    if (imgElement) {
        imgElement.src = receita.ImagemURL || '../assets/images/cafe-placeholder.jpg';
        imgElement.alt = receita.Nome;
    }


    // --- Preenche Ingredientes (Usa split ';') ---
    const listaIngredientes = document.getElementById('lista-ingredientes');
    if (listaIngredientes) {
        listaIngredientes.innerHTML = '';
        const ingredientesArray = splitAndCleanString(receita.Ingredientes); // Usa ';'
        if (ingredientesArray.length > 0) {
            ingredientesArray.forEach(ingrediente => {
                const li = document.createElement('li');
                li.textContent = ingrediente;
                listaIngredientes.appendChild(li);
            });
        } else {
            listaIngredientes.innerHTML = '<li>Ingredientes não informados.</li>';
        }
    }

    // --- Preenche Modo de Preparo (Usa split ',') ---
    const modoPreparoDiv = document.getElementById('modo-preparo-passos');
    if (modoPreparoDiv) {
        modoPreparoDiv.innerHTML = '';
        // Usa split(',') para dividir por vírgula
        const preparoArray = (receita.ModoPreparo || '')
                                .split(',') // <-- MUDANÇA AQUI
                                .map(passo => passo.trim()) // Remove espaços extras
                                .filter(passo => passo.length > 0); // Remove itens vazios

        if (preparoArray.length > 0) {
            preparoArray.forEach(passo => {
                const p = document.createElement('p');
                p.textContent = passo;
                modoPreparoDiv.appendChild(p);
            });
        } else {
            modoPreparoDiv.innerHTML = '<p>Modo de preparo não informado.</p>';
        }
    }
}

/**
 * Função auxiliar para definir o textContent
 */
function setTextContent(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}