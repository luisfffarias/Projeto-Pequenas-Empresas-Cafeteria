// assets/js/planosFactory.js
// Esta é uma fábrica SEPARADA, dedicada apenas aos planos.

const planosFactory = {
    // A URL base da nossa API de planos
    BASE_URL: '/api/planos', 

    /**
     * Busca todos os planos de assinatura da API.
     * @returns {Promise<Array>} Uma promessa que resolve para a lista de planos.
     */
    async getTodosPlanos() {
        try {
            const response = await fetch(this.BASE_URL);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const planos = await response.json();
            return planos;
        } catch (error) {
            console.error('Falha ao buscar planos:', error);
            return []; 
        }
    },

    /**
     * Busca um plano específico pelo ID.
     * @param {number} id - O ID do plano.
     * @returns {Promise<Object>} Uma promessa que resolve para o plano.
     */
    async getPlanoPorId(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`);
            if (!response.ok) {
                // Se a API der 404 (plano não encontrado), o response.json() falha.
                // Retornamos null para o script da página tratar.
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao buscar plano ${id}:`, error);
            return null; // Retorna null em caso de erro de rede ou 404
        }
    }
};

// Exporta o módulo para ser usado em outros scripts
export default planosFactory;