const { Router } = require('express');
const { createLog, listLogs } = require('../controllers/internalController');

const router = Router();

router.post('/webhook/logs/internal', createLog);
router.get('/webhook/logs/internal', listLogs);

module.exports = router;
