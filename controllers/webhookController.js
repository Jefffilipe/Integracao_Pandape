const { logger } = require('../config/pandape');
const { getCandidateDetails } = require('../services/pandapeService');
const { updateSeniorCandidate } = require('../services/seniorService');

/**
 * Controlador para gerenciamento de webhooks do PandaPe
 * @module controllers/webhook
 */

/**
 * Processa webhook de atualização do status do candidato
 * @param {Object} req - Request do webhook
 * @param {Object} res - Response do webhook
 */
async function handleCandidateStage(req, res) {
  try {
    const { requestMatchId } = req.body;
    
    // 1. Obtém dados do candidato
    const candidateData = await getCandidateDetails(requestMatchId);
    
    // 2. Retorna dados para o Senior
    await updateSeniorCandidate(candidateData);
    
    // 3. Atualiza status no banco
    await updateSeniorStatus(candidateData);
    
    logger.info('Webhook processado com sucesso', { requestMatchId });
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Erro ao processar webhook', { error: error.message });
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handleCandidateStage
};