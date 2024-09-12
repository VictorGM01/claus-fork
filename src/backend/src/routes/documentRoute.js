const { Router } = require('express');
const { getAllController, createController, searchController } = require('../controllers/documentController');

const router = Router();

router.get('/', getAllController);
router.post('/', createController);
router.post('/search', searchController);

module.exports = router;
