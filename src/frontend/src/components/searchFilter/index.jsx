import React, { useState } from 'react';
import PrimaryButton from '../primaryButton'; 
import styles from './styles.module.css';
import PropTypes from 'prop-types';

export default function SearchFilter({ darkTheme, buttonText, placeholder, options, isOpen, onToggle, onApply, idButton, idInputModal, idApplyButton }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelectedOptions, setTempSelectedOptions] = useState([]); 

  const handleOptionChange = (option) => {
    if (tempSelectedOptions.includes(option)) {
      setTempSelectedOptions(tempSelectedOptions.filter((item) => item !== option));
    } else {
      setTempSelectedOptions([...tempSelectedOptions, option]);
    }
  };

  const handleApply = () => {
    onApply(tempSelectedOptions); 
    onToggle();
  };

  const handleClose = () => {
    setTempSelectedOptions([]); 
    onToggle(); 
  };

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.options}>
      <PrimaryButton
        buttonText={buttonText}
        darkTheme={darkTheme}
        onClick={onToggle} 
        id={idButton ? idButton : ''}
      />
      <div className={`${styles.modal} ${isOpen ? styles.show : ""} ${darkTheme ? styles.modalDark : ""}`}>
        {isOpen && (
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleClose}>X</button>
            <input
              id={idInputModal ? idInputModal : ""}
              className={styles.searchInput}
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className={styles.optionsList}>
              {filteredOptions.map((option, index) => (
                <li key={index}>
                  <input
                    type="checkbox"
                    id={`option-${index}`}
                    checked={tempSelectedOptions.includes(option)}
                    onChange={() => handleOptionChange(option)}
                  />
                  <label htmlFor={`option-${index}`}>{option}</label>
                </li>
              ))}
            </ul>
            {/* Botão Aplicar */}
            <div className={styles.modalActions}>
              <button id={idApplyButton ? idApplyButton : ''} className={styles.applyButton} onClick={handleApply}>Aplicar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

SearchFilter.propTypes = {
  darkTheme: PropTypes.bool,
  buttonText: PropTypes.string,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  onApply: PropTypes.func,
};
