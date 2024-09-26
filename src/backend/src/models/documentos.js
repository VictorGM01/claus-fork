'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Documentos extends Model {
    static associate(models) {
      Documentos.belongsTo(models.Tipos_Documentos, {
        foreignKey: 'id_tipo',
        as: 'tipo',
      });
      Documentos.belongsTo(models.Orgaos, {
        foreignKey: 'id_orgao',
        as: 'orgao',
      });
      Documentos.belongsToMany(models.Tags, {
        through: 'Tags_Documentos',
        foreignKey: 'id_documento',
        otherKey: 'id_tag',
        as: 'tags',
      });
    }
  }
  Documentos.init(
    {
      nome: DataTypes.TEXT,
      link: DataTypes.TEXT,
      data_publicacao: DataTypes.DATE,
      id_tipo: DataTypes.INTEGER,
      id_orgao: DataTypes.INTEGER,
      filename: DataTypes.TEXT,
      b2_url: DataTypes.TEXT,
      criado_em: DataTypes.DATE,
      atualizado_em: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Documentos',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    }
  );
  return Documentos;
};
