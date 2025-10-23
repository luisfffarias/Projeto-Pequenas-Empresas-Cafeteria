// config/dbConfig.js
const sql = require('mssql');

const dbConfig = {
  user: 'projetinho',        // Coloque DIRETO os valores
  password: 'projetinho',    // do seu .env aqui
  server: 'localhost',
  database: 'coffe',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

console.log('🔧 Configuração do banco:', {
  server: dbConfig.server,
  database: dbConfig.database,
  user: dbConfig.user
});

module.exports = dbConfig;