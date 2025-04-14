/**
 * Rotas para webhooks do PandaPe
 * @module routes/webhook
 */

const express = require('express');
const router = express.Router();
const { handleCandidateStage } = require('../controllers/webhookController');

/**
 * Rota POST para receber atualizações de estágio do candidato
 * @name post/candidate-stage
 * @function
 */
router.post('/candidate-stage', handleCandidateStage);

module.exports = router;