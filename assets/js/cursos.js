document.addEventListener('DOMContentLoaded', () => {

    const container = document.getElementById('blog-container');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    // API que criamos em 'cursosRoutes.js'
    const API_URL = '/cursos/api/todos'; 

    let allCourses = [];
    let currentPage = 1;
    const coursesPerPage = 3; // Quantos cursos carregar por vez

    // 1. Busca os dados na API
    async function fetchCourses() {
        try {
            container.innerHTML = '<p>Carregando cursos...</p>';
            
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Falha ao carregar os cursos.');
            
            allCourses = await response.json();
            
            if (allCourses.length === 0) {
                container.innerHTML = '<p>Nenhum curso disponível no momento.</p>';
                return;
            }

            container.innerHTML = ''; // Limpa o "Carregando..."
            displayCourses(); // Mostra a primeira página

        } catch (error) {
            console.error(error);
            container.innerHTML = '<p>Erro ao carregar os cursos. Tente novamente.</p>';
        }
    }

    // 2. Exibe os cursos da página atual
    function displayCourses() {
        const startIndex = (currentPage - 1) * coursesPerPage;
        const endIndex = currentPage * coursesPerPage;
        const coursesToDisplay = allCourses.slice(startIndex, endIndex);

        coursesToDisplay.forEach(curso => {
            const courseElement = document.createElement('div');
            // Usando as classes do 'admin-cursos.ejs' para reusar o CSS
            courseElement.classList.add('course-item'); 
            
            const precoFormatado = parseFloat(curso.Preco).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            // Card do curso (sem botões de admin)
            courseElement.innerHTML = `
                <h4>${curso.Nome}</h4>
                <p>${curso.DescricaoBasica}</p>
                <div class="detalhes">
                    <span><strong>Duração:</strong> ${curso.DuracaoHoras} horas</span>
                    <span><strong>Nível:</strong> ${curso.Tipo}</span>
                    <span><strong>Modalidade:</strong> ${curso.Modalidade}</span>
                    <span><strong>Preço:</strong> ${precoFormatado}</span>
                </div>
            `;
            
            container.appendChild(courseElement);
        });

        updateLoadMoreButton();
    }

    // 3. Gerencia o botão "Carregar Mais"
    function updateLoadMoreButton() {
        loadMoreContainer.innerHTML = ''; // Limpa o botão antigo

        const totalLoaded = currentPage * coursesPerPage;
        if (totalLoaded < allCourses.length) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.innerText = 'Carregar Mais Cursos';
            loadMoreBtn.classList.add('btn1'); // Classe do seu botão
            
            loadMoreBtn.addEventListener('click', () => {
                currentPage++;
                displayCourses();
            });
            
            loadMoreContainer.appendChild(loadMoreBtn);
        }
    }

    // Inicia o processo
    fetchCourses();
});