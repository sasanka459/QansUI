import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Paper, Typography, FormControlLabel, Checkbox,
    Radio, RadioGroup, TextField, Grid, Divider, Button, Alert, Stack,
    Select, MenuItem, FormControl, InputLabel, CircularProgress, Container
} from '@mui/material';
import NavigationBar from '../common/NavigationBar';

// --- API CONFIGURATION ---
const api = axios.create({
    baseURL: 'http://localhost:5100/api', // Match your .NET port
    headers: { 'Content-Type': 'application/json' }
});

// ===========================================================================
// 1. MAIN PAGE COMPONENT (Fetches the data)
// ===========================================================================
export default function ViewAllQuestions({ topicId, subjectId }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await api.get('/Question', {
                    params: { topic: topicId, subject: subjectId }
                });

                setQuestions(response.data);
            } catch (err) {
                console.error("Error fetching questions:", err);
                if (err.response?.status === 404) {
                    setQuestions([]);
                } else {
                    setError("Failed to load questions from the backend.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [topicId, subjectId]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
                <CircularProgress size={50} />
                <Typography sx={{ mt: 2 }} color="text.secondary">Loading Question Bank...</Typography>
            </Box>
        );
    }

    if (error) return <Container maxWidth="md" sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    if (questions.length === 0) return <Container maxWidth="md" sx={{ mt: 5 }}><Alert severity="info">No questions found.</Alert></Container>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4, color: '#1976d2' }}>
                Question Bank Viewer
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {questions.map((q, index) => (
                    <QuestionRenderer key={q.rowKey || index} question={q} />
                ))}
            </Box>
        </Container>
    );
}

// ===========================================================================
// 2. RENDERER SUB-COMPONENT (Displays the UI for each question)
// ===========================================================================
function QuestionRenderer({ question }) {
    const [answers, setAnswers] = useState(null);

    useEffect(() => {
        if (question?.questionType === 'MCQ' && question.metadata?.correctIndices?.length > 1) {
            setAnswers([]);
        } else if (question?.questionType === 'FillInBlanks') {
            setAnswers([]);
        } else {
            setAnswers({});
        }
    }, [question]);

    if (!question) return null;

    const { questionType, questionHeader, questionBody, metadata } = question;

    // --- VISUAL INPUT HANDLERS ---
    const handleMCQChange = (option, isMulti) => {
        if (isMulti) {
            setAnswers(prev => {
                const current = Array.isArray(prev) ? prev : [];
                return current.includes(option) ? current.filter(o => o !== option) : [...current, option];
            });
        } else setAnswers(option);
    };

    const handleMatchChange = (leftIndex, rightValue) => setAnswers(prev => ({ ...prev, [leftIndex]: rightValue }));
    const handleBlankChange = (index, value) => {
        setAnswers(prev => {
            const current = Array.isArray(prev) ? [...prev] : [];
            current[index] = value;
            return current;
        });
    };
    const handleYesNoChange = (index, value) => setAnswers(prev => ({ ...prev, [index]: value }));

    const handleDummySubmit = () => {
        console.log("Current selections for question:", questionHeader);
        console.log("Answers:", answers);
        alert("Inputs logged to console!");
    };

    // --- SPECIFIC UI RENDERS ---
    const renderMCQ = () => {
        const isMulti = metadata?.correctIndices?.length > 1;
        const currentAnswers = answers || (isMulti ? [] : "");
        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>{questionBody}</Typography>
                <Stack spacing={1}>
                    {(metadata?.options || []).map((option, idx) => (
                        <Paper key={idx} variant="outlined" sx={{ p: 1, px: 2, '&:hover': { bgcolor: '#f5f5f5' } }}>
                            <FormControlLabel
                                control={
                                    isMulti
                                        ? <Checkbox checked={Array.isArray(currentAnswers) && currentAnswers.includes(option)} onChange={() => handleMCQChange(option, true)} />
                                        : <Radio checked={currentAnswers === option} onChange={() => handleMCQChange(option, false)} />
                                }
                                label={option} sx={{ width: '100%' }}
                            />
                        </Paper>
                    ))}
                </Stack>
            </Box>
        );
    };

    const renderMatch = () => {
        const pairs = metadata?.pairs || [];
        const rightOptions = pairs.map(p => p.right);
        const currentAnswers = answers || {};
        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>Match items from Column A with Column B:</Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>Column A (Select Match)</Typography>
                        {pairs.map((p, i) => (
                            <Paper key={i} sx={{ p: 2, my: 1, bgcolor: '#f8f9fa', display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography sx={{ flex: 1 }}>{p.left}</Typography>
                                <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
                                    <InputLabel>Select Match</InputLabel>
                                    <Select label="Select Match" value={currentAnswers[i] || ''} onChange={(e) => handleMatchChange(i, e.target.value)}>
                                        {rightOptions.map((opt, idx) => <MenuItem key={idx} value={opt}>{opt}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Paper>
                        ))}
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>Column B (Reference)</Typography>
                        {rightOptions.map((opt, i) => <Paper key={i} sx={{ p: 2, my: 1, borderStyle: 'dashed' }}>{opt}</Paper>)}
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const renderFillInBlanks = () => {
        const parts = questionBody?.split('___') || [];
        const currentAnswers = Array.isArray(answers) ? answers : [];
        return (
            <Box sx={{ mt: 2, lineHeight: 3 }}>
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        <Typography component="span" variant="body1">{part}</Typography>
                        {index < parts.length - 1 && (
                            <TextField
                                variant="standard" size="small" value={currentAnswers[index] || ''}
                                onChange={(e) => handleBlankChange(index, e.target.value)}
                                sx={{ mx: 1, width: 150, input: { textAlign: 'center' } }} placeholder={`Blank ${index + 1}`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </Box>
        );
    };

    const renderYesNo = () => {
        const statements = metadata?.statements || [];
        const currentAnswers = answers || {};
        return (
            <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>{questionBody}</Alert>
                <TableHeading />
                {statements.map((stmt, idx) => (
                    <Paper key={idx} sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ flex: 1 }}>{stmt.text}</Typography>
                        <RadioGroup row sx={{ ml: 2 }} value={currentAnswers[idx] || ''} onChange={(e) => handleYesNoChange(idx, e.target.value)}>
                            <FormControlLabel value="Yes" control={<Radio size="small" />} label="Yes" />
                            <FormControlLabel value="No" control={<Radio size="small" />} label="No" />
                        </RadioGroup>
                    </Paper>
                ))}
            </Box>
        );
    };

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <NavigationBar />
            <Typography variant="overline" color="text.secondary" gutterBottom>
                {questionType?.replace(/([A-Z])/g, ' $1').trim()}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>{questionHeader}</Typography>
            <Divider />

            <Box sx={{ minHeight: 150, py: 2 }}>
                {questionType === 'MCQ' && renderMCQ()}
                {questionType === 'Match' && renderMatch()}
                {questionType === 'FillInBlanks' && renderFillInBlanks()}
                {questionType === 'GroupedYesNo' && renderYesNo()}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" color="primary" onClick={handleDummySubmit}>
                    Test Inputs (Console Log)
                </Button>
            </Box>
        </Paper>
    );
}

// ===========================================================================
// 3. MINOR HELPER COMPONENTS
// ===========================================================================
const TableHeading = () => (
    <Box sx={{ display: 'flex', px: 2, mb: 1 }}>
        <Typography variant="caption" sx={{ flex: 1, fontWeight: 'bold' }}>STATEMENTS</Typography>
        <Typography variant="caption" sx={{ width: 150, textAlign: 'center', fontWeight: 'bold' }}>YES / NO</Typography>
    </Box>
);