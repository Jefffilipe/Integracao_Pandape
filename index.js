const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializePool, getConnection, closePool } = require('./config/db');

// Inicializa o Express
const app = express();

// Configurações do Express
app.use(cors());
app.use(bodyParser.json());

// Inicializa o pool de conexão simulado ao iniciar a aplicação
(async () => {
  try {
    await initializePool();
    console.log('Inicialização do pool concluída');
  } catch (err) {
    console.error('Falha ao inicializar o pool', err);
    process.exit(1); // Sai com erro se a inicialização falhar
  }
})();

// Rota para receber webhooks do PandaPe
app.post('/api/webhook/candidate-stage', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Webhook recebido:', webhookData);

    // Simula a inserção dos dados no banco
    const connection = await getConnection();
    const sql = 'INSERT INTO candidate_stages (data) VALUES (:data)';
    const params = { data: JSON.stringify(webhookData) };
    const result = await connection.execute(sql, params);
    console.log('Dados inseridos no banco (simulado):', result);

    await connection.close();
    res.status(200).json({ message: 'Webhook processado com sucesso' });
  } catch (err) {
    console.error('Erro ao processar webhook:', err);
    res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

// Rota de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Inicia o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Lida com o encerramento gracioso
process.on('SIGTERM', async () => {
  console.log('Recebido SIGTERM. Encerrando o pool de conexão...');
  await closePool();
  process.exit(0);
});