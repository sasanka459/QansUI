import React, { useState } from 'react';

const OptionQnasCreate = ({ OnAdd }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([]);
  const [correctOptionIds, setCorrectOptionIds] = useState([]);
  const [description, setDescription] = useState('');
  const [optionId,setOptionId]= useState(1);

  const addOption = () => {
   
    setOptions([...options, { id: optionId, value: '' }]);
    setOptionId(optionId+1);
  };

  const updateOption = (index, value) => {
    const updated = [...options];
    updated[index].value = value;
    setOptions(updated);
  };

  const toggleCorrectOption = (id) => {
    setCorrectOptionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const removeOption = (id) => {
    setOptions(options.filter((opt) => opt.id !== id));
    setCorrectOptionIds(correctOptionIds.filter((i) => i !== id));
  };

  const handleSubmit = () => {
    debugger;
    const question = {
      id: Date.now(),
      text: questionText,
      correct: correctOptionIds,
      description,
      options,
    };
    OnAdd(question);
    console.log('Saving question:', question);
    resetForm();
  };

  const resetForm = () => {
  // 🔄 Reset form fields
  setQuestionText('');
  setOptions([]);
  setCorrectOptionIds([]);
  setDescription('');
  setOptionId(1);
  //U+1f600
};

  return (
    <div className="container mt-4">
      <h3 className="mb-4">📝 Add New Question 😀</h3>

      <div className="mb-3">
        <label className="form-label">Question</label>
        <input
          type="text"
          className="form-control"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </div>

    

      <label className="form-label">Options</label>
      {options.map((opt, i) => (
        <div key={opt.id} className="d-flex mb-2 align-items-center">
          <input
            type="text"
            className="form-control"
            value={opt.value}
            onChange={(e) => updateOption(i, e.target.value)}
          />
          <input
            type="checkbox"
            checked={correctOptionIds.includes(opt.id)}
            onChange={() => toggleCorrectOption(opt.id)}
            className="form-check-input ms-3"
          />
          <button
            type="button"
            className="btn btn-outline-danger ms-2"
            onClick={() => removeOption(opt.id)}
          >
            Remove
          </button>
        </div>
      ))}
 <div className="col text-end">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={addOption}
          >
            ➕ Add Option
          </button>
        </div>
  <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="row mt-3">
       

        <div className="col-12 mt-3 d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
          >
            ✅ Create Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptionQnasCreate;
