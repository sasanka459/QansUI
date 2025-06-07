import React, { useState } from "react";


const questions = [
  { id: 1, text: "If you edit the Subscription's IAM and add a Virtual Machine Contributor role assignment to John user, he can now manage virtual machines but not access them, and not the virtual network or storage account they are connected to.", correct: "Yes", description: "A Virtual Machine Contributor can manage VMs but lacks network/storage access." },
  { id: 2, text: "If you edit the Subscription's IAM and add a Reader role assignment to John's user, he can now view all the resources, but not make any changes.", correct: "Yes", description: "The Reader role grants view-only access across all resources." },
  { id: 3, text: "If you edit the Subscription's IAM and add an Owner role assignment to John's user, he can now inherit the Contributor's Role, including the resources.", correct: "No", description: "The Owner role provides full control but does not 'inherit' contributor permissions." },
  { id: 4, text: "If you edit the Subscription's IAM and add a Contributor role assignment to John's user, he can now manage everything such as granting access to the resources.", correct: "No", description: "A Contributor manages resources but **cannot** grant access—only Owners can." },
];

function BooleanQnsAns() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const getRadioStyle = (question, value) => {
    if (!submitted) return {};
    const isSelected = answers[question.id] === value;
    const isCorrect = value === question.correct;

    return {
      accentColor: isSelected ? (isCorrect ? "green" : "red") : undefined,
      pointerEvents: submitted ? "none" : "auto", // Prevent interaction after submit
    };
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-md p-6 space-y-6">
        <h1 className="text-xl font-bold text-center">Group Questions</h1>

        {/* Reset Button */}
        <div className="text-center">
          <button
            onClick={handleReset}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1890ff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Reset
          </button>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="p-4 border rounded-md bg-gray-100">
              <p className="mb-2 text-black font-medium">{q.text}</p>

              {/* Radio Buttons */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value="Yes"
                    checked={answers[q.id] === "Yes"}
                    onChange={() => handleChange(q.id, "Yes")}
                    disabled={submitted}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value="No"
                    checked={answers[q.id] === "No"}
                    onChange={() => handleChange(q.id, "No")}
                    disabled={submitted}
                  />
                  No
                </label>
              </div>

              {/* Show feedback only for answered questions */}
              {submitted && answers[q.id] && (
                  <p style={{ fontWeight: "bold", marginTop: "5px" }}>
                     {answers[q.id] === q.correct ? (
                       <span style={{ color: "green" }}>✅ Correct</span>
                   ) : (
                     <>
                       <span style={{ color: "red" }}>❌ <strong>Incorrect</strong></span>
                       <br />
                       <span style={{ color: "black" }}>Correct Answer: {q.correct}</span>
                       <br />
                       <span style={{ color: "blue", fontSize: "12px" }}>
                           <strong style={{ color: "black", fontSize: "12px" }}>Explanation:</strong> {q.description}
                       </span>
                     </>
                    )}
                  </p>
                )}
                </div>              
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1890ff",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default BooleanQnsAns;

