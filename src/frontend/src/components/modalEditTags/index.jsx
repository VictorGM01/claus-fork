import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';
import LoaderSpinner from '../loaderSpinner';

export default function ModalEditTags({
  isOpen,
  onClose,
  onSave,
  darkTheme,
  documentName,
  allTags,
  loading,
  currentTags = [],
}) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedTags(currentTags.map((tag) => tag.id));
  }, [currentTags]);

  const handleTagToggle = (tagId) => {
    setSelectedTags((prevSelectedTags) => {
      if (prevSelectedTags.includes(tagId)) {
        return prevSelectedTags.filter((id) => id !== tagId);
      } else {
        return [...prevSelectedTags, tagId];
      }
    });
  };

  const handleSave = () => {
    onSave(selectedTags);
    onClose();
  };

  const filteredTags = allTags.filter((tag) =>
    tag.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} id='modalOverlay'>
      <div
        className={`${styles.modal} ${darkTheme ? styles['dark-modal'] : styles['light-modal']}`}
        id="modal"
        data-testid="modal"
      >
        <button
          className={`${styles.closeButton} ${darkTheme ? styles['dark-closeButton'] : styles['light-closeButton']
            }`}
          onClick={onClose}
          id='buttonClose'
        >
          X
        </button>
        <h2 className={styles.title}>
          Editar tags do documento {documentName}
        </h2>

        {loading ? (
          <div className={styles.loaderContainer}>
            <LoaderSpinner loading={loading} darkTheme={darkTheme} />
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Digite o nome da tag"
              className={`${styles.input} ${darkTheme ? styles['dark-input'] : styles['light-input']
                }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className={styles.tagList}>
              {filteredTags.map((tag) => (
                <div key={tag.id} className={styles.tagItem}>
                  <input
                    type="checkbox"
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                  />
                  <label htmlFor={`tag-${tag.id}`}>{tag.nome}</label>
                </div>
              ))}
            </div>
            <div className={styles.buttonsContainer}>
              <button
                onClick={handleSave}
                className={`${styles.submitButton} ${darkTheme
                  ? styles['dark-submitButton']
                  : styles['light-submitButton']
                  }`}
                id='submitButton'
              >
                Salvar
              </button>
              <button
                onClick={onClose}
                className={`${styles.cancelButton} ${darkTheme
                  ? styles['dark-cancelButton']
                  : styles['light-cancelButton']
                  }`}
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

ModalEditTags.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  darkTheme: PropTypes.bool.isRequired,
  documentName: PropTypes.string.isRequired,
  currentTags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nome: PropTypes.string.isRequired,
    })
  ).isRequired,
};
