// assets/js/receitasFactory.js
// Fábrica dedicada para buscar dados da API de Receitas

const receitasFactory = {
    // URL base da API (agora em português)
    BASE_URL: '/api/receitas', 

    /**
     * Busca todas as receitas da API.
     * @returns {Promise<Array>} Lista de receitas.
     */
    async getTodasReceitas() {
        try {
            const response = await fetch(this.BASE_URL);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const receitas = await response.json();
            return receitas;
        } catch (error) {
            console.error('Falha ao buscar receitas:', error);
            return []; 
        }
    },

    /**
     * Busca uma receita específica pelo ID.
     * @param {number} id - O ID da receita.
     * @returns {Promise<Object|null>} O objeto da receita ou null se falhar.
     */
    async getReceitaPorId(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`);
            if (!response.ok) {
                // Se der 404 (não encontrado), não loga como erro grave
                if (response.status === 404) {
                    console.log(`Receita com ID ${id} não encontrada.`);
                    return null; 
                }
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao buscar receita ${id}:`, error);
            return null;
        }
    }
};

export default receitasFactory;