import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './index';
import { MemoryRouter } from 'react-router-dom';

describe('Header component', () => {
  const mockHandleCheckboxChange = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Teste para verificar se o logotipo correto é exibido com base no tema
  test('Renderiza o logotipo correto com base no tema', () => {
    // Testa com tema escuro
    render(
      <MemoryRouter>
        <Header darkTheme={true} handleCheckboxChange={mockHandleCheckboxChange} />
      </MemoryRouter>
    );
    const darkLogo = screen.getByAltText('Tema escuro do grupo Claus');
    expect(darkLogo).toBeInTheDocument(); // Verifica se o logotipo escuro está presente

    // Testa com tema claro
    render(
      <MemoryRouter>
        <Header darkTheme={false} handleCheckboxChange={mockHandleCheckboxChange} />
      </MemoryRouter>
    );
    const lightLogo = screen.getByAltText('Tema claro do grupo Claus');
    expect(lightLogo).toBeInTheDocument(); // Verifica se o logotipo claro está presente
  });

  // Teste para verificar se a classe "active" é aplicada corretamente com base no pathname
  test('Aplica a classe active corretamente com base no pathname', () => {
    render(
      <MemoryRouter initialEntries={['/emails']}>
        <Header darkTheme={false} handleCheckboxChange={mockHandleCheckboxChange} />
      </MemoryRouter>
    );

    const emailsLinks = screen.getAllByText('E-mails');

    // Verifica se o link ativo é exibido corretamente
    const activeEmailsLink = emailsLinks.find(link => link.classList.contains('active'));

    expect(activeEmailsLink).toBeInTheDocument(); // Verifica se o link "E-mails" está no documento
    expect(activeEmailsLink).toHaveClass('active'); // Verifica se o link tem a classe "active"
  });

  // Teste para verificar se a função handleCheckboxChange é chamada ao alterar o tema
  test('Chama handleCheckboxChange ao clicar no switch de tema', () => {
    render(
      <MemoryRouter>
        <Header darkTheme={false} handleCheckboxChange={mockHandleCheckboxChange} />
      </MemoryRouter>
    );
    
    // Simula a mudança no interruptor de tema
    const themeSwitch = screen.getByRole('switch');
    fireEvent.click(themeSwitch);
    
    // Verifica se a função foi chamada
    expect(mockHandleCheckboxChange).toHaveBeenCalled();
  });

  // Teste para verificar se o texto do tema é exibido corretamente
  test('Exibe o texto do tema correto com base no darkTheme', () => {
    // Testa para o tema escuro
    render(
      <MemoryRouter>
        <Header darkTheme={true} handleCheckboxChange={mockHandleCheckboxChange} />
      </MemoryRouter>
    );
    expect(screen.getByText('Modo Escuro')).toBeInTheDocument(); // Verifica se "Modo Escuro" é exibido

    // Testa para o tema claro
    render(
      <MemoryRouter>
        <Header darkTheme={false} handleCheckboxChange={mockHandleCheckboxChange} />
      </MemoryRouter>
    );
    expect(screen.getByText('Modo Claro')).toBeInTheDocument(); // Verifica se "Modo Claro" é exibido
  });

  // Teste para verificar se o link "Início" aparece quando o usuário não está na página inicial
  test('Renderiza o link "Início" apenas quando o usuário não está na página inicial', () => {
    // Testa para uma página diferente da raiz ("/historico")
    render(
      <MemoryRouter initialEntries={['/historico']}>
        <Header darkTheme={false} handleCheckboxChange={mockHandleCheckboxChange} />
      </MemoryRouter>
    );
    const inicioLink = screen.getByText('Início');
    expect(inicioLink).toBeInTheDocument(); // Verifica se o link "Início" está presente
  });
});
