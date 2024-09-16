const axios = require('axios');
require('dotenv').config();

const LOG_SERVICE_URL = process.env.LOG_SERVICE_URL;

async function getAllController(req, res) {
    try {
        const response = await axios.get(`${LOG_SERVICE_URL}/webhook/logs/external`);
        res.json(response.data);
    } catch (err) {
        res.status(err.response ? err.response.status : 500).json({
            error: err.response ? err.response.data.message : 'Internal server error',
        });
    }
    }

async function createController(req, res) {
    try {
        const response = await axios.post(`${LOG_SERVICE_URL}/webhook/logs/external`, req.body);
        res.json(response.data);
    } catch (err) {
        res.status(err.response ? err.response.status : 500).json({
            error: err.response ? err.response.data.message : 'Internal server error',
        });
    }
}

module.exports = {
    getAllController,
    createController,
};