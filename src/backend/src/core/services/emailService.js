const database = require('../../models');

async function getAll() {
  const emails = await database.Emails.findAll();

  return emails;
}

async function create(email, ip) {
  const novoEmail = await database.Emails.create({
    email,
    ip,
  });

  return novoEmail;
}

module.exports = {
  getAll,
  create,
};
