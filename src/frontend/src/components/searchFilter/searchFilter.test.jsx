import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchFilter from "./index";

// Mock do componente PrimaryButton
jest.mock("../primaryButton", () => ({ buttonText, onClick, darkTheme }) => (
  <button onClick={onClick} aria-label={buttonText}>
    {buttonText}
  </button>
));

describe("SearchFilter Component", () => {
  // Configuração de mocks
  const mockOnApply = jest.fn();
  const mockOnToggle = jest.fn();

  // Propriedades padrão
  const defaultProps = {
    darkTheme: false,
    buttonText: "Filtrar por Ação",
    placeholder: "Pesquisar ação",
    options: ["Opção 1", "Opção 2", "Opção 3"],
    isOpen: false,
    onToggle: mockOnToggle,
    onApply: mockOnApply,
  };

  // Teste para verificar se o botão é renderizado com o texto correto
  test("Renderiza o PrimaryButton com o texto correto", () => {
    render(<SearchFilter {...defaultProps} />);

    // Verifica se o botão de filtro de ação é renderizado com o texto correto
    const button = screen.getByLabelText('Filtrar por Ação');
    expect(button).toBeInTheDocument();
  });

  // Teste para verificar se o filtro é alternado ao clicar no botão
  test("Alterna o filtro quando o botão é clicado", () => {
    render(<SearchFilter {...defaultProps} />);

    // Simula o clique no botão para abrir o modal de filtro
    fireEvent.click(screen.getByLabelText('Filtrar por Ação'));

    // Verifica se a função onToggle foi chamada
    expect(mockOnToggle).toHaveBeenCalled();
  });

  test("Exibe o modal de filtro quando isOpen é verdadeiro", () => {
    render(<SearchFilter {...defaultProps} isOpen={true} />);
    
    // Verifica se o modal está visível
    const modalContent = screen.getByText("Aplicar");
    expect(modalContent).toBeInTheDocument();
  });
  
  // Teste para verificar se as opções são filtradas corretamente com base na entrada do usuário
  test("Filtra as opções com base na entrada do usuário", () => {
    render(<SearchFilter {...defaultProps} isOpen={true} />);

    // Simula a entrada do usuário
    const searchInput = screen.getByPlaceholderText("Pesquisar ação");
    fireEvent.change(searchInput, { target: { value: "Opção 1" } });

    // Verifica se apenas a opção correspondente está visível
    expect(screen.getByLabelText("Opção 1")).toBeInTheDocument();
    expect(screen.queryByLabelText("Opção 2")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Opção 3")).not.toBeInTheDocument();
  });

  // Teste para verificar se a função onApply é chamada corretamente com as opções selecionadas
  test("Chama onApply quando o botão Aplicar é clicado", () => {
    render(<SearchFilter {...defaultProps} isOpen={true} />);

    // Simula a seleção de opções
    fireEvent.click(screen.getByLabelText("Opção 1"));
    fireEvent.click(screen.getByLabelText("Opção 2"));

    // Simula o clique no botão Aplicar
    fireEvent.click(screen.getByText("Aplicar"));

    // Verifica se a função onApply foi chamada com as opções corretas
    expect(mockOnApply).toHaveBeenCalledWith(["Opção 1", "Opção 2"]);
  });

  // Teste para verificar se o filtro é fechado e opções temporárias são limpas ao clicar em fechar
  test("Fecha o filtro e limpa opções ao clicar em fechar", () => {
    render(<SearchFilter {...defaultProps} isOpen={true} />);

    // Simula a seleção de opções
    fireEvent.click(screen.getByLabelText("Opção 1"));
    fireEvent.click(screen.getByLabelText("Opção 2"));

    // Simula o clique no botão de fechar
    fireEvent.click(screen.getByText("X"));

    // Verifica se a função onToggle foi chamada
    expect(mockOnToggle).toHaveBeenCalled();

    // Reabre o modal para verificar se as opções foram limpas
    fireEvent.click(screen.getByLabelText('Filtrar por Ação'));
    expect(screen.queryByLabelText("Opção 1")).not.toBeChecked();
    expect(screen.queryByLabelText("Opção 2")).not.toBeChecked();
  });
});

