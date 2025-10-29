// assets/js/produtos.js
// VERSÃO COMPLETA - Inclui funções para Admin (Atualizar e Excluir)

const productFactory = {
    BASE_URL: '/api/produtos',
    // PLANOS_URL: '/api/planos', // Removido se você criou a planosFactory separada

    /**
     * Busca todos os produtos da API.
     */
    async getTodosProdutos() {
        try {
            const response = await fetch(this.BASE_URL);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const produtos = await response.json();
            return produtos;
        } catch (error) {
            console.error('Falha ao buscar produtos:', error);
            // É melhor propagar o erro para o admin saber que falhou
            throw error; // MUDANÇA: Propaga o erro em vez de retornar [] silenciosamente
        }
    },

    /**
     * Busca um produto específico pelo ID.
     */
    async getProdutoPorId(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`);
            if (!response.ok) {
                // Se for 404, retorna null sem logar erro grave
                if (response.status === 404) return null;
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao buscar produto ${id}:`, error);
            // Retorna null para indicar falha controlada
            return null;
        }
    },

    /**
     * (Admin) Cria um novo produto.
     */
    async criarProduto(dadosProduto) {
        try {
            const response = await fetch(this.BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosProduto),
            });
            const data = await response.json(); // Tenta ler JSON mesmo em erro
            if (!response.ok) {
                // Usa a mensagem de erro da API se disponível
                throw new Error(data.error || `Erro HTTP: ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error('Falha ao criar produto:', error);
            throw error; // Propaga o erro
        }
    },

    /**
     * (Admin) Atualiza o estoque de um produto.
     */
    async atualizarEstoque(id, novaQuantidade) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}/estoque`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ novaQuantidade: novaQuantidade }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Erro HTTP: ${response.status}`);
            }
            return data;
        } catch (error) {
            console.error(`Falha ao atualizar estoque do produto ${id}:`, error);
            throw error; // Propaga o erro
        }
    },

    // --- FUNÇÕES ADICIONADAS PARA O PAINEL ADMIN ---

    /**
     * (Admin) Atualiza TODOS os dados de um produto existente.
     * @param {number|string} id - O ID do produto.
     * @param {Object} dadosProduto - O objeto completo com os dados atualizados.
     * @returns {Promise<Object>} O produto atualizado.
     */
    async atualizarProduto(id, dadosProduto) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`, { // Usa a rota PUT /:id
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosProduto),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || `Erro HTTP: ${response.status}`);
            return data;
        } catch (error) {
            console.error(`Falha ao atualizar produto ${id}:`, error);
            throw error;
        }
    },

    /**
     * (Admin) Exclui um produto.
     * @param {number|string} id - O ID do produto.
     * @returns {Promise<void>}
     */
    async excluirProduto(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`, {
                method: 'DELETE',
            });
            // DELETE retorna 204 (No Content)
            if (!response.ok && response.status !== 204) {
                 // Tenta ler erro do corpo se não for 204
                 const data = await response.json().catch(() => ({ error: `Erro HTTP: ${response.status}` }));
                 throw new Error(data.error || `Erro HTTP: ${response.status}`);
            }
            // Não retorna nada em caso de sucesso (204)
        } catch (error) {
            console.error(`Falha ao excluir produto ${id}:`, error);
            throw error;
        }
    }
    // --- FIM DAS FUNÇÕES ADICIONADAS ---
};

export default productFactory;