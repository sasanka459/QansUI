import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  CircularProgress,
  Box, Paper
} from '@mui/material';
import RichTextEditor from '../../textBox/textEditor';

const api = axios.create({
  baseURL: 'http://localhost:5100/api',
  headers: { 'Content-Type': 'application/json' }
});

const OptionQnasCreate = ({ OnAdd }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([]);
  const [correctOptionIds, setCorrectOptionIds] = useState([]);
  const [description, setDescription] = useState('');
  const [optionId, setOptionId] = useState(1);

  // Exam states
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState([]);
  const [selectedExamIds, setSelectedExamIds] = useState([]); // Unified state

  useEffect(() => {
    // Fetch active exams from the API
    api.get('/Exam/GetAllExams')
      .then((response) => {
        const activeExams = response.data.filter(
          exam => exam?.rowKey && exam?.examName && exam.isActive === true
        );
        setExams(activeExams);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching exams:', error);
        setLoading(false);
      });
  }, []);

  const handleExamSelection = (event) => {
    const {
      target: { value },
    } = event;

    // MUI multi-select returns an array of selected values
    setSelectedExamIds(
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const addOption = () => {
    setOptions([...options, { id: optionId, value: '' }]);
    setOptionId(optionId + 1);
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
    const question = {
      id: Date.now(),
      text: questionText,
      correct: correctOptionIds,
      description,
      options,
      selectedExamIds // Fixed: Now correctly passes the selected exams
    };

    OnAdd(question);
    console.log('Saving question:', question);
    resetForm();
  };

  const resetForm = () => {
    setQuestionText('');
    setOptions([]);
    setCorrectOptionIds([]);
    setDescription('');
    setOptionId(1);
    setSelectedExamIds([]); // Fixed: Clears the exam dropdown on reset
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Paper className="container mt-4" elevation={4}
      style={{ backgroundColor: (163, 150, 150, 0.2), boxShadow: 10, padding: 40 }}
    >
      <h3 className="mb-4">📝 Add New Question 😀</h3>

      {/* Question Text Input */}
      <div className="mb-3">
        <label className="form-label">Question</label>
        <input
          type="text"
          className="form-control"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
        />
      </div>

      {/* Options List */}
      <label className="form-label">Options</label>
      {options.map((opt, i) => (
        <div key={opt.id} className="d-flex mb-2 align-items-center">
          <input
            type="text"
            className="form-control"
            placeholder={`Option ${i + 1}`}
            value={opt.value}
            onChange={(e) => updateOption(i, e.target.value)}
          />
          <div className="form-check ms-3 mb-0 me-2 d-flex align-items-center">
            <input
              type="checkbox"
              id={`checkbox-${opt.id}`}
              checked={correctOptionIds.includes(opt.id)}
              onChange={() => toggleCorrectOption(opt.id)}
              className="form-check-input"
              style={{ cursor: 'pointer', marginTop: 0 }}
            />
            <label className="form-check-label ms-2 mb-0" htmlFor={`checkbox-${opt.id}`}>
              Correct
            </label>
          </div>
          <button
            type="button"
            className="btn btn-outline-danger ms-auto"
            onClick={() => removeOption(opt.id)}
          >
            Remove
          </button>
        </div>
      ))}

      {/* Add Option Button */}
      <div className="col text-end mb-3"
        style={{ paddingBottom: 20 }}>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={addOption}
        >
          ➕ Add Option
        </button>
      </div>

      {/* Description Input */}
      <RichTextEditor
        label="Exam Description"
        value={description}
        onChange={(value) => setDescription(value)}
        helperText={
          validationErrors.includes("QuestionDescription cannot be empty.")
            ? "QuestionDescription is required"
            : "Enter Question details"
        }
        error={validationErrors.includes("examDescription cannot be empty.")}
        height={200}
      />


      {/* Exams Dropdown */}
      <div className="row mt-3">
        <div className="col-12 mb-2">
          <label className="form-label fw-bold fs-5">🧪 Exams</label>
        </div>
        <Box sx={{ minWidth: 300, maxWidth: '100%', margin: '10px 0' }}>
          <FormControl fullWidth>
            <InputLabel id="exam-multiple-checkbox-label">Select Active Exams</InputLabel>
            <Select
              labelId="exam-multiple-checkbox-label"
              id="exam-multiple-checkbox"
              multiple
              value={selectedExamIds}
              onChange={handleExamSelection}
              input={<OutlinedInput label="Select Exams" />}
              renderValue={(selected) => {
                return selected
                  .map(id => {
                    const exam = exams.find(e => e.rowKey === id);
                    return exam ? exam.examCode : id;
                  })
                  .join(', ');
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 48 * 4.5 + 8,
                    width: 250,
                  },
                },
              }}
            >
              {exams.map((exam) => (
                <MenuItem key={exam.rowKey} value={exam.rowKey}>
                  <Checkbox checked={selectedExamIds.indexOf(exam.rowKey) > -1} />
                  <ListItemText primary={`${exam.examCode} : ${exam.examName}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </div>

      {/* Submit Button */}
      <div className="row mt-4">
        <div className="col-12 d-flex justify-content-center mb-5">
          <button
            type="button"
            className="btn btn-success px-4 py-2 fw-bold"
            onClick={handleSubmit}
            disabled={!questionText || options.length < 2 || correctOptionIds.length === 0}
          >
            ✅ Create Question
          </button>
        </div>
      </div>
    </Paper>
  );
};

export default OptionQnasCreate;