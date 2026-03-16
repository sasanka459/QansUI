import React, { useState } from 'react';

const QuestionDisplay = ({ question }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleChange = (id) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((opt) => opt !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const correctSet = new Set(question.qus.correct);
    const isAnswerCorrect =
      selectedOptions.length === question.qus.correct.length &&
      selectedOptions.every((id) => correctSet.has(id));

    setIsCorrect(isAnswerCorrect);
    setSubmitted(true);
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
      <h4>{question.qus.text}</h4>
      <p><strong>Description:</strong> {question.qus.description}</p>
      <div>
        {question.qus.options.map((opt) => (
          <div key={opt.id}>
            <label>
              <input
                type="checkbox"
                value={opt.id}
                checked={selectedOptions.includes(opt.id)}
                onChange={() => handleChange(opt.id)}
                disabled={submitted}
              />
              {opt.value}
            </label>
          </div>
        ))}
      </div>
      {!submitted ? (
        <button className="btn btn-primary mt-2" onClick={handleSubmit}>
          Submit Answer
        </button>
      ) : (
        <div className="mt-2">
          {isCorrect ? (
            <div style={{ color: 'green' }}>✅ Correct!</div>
          ) : (
            <div style={{ color: 'red' }}>❌ Incorrect. Try again or review.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;
