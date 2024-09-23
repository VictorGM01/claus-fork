import React from "react";
import { ClipLoader } from "react-spinners";
import styles from "./styles.module.css"; 

const LoaderSpinner = ({ loading, darkTheme }) => {
  return (
    <div className={styles.spinnerContainer}>
      <ClipLoader color={darkTheme ? "#fff" : "#2A376F"} loading={loading} size={50} />
    </div>
  );
};

export default LoaderSpinner;
