import React, { useState, useEffect } from 'react';
import Header from '../../components/header';
import styles from './styles.module.css';
import SecundaryButton from '../../components/secondaryButton';
import ModalRegisterEmail from '../../components/modalRegisterEmail';
import Table from '../../components/table';
import Pagination from '../../components/pagination'; 
import ResultsCount from '../../components/resultsCount'; 
import LoaderSpinner from '../../components/loaderSpinner'; 

export default function Emails() {
  const [darkTheme, setDarkTheme] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailData, setEmailData] = useState([]);
  const [logSent, setLogSent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredData.slice(indexOfFirstResult, indexOfLastResult);

  const totalPages = Math.ceil(filteredData.length / resultsPerPage);

  useEffect(() => {
    fetchEmails();

    if (!logSent) {
      sendLog('Página de e-mails acessada', 'Acesso à página de e-mails');
      setLogSent(true);
    }
  }, [logSent]);

  const handleCheckboxChange = () => {
    setDarkTheme(!darkTheme);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const fetchEmails = async () => {
    try {
      setLoading(true); 
      const response = await fetch(`${import.meta.env.VITE_URL_API_BACKEND}/emails`);
      const result = await response.json();
      const formattedData = result.data.map(email => ({
        'E-mail': email.email,
        'Endereço do IP': email.ip,
        'Data de Recebimento': email.criado_em
      }));
  
      
      const sortedData = formattedData.sort((a, b) => (
        new Date(b['Data de Recebimento']).getTime() - new Date(a['Data de Recebimento']).getTime()
      ));
  
      setEmailData(sortedData);
      setFilteredData(sortedData); 
    } catch (error) {
      console.log('Erro ao buscar emails:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleRegisterEmailSubmit = async email => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API_BACKEND}/emails`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        fetchEmails();
        handleModalClose(); 
        console.log('E-mail cadastrado com sucesso', email);

        await sendLog(`E-mail ${email} cadastrado`, 'Cadastro de e-mail');
      } else {
        console.error('Erro ao cadastrar e-mail');
      }
    } catch (error) {
      console.error('Erro ao cadastrar e-mail:', error);
    }
  };

  const sendLog = async (descricao, tipo) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API_BACKEND}/logs`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ descricao, tipo })
      });

      if (response.ok) {
        console.log('Log enviado com sucesso:', descricao);
      } else {
        console.error('Erro ao enviar log');
      }
    } catch (error) {
      console.error('Erro ao enviar log:', error);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <main className={`${styles.main} ${darkTheme ? styles['dark-main'] : ''}`}>
      <div className={styles.container}>
        <Header
          darkTheme={darkTheme}
          handleCheckboxChange={handleCheckboxChange}
        />
        <div className={styles.options}>
          <SecundaryButton
            buttonText='Cadastrar e-mail'
            darkTheme={darkTheme}
            onClick={handleModalOpen}
          />
        </div>
        <ModalRegisterEmail
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleRegisterEmailSubmit}
          darkTheme={darkTheme}
        />
        <div className={styles.content}>
          {loading ? ( 
            <LoaderSpinner loading={loading} darkTheme={darkTheme} />
          ) : (
            <>
              <ResultsCount
                darkTheme={darkTheme}
                count={filteredData.length}
              />
              
              <Table
                darkTheme={darkTheme}
                isLog={false}
                isTag={false}
                isEmail={true}
                columns={['E-mail', 'Endereço do IP', 'Data de Recebimento']}
                data={currentResults}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
                darkTheme={darkTheme}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
