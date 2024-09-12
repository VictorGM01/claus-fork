'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // bulk insert em Tipos_Documentos
    const tipos = [
      'Instruções',
      'Pareceres de Orientação',
      'Deliberações',
      'Decisões Conjuntas',
      'Ofícios Circulares',
      'Leis e Decretos',
      'Notas Explicativas',
    ];

    const rows = tipos.map((tipo) => ({
      nome: tipo,
      criado_em: new Date(),
      atualizado_em: new Date(),
    }));

    await queryInterface.bulkInsert('Tipos_Documentos', rows, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tipos_Documentos', null, {});
  },
};
