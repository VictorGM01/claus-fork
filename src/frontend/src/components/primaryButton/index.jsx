import React from 'react';
import styles from './styles.module.css';
import PropTypes from 'prop-types';

export default function PrimaryButton({ buttonText, onClick, darkTheme, active, children }) {
  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        className={`${styles.button} ${darkTheme ? styles.dark : styles.light} ${active ? styles.active : ''}`} // Aplicando classe 'active'
      >
        {buttonText}
      </button>
      {children}
    </div>
  );
}

PrimaryButton.propTypes = {
  buttonText: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  darkTheme: PropTypes.bool,
  active: PropTypes.bool, // Propriedade para ativar o estilo
  children: PropTypes.node,
};
