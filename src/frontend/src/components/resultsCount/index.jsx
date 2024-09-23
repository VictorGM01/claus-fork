import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';

export default function ResultsCount({ count, darkTheme }) {
  return (
    <div className={`${styles.resultsCount} ${darkTheme ? styles["count-dark"] : styles["count-light"]}`}>
      {count} resultados
    </div>
  );
}

ResultsCount.propTypes = {
  count: PropTypes.number.isRequired,
  darkTheme: PropTypes.bool.isRequired,
};
