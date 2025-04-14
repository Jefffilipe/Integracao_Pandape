const { logger } = require('../config/pandape');
const { checkPendingVacancies } = require('./seniorService');
const { createRequest, createVacancy } = require('./pandapeService');

/**
 * Serviço de agendamento para verificação de vagas pendentes
 */
class SchedulerService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  /**
   * Inicia o serviço de agendamento
   * @param {number} interval - Intervalo em milissegundos
   */
  start(interval) {
    if (this.isRunning) {
      logger.warn('Serviço de agendamento já está em execução');
      return;
    }

    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      try {
        await this.processVacancies();
      } catch (error) {
        logger.error('Erro no processamento agendado', { error: error.message });
      }
    }, interval);

    logger.info('Serviço de agendamento iniciado', { interval });
  }

  /**
   * Para o serviço de agendamento
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      logger.info('Serviço de agendamento parado');
    }
  }

  /**
   * Processa vagas pendentes com retry
   */
  async processVacancies() {
    const pendingVacancies = await checkPendingVacancies();
    
    for (const vacancy of pendingVacancies) {
      let retries = 0;
      let success = false;

      while (!success && retries < pandapeConfig.integration.maxRetries) {
        try {
          const requestData = await createRequest(vacancy);
          await createVacancy({ ...vacancy, idRequest: requestData });
          success = true;
          logger.info('Vaga processada com sucesso', { 
            codRqu: vacancy.USU_CodRqu,
            tentativa: retries + 1 
          });
        } catch (error) {
          retries++;
          logger.warn('Erro ao processar vaga, tentando novamente', {
            codRqu: vacancy.USU_CodRqu,
            tentativa: retries,
            erro: error.message
          });
          await new Promise(resolve => setTimeout(resolve, 5000 * retries)); // Backoff exponencial
        }
      }

      if (!success) {
        logger.error('Falha ao processar vaga após todas as tentativas', {
          codRqu: vacancy.USU_CodRqu,
          maxTentativas: pandapeConfig.integration.maxRetries
        });
      }
    }
  }
}

module.exports = new SchedulerService();