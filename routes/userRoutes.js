const express = require('express');
const router = express.Router();

// rota GET de teste
router.get('/', (req, res) => {
  res.send('Rota de usuários funcionando!');
});

module.exports = router;
