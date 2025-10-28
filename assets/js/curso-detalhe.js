// assets/js/curso-detalhe.js
import cursosFactory from './cursosFactory.js'; // Importa a fábrica de cursos

// Função principal
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Pegar o ID da URL
    const params = new URLSearchParams(window.location.search);
    const cursoId = params.get('id');
    const wrapper = document.querySelector('.produto-detalhe-wrapper');

    if (!cursoId) {
        wrapper.innerHTML = '<h1>Erro: Curso não especificado.</h1> <a href="cursos.html">Voltar aos cursos</a>';
        return;
    }

    // 2. Buscar o curso na API usando a fábrica
    // A função getCursoPorId já foi criada na cursosFactory
    const curso = await cursosFactory.getCursoPorId(cursoId);

    if (!curso) {
        wrapper.innerHTML = `<h1>Erro: Curso com ID ${cursoId} não encontrado.</h1> <a href="cursos.html">Voltar aos cursos</a>`;
        return;
    }

    // 3. Preencher o HTML com os dados do curso
    preencherDadosCurso(curso);
});

/**
 * Recebe o objeto do curso e preenche os elementos do HTML
 * @param {Object} curso - O objeto do curso vindo da API
 */
function preencherDadosCurso(curso) {
    // Formata o preço
    const precoFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(curso.Preco);

    // Atualiza os elementos do DOM
    document.title = curso.Nome; // Título da aba
    document.getElementById('curso-nome').innerText = curso.Nome;
    document.getElementById('curso-imagem').src = curso.Imagem || '../assets/images/cafe-placeholder.jpg';
    document.getElementById('curso-imagem').alt = curso.Nome;
    
    document.getElementById('curso-modalidade').innerText = curso.Modalidade || '';
    document.getElementById('curso-duracao').innerText = curso.DuracaoHoras ? `${curso.DuracaoHoras} horas` : '';
    document.getElementById('curso-tipo').innerText = curso.Tipo || '';

    document.getElementById('curso-preco').innerText = precoFormatado;
    
    // Usa a DescricaoCompleta aqui
    document.getElementById('curso-descricao-completa').innerText = curso.DescricaoCompleta || curso.DescricaoBasica || 'Descrição não disponível.';

    // Adiciona o ID ao botão de inscrever
    const btnInscrever = document.getElementById('curso-btn-inscrever');
    btnInscrever.dataset.id = curso.IdCurso;
    btnInscrever.addEventListener('click', (e) => {
        e.preventDefault();
        alert(`Iniciando inscrição no curso "${curso.Nome}"! (Lógica pendente)`);
        console.log("Inscrever no curso (detalhe):", curso);
    });
}