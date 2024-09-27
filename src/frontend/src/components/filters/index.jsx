import React, { useState } from 'react';
import styles from './styles.module.css';
import DateFilterButton from '../dateFilterButton';
import SearchFilter from '../searchFilter';
import PropTypes from 'prop-types';

export default function Filters({
  darkTheme,
  optionsRegulator,
  optionsTags,
  handleDateFilterChange,
  selectedDate,
  onApplyTagFilter,
  onApplyRegulatorFilter
}) {
  const [openFilter, setOpenFilter] = useState(null);

  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  return (
    <div className={styles.filtersContainer}  data-testid="filters-container">
      <div className={styles.filterItem}>
        <DateFilterButton
          darkTheme={darkTheme}
          isOpen={openFilter === "date"}
          onToggle={() => toggleFilter("date")}
          selectedDate={selectedDate}
          handleDateChange={handleDateFilterChange}
          isFilterActive={!!selectedDate} 
        />
      </div>
      <div className={styles.filterItem}>
        <SearchFilter
          buttonText="Filtrar por Órgão Regulador"
          placeholder="Pesquisar órgão"
          options={optionsRegulator}
          darkTheme={darkTheme}
          isOpen={openFilter === "org"}
          onToggle={() => toggleFilter("org")}
          onApply={onApplyRegulatorFilter} 
        />
      </div>
      <div className={styles.filterItem}>
        <SearchFilter
          buttonText="Filtrar por Tag"
          placeholder="Pesquisar por tag"
          options={optionsTags}
          darkTheme={darkTheme}
          isOpen={openFilter === "tag"}
          onToggle={() => toggleFilter("tag")}
          onApply={onApplyTagFilter} 
        />
      </div>
    </div>
  );
}

Filters.propTypes = {
  darkTheme: PropTypes.bool,
  optionsRegulator: PropTypes.arrayOf(PropTypes.string),
  optionsTags: PropTypes.arrayOf(PropTypes.string),
  handleDateFilterChange: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  onApplyTagFilter: PropTypes.func.isRequired,
  onApplyRegulatorFilter: PropTypes.func.isRequired,
};
