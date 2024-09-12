require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./routes/routes.js');
const cors = require('cors');

// Middleware para processar JSON
app.use(express.json());
app.use(cors());

// Configuração das rotas
app.use('/', routes);

module.exports = app;
