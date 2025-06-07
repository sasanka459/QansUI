import React, { useState } from "react";


const questions = [
  { id: 1, text: "If you edit the Subscription's IAM and add a Virtual Machine Contributor role assignment to John user, he can now manage virtual machines but not access them, and not the virtual network or storage account they are connected to.", correct: "Yes" },
  { id: 2, text: "If you edit the Subscription's IAM and add a Reader role assignment to John's user, he can now view all the resources, but not make any changes.", correct: "Yes" },
  { id: 3, text: "If you edit the Subscription's IAM and add an Owner role assignment to John's user, he can now inherit the Contributor's Role, including the resources.", correct: "No" },
  { id: 4, text: "If you edit the Subscription's IAM and add a Contributor role assignment to John's user, he can now manage everything such as granting access to the resources.", correct: "No" },
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

    const getRadioStyle = (question, value) => {
    if (!submitted) return {};
    const isSelected = answers[question.id] === value;
    if (!isSelected) return {};
    const isCorrect = value === question.correct;
    return {
      //outline: "2px solid",
      accentColor: isCorrect ? "green" : "red",
      //borderRadius: "50%"
    };
  };

    return (
    <div className="flex justify-start p-6">
      <div className="max-w-3xl bg-white rounded-xl shadow-md space-y-4 text-left">
        <h1 className="text-xl font-bold mb-4">Group Questions</h1>
        {questions.map((q) => (
          <div key={q.id}>
            <p className="mb-2 text-black">{q.text}</p>
            <div className="flex gap-4">
              <label style={getRadioStyle(q, "Yes")}>
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value="Yes"
                  checked={answers[q.id] === "Yes"}
                  onChange={() => handleChange(q.id, "Yes")}
                />{" "}
                Yes
              </label>
              <label style={getRadioStyle(q, "No")}>
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value="No"
                  checked={answers[q.id] === "No"}
                  onChange={() => handleChange(q.id, "No")}
                />{" "}
                No
              </label>
            </div>
          </div>
        ))}

        <button
         style={{
                  padding: '6px 12px',
                  backgroundColor: '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );

}

export default BooleanQnsAns;
