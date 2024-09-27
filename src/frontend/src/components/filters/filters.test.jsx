import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Filters from './index';

// Configurações de mocks
const mockHandleDateFilterChange = jest.fn();
const mockOnApplyTagFilter = jest.fn();
const mockOnApplyRegulatorFilter = jest.fn();

// Propriedades padrão
const defaultProps = {
  darkTheme: false,
  optionsRegulator: ['CVM', 'B3', 'Ambima'],
  optionsTags: ['Financeiro', 'Tecnologia'],
  handleDateFilterChange: mockHandleDateFilterChange,
  selectedDate: null,
  onApplyTagFilter: mockOnApplyTagFilter,
  onApplyRegulatorFilter: mockOnApplyRegulatorFilter,
};

describe('Filters Component', () => {

  // Teste para verificar se o componente é renderizado corretamente
  test('Renderiza todos os botões de filtro corretamente', () => {
    render(<Filters {...defaultProps} />);

    // Verifica se o botão do filtro de data é renderizado corretamente
    expect(screen.getByText('Filtrar por Data')).toBeInTheDocument();

    // Verifica se os botões de aplicar dos filtros de órgãos reguladores e tags são renderizados corretamente
    expect(screen.getByText('Filtrar por Órgão Regulador')).toBeInTheDocument();
    expect(screen.getByText('Filtrar por Tag')).toBeInTheDocument();
  });

  // Teste para verificar se os filtros são renderizados corretamente
  test('Alterna a visibilidade dos filtros quando os botões são clicados', () => {
    render(<Filters {...defaultProps} />);

    // Simula o clique no botão do filtro de órgãos reguladores
    fireEvent.click(screen.getByText('Filtrar por Órgão Regulador'));
    expect(screen.getByText('Filtrar por Órgão Regulador')).toHaveClass('  button light');

    // Simula o clique no botão do filtro de tags
    fireEvent.click(screen.getByText('Filtrar por Tag'));
    expect(screen.getByText('Filtrar por Tag')).toHaveClass('button light');
  });

  // Teste para verificar se a função handleDateFilterChange é chamada corretamente
  test('Chama handleDateFilterChange quando a data é selecionada', () => {
    render(<Filters {...defaultProps} />);
  
    // Simula o clique no botão do filtro de data para abrir o date picker
    fireEvent.click(screen.getByText('Filtrar por Data'));
  
    // Simula a chamada de onChange do DatePicker com uma data específica (20 de setembro de 2024)
    const selectedDate = new Date(Date.UTC(2024, 8, 20)); 
    
    // Busca o componente DatePicker na tela
    const datePicker = screen.getByRole('dialog');
    
    // Simula a seleção de uma data, chamando diretamente a função onChange
    fireEvent.click(datePicker); 
    fireEvent.click(screen.getByText('20')); 

    // Compara a data utilizando UTC
    const mockCallDate = mockHandleDateFilterChange.mock.calls[0][0];
    expect(mockCallDate.getUTCFullYear()).toBe(selectedDate.getUTCFullYear());
    expect(mockCallDate.getUTCMonth()).toBe(selectedDate.getUTCMonth());
    expect(mockCallDate.getUTCDate()).toBe(selectedDate.getUTCDate());
  });

  // Teste para verificar se a função onApplyTagFilter é chamada corretamente
  test('Chama onApplyTagFilter quando as tags são selecionadas e aplicadas', () => {
    render(<Filters {...defaultProps} />);

    // Simula o clique no botão do filtro de tags
    fireEvent.click(screen.getByText('Filtrar por Tag'));

    // Simula a seleção de uma tag e a aplicação do filtro
    fireEvent.click(screen.getByLabelText('Tecnologia')); 
    fireEvent.click(screen.getByText('Aplicar')); 

    expect(mockOnApplyTagFilter).toHaveBeenCalledWith(['Tecnologia']);
  });

  // Teste para verificar se a função onApplyRegulatorFilter é chamada corretamente
  test('Chama onApplyRegulatorFilter quando os reguladores são selecionados e aplicados', () => {
    render(<Filters {...defaultProps} />);

    // Simula o clique no botão do filtro de órgãos reguladores
    fireEvent.click(screen.getByText('Filtrar por Órgão Regulador'));

    // Simula a seleção de um regulador e a aplicação do filtro
    fireEvent.click(screen.getByLabelText('B3')); 
    fireEvent.click(screen.getByText('Aplicar')); 

    expect(mockOnApplyRegulatorFilter).toHaveBeenCalledWith(['B3']);
  });

  // Teste para verificar se a função onApplyRegulatorFilter é chamada corretamente com múltiplos reguladores
  test('Chama onApplyRegulatorFilter com vários reguladores quando selecionado e aplicado', () => {
    render(<Filters {...defaultProps} />);

    // Simula o clique no botão do filtro de órgãos reguladores
    fireEvent.click(screen.getByText('Filtrar por Órgão Regulador'));

    // Simula a seleção de múltiplos reguladores e a aplicação do filtro
    fireEvent.click(screen.getByLabelText('CVM')); 
    fireEvent.click(screen.getByLabelText('B3')); 
    fireEvent.click(screen.getByText('Aplicar')); 

    expect(mockOnApplyRegulatorFilter).toHaveBeenCalledWith(['CVM', 'B3']);
  });
});
