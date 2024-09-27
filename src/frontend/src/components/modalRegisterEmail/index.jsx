import React from 'react';
import styles from './styles.module.css';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

export default function ModalRegisterEmail({ isOpen, onClose, onSubmit, darkTheme }) {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 

  useEffect(() => {
    if (isOpen) {
      setSuccessMessage("");
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const email = event.target.elements.email.value;
    console.log(email);
    
    try {
      onSubmit(email);
      setSuccessMessage("E-mail cadastrado com sucesso!");
      setErrorMessage(""); 
      event.target.reset(); 
    } catch {
      setErrorMessage("Ocorreu um erro ao cadastrar o e-mail. Tente novamente.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} id="modal">
      <div className={`${styles.modal} ${darkTheme ? styles["dark-modal"] : styles["light-modal"]}`}>
        <button className={`${styles.closeButton} ${darkTheme ? styles["dark-closeButton"] : styles["light-closeButton"]}`} onClick={onClose} id="buttonClose">X</button>
        <h2 className={styles.title}>{successMessage ? "E-mail cadastrado" : "Cadastrar e-mail"}</h2>
        
        {successMessage ? (
          <p className={styles.successMessage}>{successMessage}</p>
        ) : (
          <>
            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
            <form data-testid="form" onSubmit={handleSubmit}>
              <label htmlFor="email" className={`${styles.label} ${darkTheme ? styles["dark-label"] : styles["light-label"]}`}>Digite seu e-mail</label>
              <input
                type="email"
                name='email'
                placeholder="Digite o e-mail"
                className={`${styles.input} ${darkTheme ? styles["dark-input"] : styles["light-input"]}`}
                required
              />
              <div className={styles.buttonsContainer}>
                <button type="submit" className={`${styles.submitButton} ${darkTheme ? styles["dark-submitButton"] : styles["light-submitButton"]}`} id="buttonRegister">
                  Cadastrar
                </button>

                <button className={`${styles.cancelButton} ${darkTheme ? styles["dark-cancelButton"] : styles["light-cancelButton"]}`} onClick={onClose}>
                  Cancelar
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

ModalRegisterEmail.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  darkTheme: PropTypes.bool.isRequired,
};
