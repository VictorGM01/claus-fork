'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Logs extends Model {
    static associate(models) {
      Logs.belongsTo(models.Tipos_Logs, {
        foreignKey: 'id_tipo',
        as: 'tipo',
      });
    }
  }
  Logs.init(
    {
      ip: DataTypes.STRING,
      id_tipo: DataTypes.NUMBER,
      descricao: DataTypes.TEXT,
      criado_em: DataTypes.DATE,
      atualizado_em: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Logs',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    }
  );
  return Logs;
};
