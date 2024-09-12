'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Logs_Interno extends Model {
    static associate(models) {}
  }
  Logs_Interno.init(
    {
      inicio_execucao: DataTypes.DATE,
      fim_execucao: DataTypes.DATE,
      retorno_documentos: DataTypes.TEXT,
      total_documentos_sucessos: DataTypes.INTEGER,
      total_documentos_falhos: DataTypes.INTEGER,
      retorno_emails: DataTypes.TEXT,
      total_emails_sucessos: DataTypes.INTEGER,
      total_emails_falhos: DataTypes.INTEGER,
      criado_em: DataTypes.DATE,
      atualizado_em: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Logs_Interno',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    }
  );
  return Logs_Interno;
};
