
import { useState } from 'react';
import Header from '../../components/header';
import styles from './styles.module.css';
import SecundaryButton from '../../components/secondaryButton';
import ModalRegisterEmail from '../../components/modalRegisterEmail';
import Table from '../../components/table';

export default function Notification(){
  const [darkTheme, setDarkTheme] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCheckboxChange = () => {
    setDarkTheme(!darkTheme);
  };
  
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleRegisterEmailSubmit = (email) => {
    console.log(email);
  };

  return (
    <main className={`${styles.main} ${darkTheme ? styles["dark-main"] : ""}`}>
      <div className={styles.container}>
        <Header 
          darkTheme={darkTheme}
          handleCheckboxChange={handleCheckboxChange}
        />
        <div className={styles.options}>
          <SecundaryButton 
            buttonText="Cadastrar e-mail"
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
          <Table 
            darkTheme={darkTheme}
            isLog={false}
            isTag={false}
            columns={["E-mail", "Endereço do IP","Data de Recebimento"]} 
            data={[
              { "E-mail": "teste@gmail.com", "Endereço do IP": "111.111.1.11", "Data de Recebimento": "2000-10-20T01:30:00.000" }, 
              { "E-mail": "teste2@gmail.com", "Endereço do IP": "222.222.2.22", "Data de Recebimento": "2000-10-31T01:30:00.000" },
              { "E-mail": "teste3@gmail.com", "Endereço do IP": "333.333.3.33", "Data de Recebimento": "2000-10-31T01:30:00.000" }
            ]} 
          />
        </div>
      </div>
    </main>
  );
}