// assets/js/cursosFactory.js
// Fábrica COMPLETA para CRUD de Cursos

const cursosFactory = {
    BASE_URL: '/api/cursos',

    // GET Todos (Existente)
    async getTodosCursos() {
        try {
            const response = await fetch(this.BASE_URL);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao buscar cursos:', error);
            throw error; // Propaga erro
        }
    },

    // GET por ID (Existente)
    async getCursoPorId(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`);
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao buscar curso ${id}:`, error);
            return null; // Retorna null em erro
        }
    },

    // --- NOVAS FUNÇÕES ADMIN ---

    /**
     * (Admin) Cria um novo curso.
     */
    async criarCurso(dadosCurso) {
        try {
            const response = await fetch(this.BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosCurso),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Erro HTTP: ${response.status}`);
            return data;
        } catch (error) {
            console.error('Falha ao criar curso:', error);
            throw error;
        }
    },

    /**
     * (Admin) Atualiza um curso existente.
     */
    async atualizarCurso(id, dadosCurso) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosCurso),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Erro HTTP: ${response.status}`);
            return data;
        } catch (error) {
            console.error(`Falha ao atualizar curso ${id}:`, error);
            throw error;
        }
    },

    /**
     * (Admin) Exclui um curso.
     */
    async excluirCurso(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok && response.status !== 204) {
                 const data = await response.json().catch(() => ({ error: `Erro HTTP: ${response.status}` }));
                 throw new Error(data.error || `Erro HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error(`Falha ao excluir curso ${id}:`, error);
            throw error;
        }
    }
    // --- FIM NOVAS FUNÇÕES ADMIN ---
};

export default cursosFactory;