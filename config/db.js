const { logger } = require('../config/pandape');

// Simulação: Não conecta ao banco Oracle, apenas retorna dados fictícios
logger.info('Simulando operações de banco de dados (sem conexão real com Oracle)');

async function initializePool() {
  try {
    logger.info('Simulando criação do pool de conexão com Oracle');
    // Não cria um pool real, apenas simula
    logger.info('Pool de conexão com Oracle "criado" com sucesso (simulado)');
  } catch (err) {
    logger.error('Erro ao simular criação do pool', { error: err.message });
    throw err;
  }
}

async function getConnection() {
  try {
    logger.info('Simulando obtenção de conexão');
    // Retorna um objeto simulado que imita uma conexão
    return {
      execute: async (sql, params) => {
        logger.info('Simulando execução de query', { sql, params });
        // Simula o resultado de uma query
        if (sql.includes('INSERT')) {
          return { rowsAffected: 1 }; // Simula um INSERT bem-sucedido
        }
        return { rows: [{ dummy: 'data' }] }; // Simula um SELECT
      },
      close: async () => {
        logger.info('Simulando fechamento da conexão');
      }
    };
  } catch (err) {
    logger.error('Erro ao simular obtenção de conexão', { error: err.message });
    throw err;
  }
}

async function closePool() {
  try {
    logger.info('Simulando fechamento do pool de conexão');
  } catch (err) {
    logger.error('Erro ao simular fechamento do pool', { error: err.message });
  }
}

module.exports = { initializePool, getConnection, closePool };