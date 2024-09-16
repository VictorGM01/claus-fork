const { Router } = require('express');
const { getAllController, createController, searchController, updateDocumentTagsController } = require('../controllers/documentController');

const router = Router();

router.get('/', getAllController);
router.post('/webhook/save', createController);
router.post('/search', searchController);
router.post('/:id/tags', updateDocumentTagsController)

module.exports = router;
