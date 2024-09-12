'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Orgaos extends Model {
    static associate(models) {
      Orgaos.hasMany(models.Documentos, {
        foreignKey: 'id_orgao',
        as: 'documentos',
      });
    }
  }
  Orgaos.init(
    {
      nome: DataTypes.STRING,
      link: DataTypes.TEXT,
      criado_em: DataTypes.DATE,
      atualizado_em: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Orgaos',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    }
  );
  return Orgaos;
};
