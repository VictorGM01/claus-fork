import React from 'react';
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';

export default function Table({ columns, data, isLog = false, isTag = false, darkTheme = false }) {
  const [sort, setSort] = useState({ column: '', order: '' });
  const [sortedData, setSortedData] = useState([...data]);
  const tagColors = useRef({});

  useEffect(() => {
    setSortedData([...data]);

    // Gerar cores aleatórias para cada tag única apenas na montagem do componente
    if (Object.keys(tagColors.current).length === 0) {
      const colors = {};
      data.forEach(row => {
        if (row.Tags) {
          row.Tags.forEach(tag => {
            if (!colors[tag.abbreviated]) {
              colors[tag.abbreviated] = generateRandomColor();
            }
          });
        }
      });
      tagColors.current = colors;
    }
  }, [data]);

  const formatDate = date => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date; // Retorna a string original se não for uma data válida

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    // Verifica se é para exibir data e hora ou apenas data
    if (isLog && date.includes('T')) {
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
    return `${day}/${month}/${year}`;
  };

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleSort = column => {
    let order = 'asc';

    if (sort.column === column && sort.order === 'asc') {
      order = 'desc';
    }

    setSort({ column, order });

    const sorted = [...data].sort((a, b) => {
      if (!isNaN(new Date(a[column]).getTime()) && !isNaN(new Date(b[column]).getTime())) {
        // Ordena como data se ambos os valores forem datas válidas
        const dateA = new Date(a[column]).getTime();
        const dateB = new Date(b[column]).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        // Ordena como string para outras colunas
        if (order === 'asc') {
          return a[column] > b[column] ? 1 : -1;
        }
        return a[column] < b[column] ? 1 : -1;
      }
    });

    setSortedData(sorted);
  };

  const isIpAddress = value => {
    // Verifica se o valor é um endereço IP (IPv4 ou IPv6)
    return (
      typeof value === 'string' &&
      (value.match(/^(\d{1,3}\.){3}\d{1,3}$/) || value.includes('::'))
    );
  };

  return (
    <table className={`${styles['table']} ${darkTheme ? styles['dark-table'] : styles['light-table']}`}>
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column} onClick={() => handleSort(column)} style={{ cursor: 'pointer' }}>
              {column}
              {column.toLowerCase().includes('data') && (
                <img
                  src={darkTheme ? '/arrow-dark-theme.svg' : '/arrow-light-theme.svg'}
                  alt="Sort arrow"
                  className={`${styles['sort-arrow']} ${
                    sort.column === column && sort.order === 'asc' ? styles['rotate-arrow'] : ''
                  }`}
                />
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, index) => (
          <tr key={index}>
            {columns.map(column => (
              <td key={column}>
                {/* Verificação adicional para IPs e datas */}
                {!isNaN(new Date(row[column]).getTime()) && !isIpAddress(row[column]) ? (
                  formatDate(row[column])
                ) : column.toLowerCase() === 'tags' && isTag ? (
                  <div className={styles.tagContainer}>
                    {row.Tags.map((tag, idx) => (
                      <span
                        key={idx}
                        title={tag.full}
                        className={styles.tag}
                        style={{
                          backgroundColor: tagColors.current[tag.abbreviated] || '#ccc',
                        }}
                      >
                        {tag.abbreviated}
                      </span>
                    ))}
                  </div>
                ) : column.toLowerCase() === 'nome' && row[column].nome && row[column].link ? (
                  <a
                    href={row[column].link}
                    style={{ textDecoration: 'underline', color: 'inherit' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {row[column].nome}
                  </a>
                ) : (
                  row[column]
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLog: PropTypes.bool,
  isTag: PropTypes.bool,
  darkTheme: PropTypes.bool,
};
