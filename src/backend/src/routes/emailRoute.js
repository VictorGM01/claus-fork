const { Router } = require('express');
const { getAllController, createController } = require('../controllers/emailController');

const router = Router();

router.get('/', getAllController);
router.post('/', createController);

module.exports = router;