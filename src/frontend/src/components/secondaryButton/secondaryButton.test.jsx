import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SecondaryButton from './index';

describe('SecondaryButton Component', () => {
  // Mock da função onClick
  const mockOnClick = jest.fn();

  // Propriedades padrão
  const defaultProps = {
    buttonText: 'Clique Aqui',
    onClick: mockOnClick,
    darkTheme: false,
  };

  // Limpa os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Teste para verificar se o botão é renderizado com o texto correto
  test('Renderiza o botão com o texto correto', () => {
    render(<SecondaryButton {...defaultProps} />);
    const buttonElement = screen.getByRole('button', { name: /Clique Aqui/i });
    expect(buttonElement).toBeInTheDocument();
  });

  // Teste para verificar se a função onClick é chamada ao clicar no botão
  test('Chama onClick ao clicar no botão', () => {
    render(<SecondaryButton {...defaultProps} />);
    const buttonElement = screen.getByRole('button', { name: /Clique Aqui/i });
    fireEvent.click(buttonElement);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  // Teste para verificar se a classe 'dark' é aplicada quando darkTheme é true
  test('Aplica a classe dark quando darkTheme é true', () => {
    render(<SecondaryButton {...defaultProps} darkTheme={true} />);
    const buttonElement = screen.getByRole('button', { name: /Clique Aqui/i });
    expect(buttonElement).toHaveClass('dark');
  });

  // Teste para verificar se a classe 'light' é aplicada quando darkTheme é false
  test('Aplica a classe light quando darkTheme é false', () => {
    render(<SecondaryButton {...defaultProps} darkTheme={false} />);
    const buttonElement = screen.getByRole('button', { name: /Clique Aqui/i });
    expect(buttonElement).toHaveClass('light');
  });

  // Teste para verificar se todas as classes são aplicadas corretamente
  test('Aplica as classes corretamente com base nas props', () => {
    render(<SecondaryButton {...defaultProps} darkTheme={true} />);
    const buttonElement = screen.getByRole('button', { name: /Clique Aqui/i });
    expect(buttonElement).toHaveClass('button', 'dark');
  });
});
