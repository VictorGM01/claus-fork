const database = require('../../models');

async function getAll() {
  const tags = await database.Tags.findAll();

  return tags;
}

module.exports = {
    getAll,
  };