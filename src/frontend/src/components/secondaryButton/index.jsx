import React from 'react';
import styles from './styles.module.css';
import PropTypes from 'prop-types';

export default function SecondaryButton({ buttonText, onClick, darkTheme }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.button} ${darkTheme ? styles.dark : styles.light}`}
    >
      {buttonText}
    </button>
  );
}

SecondaryButton.propTypes = {
  buttonText: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  darkTheme: PropTypes.bool,
};