import React, { useState, useRef, useEffect } from "react";
import styles from "./styles.module.css";
import stylesSearch from "../../style/search.module.css";
import Table from "../../components/table";
import Header from "../../components/header";
import Filters from "../../components/filters";
import Pagination from "../../components/pagination";
import ResultsCount from "../../components/resultsCount";
import LoaderSpinner from "../../components/loaderSpinner"; 

function abbreviateTags(tags) {
  return tags.map((tag) => ({
    full: tag.nome,
    abbreviated: tag.nome
      .split(" ")
      .filter((word) => word[0] === word[0].toUpperCase())
      .map((word) => word[0])
      .join(""),
  }));
}

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
  const resultsPerPage = 5;

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleCheckboxChange = () => {
    setDarkTheme(!darkTheme);
  };

  const fetchAllDocuments = async () => {
    try {
      setLoading(true); 
      const response = await fetch(
        `${import.meta.env.VITE_URL_API_BACKEND}/documents`
      );
      const result = await response.json();

      if (Array.isArray(result.data)) {
        const formattedData = result.data.map((doc) => ({
          Nome: { nome: doc.nome, link: doc.link },
          "Data de Publicação": new Date(
            doc.data_publicacao
          ).toLocaleDateString("pt-BR"),
          Tags: Array.isArray(doc.tags) ? abbreviateTags(doc.tags) : [],
          "Órgão Regulador": doc.orgao.nome,
          "Tipo de Documento": doc.tipo.nome,
        }));

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
        const formattedData = result.data.map((doc) => ({
          Nome: { nome: doc.nome, link: doc.link },
          "Data de Publicação": new Date(
            doc.data_publicacao
          ).toLocaleDateString("pt-BR"),
          Tags: Array.isArray(doc.tags) ? abbreviateTags(doc.tags) : [],
        }));

        setTableData(formattedData);
        setFilteredData(formattedData);
      } else {
        console.error("Erro: a resposta não é um array de documentos.", result);
      }
    } catch (error) {
      console.error("Error searching documents:", error);
    } finally {
      setLoading(false); 
    }
  };

  const handleDateFilterChange = (date) => {
    setSelectedDate(date);
    filterData(date, selectedTags, selectedRegulators);
  };

  const handleTagFilterChange = (selectedTags) => {
    setSelectedTags(selectedTags);
    filterData(selectedDate, selectedTags, selectedRegulators);
  };

  const handleRegulatorFilterChange = (selectedRegulators) => {
    setSelectedRegulators(selectedRegulators);
    filterData(selectedDate, selectedTags, selectedRegulators);
  };

  const filterData = (date, tags, regulators) => {
    let filtered = [...tableData];

    if (date) {
      filtered = filtered.filter((doc) => {
        const docDate = new Date(doc["Data de Publicação"]);
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

  useEffect(() => {
    fetchAllDocuments();
  }, []);

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

          <ResultsCount
            darkTheme={darkTheme}
            count={filteredData.length}
          />


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
