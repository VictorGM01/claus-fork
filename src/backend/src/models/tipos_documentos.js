'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tipos_Documentos extends Model {
    static associate(models) {
      Tipos_Documentos.hasMany(models.Documentos, {
        foreignKey: 'id_tipo',
        as: 'documentos',
      });
    }
  }
  Tipos_Documentos.init(
    {
      nome: DataTypes.TEXT,
      criado_em: DataTypes.DATE,
      atualizado_em: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Tipos_Documentos',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    }
  );
  return Tipos_Documentos;
};
