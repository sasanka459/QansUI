import React, { useState, useEffect } from "react";


const questions = [
  { id: 1, text: "If you edit the Subscription's IAM and add a Virtual Machine Contributor role assignment to John user, he can now manage virtual machines but not access them, and not the virtual network or storage account they are connected to.", correct: "Yes" },
  { id: 2, text: "If you edit the Subscription's IAM and add a Reader role assignment to John's user, he can now view all the resources, but not make any changes.", correct: "Yes" },
  { id: 3, text: "If you edit the Subscription's IAM and add an Owner role assignment to John's user, he can now inherit the Contributor's Role, including the resources.", correct: "No" },
  { id: 4, text: "If you edit the Subscription's IAM and add a Contributor role assignment to John's user, he can now manage everything such as granting access to the resources.", correct: "No" },
];

function BooleanQnsAns() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
  console.log("State changed! submitted:", submitted);
}, [submitted]);
  const handleChange = (id, value) => {
  setAnswers((prev) => ({ ...prev, [id]: value }));
  };

 
const handleSubmit = () => {
  debugger;
  console.log("Submitting with Answers:", answers);
  setSubmitted(true);
  console.log(answers[1]);
  console.log("Updated Submitted State:", submitted);

};
console.log("Rendering with submitted:", submitted);


  return (
    <div className="flex justify-start p-6">
      <div className="max-w-3xl bg-white rounded-xl shadow-md space-y-4 text-left">
        <h1 className="text-xl font-bold mb-4">Group Questions</h1>
          {questions.map((q) => (
            <div key={q.id} style={ `${submitted && answers[q.id] === q.correct ?  "color: 'green';" : "color: 'red';" }`}
>
            <p className="mb-2">{q.text}</p>
            <div className="flex gap-4">
              <label>
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  value="Yes"
                  checked={answers[q.id] === "Yes"}
                  onChange={() => handleChange(q.id, "Yes")}
                />{" "}
                Yes
              </label>
              <label>
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
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default BooleanQnsAns;
