'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const orgaos = [
      {
        nome: 'CVM',
        link: 'https://conteudo.cvm.gov.br/legislacao/index.html',
      },
    ];

    const rows = orgaos.map((orgao) => ({
      nome: orgao.nome,
      link: orgao.link,
      criado_em: new Date(),
      atualizado_em: new Date(),
    }));

    await queryInterface.bulkInsert('Orgaos', rows, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Orgaos', null, {});
  },
};
