import React, { useState, useRef, useEffect } from "react";
import styles from "./styles.module.css";
import stylesSearch from "../../style/search.module.css";
import Table from "../../components/table";
import Header from "../../components/header";
import Filters from "../../components/filters";
import Pagination from "../../components/pagination";
import ResultsCount from "../../components/resultsCount";
import LoaderSpinner from "../../components/loaderSpinner";
import ModalEditTags from "../../components/modalEditTags";

export default function Home() {
  const [darkTheme, setDarkTheme] = useState(false);
  const [searchBar, setSearchBar] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedRegulators, setSelectedRegulators] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [logSent, setLogSent] = useState(false);
  const [pagesAccessed, setPagesAccessed] = useState(["Pg. 1"]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const resultsPerPage = 5;
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredData.slice(
    indexOfFirstResult,
    indexOfLastResult
  );
  const [modalEditAllTags, setModalEditAllTags] = useState([])
  const [modalEditTagsLoading, setModalEditTagsLoading] = useState(true)

  const totalPages = Math.ceil(filteredData.length / resultsPerPage);

  function abbreviateTags(tags) {
    return tags.map((tag) => ({
      id: tag.id,
      full: tag.nome,
      abbreviated: tag.nome
        .split(" ")
        .filter((word) => word[0] === word[0].toUpperCase())
        .map((word) => word[0])
        .join(""),
    }));
  }

  const handleCheckboxChange = () => {
    setDarkTheme(!darkTheme);
  };

  const fetchAllDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_URL_API_BACKEND}/documents`,
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
      const result = await response.json();

      if (Array.isArray(result.data)) {
        const formattedData = result.data.map((doc) => {
          const [year, month, day] = doc.data_publicacao.split("T")[0].split("-");
          return {
            id: doc.id,
            Nome: { nome: doc.nome, link: doc.link },
            "Data de Publicação": `${day}/${month}/${year}`, 
            Tags: Array.isArray(doc.tags) ? abbreviateTags(doc.tags) : [],
            "Órgão Regulador": doc.orgao?.nome || "N/A",
            "Tipo de Documento": doc.tipo?.nome || "N/A",
          };
        });

        setTableData(formattedData);
        setFilteredData(formattedData);

        const allTags = new Set();
        result.data.forEach((doc) => {
          if (Array.isArray(doc.tags)) {
            doc.tags.forEach((tag) => allTags.add(tag.nome));
          }
        });
        setAvailableTags(Array.from(allTags));
      } else {
        console.error("Erro: a resposta não é um array de documentos.", result);
      }
    } catch (error) {
      console.error("Error fetching all documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API_BACKEND}/tags`);
      const result = await response.json();

      if (Array.isArray(result.data)) {
        setModalEditAllTags(result.data);
      } else {
        console.error('Erro ao buscar tags');
      }
    } catch (error) {
      console.error('Erro ao buscar tags:', error);
    } finally {
      setModalEditTagsLoading(false);
    }
  };

  const handleSearch = async (searchText) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_URL_API_BACKEND}/documents/search`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input: searchText }),
        }
      );

      const result = await response.json();

      if (Array.isArray(result.data)) {
        const formattedData = result.data.map((doc) => {
          const [year, month, day] = doc.data_publicacao.split("T")[0].split("-");
          return {
            id: doc.id,
            Nome: { nome: doc.nome, link: doc.link },
            "Data de Publicação": `${day}/${month}/${year}`,
            Tags: Array.isArray(doc.tags) ? abbreviateTags(doc.tags) : [],
            "Órgão Regulador": doc.orgao_nome || "N/A",
            "Tipo de Documento": doc.tipo_nome || "N/A",
          };
        });
        setTableData(formattedData);
        setFilteredData(formattedData);

        await sendLog(`Busca realizada: ${searchText}`, "Filtro realizado");
      } else {
        console.error("Erro: a resposta não é um array de documentos.", result);
      }
    } catch (error) {
      console.error("Error searching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = async (date) => {
    setSelectedDate(date);
    filterData(date, selectedTags, selectedRegulators);
    await sendLog(`Filtro de data aplicado: ${date.toLocaleDateString("pt-BR")}`, "Filtro realizado");
  };

  const handleTagFilterChange = async (selectedTags) => {
    setSelectedTags(selectedTags);
    filterData(selectedDate, selectedTags, selectedRegulators);
    await sendLog(`Filtro de tags aplicado: ${selectedTags.join(", ")}`, "Filtro realizado");
  };

  const handleRegulatorFilterChange = async (selectedRegulators) => {
    setSelectedRegulators(selectedRegulators);
    filterData(selectedDate, selectedTags, selectedRegulators);
    await sendLog(`Filtro de órgão regulador aplicado: ${selectedRegulators.join(", ")}`, "Filtro realizado");
  };

  const filterData = (date, tags, regulators) => {
    let filtered = [...tableData];

    if (date) {
      filtered = filtered.filter((doc) => {
        // o formato está dd/mm/yyyy
        const [day, month, year] = doc["Data de Publicação"].split("/");
        const docDate = new Date(year, month -1, day);
        return (
          docDate.getDate() === date.getDate() &&
          docDate.getMonth() === date.getMonth() &&
          docDate.getFullYear() === date.getFullYear()
        );
      });
    }

    if (tags.length > 0) {
      filtered = filtered.filter((doc) =>
        doc.Tags.some((tag) => tags.includes(tag.full))
      );
    }

    if (regulators.length > 0) {
      filtered = filtered.filter((doc) =>
        regulators.includes(doc["Órgão Regulador"])
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const sendLog = async (descricao, tipo) => {
    try {
      const logData = {
        descricao: descricao || "Descrição não fornecida",
        tipo: tipo || "Tipo não fornecido"
      };
      
      console.log("Enviando log com os dados:", logData);
      
      const response = await fetch(`${import.meta.env.VITE_URL_API_BACKEND}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      });

      if (response.ok) {
        console.log("Log enviado com sucesso:", logData);
      } else {
        console.error("Erro ao enviar log. Status:", response.status);
        const errorData = await response.json();
        console.error("Detalhes do erro:", errorData);
      }
    } catch (error) {
      console.error("Erro ao enviar log:", error);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchAllDocuments();

    if (!logSent) {
      sendLog('Página principal acessada', 'Acesso à página principal');
      setLogSent(true);
    }
  }, [logSent]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error("Error accessing microphone", error);
    }
  };

  useEffect(() => {
    const stopRecording = () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          audioChunksRef.current = [];

          sendAudioToSTT(audioBlob);
        };
      }
    };

    if (micOn) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [micOn]);

  const sendAudioToSTT = async (audioBlob) => {
    const formData = new FormData();
    const audioFile = new File([audioBlob], "audio.wav", { type: "audio/wav" });
    formData.append("audio", audioFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API_STT_SST}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.text();
      setSearchBar(result);

      handleSearch(result);
    } catch (error) {
      console.error("Error sending audio to Whisper:", error);
    }
  };

  const handleMicButton = () => {
    if (!micOn) {
      setSearchBar("Áudio sendo transcrito...");
    }
    setMicOn(!micOn);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(searchBar);
    }
  };

  const Mic = () => {
    if (darkTheme) {
      return micOn ? (
        <img src={"/mic-press-dark-theme.svg"} alt={"Ícone de microfone"} />
      ) : (
        <img src={"/mic-dark-theme.svg"} alt={"Ícone de microfone"} />
      );
    } else {
      return micOn ? (
        <img src={"/mic-press-light-theme.svg"} alt={"Ícone de microfone"} />
      ) : (
        <img src={"/mic-light-theme.svg"} alt={"Ícone de microfone"} />
      );
    }
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await sendLog(`Página principal acessada. ${pagesAccessed.join(" | ")} | Pg. ${nextPage}`, 'Acesso à página principal');
      setPagesAccessed((prev) => [...prev, `Pg. ${nextPage}`]);
    }
  };

  const handlePrevPage = async () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      await sendLog(`Página principal acessada. ${pagesAccessed.join(" | ")} | Pg. ${prevPage}`, 'Acesso à página principal');
      setPagesAccessed((prev) => [...prev, `Pg. ${prevPage}`]);
    }
  };

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    await sendLog(`Página principal acessada. ${pagesAccessed.join(" | ")} | Pg. ${pageNumber}`, 'Acesso à página principal');
    setPagesAccessed((prev) => [...prev, `Pg. ${pageNumber}`]);
  };

  const openEditTagsModal = (document) => {
    setSelectedDocument({
      id: document.id,
      documentName: document.Nome.nome,
      currentTags: document.Tags.map((tag) => ({ id: tag.id, nome: tag.full })),
    });
    setIsModalOpen(true);
  };

  const saveUpdatedTags = async (updatedTags) => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_URL_API_BACKEND}/documents/${
          selectedDocument.id
        }/tags`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idTags: updatedTags }),
        }
      );

      if (response.ok) {
        console.log("Tags atualizadas com sucesso!");
        fetchAllDocuments();
        setIsModalOpen(false);
      } else {
        console.error("Erro ao atualizar tags");
      }
    } catch (error) {
      console.error("Erro ao atualizar tags:", error);
    }
  };

  return (
    <main className={`${styles.main} ${darkTheme ? styles["dark-main"] : ""}`}>
      <div className={styles.container}>
        <Header
          darkTheme={darkTheme}
          handleCheckboxChange={handleCheckboxChange}
        />
        <div
          className={`${stylesSearch.search} ${
            darkTheme ? stylesSearch.searchDark : ""
          }`}
        >
          <div className={stylesSearch.searchBox}>
            <div className={stylesSearch.searchField}>
              <input
                placeholder="Buscar normas..."
                className={stylesSearch.input}
                type="text"
                value={searchBar}
                onChange={(e) => setSearchBar(e.target.value)}
                onKeyDown={handleKeyDown}
                id="filterInput"
              />
              <div className={stylesSearch.searchBoxIcon}>
                <button
                  className={stylesSearch.btnIconContent}
                  onClick={handleMicButton}
                >
                  <Mic />
                </button>
              </div>
            </div>
          </div>

          <Filters
            darkTheme={darkTheme}
            optionsRegulator={["Ambima", "CVM", "B3"]}
            optionsTags={availableTags}
            handleDateFilterChange={handleDateFilterChange}
            selectedDate={selectedDate}
            onApplyTagFilter={handleTagFilterChange}
            onApplyRegulatorFilter={handleRegulatorFilterChange}
          />

          <ResultsCount darkTheme={darkTheme} count={filteredData.length} />

          {loading ? (
            <LoaderSpinner loading={loading} darkTheme={darkTheme} />
          ) : (
            <>
              <Table
                columns={["Nome", "Órgão Regulador", "Tipo de Documento", "Tags", "Data de Publicação"]}
                data={currentResults}
                isLog={false}
                isTag={true}
                darkTheme={darkTheme}
                onEditTags={openEditTagsModal}
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

      {isModalOpen && selectedDocument && (
        <ModalEditTags
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          documentName={selectedDocument.documentName}
          currentTags={selectedDocument.currentTags}
          availableTags={availableTags}
          onSave={saveUpdatedTags}
          darkTheme={darkTheme}
          allTags={modalEditAllTags}
          loading={modalEditTagsLoading}
        />
      )}
    </main>
  );
}
