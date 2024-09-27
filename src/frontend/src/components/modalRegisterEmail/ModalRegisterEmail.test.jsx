import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalRegisterEmail from './index';

describe('ModalRegisterEmail component', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('O modal não deve renderizar quando isOpen é falso', () => {
    render(<ModalRegisterEmail isOpen={false} onClose={mockOnClose} onSubmit={mockOnSubmit} darkTheme={false} />);
    const modal = screen.queryByTestId('modal');
    expect(modal).toBeNull();
  });

  test('O modal deve renderizar quando isOpen for verdadeiro', () => {
    render(<ModalRegisterEmail isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} darkTheme={false} />);
    expect(screen.getByText(/Cadastrar e-mail/i)).toBeInTheDocument();
  });

  test('O modal deve chamar onClose quando o botão Fechar for clicado', () => {
    render(<ModalRegisterEmail isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} darkTheme={false} />);
    fireEvent.click(screen.getByText('X'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('O modal deve enviar o formulário e exibir mensagem de sucesso quando o envio ocorre normalmente', async () => {
    render(<ModalRegisterEmail isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} darkTheme={false} />);

    const input = screen.getByPlaceholderText('Digite o e-mail');
    fireEvent.change(input, { target: { value: 'email@test.com' } });

    const submitButton = screen.getByText('Cadastrar');
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith('email@test.com');
    expect(await screen.findByText('E-mail cadastrado com sucesso!')).toBeInTheDocument();
  });

  test('O modal deve exibir mensagem de erro quando o envio falha', async () => {
    mockOnSubmit.mockImplementation(() => { throw new Error(); });
    render(<ModalRegisterEmail isOpen={true} onClose={mockOnClose} onSubmit={mockOnSubmit} darkTheme={false} />);

    const input = screen.getByPlaceholderText('Digite o e-mail');
    fireEvent.change(input, { target: { value: 'email@test.com' } });

    const submitButton = screen.getByText('Cadastrar');
    fireEvent.click(submitButton);

    expect(await screen.findByText('Ocorreu um erro ao cadastrar o e-mail. Tente novamente.')).toBeInTheDocument();
  });
});
