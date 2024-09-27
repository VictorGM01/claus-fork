import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PrimaryButton from './index';

describe('PrimaryButton Component', () => {
  // Mock da função onClick
  const mockOnClick = jest.fn();

  // Propriedades padrão
  const defaultProps = {
    buttonText: 'Clique Aqui',
    onClick: mockOnClick,
    darkTheme: false,
    active: false,
    children: null,
  };

  // Limpa os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Teste para verificar se o botão é renderizado com o texto correto
  test('Renderiza o botão com o texto correto', () => {
    render(<PrimaryButton {...defaultProps} />);
    const buttonElement = screen.getByRole('button', { name: /Clique Aqui/i });
    expect(buttonElement).toBeInTheDocument();
  });

  // Teste para verificar se a função onClick é chamada ao clicar no botão
  test('Chama onClick ao clicar no botão', () => {
    render(<PrimaryButton {...defaultProps} />);
    const buttonElement = screen.getByRole('button', { name: /Clique Aqui/i });
    fireEvent.click(buttonElement);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // Teste para verificar se a classe 'dark' é aplicada quando darkTheme é true
  test('Aplica a classe dark quando darkTheme é true', () => {
    render(<PrimaryButton {...defaultProps} darkTheme={true} />);
    const buttonElement = screen.getByRole('button', { name: /Clique Aqui/i });
    expect(buttonElement).toHaveClass('dark');
  });

  // Teste para verificar se a classe 'light' é aplicada quando darkTheme é false
  test('Aplica a classe light quando darkTheme é false', () => {
    render(<PrimaryButton {...defaultProps} darkTheme={false} />);
    const buttonElement = screen.getByRole('button', { name: /Clique Aqui/i });
    expect(buttonElement).toHaveClass('light');
  });

  // Teste para verificar se a classe 'active' é aplicada quando active é true
  test('Aplica a classe active quando active é true', () => {
    render(<PrimaryButton {...defaultProps} active={true} />);
    const buttonElement = screen.getByRole('button', { name: /Clique Aqui/i });
    expect(buttonElement).toHaveClass('active');
  });

  // Teste para verificar se os children são renderizados
  test('Renderiza os elementos filhos (children) corretamente', () => {
    render(
      <PrimaryButton {...defaultProps}>
        <p>Elemento Filho</p>
      </PrimaryButton>
    );
    const childElement = screen.getByText('Elemento Filho');
    expect(childElement).toBeInTheDocument();
  });

  // Teste para verificar se todas as classes são aplicadas corretamente
  test('Aplica as classes corretamente com base nas props', () => {
    render(<PrimaryButton {...defaultProps} darkTheme={true} active={true} />);
    const buttonElement = screen.getByRole('button', { name: /Clique Aqui/i });
    expect(buttonElement).toHaveClass('button', 'dark', 'active');
  });
});
