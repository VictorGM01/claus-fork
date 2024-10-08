import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './index';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();

  test('Renderiza corretamente a paginação quando está nas páginas do meio', () => {
    render(
      <Pagination
        totalPages={10}
        currentPage={5}
        onPageChange={mockOnPageChange}
        darkTheme={false}
      />
    );

    // Verifica se a estrutura correta de páginas é renderizada
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Verifica se há exatamente dois elementos com "..."
    const ellipses = screen.getAllByText('...');
    expect(ellipses).toHaveLength(2);
    
    // Verifica se as páginas do meio e últimas estão presentes
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  test('Chama a função de mudança de página ao clicar em uma página específica', () => {
    render(
      <Pagination
        totalPages={10}
        currentPage={5}
        onPageChange={mockOnPageChange}
        darkTheme={false}
      />
    );

    fireEvent.click(screen.getByText('6'));
    expect(mockOnPageChange).toHaveBeenCalledWith(6);
  });
});
