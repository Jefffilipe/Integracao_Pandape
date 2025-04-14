// api.js
const express = require('express');
const axios = require('axios');
const { getConnection } = require('../config/db');
const { getPandaPeToken, pandapeConfig, logger } = require('../config/pandape');
const { mapSeniorToPandaPe } = require('../mappers/seniorToPandape');
const { handleCandidateStage } = require('../controllers/webhookController');

const router = express.Router();

// Novo endpoint para testar a criação de requisição e vaga
router.post('/test-sync', async (req, res) => {
  const { codRqu } = req.body;
  if (!codRqu) {
    logger.warn('USU_CodRqu não fornecido');
    return res.status(400).json({ error: 'USU_CodRqu é obrigatório' });
  }

  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM USU_TIdPanda WHERE USU_CodRqu = :codRqu AND USU_EnvPanda = 'N'`,
      { codRqu }
    );

    if (!result.rows.length) {
      logger.info('Nenhuma requisição encontrada para o USU_CodRqu fornecido', { codRqu });
      return res.status(404).json({ message: 'Nenhuma requisição encontrada ou já sincronizada' });
    }

    const token = await getPandaPeToken();
    const syncResults = [];

    const row = result.rows[0];
    const seniorData = Object.fromEntries(result.metaData.map((col, i) => [col.name, row[i]]));
    const requestData = mapSeniorToPandaPe(seniorData, 'request');

    try {
      // 1. Criar a requisição no PandaPe
      const requestResponse = await axios.post(
        `${pandapeConfig.baseUrl}${pandapeConfig.endpoints.requests}`,
        requestData,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      const idRequest = requestResponse.data;
      logger.info('Requisição criada com sucesso', { codRqu: seniorData.USU_CodRqu, idRequest });

      // 2. Criar a vaga associada à requisição
      seniorData.idRequest = idRequest; // Adicionar o idRequest ao seniorData para uso no mapeamento da vaga
      const vacancyData = mapSeniorToPandaPe(seniorData, 'vacancy');

      const vacancyResponse = await axios.post(
        `${pandapeConfig.baseUrl}${pandapeConfig.endpoints.vacancies}`,
        vacancyData,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      const idVacancy = vacancyResponse.data;
      logger.info('Vaga criada com sucesso', { codRqu: seniorData.USU_CodRqu, idRequest, idVacancy });

      // 3. Atualizar o banco com o ID da requisição
      await connection.execute(
        `UPDATE USU_TIdPanda SET USU_EnvPanda = 'S', USU_IdPanda = :idPanda WHERE USU_CodRqu = :codRqu`,
        { idPanda: idRequest, codRqu: seniorData.USU_CodRqu }
      );
      await connection.commit();

      syncResults.push({ codRqu: seniorData.USU_CodRqu, idPanda: idRequest, idVacancy, status: 'success' });
      res.json({ syncResults });
    } catch (error) {
      logger.error('Erro ao enviar vaga ao PandaPe', { 
        codRqu: seniorData.USU_CodRqu, 
        error: error.response ? error.response.data : error.message 
      });
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    logger.error('Erro geral na sincronização', { error: error.message });
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        logger.error('Erro ao fechar conexão com o banco', { error: error.message });
      }
    }
  }
});

// Endpoint /sync (ajustado para usar o novo mapeamento)
router.get('/sync', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`SELECT * FROM USU_TIdPanda WHERE USU_EnvPanda = 'N'`);
    
    if (!result.rows.length) {
      logger.info('Nenhuma nova vaga para sincronizar');
      return res.json({ message: 'Nenhuma nova vaga para sincronizar' });
    }

    const token = await getPandaPeToken();
    const syncResults = [];

    for (const row of result.rows) {
      const seniorData = Object.fromEntries(result.metaData.map((col, i) => [col.name, row[i]]));
      const requestData = mapSeniorToPandaPe(seniorData, 'request');

      try {
        const requestResponse = await axios.post(
          `${pandapeConfig.baseUrl}/api/ExternalRequest/Insert`,
          requestData,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        const idRequest = requestResponse.data;
        logger.info('Requisição criada com sucesso', { codRqu: seniorData.USU_CodRqu, idRequest });

        seniorData.idRequest = idRequest;
        const vacancyData = mapSeniorToPandaPe(seniorData, 'vacancy');

        const vacancyResponse = await axios.post(
          `${pandapeConfig.baseUrl}/api/Vacancy/Insert`,
          vacancyData,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        const idVacancy = vacancyResponse.data;
        logger.info('Vaga criada com sucesso', { codRqu: seniorData.USU_CodRqu, idRequest, idVacancy });

        await connection.execute(
          `UPDATE USU_TIdPanda SET USU_EnvPanda = 'S', USU_IdPanda = :idPanda WHERE USU_CodRqu = :codRqu`,
          { idPanda: idRequest, codRqu: seniorData.USU_CodRqu }
        );
        await connection.commit();

        syncResults.push({ codRqu: seniorData.USU_CodRqu, idPanda: idRequest, idVacancy, status: 'success' });
      } catch (error) {
        logger.error('Erro ao enviar vaga ao PandaPe', { 
          codRqu: seniorData.USU_CodRqu, 
          error: error.response ? error.response.data : error.message 
        });
        syncResults.push({ codRqu: seniorData.USU_CodRqu, error: error.message, status: 'error' });
      }
    }

    res.json({ syncResults });
  } catch (error) {
    logger.error('Erro geral na sincronização', { error: error.message });
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        logger.error('Erro ao fechar conexão com o banco', { error: error.message });
      }
    }
  }
});

// Endpoint /webhook/candidate-stage (mantido como está)
// Remover estas linhas duplicadas
// const express = require('express');
// const router = express.Router();
// const { handleCandidateStage } = require('../controllers/webhookController');

// Manter apenas a rota
router.post('/webhook/candidate-stage', handleCandidateStage);

module.exports = router;