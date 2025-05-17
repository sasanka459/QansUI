// src/components/MulitipledropdownQuestion.js
import React from "react";

const MulitipledropdownQuestion = ({ question, options, onChange }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
      <div style={{ width: "200px", fontWeight: "500" }}>{question.label}</div>
      <select
        value={question.answer}
        onChange={(e) => onChange(question.id, e.target.value)}
        style={{
          padding: "8px",
          width: "300px",
          fontSize: "14px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <option value="">-- Select an option --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MulitipledropdownQuestion;
