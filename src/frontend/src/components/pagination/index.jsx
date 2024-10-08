import React from 'react';
import styles from './styles.module.css';
import PropTypes from 'prop-types';

export default function Pagination({ totalPages, currentPage, onPageChange, darkTheme }) {
  const pageNumbers = [];
  const renderPageNumbers = () => {
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, '...', totalPages - 1, totalPages);
      } else if (currentPage > totalPages - 3) {
        pageNumbers.push(1, 2, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
  };

  renderPageNumbers();

  if (totalPages <= 1) {
    return null; 
  }

  return (
    <div id="pagination" className={styles.pagination}>
      {/* Seta para voltar */}
      <button
        className={`${styles.arrowButton} ${darkTheme ? styles["button-dark"] : styles["button-light"]}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        id='prevPageButton'
      >
        &lt;
      </button>

      {/* Números de páginas */}
      {pageNumbers.map((number, index) => (
        <button
          data-testid={typeof number === 'number' ? `pageButton-${number}` : undefined}
          data-active={currentPage === number ? 'true' : 'false'}
          key={index}
          onClick={() => typeof number === 'number' && onPageChange(number)}
          className={`${styles.pageButton} ${darkTheme ? styles["pageButton-dark"] : styles["pageButton-light"]} ${currentPage === number ? styles.active : ''}`}
          disabled={typeof number !== 'number'} 
        >
          {number}
        </button>
      ))}

      {/* Seta para avançar */}
      <button
        id='nextPageButton'
        className={`${styles.arrowButton} ${darkTheme ? styles["button-dark"] : styles["button-light"]}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
}

Pagination.propTypes = {
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  darkTheme: PropTypes.bool.isRequired,
};
