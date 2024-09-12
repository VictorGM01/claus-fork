'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Logs_Internos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      inicio_execucao: {
        type: Sequelize.DATE,
      },
      fim_execucao: {
        type: Sequelize.DATE,
      },
      retorno_documentos: {
        type: Sequelize.TEXT,
      },
      total_documentos_sucessos: {
        type: Sequelize.INTEGER,
      },
      total_documentos_falhos: {
        type: Sequelize.INTEGER,
      },
      retorno_emails: {
        type: Sequelize.TEXT,
      },
      total_emails_sucessos: {
        type: Sequelize.INTEGER,
      },
      total_emails_falhos: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('Logs_Internos');
  },
};
