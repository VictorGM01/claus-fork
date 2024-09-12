'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Emails extends Model {
    static associate(models) {}
  }
  Emails.init(
    {
      email: DataTypes.STRING,
      ip: DataTypes.STRING,
      criado_em: DataTypes.DATE,
      atualizado_em: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Emails',
      timestamps: true,
      createdAt: 'criado_em',
      updatedAt: 'atualizado_em',
    }
  );
  return Emails;
};
