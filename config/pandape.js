/**
 * Configuração e serviços de autenticação do PandaPe
 * @module config/pandape
 */

const axios = require('axios');
const winston = require('winston');
require('dotenv').config();

/**
 * Configuração do logger para registro de eventos da aplicação
 */
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/app.log' }),
    new winston.transports.Console()
  ]
});

/**
 * Configurações base da API do PandaPe
 * @constant {Object}
 */
const pandapeConfig = {
  baseUrl: 'https://api.pandape.com.br/v2',
  endpoints: {
    token: 'https://login.pandape.com.br/connect/token',
    requests: '/requests',
    vacancies: '/vacancies',
    customFields: '/custom-fields',
    dataSources: '/data-sources/items',
    requestMatches: '/request-matches',
    requestMatchById: (id) => `/request-matches/${id}`
  },
  clientId: process.env.PANDAPE_CLIENT_ID || 'AtacadaoApiClient',
  clientSecret: process.env.PANDAPE_CLIENT_SECRET || 'db1d76a77dca4ecb997c',
  webhook: {
    candidateStage: '/candidate-stage'
  },
  integration: {
    enabled: process.env.PANDAPE_INTEGRATION_ENABLED === 'true',
    checkInterval: parseInt(process.env.PANDAPE_CHECK_INTERVAL) || 300000, // 5 minutos
    maxRetries: parseInt(process.env.PANDAPE_MAX_RETRIES) || 3
  }
};

/**
 * Obtém token de autenticação para as requisições à API
 * @returns {Promise<string>} Token de autenticação
 */
async function getPandaPeToken() {
  if (cachedToken && tokenExpiration > Date.now()) {
    logger.info('Token reutilizado do cache');
    return cachedToken;
  }

  try {
    const response = await axios.post(pandapeConfig.endpoints.token, 
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: pandapeConfig.clientId,
        client_secret: pandapeConfig.clientSecret,
        scope: 'ExternalRequestApi PandapeApi'
      }), 
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiration = Date.now() + (response.data.expires_in * 1000) - 60000; // Expira 1min antes
    logger.info('Token obtido com sucesso', { tokenExpiration: new Date(tokenExpiration).toISOString() });
    return cachedToken;
  } catch (error) {
    logger.error('Erro ao obter token de autenticação', { error: error.message });
    throw new Error('Falha na autenticação com o PandaPe');
  }
}

async function getCustomFields() {
  try {
    const token = await getPandaPeToken();
    const response = await axios.get(
      `${pandapeConfig.baseUrl}${pandapeConfig.endpoints.customFields}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    logger.info('Custom fields obtained successfully');
    return response.data;
  } catch (error) {
    logger.error('Error fetching custom fields', { error: error.message });
    throw new Error('Failed to fetch custom fields');
  }
}

async function getDataSourceItems(idDatasource) {
  try {
    const token = await getPandaPeToken();
    const response = await axios.get(
      `${pandapeConfig.baseUrl}${pandapeConfig.endpoints.dataSources}?IdDatasource=${idDatasource}&Page=1&PageSize=1000`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    logger.info(`Data source items obtained successfully for ID ${idDatasource}`);
    return response.data;
  } catch (error) {
    logger.error('Error fetching data source items', { error: error.message });
    throw new Error('Failed to fetch data source items');
  }
}

module.exports = { 
  pandapeConfig, 
  getPandaPeToken, 
  getCustomFields,
  getDataSourceItems,  // New export
  logger 
}; // Exporta o logger para uso em outros módulos