import React, { useEffect, useState } from 'react';
import { NavigationBar } from '../../NavigationBar';
import TopicSelector from '../../topic/TopicSelector';
import ChapterSelector from '../../chapter/ChapterSelector';
import OptionQnasCreate from './OptionQnasCreate';
import QuestionDisplay from './QuestionDisplay';


const CreateBoolQans = () => {


//Variable to store the default value of the topic i.e Azure/Aws
 const [selectedTopic,SetselectedTopic]= useState('');

 //Variable to store the default value of the chapter

 const [selectedChapter,SetSelectedChapter]= useState(null);

 //Variable to store selected sub module
const [selectedModule,SetSelectedModule]= useState(null);

const [preView, setPreview] = useState(true);
const [showPreview, setShowPreview] = useState(true);
const [showJson, setShowJson] = useState(false);



 const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState({
   
    text: '',
    correct: 'Yes',
    description: ''
  });

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

  const handleNewQuestion=(question)=>{

      const newQuestion = {
      id: questions.length + 1, // Auto-generate ID
      topic:selectedTopic,
      chapter:selectedChapter,
      module:selectedModule,
      qus: question,
    
    };

    setQuestions([...questions, newQuestion]);

  };



  const stringifyJson = () => JSON.stringify(questions);

  return (
    <>
    <NavigationBar/>
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: 700,margin:'0 auto' }}>
      <h2>IAM A Boolean Questions Builder</h2>



      <TopicSelector
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
        <OptionQnasCreate OnAdd={handleNewQuestion}></OptionQnasCreate>
      </div>

     {questions.length > 0 && (
  <>
  <h3>
      Preview{' '}
      <button
        className="btn btn-sm btn-link"
        onClick={() => setPreview(!preView)}
      >
        {preView ? '⬆️ Collapse' : '⬇️ Expand'}
      </button>
    </h3>
    {preView && (
      <pre>{
        questions.map((q) => (
  <QuestionDisplay key={q.id} question={q} />
))}

        
        </pre>
    )}


    <h3>
      Json Preview{' '}
      <button
        className="btn btn-sm btn-link"
        onClick={() => setShowPreview(!showPreview)}
      >
        {showPreview ? '⬆️ Collapse' : '⬇️ Expand'}
      </button>
    </h3>
    {showPreview && (
      <pre>{JSON.stringify(questions, null, 2)}</pre>
    )}

    <h3>
      Stringified Json{' '}
      <button
        className="btn btn-sm btn-link"
        onClick={() => setShowJson(!showJson)}
      >
        {showJson ? '⬆️ Collapse' : '⬇️ Expand'}
      </button>
    </h3>
    {showJson && (
      <textarea value={stringifyJson()} rows="10" cols="80" readOnly />
    )}
  </>
)}

    </div>
  <div className="col-10 mt-3 d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-success"
            onClick={handleAdd}
          >
            ✅ Submit Question
          </button>
        </div>
    </>
  );
};

export default CreateBoolQans;
