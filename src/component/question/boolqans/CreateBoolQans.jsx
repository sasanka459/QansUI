import React, { useState } from 'react';

const CreateBoolQans = () => {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({
    text: '',
    correct: 'Yes',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!form.text || !form.description) return;

    const newQuestion = {
      id: questions.length + 1, // Auto-generate ID
      text: form.text,
      correct: form.correct,
      description: form.description
    };

    setQuestions([...questions, newQuestion]);
    setForm({ text: '', correct: 'Yes', description: '' });
  };

  const stringifyJson = () => JSON.stringify(questions);

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: 700 }}>
      <h2>IAM A Boolean Questions Builder</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <textarea
          name="text"
          placeholder="Question Text"
          value={form.text}
          onChange={handleChange}
        />
        <div>
          <label>
            <input
              type="radio"
              name="correct"
              value="Yes"
              checked={form.correct === 'Yes'}
              onChange={handleChange}
            />
            Yes
          </label>
          {' '}
          <label>
            <input
              type="radio"
              name="correct"
              value="No"
              checked={form.correct === 'No'}
              onChange={handleChange}
            />
            No
          </label>
        </div>
        <textarea
          name="description"
          placeholder="Explanation / Description"
          value={form.description}
          onChange={handleChange}
        />
        <button onClick={handleAdd}>Add Question</button>
      </div>

      {questions.length > 0 && (
        <>
          <h3>Preview</h3>
          <pre>{JSON.stringify(questions, null, 2)}</pre>

          <h3>Stringified JSON</h3>
          <textarea value={stringifyJson()} rows="10" cols="80" readOnly />
        </>
      )}
    </div>
  );
};

export default CreateBoolQans;
