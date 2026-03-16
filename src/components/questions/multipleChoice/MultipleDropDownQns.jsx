import React, { useState } from "react";

const MultipleDropDownQns = () => {
  // ✅ JSON data directly inside the component
  const options = [
    "Platform as a service (PaaS)",
    "Infrastructure as a service (IaaS)",
    "Software as a service (SaaS)",
  ];

  const initialQuestions = [
    { id: 1, label: "Azure Virtual Machines", answer: "" },
    { id: 2, label: "Azure App Service", answer: "" },
  ];

  const correctAnswers = {
    1: "Infrastructure as a service (IaaS)",
    2: "Platform as a service (PaaS)",
  };

  const [questions, setQuestions] = useState(initialQuestions);
  const [results, setResults] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (id, value) => {
    const updated = questions.map((q) =>
      q.id === id ? { ...q, answer: value } : q
    );
    setQuestions(updated);
    setResults({});
    setSubmitted(false);
  };

  const handleSubmit = () => {
    const newResults = {};
    questions.forEach((q) => {
      newResults[q.id] = q.answer === correctAnswers[q.id];
    });
    setResults(newResults);
    setSubmitted(true);
    console.log("Selected Answers:", questions);
  };

  const handleReset = () => {
    const reset = questions.map((q) => ({ ...q, answer: "" }));
    setQuestions(reset);
    setResults({});
    setSubmitted(false);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Select the correct cloud service model</h2>

      {questions.map((question) => {
        const isCorrect = results[question.id];
        const hasAnswered = question.answer !== "";

        return (
          <div key={question.id} style={{ marginBottom: "25px" }}>
            <div style={{ fontWeight: "500", marginBottom: "8px" }}>
              {question.label}
            </div>

            <select
              value={question.answer}
              onChange={(e) => handleChange(question.id, e.target.value)}
              style={{
                padding: "8px",
                width: "100%",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px"
              }}
            >
              <option value="">-- Select an option --</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {submitted && hasAnswered && (
              <div style={{ marginTop: "6px" }}>
                <span
                  style={{
                    color: isCorrect ? "green" : "red",
                    fontWeight: "bold"
                  }}
                >
                  {isCorrect ? "✅ Correct" : "❌ Incorrect"}
                </span>
                {!isCorrect && (
                  <div style={{ marginTop: "4px", color: "#555" }}>
                    Correct Answer:{" "}
                    <span style={{ fontWeight: "500", color: "green" }}>
                      {correctAnswers[question.id]}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: "30px" }}>
        <button
          onClick={handleSubmit}
          disabled={questions.some((q) => q.answer === "")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#0078D4",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px",
            opacity: questions.some((q) => q.answer === "") ? 0.5 : 1
          }}
        >
          Submit
        </button>

        {submitted && (
          <button
            onClick={handleReset}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ccc",
              color: "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default MultipleDropDownQns;
