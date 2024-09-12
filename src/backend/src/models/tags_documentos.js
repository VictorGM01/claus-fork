'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tags_Documentos extends Model {
    static associate(models) {
      Tags_Documentos.belongsTo(models.Tags, {
        foreignKey: 'id_tag',
        as: 'tag',
      });
      Tags_Documentos.belongsTo(models.Documentos, {
        foreignKey: 'id_documento',
        as: 'documento',
      });
    }
  }
  Tags_Documentos.init(
    {
      id_tag: DataTypes.NUMBER,
      id_documento: DataTypes.NUMBER,
      criado_em: DataTypes.DATE,
      atualizado_em: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Tags_Documentos',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    }
  );
  return Tags_Documentos;
};
