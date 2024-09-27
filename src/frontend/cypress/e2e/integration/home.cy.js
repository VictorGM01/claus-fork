describe('Teste de Integração da Página Home', () => {
    // URL da API de backend
    const backendUrl = `${Cypress.env('VITE_URL_API_BACKEND')}`;
  
    // Visita a página Home antes de cada teste
    beforeEach(() => {
      cy.visit('/');
    });
  
    // Função para formatar a data no formato dd/MM/yyyy
    const formatDateToDDMMYYYY = (dateString) => {
      const [year, month, day] = dateString.split("T")[0].split("-");
      return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    };
  
    const abbreviateTag = (tag) => {
        return tag
            .split(" ")
            .filter((word) => word[0] === word[0].toUpperCase())
            .map((word) => word[0])
            .join("");
    };


    // Teste de carregamento da página
    it('Deve carregar a lista de documentos corretamente', () => {
      // Verifica se a requisição para listar documentos retorna com sucesso
      cy.request('GET', `${backendUrl}/documents`).then((response) => {
        expect(response.status).to.eq(200);
  
        // Verifica se os dados retornados estão corretos
        const documentsData = response.body.data;
        const lastDocumentIndex = documentsData.length - 1;
  
        // Certifica-se de que a tabela está preenchida com os dados reais do backend
        cy.get('table').should('exist');
        
        // Simula a navegação para a página correta (2) para acessar o documento esperado
        cy.get('#pagination').contains('2').click();
        
        // Verifica se os dados do último documento da lista (que está na página 2) estão corretos
        cy.get('table').within(() => {
          cy.get('td').contains(documentsData[lastDocumentIndex].nome); 
          cy.get('td').contains(documentsData[lastDocumentIndex].orgao.nome); 
        });
      });
    });
  
  
    // Teste de abertura e fechamento do modal de edição de tags
    it('Deve abrir e fechar o modal de edição de tags', () => {
      cy.request('GET', `${backendUrl}/documents`).then((response) => {
        expect(response.status).to.eq(200);
        const documentsData = response.body.data;
        const lastDocumentIndex = documentsData.length - 1;
  
        // Navega para a página onde o documento se encontra, se necessário
        if (documentsData.length > 5) {
          cy.get('#pagination').should('exist');
          cy.get('#pagination').contains('2').click();
          cy.wait(1000);
        }
  
        // Clicar no botão de "Editar tags" na primeira linha da tabela
        cy.get('table').should('exist').within(() => {
          cy.contains('Editar tags').first().click();
        });
  
        // Verifica se o modal foi aberto
        cy.get('#modal').should('be.visible');
  
        // Fechar o modal
        cy.get('#modalOverlay').find('#buttonClose').click();
        cy.get('#modal').should('not.exist');
  
        cy.wait(1000);
      });
    });
  
    // Teste de edição de tags e salvamento
    it('Deve editar as tags de um documento e salvar as mudanças', () => {
      cy.request('GET', `${backendUrl}/documents`).then((response) => {
        expect(response.status).to.eq(200);
        const documentsData = response.body.data;
        const lastDocumentIndex = documentsData.length - 1;
  
        // Navega para a página onde o documento se encontra, se necessário
        if (documentsData.length > 5) {
          cy.get('#pagination').should('exist');
          cy.get('#pagination').contains('2').click();
          cy.wait(1000);
        }
  
        // Abre o modal de edição de tags na primeira linha da tabela
        cy.get('table').should('exist').within(() => {
          cy.contains('Editar tags').first().click();
        });
  
        cy.get('#modal').within(() => {
          cy.get('input[type="checkbox"]').first().check(); 
          cy.get('#submitButton').click(); 
        });
  
        // Verifica se o modal foi fechado após o salvamento
        cy.get('#modal').should('not.exist');
      });
    });
  
    it('Deve filtrar os documentos por tags corretamente', () => {
        cy.request('GET', `${backendUrl}/tags`).then((response) => {
            expect(response.status).to.eq(200);
            const tags = response.body.data;

            if (tags.length > 0) {
                const tagToFilter = tags[0].nome; 
                const abbreviatedTag = abbreviateTag(tagToFilter); 

                // Digita o nome da tag na barra de busca de tags e aplica o filtro
                cy.get('#filterInput').type(tagToFilter);

                // Verifica se os documentos filtrados na tabela possuem a tag abreviada
                cy.get('table').within(() => {
                    cy.get('td').contains(abbreviatedTag); // Verifica pela abreviação
                });
            }
        });
    });
  
    // Teste de paginação
    it('Deve navegar entre as páginas corretamente', () => {
      cy.request('GET', `${backendUrl}/documents`).then((response) => {
        expect(response.status).to.eq(200);
  
        const totalResults = response.body.data.length;
        const resultsPerPage = 5;
        const totalPages = Math.ceil(totalResults / resultsPerPage);
  
        if (totalPages > 1) {
          // Aguarde a renderização completa da paginação
          cy.get('#pagination').should('be.visible');
  
          // Verifica se a página atual está correta (Página 1)
          cy.get('button').contains('1');
  
          // Navega para a próxima página clicando no botão 2
          cy.get('button').contains('2').click();
          cy.wait(1000); // Aguarda o carregamento da nova página
  
        } else {
          cy.log('Não há páginas suficientes para testar a paginação.');
        }
      });
  
      cy.wait(1000);
    });
  });
  