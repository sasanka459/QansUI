import { Routes, Route } from "react-router-dom";
import { PageLayout } from '../components/authentication/PageLayout';
import Welcome from '../components/authentication/Welcome';
import Abc from '../components/authentication/Abc';
import CreateBoolQans from '../components/questions/boolean/CreateBoolQans';
import OptionQansCreate from '../components/questions/boolean/OptionQnasCreate';
import CreateExam from '../components/exams/CreateExam';
import ExamList from '../components/exams/listAllExams';
import CreateQuestion from '../components/questions/CreateQuestion';
import QuestionRenderer from '../components/questions/display';

export const Router = () => (
    <Routes>
        <Route path="/" element={<PageLayout><Welcome /></PageLayout>} />
        <Route path="/about" element={<Abc />} />
        <Route path="/boolQans" element={<CreateBoolQans />} />
        <Route path="/OptionQans" element={<OptionQansCreate />} />
        <Route path="/main" element={<Welcome />} />
        <Route path="/createExam" element={<CreateExam />} />
        <Route path="/ExamList" element={<ExamList />} />
        <Route path="/createQuestion" element={<CreateQuestion />} />
        <Route path="/QuestionRenderer" element={<QuestionRenderer />} />
    </Routes>
);