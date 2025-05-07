import React, { useState } from "react";

const Multichoicerestrictedoptions = ({ question, options }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
  const [resultMessage, setResultMessage] = useState("");

  

  const correctAnswers = ["Azure Virtual Machines", "Azure Functions", "Azure Kubernetes Service"];

  const handleChange = (event) => {
    const value = event.target.value;
    if (selectedOptions.includes(value)) {
      setSelectedOptions(selectedOptions.filter((option) => option !== value));
    } else if (selectedOptions.length < 3) {
      setSelectedOptions([...selectedOptions, value]);
    }
  };

  const checkAnswers = () => {
    const isCorrect = selectedOptions.every((option) => correctAnswers.includes(option)) && selectedOptions.length === correctAnswers.length;
    setResultMessage(isCorrect ? "Correct! 🎉" : "Incorrect, try again. ❌");
  };

  return (
    <div>
      <h2>{question}</h2>
      {options.map((option) => (
        <div key={option}>
          <input
            type="checkbox"
            value={option}
            checked={selectedOptions.includes(option)}
            onChange={handleChange}
            disabled={!selectedOptions.includes(option) && selectedOptions.length >= 3}
          />
          <label>{option}</label>
        </div>
      ))}
      <p>Selected: {selectedOptions.join(", ")}</p>
      <button onClick={checkAnswers}>Submit</button>
      <p>{resultMessage}</p>
    </div>
  );
};



export default Multichoicerestrictedoptions;