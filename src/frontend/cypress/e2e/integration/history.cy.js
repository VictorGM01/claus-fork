describe('Teste de Integração da Página Historico', () => {
  const backendUrl = `${Cypress.env('VITE_URL_API_BACKEND')}`;

  beforeEach(() => {
    cy.visit('/historico');
  });

  it('Deve carregar a lista de logs corretamente', () => {
    cy.request('GET', `${backendUrl}/logs`).then((response) => {
      expect(response.status).to.eq(200);

      const logsData = response.body.rows;

      cy.get('table').should('exist');

      if (logsData.length > 0) {
        cy.get('table').within(() => {
          cy.contains(logsData[0].ip);
          cy.contains(logsData[0].tipo.nome);
          cy.contains(logsData[0].descricao);
        });
      } else {
        cy.log('Nenhum log disponível para exibir.');
      }
    });
  });

  it('Deve filtrar os logs por data corretamente', () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    const todayDate = today.getDate();
  
    cy.get('#dateFilterButton').click();
  
    // Selecionar o mês e o ano atuais, se necessário
    // (adicione a lógica aqui caso precise navegar entre meses/anos)
  
    // Selecionar o dia de hoje
    cy.get('.react-datepicker__day')
      .not('.react-datepicker__day--outside-month')
      .contains(new RegExp(`^${todayDate}$`))
      .click();
  
    // Verificar se o filtro foi aplicado e os logs correspondem à data selecionada
    cy.get('table').within(() => {
      cy.get('td').contains(formattedDate);
    });
  });

  it('Deve filtrar os logs por tipo de ação corretamente', () => {
    const actionType = 'Acesso à página de logs';

    cy.get('#actionFilterButton').click();
    cy.get('#searchFilterInput').type(actionType);
    cy.contains(actionType).parent().find('input[type="checkbox"]').check();
    cy.get('#applyFilterButton').click();

    cy.get('table').within(() => {
      cy.get('td').contains(actionType);
    });
  });

  it('Deve filtrar os logs por endereço IP corretamente', () => {
    cy.request('GET', `${backendUrl}/logs`).then((response) => {
      expect(response.status).to.eq(200);

      const logsData = response.body.rows;

      if (logsData.length > 0) {
        const ipAddress = logsData[0].ip;

        cy.get('#ipFilterButton').click();
        cy.get('#searchFilterInput').type(ipAddress);
        cy.contains(ipAddress).parent().find('input[type="checkbox"]').check();
        cy.get('#applyFilterButton').click();

        cy.get('table').within(() => {
          cy.get('td').contains(ipAddress);
        });
      }
    });
  });

  it('Deve navegar entre as páginas corretamente', () => {
    cy.request('GET', `${backendUrl}/logs`).then((response) => {
      expect(response.status).to.eq(200);
  
      const totalResults = response.body.rows.length;
      const resultsPerPage = 5;
      const totalPages = Math.ceil(totalResults / resultsPerPage);
  
      if (totalPages > 1) {
        // Verifica se a paginação está visível
        cy.get('#pagination').should('be.visible');
  
        // Verifica se a página atual é a primeira
        cy.get('[data-testid="pageButton-1"]').should('have.attr', 'data-active', 'true');
  
        // Navega para a próxima página clicando no botão de página 2
        cy.get('[data-testid="pageButton-2"]').click();
        cy.wait(1000);
  
        // Verifica se a página atual é a segunda
        cy.get('[data-testid="pageButton-2"]').should('have.attr', 'data-active', 'true');
      } else {
        cy.log('Não há páginas suficientes para testar a paginação.');
      }
    });
  });

  it('Deve alternar para o tema escuro corretamente', () => {
    // Verifica que o tema inicial é claro
    cy.get('main').should('have.attr', 'data-theme', 'light');
  
    // Clica no checkbox para alternar para o tema escuro
    cy.get('#themeToggle').click();
  
    // Verifica que o tema agora é escuro
    cy.get('main').should('have.attr', 'data-theme', 'dark');
  });
});
