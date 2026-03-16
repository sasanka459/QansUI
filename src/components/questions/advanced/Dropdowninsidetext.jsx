import React, { useState } from "react";


const Dropdowninsidetext = ({ sentenceBefore, options = [], sentenceAfter = "", defaultValue = "" }) => {
  const [selected, setSelected] = useState(defaultValue || options[0]);

  if (!options.length) {
    return <p className="text-red-500">No options provided.</p>;
  }

  return (
    <div className="p-4 border rounded-xl shadow-md bg-white max-w-md mx-auto text-lg">
      <p>
        {sentenceBefore}{" "}
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border-b border-gray-400 focus:outline-none focus:border-blue-500 px-1 bg-transparent"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>{" "}
        {sentenceAfter}
      </p>
    </div>
  );
};

export default Dropdowninsidetext;
