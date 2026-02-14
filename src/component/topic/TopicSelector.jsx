import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TopicSelector = ({ selectedTopic, onChange }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5100/api/Topic/GetTopic')
      .then((response) => {
        const validTopics = response.data.filter(topic => topic?.rowKey && topic?.name);
        setTopics(validTopics);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching topics:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mb-3">
      <label className="form-label">Select Topic</label>
      <select
        className="form-select"
        value={selectedTopic}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        <option value="">-- Choose a Topic --</option>
        {topics.map(({ rowKey, name }) => (
          <option key={rowKey} value={rowKey}>
            {name}
          </option>
        ))}
      </select>
      {loading && <div className="form-text">Loading topics...</div>}
    </div>
  );
};

export default TopicSelector;
