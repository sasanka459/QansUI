import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChapterSelector = ({ topicKey, selectedChapter, onChange }) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 🚫 Skip API call if topicKey is falsy
    if (!topicKey || topicKey.trim() === '') {
      setChapters([]);
      return;
    }

    setLoading(true);
    axios
      .get(`http://localhost:5100/api/Topic/GetChapterOrModule?topicKey=${topicKey}`)
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        const validChapters = data
          .filter((item) => item?.rowKey && item?.name)
          .map((item) => ({
            id: item.rowKey,
            name: item.name
          }));
        setChapters(validChapters);
      })
      .catch((error) => {
        console.error('Error fetching chapters:', error);
        setChapters([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [topicKey]);

  return (
    <div className="mb-3">
      <label className="form-label">Select Chapter</label>
      <select
        className="form-select"
        value={selectedChapter}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || chapters.length === 0}
      >
        <option value="">-- Choose a Chapter --</option>
      {chapters?.map?.(({ id, name }) => (
  <option key={id} value={id}>
    {name}
  </option>
))}

      </select>
      {loading && <div className="form-text">Loading chapters...</div>}
      {!loading && chapters.length === 0 && topicKey?.trim() !== '' && (
        <div className="form-text text-warning">No chapters found for "{topicKey}".</div>
      )}
    </div>
  );
};

export default ChapterSelector;
