require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
//const userRoutes = require('./routes/userRoutes');

const app = express();

// Conectar ao SQL Server
connectDB();

// Middleware para JSON
app.use(express.json());

// Rotas
//app.use('/api/users', userRoutes);

// Rota de teste
app.get('/', (req, res) => res.send('API funcionando com SQL Server!'));

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
