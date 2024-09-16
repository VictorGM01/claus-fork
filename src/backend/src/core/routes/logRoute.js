const { Router } = require('express');
const { getAllController, createController } = require('../controllers/logController');

const router = Router();

router.get('/', getAllController);
router.post('/', createController);

module.exports = router;