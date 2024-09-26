'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // adiciona coluna filename e b2_url na tabela Documentos
    await queryInterface.addColumn('Documentos', 'filename', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Documentos', 'b2_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // remove coluna filename e b2_url da tabela Documentos
    await queryInterface.removeColumn('Documentos', 'filename');
    await queryInterface.removeColumn('Documentos', 'b2_url');
  },
};
