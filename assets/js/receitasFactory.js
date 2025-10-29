// assets/js/receitasFactory.js
// Fábrica COMPLETA para CRUD de Receitas

const receitasFactory = {
    BASE_URL: '/api/receitas', // Mantém o URL da API

    // GET Todos (Existente)
    async getTodasReceitas() {
        try {
            const response = await fetch(this.BASE_URL);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao buscar receitas:', error);
            throw error; // Propaga erro
        }
    },

    // GET por ID (Existente)
    async getReceitaPorId(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`);
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao buscar receita ${id}:`, error);
            return null; // Retorna null em erro
        }
    },

    // --- NOVAS FUNÇÕES ADMIN ---

    /**
     * (Admin) Cria uma nova receita.
     */
    async criarReceita(dadosReceita) {
        try {
            const response = await fetch(this.BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosReceita),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Erro HTTP: ${response.status}`);
            return data;
        } catch (error) {
            console.error('Falha ao criar receita:', error);
            throw error;
        }
    },

    /**
     * (Admin) Atualiza uma receita existente.
     */
    async atualizarReceita(id, dadosReceita) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosReceita),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Erro HTTP: ${response.status}`);
            return data;
        } catch (error) {
            console.error(`Falha ao atualizar receita ${id}:`, error);
            throw error;
        }
    },

    /**
     * (Admin) Exclui uma receita.
     */
    async excluirReceita(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok && response.status !== 204) {
                 const data = await response.json().catch(() => ({ error: `Erro HTTP: ${response.status}` }));
                 throw new Error(data.error || `Erro HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error(`Falha ao excluir receita ${id}:`, error);
            throw error;
        }
    }
    // --- FIM NOVAS FUNÇÕES ADMIN ---
};

export default receitasFactory;