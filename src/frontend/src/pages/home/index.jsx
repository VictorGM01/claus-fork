import { useEffect, useRef, useState } from "react";
import styles from './styles.module.css'
import stylesSearch from "../../style/search.module.css";
import Table from "../../components/table";
import Header from "../../components/header";

export default function Home() {
  const [darkTheme, setDarkTheme] = useState(false);
  const [searchBar, setSearchBar] = useState("");
  const [micOn, setMicOn] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleCheckboxChange = () => {
    setDarkTheme(!darkTheme);
  };

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
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          audioChunksRef.current = [];
  
          // Enviar o áudio para a API STT
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
      console.log(import.meta.env.VITE_URL_API_STT_SST);
      const response = await fetch(`${import.meta.env.VITE_URL_API_STT_SST}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.text();
      setSearchBar(result);
    } catch (error) {
      console.error("Error sending audio to Whisper:", error);
    }
  };

  const handleMicButton = () => {
    if (!micOn) {
      setSearchBar("Audio sendo transcrito...");
    }
    setMicOn(!micOn);
  };

  const Mic = () => {
    if (darkTheme) {
      return micOn ? <img src={"/mic-press-dark-theme.svg"} alt={"Ícone de microfone"}/> : <img src={"/mic-dark-theme.svg"} alt={"Ícone de microfone"}/>;
    } else {
      return micOn ? <img src={"/mic-press-light-theme.svg"} alt={"Ícone de microfone"}/> : <img src={"/mic-light-theme.svg"} alt={"Ícone de microfone"}/>;
    }
  };

  return (
    <main className={`${styles.main} ${darkTheme ? styles["dark-main"] : ""}`}>
      <div className={styles.container}>
        <Header
          darkTheme={darkTheme} 
          handleCheckboxChange={handleCheckboxChange}
        />
        <div className={`${stylesSearch.search} ${darkTheme ? stylesSearch.searchDark : ""}`}>
          <div className={stylesSearch.searchBox}>
            <div className={stylesSearch.searchField}>
              <input
                placeholder="Buscar normas..."
                className={stylesSearch.input}
                type="text"
                value={searchBar}
                onChange={(e) => setSearchBar(e.target.value)}
              />
              <div className={stylesSearch.searchBoxIcon}>
                <button className={stylesSearch.btnIconContent} onClick={() => handleMicButton()}>
                  <Mic />
                </button>
              </div>
            </div>
          </div>
          <Table 
            columns={["Nome", "Data de Publicação", "Tags", "Órgão Regulador"]} 
            data={[
              { Nome: { nome: "Norma 1", link: "https://www.inteli.edu.br/" }, "Data de Publicação": "2000-10-20T01:30:00.000", Tags: ["Tag1", "Tag2"], "Órgão Regulador": "CVM"  }, 
              { Nome: { nome: "Norma 2", link: "https://www.inteli.edu.br/" }, "Data de Publicação": "2000-10-31T01:30:00.000", Tags: ["Tag3", "Tag4"], "Órgão Regulador": "CVM" }
            ]} 
            isLog={false} 
            isTag={true}
            darkTheme={darkTheme}  
          />

        </div>
      </div>
    </main>
  );
}
