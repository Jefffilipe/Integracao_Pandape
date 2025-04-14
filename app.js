const { pandapeConfig, logger } = require('./config/pandape');
const schedulerService = require('./services/schedulerService');

// Inicia o serviço de agendamento se a integração estiver habilitada
if (pandapeConfig.integration.enabled) {
  schedulerService.start(pandapeConfig.integration.checkInterval);
  logger.info('Integração PandaPe iniciada');
} else {
  logger.info('Integração PandaPe desabilitada');
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não tratado', { error: error.message });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada', { 
    reason: reason?.message || reason,
    promise 
  });
});