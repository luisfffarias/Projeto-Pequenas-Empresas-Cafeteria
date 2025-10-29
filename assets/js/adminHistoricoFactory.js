// assets/js/adminHistoricoFactory.js
// Fábrica dedicada para buscar dados da API de Histórico de Compras (Admin)

const adminHistoricoFactory = {
    // URL base da API de histórico
    BASE_URL: '/api/admin/historico',

    /**
     * Busca todo o histórico de compras.
     * @returns {Promise<Array>} Lista do histórico de compras.
     */
    async getHistoricoCompleto() {
        try {
            // Adicionar token de admin aqui seria ideal
            const response = await fetch(this.BASE_URL);
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ error: `Erro HTTP: ${response.status}` }));
                 throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Falha ao buscar histórico de compras:', error);
            throw error; // Propaga o erro
        }
    },

    // (Futuramente, pode adicionar funções para filtrar por data, utilizador, etc.)
};

export default adminHistoricoFactory;