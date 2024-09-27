import React from 'react';
import { render, screen } from '@testing-library/react';
import ResultsCount from './index';

describe('ResultsCount component', () => {
  // Teste para verificar se o componente exibe corretamente o número de resultados
  test('Renderiza o número de resultados corretamente', () => {
    render(<ResultsCount count={10} darkTheme={false} />);
    
    // Verifica se o número de resultados é exibido corretamente
    const resultsText = screen.getByText('10 resultados');
    expect(resultsText).toBeInTheDocument();
  });

  // Teste para verificar se o tema claro é aplicado corretamente
  test('Aplica o tema claro corretamente', () => {
    render(<ResultsCount count={5} darkTheme={false} />);
    
    // Verifica se a classe de tema claro está presente
    const resultsContainer = screen.getByText('5 resultados');
    expect(resultsContainer).toHaveClass('count-light');
  });

  // Teste para verificar se o tema escuro é aplicado corretamente
  test('Aplica o tema escuro corretamente', () => {
    render(<ResultsCount count={7} darkTheme={true} />);
    
    // Verifica se a classe de tema escuro está presente
    const resultsContainer = screen.getByText('7 resultados');
    expect(resultsContainer).toHaveClass('count-dark');
  });
});
