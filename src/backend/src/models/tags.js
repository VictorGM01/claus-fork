'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tags extends Model {
    static associate(models) {
      Tags.belongsToMany(models.Documentos, {
        through: 'Tags_Documentos',
        foreignKey: 'id_tag',
        otherKey: 'id_documento',
        as: 'documentos',
      });
    }
  }
  Tags.init(
    {
      nome: DataTypes.STRING,
      descricao: DataTypes.TEXT,
      criado_em: DataTypes.DATE,
      atualizado_em: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Tags',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    }
  );
  return Tags;
};
