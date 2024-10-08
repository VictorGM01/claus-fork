import React from "react";
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

export default function Table({
  columns,
  data,
  isLog = false,
  isTag = false,
  darkTheme = false,
  onEditTags,
  isEmail = false,
}) {
  const [sort, setSort] = useState({ column: "", order: "" });
  const [sortedData, setSortedData] = useState([...data]);
  const tagColors = useRef({});

  useEffect(() => {
    setSortedData([...data]);

    if (Object.keys(tagColors.current).length === 0) {
      const colors = {};
      data.forEach((row) => {
        if (row.Tags) {
          row.Tags.forEach((tag) => {
            if (!colors[tag.abbreviated]) {
              colors[tag.abbreviated] = generateRandomColor();
            }
          });
        }
      });
      tagColors.current = colors;
    }
  }, [data]);

  const formatDate = (date) => {
    if ((isLog || isEmail) && date.includes("T")) {
      const [datePart, timePart] = date.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hours, minutes, seconds] = timePart
        .split(".")[0]
        .split(":")
        .map(Number);
      const adjustedHours = hours - 3;
      return `${day}/${month}/${year} ${adjustedHours}:${minutes}:${seconds}`;
    }
    return date;
  };

  const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleSort = (column) => {
    let order = "asc";

    if (sort.column === column && sort.order === "asc") {
      order = "desc";
    }

    setSort({ column, order });

    const sorted = [...data].sort((a, b) => {
      if (
        !isNaN(new Date(a[column]).getTime()) &&
        !isNaN(new Date(b[column]).getTime())
      ) {
        const dateA = new Date(a[column]).getTime();
        const dateB = new Date(b[column]).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        if (order === "asc") {
          return a[column] > b[column] ? 1 : -1;
        }
        return a[column] < b[column] ? 1 : -1;
      }
    });

    setSortedData(sorted);
  };

  const isIpAddress = (value) => {
    return (
      typeof value === "string" &&
      (value.match(/^(\d{1,3}\.){3}\d{1,3}$/) || value.includes("::"))
    );
  };

  return (
    <table
      className={`${styles["table"]} ${
        darkTheme ? styles["dark-table"] : styles["light-table"]
      }`}
    >
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column}
              onClick={() => handleSort(column)}
              style={{ cursor: "pointer" }}
            >
              {column}
              {column.toLowerCase().includes("data") && (
                <img
                  src={
                    darkTheme
                      ? "/arrow-dark-theme.svg"
                      : "/arrow-light-theme.svg"
                  }
                  alt="Sort arrow"
                  className={`${styles["sort-arrow"]} ${
                    sort.column === column && sort.order === "asc"
                      ? styles["rotate-arrow"]
                      : ""
                  }`}
                />
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column}>
                {!isNaN(new Date(row[column])) &&
                !isIpAddress(row[column]) ? (
                  formatDate(row[column])
                ) : column.toLowerCase() === "tags" && isTag ? (
                  <>
                    <div className={styles.tagContainer}>
                      {row.Tags.map((tag, idx) => (
                        <span
                          key={idx}
                          title={tag.full}
                          className={styles.tag}
                          style={{
                            backgroundColor:
                              tagColors.current[tag.abbreviated] || "#ccc",
                          }}
                        >
                          {tag.abbreviated}
                        </span>
                      ))}
                    </div>
                    <button
                      className={styles.editTagsButton}
                      onClick={() => onEditTags && onEditTags(row)}
                    >
                      Editar tags
                    </button>
                  </>
                ) : column.toLowerCase() === "nome" &&
                  row[column].nome &&
                  row[column].link ? (
                  <a
                    href={row[column].link}
                    style={{ textDecoration: "underline", color: "inherit" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {row[column].nome}
                  </a>
                ) : (
                  row[column]
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLog: PropTypes.bool,
  isTag: PropTypes.bool,
  darkTheme: PropTypes.bool,
  onEditTags: PropTypes.func,
  isEmail: PropTypes.bool,
};
