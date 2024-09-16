'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tipos = [
      'Acesso à página principal',
      'Busca realizada',
      'Filtro realizado',
      'Documento visualizado',
      'Acesso à página de logs',
      'Acesso à página de e-mails',
      'Cadastro de e-mail',
    ];

    const tiposLogs = tipos.map((nome) => ({
      nome,
      criado_em: new Date(),
      atualizado_em: new Date(),
    }));

    await queryInterface.bulkInsert('Tipos_Logs', tiposLogs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tipos_Logs', null, {});
  },
};
