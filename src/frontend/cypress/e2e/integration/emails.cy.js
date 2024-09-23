describe('Teste de Integração da Tela de E-mails', () => {

  // URL da API de backend
  const backendUrl = `${Cypress.env('VITE_URL_API_BACKEND')}`;

  // Visita a página de e-mails
  beforeEach(() => {
    cy.visit('/emails');
  });

  // Teste de carregamento da página
  it('Deve carregar a lista de e-mails corretamente', () => {
    // Verifica se a tabela foi preenchida com os dados reais do backend
    cy.request('GET', `${backendUrl}/emails`).then((response) => {
      expect(response.status).to.eq(200);
      
      // Verifica se os dados retornados estão corretos
      const emailData = response.body.data;
      const lastEmailIndex = emailData.length - 1; 

      // Acesse a tabela e verifique os dados diretamente
      cy.get('table').within(() => {
        cy.get('td').contains(emailData[lastEmailIndex].email); 
        cy.get('td').contains(emailData[lastEmailIndex].ip); 
        const formattedDate = new Date(emailData[lastEmailIndex].criado_em).toLocaleDateString('pt-BR');
        cy.get('td').contains(formattedDate); 
      });
    });

    cy.wait(1000); 
  });

  // Teste de abrir e fechar o modal de cadastro de e-mail
  it('Deve abrir e fechar o modal de cadastro de e-mail', () => {
    // Clicar no botão de "Cadastrar e-mail"
    cy.contains('Cadastrar e-mail').click();

    // Verifica se o modal foi aberto
    cy.get('#modal').should('be.visible');

    // Fechar o modal
    cy.get('#modal').find('#buttonClose').click();
    cy.get('#modal').should('not.exist');

    cy.wait(1000); 
  });

  // Teste de cadastro de novo e-mail
  it('Deve cadastrar um novo e-mail e atualizar a lista', () => {
    // Abre o modal de cadastro de e-mail
    cy.contains('Cadastrar e-mail').click();

    // Preenche o campo de e-mail e envia o formulário
    const newEmail = 'emailtestecomcypres@gmail.com';
    cy.get('input[name="email"]').type(newEmail);
    cy.get('#modal').find('#buttonRegister').click();

    // Verifica se o e-mail foi cadastrado chamando a API diretamente
    cy.request('GET', `${backendUrl}/emails`).then((response) => {
      expect(response.status).to.eq(200);

      // Verifica se o novo e-mail está na lista retornada pelo backend
      const emailData = response.body.data;
      const lastEmailIndex = emailData.length - 1; 
      const emailExists = emailData.some(e => e.email === newEmail);
      expect(emailExists).to.be.true;

      // Atualiza a tabela no frontend e verifica se o novo e-mail aparece
      cy.get('table').contains(newEmail);
    });

    // Verifica se o modal foi fechado após o cadastro
    cy.get('.modal').should('not.exist');
  });

  // Teste de cadastro de novo e-mail
  it('Deve cadastrar um novo e-mail e atualizar a lista', () => {
    // Abre o modal de cadastro de e-mail
    cy.contains('Cadastrar e-mail').click();

    // Preenche o campo de e-mail e envia o formulário
    const newEmail = 'emailtestecomcypres@gmail.com';
    cy.get('input[name="email"]').type(newEmail);
    cy.get('#modal').find('#buttonRegister').click();

    // Verifica se o e-mail foi cadastrado chamando a API diretamente
    cy.request('GET', `${backendUrl}/emails`).then((response) => {
      expect(response.status).to.eq(200);

      // Verifica se o novo e-mail está na lista retornada pelo backend
      const emailData = response.body.data;
      const emailExists = emailData.some(e => e.email === newEmail);
      expect(emailExists).to.be.true;

      // Atualiza a tabela no frontend e verifica se o novo e-mail aparece
      cy.get('table').contains(newEmail);
    });

    // Verifica se o modal foi fechado após o cadastro
    cy.get('.modal').should('not.exist');

    cy.wait(1000); 
  });

  // Teste de paginação
  it('Deve navegar entre as páginas corretamente', () => {
    // Certifique-se de que há mais de uma página de resultados
    cy.request('GET', `${backendUrl}/emails`).then((response) => {
      expect(response.status).to.eq(200);
      
      const totalResults = response.body.data.length;
      const resultsPerPage = 5; 
      const totalPages = Math.ceil(totalResults / resultsPerPage);
  
      if (totalPages > 1) {
        // Aguarde a renderização completa da paginação
        cy.get('#pagination').should('be.visible');
  
        // Verifica se a página atual está correta (Página 1)
        cy.get(`button`).contains('1');

        // Navega para a próxima página clicando no botão 2 
        cy.get(`button`).contains('2').click();

      } else {
        cy.log('Não há páginas suficientes para testar a paginação.');
      }
    });

    cy.wait(1000); 
  });
  
});
