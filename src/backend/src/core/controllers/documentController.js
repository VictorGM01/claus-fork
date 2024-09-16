const { v4: uuidv4 } = require('uuid');

const {
  getAll,
  create,
  search,
  updateDocumentTags,
} = require('../services/documentService.js');

const { publishToQueue, consumeQueue } = require('../../utils/queue.js');

async function getAllController(req, res) {
  try {
    const documentos = await getAll();

    return res.status(200).json({
      message: 'Documents listed successfully',
      data: documentos,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

async function createController(req, res) {
  try {
    const documento = req.body;

    const novoDocumento = await create(documento);

    return res.status(201).json({
      message: 'Document created successfully',
      data: novoDocumento,
    });
  } catch (err) {
    if (
      err.message.includes('não encontrado') ||
      err.message.includes('não encontradas')
    ) {
      return res.status(400).json({
        message: err.message,
      });
    }

    console.error(err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

async function searchController(req, res) {
  try {
    const { input } = req.body;
    const correlationId = uuidv4();
    const data = {
      input,
      correlationId,
    };
    await publishToQueue('core.documents.search', data);

    const parameters = await consumeQueue(
      'core.documents.search.response',
      data.correlationId
    );

    const documentos = await search(parameters);

    return res.status(200).json({
      message: 'Documents found successfully',
      data: documentos,
    });
  } catch (err) {
    if (err.message.includes('Timeout')) {
      return res.status(504).json({
        message: 'Request timed out',
      });
    } else {
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
  }
}

async function updateDocumentTagsController(req, res) {
  try {
    const idDocumento = parseInt(req.params.id);
    const { idTags } = req.body;

    const documento = await updateDocumentTags(idDocumento, idTags);

    return res.status(200).json({
      message: 'Document tags updated successfully',
      data: documento,
    });
  } catch (err) {
    if (err.message.includes('não encontrado')) {
      return res.status(400).json({
        message: err.message,
      });
    }
    console.error(err);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

module.exports = {
  getAllController,
  createController,
  searchController,
  updateDocumentTagsController,
};
