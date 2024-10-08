import React from 'react';
import styles from './styles.module.css'; 
import stylesToggle from "../../style/toggleTheme.module.css";
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom'; 

export default function Header({ darkTheme, handleCheckboxChange }) {
  const location = useLocation(); 

  return (
    <header className={styles.items}>
      {darkTheme ? (
        <a href='/'>
          <img src={"/logo-dark-theme.svg"} alt={"Tema escuro do grupo Claus"} />
        </a>
      ) : (
        <a href='/'>
          <img src={"/logo-light-theme.svg"} alt={"Tema claro do grupo Claus"} />
        </a>
      )}
      <div className={styles.options}>  
        <nav className={styles.nav}>
          <ul className={styles.list}>
            {location.pathname !== '/' && (
              <li className={styles.item}>
                <a 
                  className={`${darkTheme ? styles["link-dark"] : styles["link-light"]} ${location.pathname === '/' ? styles.active : ''}`}
                  href="/">Início</a>
              </li>
            )}
            <li className={styles.item}>
              <a 
                className={`${darkTheme ? styles["link-dark"] : styles["link-light"]} ${location.pathname === '/historico' ? styles.active : ''}`}
                href="/historico">Histórico</a>
            </li>
            <li className={styles.item}>
              <a 
                className={`${darkTheme ? styles["link-dark"] : styles["link-light"]} ${location.pathname === '/emails' ? styles.active : ''}`} 
                href="/emails">E-mails</a> 
            </li>
          </ul>
        </nav>
        <div className={styles.switchContainer}>
          <label
            aria-checked="false"
            role="switch"
            className={stylesToggle.switch}
            id='themeToggle'
          >
            <input
              type="checkbox"
              onChange={handleCheckboxChange}
              checked={darkTheme}
            />
            <span className={stylesToggle.slider}>
              <span className={stylesToggle.sliderInner}></span>
            </span>
          </label>
          <span
            className={
              darkTheme ? styles.darkSwitchName : styles.lightSwitchName
            }
          >
            {darkTheme ? "Modo Escuro" : "Modo Claro"}
          </span>
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  darkTheme: PropTypes.bool.isRequired,
  handleCheckboxChange: PropTypes.func.isRequired,
};
