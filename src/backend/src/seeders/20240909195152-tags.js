'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const cvmTags = [
      'Administradores de Carteiras',
      'Agencias de Classificação de Risco de Crédito',
      'Agentes Fiduciários',
      'Alerta',
      'Analistas de Valores Mobiliários',
      'Assessores de Investimento',
      'Ato Declaratório',
      'Atuação Irregular',
      'Audiência Pública',
      'Auditor Independente',
      'BDR',
      'Cadastro de Participantes Regulados',
      'Clubes de Investimento',
      'Companhia',
      'Comunicado ao Mercado',
      'Concurso/Prêmio',
      'Consultores de Valores Mobiliários',
      'Convênio',
      'Coronavirus',
      'Corretora',
      'Crowdfunding',
      'Decisão do Colegiado',
      'Deliberação',
      'Educação Financeira',
      'Evento',
      'Fundos de Investimento',
      'Fundos de Investimento em Direitos Creditórios',
      'Fundos de Investimento em Participações',
      'Fundos de Investimento Imobiliários',
      'Gestão Institucional',
      'Indenização',
      'Infraestrutura do Mercado',
      'Insider Trading',
      'Intermediários',
      'Investidores Nao Residentes',
      'Julgamento',
      'Julgamento_Insider',
      'Mercados Organizados',
      'Normas Contábeis',
      'Nota',
      'Ofertas Publicas',
      'Ofício Circular',
      'Ouvidoria',
      'Parecer de Orientação',
      'Pesquisa',
      'Planejamento Estratégico',
      'PLD/FTP',
      'Processo Eletrônico',
      'Protocolo Digital',
      'Publicação',
      'Ritos CVM',
      'Sandbox Regulatório',
      'Securitizadoras',
      'Sistema de governança e gestão da CVM',
      'Suitability',
      'Suspensão',
      'Tecnologia da Informação',
      'Termo_Compromisso_Insider',
      'Termo de Compromisso',
    ];

    const currentDate = new Date();

    await queryInterface.bulkInsert(
      'Tags',
      cvmTags.map((tag) => ({
        nome: tag,
        descricao: null,
        criado_em: currentDate,
        atualizado_em: currentDate,
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tags', null, {});
  },
};
