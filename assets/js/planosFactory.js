// assets/js/planosFactory.js
// Fábrica COMPLETA para CRUD de Planos

const planosFactory = {
    BASE_URL: '/api/planos',

    // GET Todos (Existente)
    async getTodosPlanos() {
        try {
            const response = await fetch(this.BASE_URL);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao buscar planos:', error);
            throw error; // Propaga erro
        }
    },

    // GET por ID (Existente)
    async getPlanoPorId(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`);
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao buscar plano ${id}:`, error);
            return null; // Retorna null em erro
        }
    },

    // --- NOVAS FUNÇÕES ADMIN ---

    /**
     * (Admin) Cria um novo plano.
     */
    async criarPlano(dadosPlano) {
        try {
            const response = await fetch(this.BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPlano),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Erro HTTP: ${response.status}`);
            return data;
        } catch (error) {
            console.error('Falha ao criar plano:', error);
            throw error;
        }
    },

    /**
     * (Admin) Atualiza um plano existente.
     */
    async atualizarPlano(id, dadosPlano) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPlano),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Erro HTTP: ${response.status}`);
            return data;
        } catch (error) {
            console.error(`Falha ao atualizar plano ${id}:`, error);
            throw error;
        }
    },

    /**
     * (Admin) Exclui um plano.
     */
    async excluirPlano(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok && response.status !== 204) {
                 const data = await response.json().catch(() => ({ error: `Erro HTTP: ${response.status}` }));
                 throw new Error(data.error || `Erro HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error(`Falha ao excluir plano ${id}:`, error);
            throw error;
        }
    }
    // --- FIM NOVAS FUNÇÕES ADMIN ---
};

export default planosFactory;