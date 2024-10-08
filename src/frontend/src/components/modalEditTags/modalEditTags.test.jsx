// modalEditTags.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalEditTags from './index';

// Mock do componente LoaderSpinner
jest.mock('../loaderSpinner', () => () => <div data-testid="loader-spinner"></div>);

describe('ModalEditTags Component', () => {
  // Mocks das funções de callback
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  // Propriedades padrão para os testes
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    darkTheme: false,
    documentName: 'Documento de Teste',
    currentTags: [{ id: 1, nome: 'Tag1' }],
    allTags: [
      { id: 1, nome: 'Tag1' },
      { id: 2, nome: 'Tag2' },
      { id: 3, nome: 'Tag3' },
    ],
    loading: false,
  };

  // Limpa todos os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Teste para verificar se o modal é renderizado quando isOpen é true
  test('Renderiza o modal quando isOpen é true', () => {
    render(<ModalEditTags {...defaultProps} />);

    // Verifica se o título do modal está no documento
    expect(
      screen.getByText(/Editar tags do documento Documento de Teste/i)
    ).toBeInTheDocument();

    // Verifica se as tags são exibidas
    expect(screen.getByLabelText('Tag1')).toBeInTheDocument();
    expect(screen.getByLabelText('Tag2')).toBeInTheDocument();
    expect(screen.getByLabelText('Tag3')).toBeInTheDocument();
  });

  // Teste para verificar se o modal não é renderizado quando isOpen é false
  test('Não renderiza o modal quando isOpen é false', () => {
    render(<ModalEditTags {...defaultProps} isOpen={false} />);

    // Verifica se o título do modal não está no documento
    expect(
      screen.queryByText(/Editar tags do documento/i)
    ).not.toBeInTheDocument();
  });

  // Teste para verificar se a função onClose é chamada ao clicar no botão de fechar
  test('Chama onClose ao clicar no botão de fechar', () => {
    render(<ModalEditTags {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /X/i });

    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Teste para verificar se a função onSave é chamada com as tags selecionadas ao clicar em salvar
  test('Chama onSave com as tags selecionadas ao clicar em salvar', () => {
    render(<ModalEditTags {...defaultProps} />);

    // Seleciona a Tag2
    const tag2Checkbox = screen.getByLabelText('Tag2');
    fireEvent.click(tag2Checkbox);

    // Clica no botão Salvar
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);

    // Verifica se onSave foi chamado com os IDs corretos das tags selecionadas
    expect(mockOnSave).toHaveBeenCalledWith([1, 2]);

    // Verifica se onClose foi chamado
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Teste para verificar se o filtro de tags funciona corretamente
  test('Filtra as tags com base na entrada de pesquisa', () => {
    render(<ModalEditTags {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Digite o nome da tag');

    // Digita 'Tag2' no campo de busca
    fireEvent.change(searchInput, { target: { value: 'Tag2' } });

    // Verifica se apenas 'Tag2' está sendo exibida
    expect(screen.queryByLabelText('Tag1')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Tag2')).toBeInTheDocument();
    expect(screen.queryByLabelText('Tag3')).not.toBeInTheDocument();
  });

  // Teste para verificar se o loader é exibido quando loading é true
  test('Exibe o loader quando loading é true', () => {
    render(<ModalEditTags {...defaultProps} loading={true} />);

    // Verifica se o loader é exibido
    expect(screen.getByTestId('loader-spinner')).toBeInTheDocument();

    // Verifica se o campo de busca não está presente
    expect(
      screen.queryByPlaceholderText('Digite o nome da tag')
    ).not.toBeInTheDocument();
  });

  // Teste para verificar se é possível selecionar e desselecionar tags
  test('Permite alternar a seleção de tags', () => {
    render(<ModalEditTags {...defaultProps} />);

    const tag1Checkbox = screen.getByLabelText('Tag1');

    // Verifica se a Tag1 está inicialmente selecionada
    expect(tag1Checkbox).toBeChecked();

    // Desmarca a Tag1
    fireEvent.click(tag1Checkbox);

    expect(tag1Checkbox).not.toBeChecked();
  });

  // Teste para verificar se o modal fecha ao clicar no botão Cancelar
  test('Fecha o modal ao clicar no botão Cancelar', () => {
    render(<ModalEditTags {...defaultProps} />);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Teste para verificar se o componente aplica corretamente as classes de tema
  test('Aplica as classes de tema corretamente', () => {
    render(<ModalEditTags {...defaultProps} darkTheme={true} />);

    // Seleciona o elemento do modal
    const modalElement = screen.getByTestId('modal');

    expect(modalElement).toHaveClass('dark-modal');
  });
});
