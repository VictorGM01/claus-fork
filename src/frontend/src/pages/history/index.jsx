import React, { useEffect, useState } from "react";
import Header from "../../components/header";
import styles from "./styles.module.css";
import Table from "../../components/table";
import DataFilterButton from "../../components/dateFilterButton";
import SearchFilter from "../../components/searchFilter";
import Pagination from "../../components/pagination";
import ResultsCount from "../../components/resultsCount";
import LoaderSpinner from "../../components/loaderSpinner";

export default function History() {
  const [darkTheme, setDarkTheme] = useState(false);
  const [logData, setLogData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [openFilter, setOpenFilter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedActions, setSelectedActions] = useState([]);
  const [selectedIPs, setSelectedIPs] = useState([]);
  const [ipOptions, setIpOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;
  const [logSent, setLogSent] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleCheckboxChange = () => {
    setDarkTheme(!darkTheme);
  };

  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    filterData(date, selectedActions, selectedIPs);
    setOpenFilter(null);
  };

  const handleActionFilterChange = (actions) => {
    setSelectedActions(actions);
    filterData(selectedDate, actions, selectedIPs);
  };

  const handleIPFilterChange = (ips) => {
    setSelectedIPs(ips);
    filterData(selectedDate, selectedActions, ips);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_URL_API_BACKEND}/logs`
      );
      const result = await response.json();

      const formattedData = result.rows.map((log) => ({
        "Endereço IP": log.ip,
        "Tipo de Ação": log.tipo.nome,
        "Descrição da Ação": log.descricao,
        Data: log.criado_em,
      }));

      setLogData(formattedData);
      setFilteredData(formattedData);

      const ips = formattedData.map((log) => log["Endereço IP"]);
      setIpOptions([...new Set(ips)]);

      console.log("Logs:", formattedData);
    } catch (error) {
      console.log("Erro ao buscar logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendLog = async (descricao, tipo) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL_API_BACKEND}/logs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ descricao, tipo }),
        }
      );

      if (response.ok) {
        console.log("Log enviado com sucesso:", descricao);
      } else {
        console.error("Erro ao enviar log");
      }
    } catch (error) {
      console.error("Erro ao enviar log:", error);
    }
  };

  const filterData = (date, actions, ips) => {
    let filtered = [...logData];

    if (date) {
      filtered = filtered.filter((log) => {
        const logDate = new Date(log["Data"]);
        return (
          logDate.getDate() === date.getDate() &&
          logDate.getMonth() === date.getMonth() &&
          logDate.getFullYear() === date.getFullYear()
        );
      });
    }

    if (actions.length > 0) {
      filtered = filtered.filter((log) =>
        actions.includes(log["Tipo de Ação"])
      );
    }

    if (ips.length > 0) {
      filtered = filtered.filter((log) => ips.includes(log["Endereço IP"]));
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchLogs();

    if (!logSent) {
      sendLog("Página de histórico acessada", "Acesso à página de logs");
      setLogSent(true);
    }
  }, [logSent]);

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredData.slice(
    indexOfFirstResult,
    indexOfLastResult
  );

  const totalPages = Math.ceil(filteredData.length / resultsPerPage);

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
    <main
      data-theme={darkTheme ? "dark" : "light"}
      className={`${styles.main} ${darkTheme ? styles["dark-main"] : ""}`}
    >
      <div className={styles.container}>
        <Header
          darkTheme={darkTheme}
          handleCheckboxChange={handleCheckboxChange}
        />
        <div className={styles.content}>
          <div className={styles.options}>
            <DataFilterButton
              darkTheme={darkTheme}
              isOpen={openFilter === "date"}
              onToggle={() => toggleFilter("date")}
              selectedDate={selectedDate}
              handleDateChange={handleDateChange}
            />
            <SearchFilter
              buttonText="Filtrar por Ação"
              placeholder="Pesquisar ação"
              options={[
                "Acesso à página principal",
                "Busca realizada",
                "Filtro realizado",
                "Documento visualizado",
                "Acesso à página de logs",
                "Acesso à página de e-mails",
                "Cadastro de e-mail",
              ]}
              darkTheme={darkTheme}
              isOpen={openFilter === "acao"}
              onToggle={() => toggleFilter("acao")}
              onApply={handleActionFilterChange}
              idButton={"actionFilterButton"}
              idInputModal={"searchFilterInput"}
              idApplyButton={"applyFilterButton"}
            />
            <SearchFilter
              buttonText="Filtrar por Endereço IP"
              placeholder="Pesquisar IP"
              options={ipOptions}
              darkTheme={darkTheme}
              isOpen={openFilter === "ip"}
              onToggle={() => toggleFilter("ip")}
              onApply={handleIPFilterChange}
              idButton={"ipFilterButton"}
              idInputModal={"searchFilterInput"}
              idApplyButton={"applyFilterButton"}
            />
          </div>

          <ResultsCount darkTheme={darkTheme} count={filteredData.length} />

          {loading ? (
            <LoaderSpinner loading={loading} darkTheme={darkTheme} />
          ) : (
            <>
              <Table
                darkTheme={darkTheme}
                isLog={true}
                isTag={false}
                columns={[
                  "Endereço IP",
                  "Tipo de Ação",
                  "Descrição da Ação",
                  "Data",
                ]}
                data={currentResults.map((log) => ({
                  ...log,
                  Data: log["Data"],
                }))}
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
