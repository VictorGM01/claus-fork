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
  let { nome, link, data_publicacao, tipo, orgao, tags } = documento;

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

  // cria apenas se não existir
  const [novoDocumento, created] = await database.Documentos.findOrCreate({
    where: {
      nome,
      link,
    },
    defaults: {
      data_publicacao,
      id_tipo: tipoDocumentoBd.id,
      id_orgao: orgaoBd.id,
    },
  });

  if (tagsExistentes.length) {
    await novoDocumento.setTags(tagsExistentes);
  }

  return novoDocumento;
}

async function search(parameters) {
  const { tipo_documento, orgao, tags, datas } = parameters;

  const query = {
    where: {},
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
  };

  if (tipo_documento) {
    const tipoDocumentoBd = await database.Tipos_Documentos.findOne({
      where: { nome: tipo_documento },
    });
    if (tipoDocumentoBd) {
      query.where.id_tipo = tipoDocumentoBd.id;
    }
  }

  if (orgao) {
    const orgaoBd = await database.Orgaos.findOne({
      where: { nome: orgao },
    });
    if (orgaoBd) {
      query.where.id_orgao = orgaoBd.id;
    }
  }

  if (tags && tags.length) {
    query.include.push({
      model: database.Tags,
      as: 'tags',
      where: {
        nome: tags,
      },
      through: { attributes: [] },
    });
  }

  if (datas && datas.length) {
    const datasFiltradas = [];

    datas.forEach(([dataInicial, dataFinal]) => {
      const dataInicialFormatada = new Date(dataInicial);
      const dataFinalFormatada = new Date(dataFinal);

      datasFiltradas.push({
        data_publicacao: {
          [Op.between]: [dataInicialFormatada, dataFinalFormatada],
        },
      });
    });

    if (datasFiltradas.length) {
      query.where[Op.or] = datasFiltradas;
    }
  }

  const documentos = await database.Documentos.findAll(query);
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
}

module.exports = {
  getAll,
  create,
  search,
  updateDocumentTags,
};
