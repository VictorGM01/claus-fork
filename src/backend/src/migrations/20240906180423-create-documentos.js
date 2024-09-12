'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Documentos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nome: {
        type: Sequelize.TEXT,
      },
      link: {
        type: Sequelize.TEXT,
      },
      data_publicacao: {
        type: Sequelize.DATE,
      },
      id_tipo: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Tipos_Documentos',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
      },
      id_orgao: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Orgaos',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
      },
      criado_em: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      atualizado_em: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Documentos');
  },
};
