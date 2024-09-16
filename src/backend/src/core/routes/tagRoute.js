const { Router } = require('express');
const { getAllController } = require('../controllers/tagController');

const router = Router();

router.get('/', getAllController);

module.exports = router;