const { getAll } = require('../services/tagService.js');

async function getAllController(req, res) {
  try {
    const tags = await getAll();
    return res.status(200).json({
      data: tags,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

module.exports = {
  getAllController,
};
