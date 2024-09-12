'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tipos_Logs extends Model {
    static associate(models) {
      Tipos_Logs.hasMany(models.Logs, {
        foreignKey: 'id_tipo',
        as: 'logs',
      });
    }
  }
  Tipos_Logs.init(
    {
      nome: DataTypes.STRING,
      criado_em: DataTypes.DATE,
      atualizado_em: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Tipos_Logs',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    }
  );
  return Tipos_Logs;
};
