// assets/js/cursosFactory.js
// Esta é uma fábrica SEPARADA, dedicada apenas aos cursos.

const cursosFactory = {
    // A URL base da nossa API de cursos
    BASE_URL: '/api/cursos', 

    /**
     * Busca todos os cursos da API.
     * @returns {Promise<Array>} Uma promessa que resolve para a lista de cursos.
     */
    async getTodosCursos() {
        try {
            const response = await fetch(this.BASE_URL);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const cursos = await response.json();
            return cursos;
        } catch (error) {
            console.error('Falha ao buscar cursos:', error);
            return []; 
        }
    },

    /**
     * Busca um curso específico pelo ID.
     * @param {number} id - O ID do curso.
     * @returns {Promise<Object>} Uma promessa que resolve para o curso.
     */
    async getCursoPorId(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao buscar curso ${id}:`, error);
            return null; // Retorna null em caso de erro
        }
    }
};

// Exporta o módulo para ser usado em outros scripts
export default cursosFactory;