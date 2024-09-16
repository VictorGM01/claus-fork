const { Router } = require('express');
const { createLog, listLogs } = require('../controllers/externalController');

const router = Router();

router.post('/webhook/logs/external', createLog);
router.get('/webhook/logs/external', listLogs);

module.exports = router;
