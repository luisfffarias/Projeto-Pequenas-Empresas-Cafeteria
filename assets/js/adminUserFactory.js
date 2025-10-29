// assets/js/adminUserFactory.js
// Fábrica dedicada para as rotas de ADMINISTRAÇÃO de usuários

const adminUserFactory = {
    // URL base da API de admin
    BASE_URL: '/api/admin/usuarios',

    /**
     * Busca todos os usuários.
     * @returns {Promise<Array>} Lista de usuários.
     */
    async getTodosUsuarios() {
        try {
            const response = await fetch(this.BASE_URL);
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Falha ao buscar usuários:', error);
            throw error; // Propaga o erro para ser tratado no JS da página
        }
    },

    /**
     * Adiciona um novo usuário.
     * @param {Object} dadosUsuario - { Nome, Email, Senha, IsAdmin, IsAssinante }
     * @returns {Promise<Object>} O usuário criado.
     */
    async adicionarUsuario(dadosUsuario) {
        try {
            const response = await fetch(this.BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosUsuario),
            });
            const data = await response.json(); // Tenta ler JSON mesmo se não for ok
            if (!response.ok) throw new Error(data.error || `Erro HTTP: ${response.status}`);
            return data;
        } catch (error) {
            console.error('Falha ao adicionar usuário:', error);
            throw error;
        }
    },

    /**
     * Atualiza dados básicos de um usuário.
     * @param {number} id - ID do usuário.
     * @param {Object} dadosAtualizados - { Nome, IsAdmin, IsAssinante }
     * @returns {Promise<Object>} O usuário atualizado.
     */
    async atualizarUsuario(id, dadosAtualizados) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosAtualizados),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Erro HTTP: ${response.status}`);
            return data;
        } catch (error) {
            console.error(`Falha ao atualizar usuário ${id}:`, error);
            throw error;
        }
    },

    /**
     * Exclui um usuário.
     * @param {number} id - ID do usuário.
     * @returns {Promise<void>}
     */
    async excluirUsuario(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`, {
                method: 'DELETE',
            });
            // DELETE retorna 204 (No Content), não tem JSON
            if (!response.ok && response.status !== 204) {
                 const data = await response.json().catch(() => ({ error: `Erro HTTP: ${response.status}` })); // Tenta pegar erro do JSON
                 throw new Error(data.error || `Erro HTTP: ${response.status}`);
            }
            // Não retorna nada em caso de sucesso (204)
        } catch (error) {
            console.error(`Falha ao excluir usuário ${id}:`, error);
            throw error;
        }
    }

    // --- Se adicionar a rota de Bloqueio ---
    /*
    async atualizarStatusUsuario(id, isBloqueado) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBloqueado: isBloqueado }), // Envia 0 ou 1
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Erro HTTP: ${response.status}`);
            return data;
        } catch (error) {
            console.error(`Falha ao atualizar status do usuário ${id}:`, error);
            throw error;
        }
    }
    */
};

export default adminUserFactory;