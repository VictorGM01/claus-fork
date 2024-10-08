import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PrimaryButton from "../primaryButton";
import styles from "./styles.module.css";
import PropTypes from "prop-types";
import { ptBR } from 'date-fns/locale';

export default function DateFilterButton({
  darkTheme,
  isOpen,
  onToggle,
  selectedDate,
  handleDateChange,
  isFilterActive,
}) {
  return (
    <div className={styles.options}>
      <PrimaryButton
        buttonText="Filtrar por Data"
        darkTheme={darkTheme}
        onClick={onToggle}
        active={isFilterActive} // Passando a propriedade para alterar a cor do botão
        id={"dateFilterButton"}
      />
      <div
        className={`${styles.datePickerContainer} ${isOpen ? styles.show : ""}`}
      >
        {isOpen && (
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            inline
            locale={ptBR} // Adicione o locale PT-BR
            dateFormat="dd/MM/yyyy" // Defina o formato de data
            calendarClassName="datePickerContainer"
          />
        )}
      </div>
    </div>
  );
}

DateFilterButton.propTypes = {
  darkTheme: PropTypes.bool,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
  handleDateChange: PropTypes.func,
  isFilterActive: PropTypes.bool, // Prop que indica se o filtro está ativo
};
