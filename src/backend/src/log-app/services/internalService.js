const database = require('../../models');

async function create(dto) {
  const log = await database.Logs_Internos.create({
    inicio_execucao: dto.inicio_execucao,
    fim_execucao: dto.fim_execucao,
    retorno_documentos: dto.retorno_documentos,
    total_documentos_sucessos: dto.total_documentos_sucessos,
    total_documentos_falhos: dto.total_documentos_falhos,
    retorno_emails: dto.retorno_emails,
    total_emails_sucessos: dto.total_emails_sucessos,
    total_emails_falhos: dto.total_emails_falhos,
  });

  return log;
}

async function list() {
  const logs = await database.Logs_Internos.findAndCountAll({
    order: [['criado_em', 'DESC']],
  });

  return logs;
}

module.exports = {
  create,
  list,
};
