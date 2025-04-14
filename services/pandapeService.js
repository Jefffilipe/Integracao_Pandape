const { pandapeConfig, getPandaPeToken, logger } = require('../config/pandape');
const axios = require('axios');

/**
 * Cria uma nova requisição de vaga no PandaPe
 * @param {Object} requestData - Dados da requisição a ser criada
 * @returns {Promise<Object>} Dados da requisição criada, incluindo o ID
 */
async function createRequest(requestData) {
  const token = await getPandaPeToken();
  const response = await axios.post(
    `${pandapeConfig.baseUrl}${pandapeConfig.endpoints.requests}`,
    requestData,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  logger.info('Requisição criada com sucesso', { idRequest: response.data });
  return response.data;
}

/**
 * Cria uma nova vaga no PandaPe associada a uma requisição
 * @param {Object} vacancyData - Dados da vaga a ser criada
 * @returns {Promise<Object>} Dados da vaga criada
 */
async function createVacancy(vacancyData) {
  const token = await getPandaPeToken();
  const response = await axios.post(
    `${pandapeConfig.baseUrl}${pandapeConfig.endpoints.vacancies}`,
    vacancyData,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  logger.info('Vaga criada com sucesso', { idVacancy: response.data });
  return response.data;
}

/**
 * Associa um candidato a uma requisição específica
 * @param {Object} matchData - Dados do match entre candidato e requisição
 * @returns {Promise<Object>} Dados da associação criada
 */
async function associateCandidate(matchData) {
  const token = await getPandaPeToken();
  const response = await axios.post(
    `${pandapeConfig.baseUrl}${pandapeConfig.endpoints.requestMatches}`,
    matchData,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  logger.info('Candidato associado com sucesso', { idMatch: response.data });
  return response.data;
}

/**
 * Obtém os detalhes de um candidato associado a uma requisição
 * @param {number} requestMatchId - ID do match entre candidato e requisição
 * @returns {Promise<Object>} Dados detalhados do candidato e da requisição
 */
async function getCandidateDetails(requestMatchId) {
  const token = await getPandaPeToken();
  try {
    const response = await axios.get(
      `${pandapeConfig.baseUrl}${pandapeConfig.endpoints.requestMatchById(requestMatchId)}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    logger.info('Detalhes do candidato obtidos com sucesso', { requestMatchId });
    return response.data;
  } catch (error) {
    logger.error('Erro ao obter detalhes do candidato', { 
      requestMatchId, 
      erro: error.message 
    });
    throw new Error('Falha ao obter detalhes do candidato');
  }
}

module.exports = {
  createRequest,
  createVacancy,
  associateCandidate,
  getCandidateDetails
};