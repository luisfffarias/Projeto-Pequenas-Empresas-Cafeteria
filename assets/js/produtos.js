// assets/js/produtos.js

/**
 * Módulo (Factory) para centralizar a comunicação com a API de produtos.
 * Assume que a API está rodando na mesma origem (ex: http://localhost:3000)
 * Se estiver em outro domínio, precisará de CORS no backend.
 */
const productFactory = {
    // A URL base da nossa API. 
    // Assumindo: app.use('/api/produtos', productRoutes);
    BASE_URL: '/api/produtos', 

    /**
     * Busca todos os produtos da API.
     * @returns {Promise<Array>} Uma promessa que resolve para a lista de produtos.
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
            return []; 
        }
    },

    /**
     * Busca um produto específico pelo ID.
     * @param {number} id - O ID do produto.
     * @returns {Promise<Object>} Uma promessa que resolve para o produto.
     */
    async getProdutoPorId(id) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao buscar produto ${id}:`, error);
            return null;
        }
    },

    /**
     * (Para o Admin) Cria um novo produto.
     * @param {Object} dadosProduto - O objeto completo do produto.
     * @returns {Promise<Object>} O novo produto criado.
     */
    async criarProduto(dadosProduto) {
        try {
            const response = await fetch(this.BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosProduto),
            });
            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.error || `Erro HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Falha ao criar produto:', error);
            return null;
        }
    },

    /**
     * (Para o Admin) Atualiza o estoque de um produto.
     * @param {number} id - O ID do produto.
     * @param {number} novaQuantidade - O novo valor do estoque.
     * @returns {Promise<Object>} O produto atualizado.
     */
    async atualizarEstoque(id, novaQuantidade) {
        try {
            const response = await fetch(`${this.BASE_URL}/${id}/estoque`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ novaQuantidade: novaQuantidade }),
            });
            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.error || `Erro HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao atualizar estoque do produto ${id}:`, error);
            return null;
        }
    }
};

// Exporta o módulo para ser usado em outros scripts
export default productFactory;