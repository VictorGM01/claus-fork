const { getAll, create } = require('../services/emailService.js');

async function getAllController(req, res) {
  try {
    const emails = await getAll();
    return res.status(200).json({
      data: emails,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

async function createController(req, res) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const { email } = req.body;
    const novoEmail = await create(email, ip);
    return res.status(201).json(novoEmail);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

module.exports = {
  getAllController,
    createController,
};
