import React, { useEffect, useState } from 'react';
import { NavigationBar } from '../../NavigationBar';
import TopicSelector from '../../topic/TopicSelector';
import ChapterSelector from '../../chapter/ChapterSelector';


const CreateBoolQans = () => {

//Dummy data (This need to be fetched from API)
const topicsData = {
  azure: [
    { id: 'az-net', name: 'Networking', description: 'Covers VNets, NSGs, and more' },
    { id: 'az-sec', name: 'Security', description: 'Covers Key Vault, RBAC, etc.' },
    { id: 'az-comp', name: 'Compute', description: 'Focus on VMs, App Services' }
  ],
  AWS: [
    { id: 'aws-vpc', name: 'VPC', description: 'Virtual Private Cloud in AWS' },
    { id: 'aws-iam', name: 'IAM', description: 'Identity and Access Management' },
    { id: 'aws-ec2', name: 'EC2', description: 'Elastic Compute Cloud' }
  ]
};


//Variable to store the default value of the topic i.e Azure/Aws
 const [selectedTopic,SetselectedTopic]= useState('');

 //Variable to store the default value of the chapter

 const [selectedChapter,SetSelectedChapter]= useState(null);

 //Variable to store selected sub module

const [selectedModule,SetSelectedModule]= useState(null);

 useEffect(()=>{
if (selectedTopic) {
  debugger;
  //Clear the chapter drop down
  SetSelectedChapter(null);
}

 },[selectedTopic]);

useEffect(()=>{
if (selectedChapter) {
  SetSelectedModule(null)
}

},[selectedChapter])


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
      topic:selectedTopic,
      chapter:selectedChapter,
      module:selectedModule,
      text: form.text,
      correct: form.correct,
      description: form.description
    };

    setQuestions([...questions, newQuestion]);
    setForm({ text: '', correct: 'Yes', description: '' });
  };

  const stringifyJson = () => JSON.stringify(questions);

  return (
    <>
    <NavigationBar/>
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: 700,margin:'0 auto' }}>
      <h2>IAM A Boolean Questions Builder</h2>



      <TopicSelector
  topics={topicsData}
  selectedTopic={selectedTopic}
  onChange={SetselectedTopic}
/>

<ChapterSelector
  topicKey={selectedTopic}
  selectedChapter={selectedChapter}
  onChange={SetSelectedChapter}
/>

<ChapterSelector
  topicKey={selectedChapter}
  selectedChapter={selectedModule}
  onChange={SetSelectedModule}
/>

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

    </>
  );
};

export default CreateBoolQans;
