import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Table from './index';

const columns = ['Nome', 'Órgão Regulador', 'Tipo de Documento', 'Tags', 'Data de Publicação'];
const data = [
  {
    Nome: { nome: 'Norma 1', link: 'http://example.com/norma1' },
    'Órgão Regulador': 'CVM',
    'Tipo de Documento': 'Instrução',
    Tags: [{ full: 'Regulação Financeira', abbreviated: 'RF' }],
    'Data de Publicação': '2023-09-20T15:20:30Z',
  },
  {
    Nome: { nome: 'Norma 2', link: 'http://example.com/norma2' },
    'Órgão Regulador': 'B3',
    'Tipo de Documento': 'Deliberação',
    Tags: [{ full: 'Mercado de Capitais', abbreviated: 'MC' }],
    'Data de Publicação': '2023-09-19T12:00:00Z',
  },
];

describe('Table Component', () => {
  test('Renderiza a tabela com colunas e dados corretos', () => {
    render(<Table columns={columns} data={data} isTag={true} darkTheme={false} />);

    // Verificar se as colunas estão sendo renderizadas corretamente
    columns.forEach((column) => {
      expect(screen.getByText(column)).toBeInTheDocument();
    });

    // Verificar se os dados da primeira linha estão corretos
    expect(screen.getByText('Norma 1')).toBeInTheDocument();
    expect(screen.getByText('CVM')).toBeInTheDocument();
    expect(screen.getByText('Instrução')).toBeInTheDocument();
    expect(screen.getByText('RF')).toBeInTheDocument();
    expect(screen.getByText('20/09/2023')).toBeInTheDocument();

    // Verificar se os dados da segunda linha estão corretos
    expect(screen.getByText('Norma 2')).toBeInTheDocument();
    expect(screen.getByText('B3')).toBeInTheDocument();
    expect(screen.getByText('Deliberação')).toBeInTheDocument();
    expect(screen.getByText('MC')).toBeInTheDocument();
    expect(screen.getByText('19/09/2023')).toBeInTheDocument();
  });

  test('Classifica os dados por coluna quando o cabeçalho é clicado', () => {
    render(<Table columns={columns} data={data} isTag={true} darkTheme={false} />);

    // Ordena pela coluna 'Data de Publicação'
    const dataColumnHeader = screen.getByText('Data de Publicação');
    fireEvent.click(dataColumnHeader);

    const firstRowDate = screen.getAllByText('19/09/2023')[0];
    const secondRowDate = screen.getAllByText('20/09/2023')[0];

    // Verifica se a ordem está correta após a ordenação ascendente
    expect(firstRowDate).toBeInTheDocument();
    expect(secondRowDate).toBeInTheDocument();
  });

  test('Exibe a data no formato correto', () => {
    render(<Table columns={columns} data={data} isTag={true} darkTheme={false} />);

    // Verificar se as datas estão sendo exibidas corretamente
    expect(screen.getByText('20/09/2023')).toBeInTheDocument();
    expect(screen.getByText('19/09/2023')).toBeInTheDocument();
  });


  test('Exibe as tags com o formato abreviado correto', () => {
    render(<Table columns={columns} data={data} isTag={true} darkTheme={false} />);

    // Verificar se os dados das tags estão sendo exibidos corretamente
    expect(screen.getByText('RF')).toBeInTheDocument();
    expect(screen.getByText('MC')).toBeInTheDocument();
  });
});
