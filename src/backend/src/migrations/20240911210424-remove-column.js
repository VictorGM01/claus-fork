'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // remove created e updated at de Tags_Documentos
    await queryInterface.removeColumn('Tags_Documentos', 'createdAt');
    await queryInterface.removeColumn('Tags_Documentos', 'updatedAt');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Tags_Documentos', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.addColumn('Tags_Documentos', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};
