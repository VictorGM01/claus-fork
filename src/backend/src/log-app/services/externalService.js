const database = require('../../models');

async function create(dto) {
  const tipoLog = await database.Tipos_Logs.findOne({
    where: { nome: dto.tipo },
    attributes: ['id'],
  });

  if (!tipoLog) {
    throw new Error(`Tipo de log '${dto.tipo}' não encontrado`);
  }

  const log = await database.Logs.create({
    ip: dto.ip,
    descricao: dto.descricao,
    id_tipo: tipoLog.id,
  });

  return log;
}

async function list() {
  const logs = await database.Logs.findAndCountAll({
    include: [
      {
        model: database.Tipos_Logs,
        as: 'tipo',
        attributes: ['nome'],
      },
    ],
    order: [['criado_em', 'DESC']],
  });

  return logs;
}

module.exports = {
  create,
  list,
};
