'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      ip: {
        type: Sequelize.STRING,
      },
      id_tipo: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Tipos_Logs',
          key: 'id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
      },
      descricao: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('Logs');
  },
};
