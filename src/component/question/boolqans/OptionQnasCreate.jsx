import React, { useState } from 'react';

const OptionQnasCreate = ({ OnAdd }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([]);
  const [correctOptionIds, setCorrectOptionIds] = useState([]);
  const [description, setDescription] = useState('');
  const [optionId,setOptionId]= useState(1);
  const [selectedExamId,setSelectedExams]=useState([]);

  //need to fetch the exams from api

  const exams=[
  { "id": "AZ-900", "name": "Microsoft Azure Fundamentals" },
  { "id": "AZ-104", "name": "Microsoft Azure Administrator" },
  { "id": "AZ-305", "name": "Microsoft Azure Solutions Architect Expert" },
  { "id": "AZ-400", "name": "Microsoft Azure DevOps Engineer Expert" },
  { "id": "AZ-500", "name": "Microsoft Azure Security Technologies" },
  { "id": "AZ-204", "name": "Developing Solutions for Microsoft Azure" },
  { "id": "AZ-720", "name": "Troubleshooting Microsoft Azure Connectivity" },
  { "id": "AZ-140", "name": "Configuring and Operating Microsoft Azure Virtual Desktop" },
  { "id": "AZ-800", "name": "Administering Windows Server Hybrid Core Infrastructure" },
  { "id": "AZ-801", "name": "Configuring Windows Server Hybrid Advanced Services" },
  { "id": "DP-900", "name": "Microsoft Azure Data Fundamentals" },
  { "id": "DP-300", "name": "Administering Relational Databases on Microsoft Azure" },
  { "id": "DP-420", "name": "Designing and Implementing Cloud-Native Applications Using Microsoft Azure Cosmos DB" },
  { "id": "AI-900", "name": "Microsoft Azure AI Fundamentals" },
  { "id": "AI-102", "name": "Designing and Implementing an Azure AI Solution" },
  { "id": "SC-900", "name": "Microsoft Security, Compliance, and Identity Fundamentals" },
  { "id": "SC-200", "name": "Microsoft Security Operations Analyst" },
  { "id": "SC-300", "name": "Microsoft Identity and Access Administrator" },
  { "id": "SC-400", "name": "Microsoft Information Protection Administrator" },
  { "id": "MB-910", "name": "Microsoft Dynamics 365 Fundamentals (CRM)" },
  { "id": "MB-920", "name": "Microsoft Dynamics 365 Fundamentals (ERP)" }
];


  const handleExamSelection =(id)=>{
    const updatedIds= selectedExamId.includes(id)? selectedExamId.filter(x=>x!==id):
    [...selectedExamId,id];
    setSelectedExams(updatedIds);
  }

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
      selectedExamId
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
  <div className="col-12 mb-2">
    <label className="form-label fw-bold fs-5">🧪 Exams</label>
  </div>

  {exams.map((opt) => (
    <div key={opt.id} className="col-md-6 mb-2">
      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          value={opt.id}
          checked={selectedExamId.includes(opt.id)}
          onChange={() => handleExamSelection(opt.id)}
          id={`exam-${opt.id}`}
          style={{ transform: 'scale(1.3)' }} // Just enlarges the checkbox
        />
        <label
          className="form-check-label fw-bold"
          htmlFor={`exam-${opt.id}`}
        >
          {opt.id +" : "+ opt.name}
        </label>
      </div>
    </div>
  ))}
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
