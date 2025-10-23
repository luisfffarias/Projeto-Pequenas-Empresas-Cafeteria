// teste-insert-direto.js
const sql = require('mssql');
const db = require("./config/dbconfig");

async function testeInsertDireto() {
  try {
    console.log('🔧 Conectando...');
    const pool = await sql.connect(db);
    
    // Teste 1: INSERT direto com dbo.Usuarios
    console.log('🚀 TESTE 1: INSERT com dbo.Usuarios...');
    try {
      await pool.request()
        .input('Email', sql.NVarChar, 'teste@email.com')
        .input('SenhaHash', sql.NVarChar, 'hash_teste')
        .input('Nome', sql.NVarChar, 'Teste Direto')
        .query(`INSERT INTO dbo.Usuarios (Email, SenhaHash, Nome) VALUES (@Email, @SenhaHash, @Nome)`);
      console.log('✅ INSERT com dbo.Usuarios FUNCIONOU!');
    } catch (err1) {
      console.log('❌ INSERT com dbo.Usuarios FALHOU:', err1.message);
    }

    // Teste 2: INSERT direto sem schema
    console.log('🚀 TESTE 2: INSERT sem schema...');
    try {
      await pool.request()
        .input('Email', sql.NVarChar, 'teste2@email.com')
        .input('SenhaHash', sql.NVarChar, 'hash_teste2')
        .input('Nome', sql.NVarChar, 'Teste Sem Schema')
        .query(`INSERT INTO Usuarios (Email, SenhaHash, Nome) VALUES (@Email, @SenhaHash, @Nome)`);
      console.log('✅ INSERT sem schema FUNCIONOU!');
    } catch (err2) {
      console.log('❌ INSERT sem schema FALHOU:', err2.message);
    }

    // Teste 3: SELECT para ver se existe algum usuário
    console.log('🔍 TESTE 3: Verificar usuários existentes...');
    const usuarios = await pool.request().query('SELECT COUNT(*) as total FROM Usuarios');
    console.log('📊 Total de usuários na tabela:', usuarios.recordset[0].total);

    await pool.close();
  } catch (err) {
    console.log('❌ Erro geral:', err.message);
  }
}

testeInsertDireto();