import React, { useState } from "react";

const MutipleOptionQuestion = ({ data }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleSelect = (option) => {
    if (data.isMultiSelect) {
      setSelectedOptions((prev) =>
        prev.includes(option)
          ? prev.filter((item) => item !== option)
          : [...prev, option]
      );
    } else {
      setSelectedOptions([option]); // Single selection mode
    }
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", width: "300px" }}>
      <h3>{data.question}</h3>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {data.options.map((option, index) => (
          <li key={index}>
            <button
              style={{
                margin: "5px",
                padding: "5px 10px",
                backgroundColor: selectedOptions.includes(option)
                  ? "#4CAF50"
                  : "#f0f0f0",
                color: selectedOptions.includes(option) ? "white" : "black",
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
              onClick={() => handleSelect(option)}
            >
              {option}
            </button>
          </li>
        ))}
      </ul>
      <p>Selected Answers: {selectedOptions.join(", ") || "None"}</p>
    </div>
  );
};



export default MutipleOptionQuestion;
