const express = require('express');
const documentRouter = require('./documentRoute.js');
const emailRouter = require('./emailRoute.js');

const router = express.Router();

router.use(express.json());

router.get('/', (req, res) => {
  res.json({ message: 'API Claus is running!' });
});

router.use('/documents', documentRouter);
router.use('/emails', emailRouter);

// Exporta o router
module.exports = router;
