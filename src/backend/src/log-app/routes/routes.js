const express = require('express');
const externalLogRouter = require('./externalRoute.js');
const internalLogRouter = require('./internalRoute.js');

const router = express.Router();

router.use(express.json());

router.get('/', (req, res) => {
  res.json({ message: 'Log API is running!' });
});

router.use(externalLogRouter);
router.use(internalLogRouter);

// Exporta o router
module.exports = router;
