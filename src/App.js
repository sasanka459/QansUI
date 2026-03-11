import React, { useState } from 'react';
import { PageLayout } from './component/authntication/PageLayout';
import Abc from './component/authntication/Abc'
import { loginRequest } from './auth-config';
import { callMsGraph } from './graph';
import { ProfileData } from './component/authntication/ProfileData';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { BrowserRouter as  Routes, Route ,Router} from "react-router-dom";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import './App.css';
import Button from 'react-bootstrap/Button';
import CreateBoolQans from './component/question/boolqans/CreateBoolQans';
import OptionQansCreate from './component/question/boolqans/OptionQnasCreate'
import CreateExam from './component/Exams/CreateExam';
import ExamList from './component/Exams/listAllExams';
import CreateQuestion from './component/question/CreateQuestion';


/**
 * Renders information about the signed-in user or a button to retrieve data about the user
 */

const ProfileContent = () => {
    const { instance, accounts } = useMsal();
    const [graphData, setGraphData] = useState(null);

    function RequestProfileData() {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance
            .acquireTokenSilent({
                ...loginRequest,
                account: accounts[0],
            })
            .then((response) => {
                callMsGraph(response.accessToken).then((response) => setGraphData(response));
            });
    }

    return (
        <>
            <h5 className="profileContent">Welcome {accounts[0].name}</h5>
            {graphData ? (
                <ProfileData graphData={graphData} />
            ) : (
                <Button variant="secondary" onClick={RequestProfileData}>
                    Request Profile
                </Button>
            )}
        </>
    );
};

/**
 * If a user is authenticated the ProfileContent component above is rendered. Otherwise a message indicating a user is not authenticated is rendered.
 */
const MainContent = () => {
    return (
        <div className="App">
            <AuthenticatedTemplate>
                <ProfileContent />
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <h5 className="card-title">Please sign-in to see your profile information.</h5>
            </UnauthenticatedTemplate>
        </div>
    );
};

export default function App() {
    return (   
        <Router>
      <Routes>
        <Route path="/" element={ <PageLayout>
            <MainContent />
        </PageLayout>} />
        <Route path="/about" element={<Abc/>} />
        <Route path="/boolQans" element={<CreateBoolQans/>}/>
        <Route path="/OptionQans" element={<OptionQansCreate/>}/>
        <Route path="/main" element={<MainContent/>} />
        <Route path="/createExam" element={<CreateExam/>} />
        <Route path="/ExamList" element={<ExamList/>} />
        <Route path="/createQuestion" element={<CreateQuestion/>} />
    
      </Routes>
      </Router> 
    );
}