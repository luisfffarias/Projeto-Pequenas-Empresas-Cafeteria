const sql = require('mssql');

const configMaster = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  database: 'master', // conecta no banco principal
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function connectDB() {
  try {
    // Conectar ao banco "master"
    const pool = await sql.connect(configMaster);

    // Verificar se o banco já existe
    const result = await pool.request().query(
      `IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = '${process.env.DB_NAME}')
       BEGIN
         CREATE DATABASE [${process.env.DB_NAME}]
       END`
    );

    console.log(`✅ Banco de dados ${process.env.DB_NAME} pronto!`);

    // Agora conecta no banco certo
    const dbConfig = {
      ...configMaster,
      database: process.env.DB_NAME
    };
    const poolDB = await sql.connect(dbConfig);

    return poolDB;
  } catch (err) {
    console.error('❌ Erro ao conectar/criar banco:', err);
    process.exit(1);
  }
}

module.exports = connectDB;
