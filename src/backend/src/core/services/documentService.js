const database = require('../../models');
const { Op } = require('sequelize');

async function getAll() {
  const documentos = await database.Documentos.findAll({
    include: [
      {
        model: database.Tags,
        as: 'tags',
        through: { attributes: [] },
      },
      {
        model: database.Tipos_Documentos,
        as: 'tipo',
      },
      {
        model: database.Orgaos,
        as: 'orgao',
      },
    ],
  });

  return documentos;
}

async function create(documento) {
  let { nome, link, data_publicacao, tipo, orgao, tags, filename, b2_url } =
    documento;

  const tipoDocumentoBd = await database.Tipos_Documentos.findOne({
    where: { nome: tipo },
  });

  if (!tipoDocumentoBd) {
    throw new Error(`Tipo de documento '${tipo}' não encontrado`);
  }

  if (!orgao) {
    orgao = 'CVM';
  }

  const orgaoBd = await database.Orgaos.findOne({
    where: { nome: orgao },
  });

  if (!orgaoBd) {
    throw new Error(`Órgão '${orgao}' não encontrado`);
  }

  let tagsExistentes = [];
  if (tags && tags.length) {
    tagsExistentes = await database.Tags.findAll({
      where: {
        nome: tags,
      },
    });
  }

  if (tagsExistentes.length !== tags.length) {
    const tagsFaltantes = tags.filter(
      (tag) => !tagsExistentes.some((t) => t.nome === tag)
    );

    if (tagsFaltantes.length) {
      throw new Error(`Tags não encontradas: ${tagsFaltantes.join(', ')}`);
    }
  }

  const novoDocumento = await database.Documentos.create({
    nome,
    link,
    data_publicacao,
    id_tipo: tipoDocumentoBd.id,
    id_orgao: orgaoBd.id,
    filename,
    b2_url,
  });

  if (tagsExistentes.length) {
    await novoDocumento.setTags(tagsExistentes);
  }

  return novoDocumento;
}

async function search(parameters) {
  const { tipo_documento, orgao, tags, datas } = parameters;

  let sql = `
    SELECT 
      d.id, 
      d.nome, 
      d.link, 
      d.data_publicacao, 
      d.id_tipo, 
      d.id_orgao, 
      t.nome AS tipo_nome, 
      o.nome AS orgao_nome, 
      ARRAY_AGG(json_build_object('id', tg.id, 'nome', tg.nome)) AS tags
    FROM "Documentos" d
    LEFT JOIN "Tipos_Documentos" t ON d.id_tipo = t.id
    LEFT JOIN "Orgaos" o ON d.id_orgao = o.id
    LEFT JOIN "Tags_Documentos" td ON d.id = td.id_documento
    LEFT JOIN "Tags" tg ON td.id_tag = tg.id
  `;

  let whereClauses = [];

  if (tipo_documento) {
    whereClauses.push(`t.nome = '${tipo_documento}'`);
  }

  if (orgao) {
    whereClauses.push(`o.nome = '${orgao}'`);
  }

  if (tags && tags.length) {
    const tagNames = tags.map(tag => `'${tag}'`).join(', ');
    whereClauses.push(`d.id IN (
      SELECT td.id_documento
      FROM "Tags_Documentos" td
      LEFT JOIN "Tags" tg ON td.id_tag = tg.id
      WHERE tg.nome IN (${tagNames})
    )`);
  }

  if (datas && datas.length) {
    const datasFiltradas = datas.map(([dataInicial, dataFinal]) => {
      const dataInicialFormatada = new Date(dataInicial).toISOString();
      const dataFinalFormatada = new Date(dataFinal).toISOString();
      return `(d.data_publicacao BETWEEN '${dataInicialFormatada}' AND '${dataFinalFormatada}')`;
    }).join(' OR ');

    whereClauses.push(`(${datasFiltradas})`);
  }

  if (whereClauses.length) {
    sql += ' WHERE ' + whereClauses.join(' OR ');
  }

  sql += ' GROUP BY d.id, d.nome, d.link, d.data_publicacao, d.id_tipo, d.id_orgao, t.nome, o.nome';

  const documentos = await database.sequelize.query(sql, {
    type: database.Sequelize.QueryTypes.SELECT,
  });

  return documentos;
}

async function updateDocumentTags(idDocumento, idTags) {
  const documento = await database.Documentos.findByPk(idDocumento);
  if (!documento) {
    throw new Error(`Documento com id ${idDocumento} não encontrado`);
  }

  const tagsBd = await database.Tags.findAll({
    where: {
      id: idTags,
    },
  });

  if (tagsBd.length !== idTags.length) {
    const tagsNaoEncontradas = idTags.filter(
      (id) => !tagsBd.some((tag) => tag.id === id)
    );

    throw new Error(
      `Ids de Tags não encontrados: ${tagsNaoEncontradas.join(', ')}`
    );
  }

  await documento.setTags(tagsBd);

  return { documento, tags: tagsBd };
}

module.exports = {
  getAll,
  create,
  search,
  updateDocumentTags,
};
