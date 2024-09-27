import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DateFilterButton from "./index";

// Mock do componente PrimaryButton
jest.mock("../primaryButton", () => ({ buttonText, onClick, active }) => (
  <button onClick={onClick} aria-pressed={active}>
    {buttonText}
  </button>
));

describe('DateFilterButton Component', () => {

  // Configuração de mocks
  const mockHandleDateChange = jest.fn();
  const mockOnToggle = jest.fn();

  // Propriedades padrão
  const defaultProps = {
    darkTheme: false,
    isOpen: false,
    onToggle: mockOnToggle,
    selectedDate: new Date('2024-09-20'),
    handleDateChange: mockHandleDateChange,
    isFilterActive: false,
  };

  // Teste para verificar se o componente de botão é renderizado com o texto correto
  test('Renderiza o PrimaryButton com o texto correto', () => {
    render(<DateFilterButton {...defaultProps} />);
    
    // Verifica se o botão de filtro de data é renderizado com o texto correto
    const button = screen.getByText('Filtrar por Data');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  // Teste para verificar se o botão de filtro de data é renderizado com a cor correta
  test('Alterna o seletor de data quando o botão é clicado', () => {
    render(<DateFilterButton {...defaultProps} />);
    
    // Simula o clique no botão para abrir o DatePicker
    fireEvent.click(screen.getByText('Filtrar por Data'));
    
    // Verifica se a função onToggle foi chamada
    expect(mockOnToggle).toHaveBeenCalled();
  });

  // Teste para verificar se o DatePicker é exibido quando isOpen é verdadeiro
  test('Exibe o DatePicker quando isOpen é verdadeiro', () => {
    // Renderiza o componente com o isOpen true
    render(<DateFilterButton {...defaultProps} isOpen={true} />);
    
    // Verifica se o DatePicker está visível
    const datePicker = screen.getByRole('dialog'); 
    expect(datePicker).toBeInTheDocument();
  });

  // Teste para verificar se a função handleDateChange é chamada corretamente
  test('Chama handleDateChange quando uma data é selecionada', () => {
    render(<DateFilterButton {...defaultProps} isOpen={true} />);
    
    // Simula a seleção de uma data no DatePicker
    const dateToSelect = new Date(2024, 8, 21); 
    fireEvent.click(screen.getByText('21')); 
    
    // Verifica se a função handleDateChange foi chamada com a data correta (comparando ano, mês e dia)
    const mockCallDate = mockHandleDateChange.mock.calls[0][0];
  
    // Comparação robusta, apenas ano, mês e dia
    expect(mockCallDate.getFullYear()).toBe(dateToSelect.getFullYear());
    expect(mockCallDate.getMonth()).toBe(dateToSelect.getMonth());
    expect(mockCallDate.getDate()).toBe(dateToSelect.getDate());
  });  
});
