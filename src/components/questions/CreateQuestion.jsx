import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box, TextField, MenuItem, Select, FormControl, InputLabel,
    Grid, Paper, Typography, Button, Divider, Alert, CircularProgress,
    Snackbar, FormHelperText, Stack, IconButton, Checkbox
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { NavigationBar } from "../common/NavigationBar";

const api = axios.create({
    baseURL: 'http://localhost:5100/api', // Match your local port
    headers: { 'Content-Type': 'application/json' }
});

export default function CreateQuestion() {
    const getCurrentUser = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.displayName || user.email || 'Unknown User';
        }
        return 'Admin';
    };

    // ===========================================================================
    // 1. STATE MANAGEMENT
    // ===========================================================================
    const [formData, setFormData] = useState({
        topic: "",
        subject: "", // This will store the selected Chapter/Module key
        questionHeader: "",
        questionBody: "",
        questionType: "MCQ",
        isActive: true,
        createdBy: getCurrentUser(),
        createdAt: new Date().toISOString()
    });

    const [metadata, setMetadata] = useState({
        options: ['', '', '', ''],
        correctIndices: [0] // Support for multiple correct answers via Checkbox
    });

    const [touched, setTouched] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const [validationErrors, setValidationErrors] = useState([]);

    // Dropdown Data States
    const [topics, setTopics] = useState([]);
    const [chapters, setChapters] = useState([]);

    // Loading & Submission States
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ===========================================================================
    // 2. DATA FETCHING (Topics & Dependent Chapters)
    // ===========================================================================

    // Fetch initial Topics
    useEffect(() => {
        api.get('/Topic/GetTopic')
            .then((response) => {
                const validTopics = response.data.filter(topic => topic?.rowKey && topic?.name);
                setTopics(validTopics);
            })
            .catch((error) => console.error('Error fetching topics:', error))
            .finally(() => setLoadingTopics(false));
    }, []);

    // Fetch Chapters whenever the selected Topic changes
    useEffect(() => {
        if (!formData.topic) {
            setChapters([]);
            return;
        }

        setLoadingChapters(true);
        api.get('/Topic/GetChapterOrModule', { params: { topicKey: formData.topic } })
            .then((response) => {
                setChapters(response.data || []);
            })
            .catch((error) => console.error('Error fetching chapters:', error))
            .finally(() => setLoadingChapters(false));
    }, [formData.topic]);

    // ===========================================================================
    // 3. EVENT HANDLERS
    // ===========================================================================
    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: type === "checkbox" ? checked : value };

            // If they change the topic, clear the currently selected chapter
            if (name === 'topic') {
                updated.subject = '';
            }
            return updated;
        });
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const handleTypeChange = (e) => {
        const newType = e.target.value;
        setFormData(prev => ({ ...prev, questionType: newType, questionBody: '' }));

        if (newType === 'MCQ') setMetadata({ options: ['', '', '', ''], correctIndices: [0] });
        if (newType === 'Match') setMetadata({ pairs: [{ left: '', right: '' }] });
        if (newType === 'FillInBlanks') setMetadata({ answers: [] });
        if (newType === 'GroupedYesNo') setMetadata({ statements: [{ text: '', correct: 'Yes', explanation: '' }] });
    };

    useEffect(() => {
        if (formData.questionType === 'FillInBlanks') {
            const blankCount = (formData.questionBody.match(/___/g) || []).length;
            const currentAnswers = metadata.answers || [];
            if (blankCount !== currentAnswers.length) {
                const newAnswers = Array.from({ length: blankCount }).map((_, i) => currentAnswers[i] || '');
                setMetadata({ ...metadata, answers: newAnswers });
            }
        }
    }, [formData.questionBody, formData.questionType, metadata]);

    // ===========================================================================
    // 4. VALIDATION ENGINE
    // ===========================================================================
    useEffect(() => {
        const errors = [];
        const inlineErrors = {};

        if (!formData.topic) { errors.push("Topic is required."); inlineErrors.topic = "Topic is required."; }
        if (!formData.subject) { errors.push("Chapter is required."); inlineErrors.subject = "Chapter is required."; }
        if (!formData.questionHeader.trim()) { errors.push("Question Header is required."); inlineErrors.questionHeader = "Header is required."; }
        if (!formData.questionBody.trim() && formData.questionType !== 'Match') {
            errors.push("Question Body / Scenario is required.");
            inlineErrors.questionBody = "Question Body is required.";
        }

        if (formData.questionType === 'MCQ') {
            const validOptions = metadata.options?.filter(o => o.trim() !== '') || [];
            if (validOptions.length < 2) errors.push("MCQ requires at least 2 filled options.");
            if (!metadata.correctIndices || metadata.correctIndices.length === 0) errors.push("MCQ requires at least 1 correct answer to be selected.");
        }
        else if (formData.questionType === 'Match') {
            if (!metadata.pairs || metadata.pairs.length < 2) errors.push("Matching requires at least 2 pairs.");
            else if (metadata.pairs.some(p => !p.left.trim() || !p.right.trim())) errors.push("All matching pairs must have both sides filled.");
        }
        else if (formData.questionType === 'FillInBlanks') {
            const blankCount = (formData.questionBody.match(/___/g) || []).length;
            if (blankCount === 0) {
                errors.push("Fill in the Blanks requires at least one '___' in the body.");
                inlineErrors.questionBody = "Add '___' to create a blank.";
            } else if (metadata.answers?.some(a => !a.trim())) errors.push("All blank answers must be filled.");
        }
        else if (formData.questionType === 'GroupedYesNo') {
            if (!metadata.statements || metadata.statements.length === 0) errors.push("You must add at least one statement.");
            else if (metadata.statements.some(s => !s.text.trim())) errors.push("All Yes/No statements must contain text.");
            else if (metadata.statements.some(s => !s.explanation.trim())) errors.push("An explanation is required for every statement.");
        }

        setValidationErrors(errors);
        setFieldErrors(inlineErrors);
    }, [formData, metadata]);

    // ===========================================================================
    // 5. SUBMISSION HANDLER
    // ===========================================================================
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError('');
        setTouched({ topic: true, subject: true, questionHeader: true, questionBody: true });

        if (validationErrors.length > 0) {
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                topic: formData.topic,
                subject: formData.subject, // API treats this as Chapter Key
                questionHeader: formData.questionHeader,
                questionBody: formData.questionBody,
                questionType: formData.questionType,
                createdBy: formData.createdBy,
                metadata: metadata
            };

            await api.post('/Question', payload);

            setSubmitSuccess(true);
            setTouched({});

            // Keep Topic and Chapter intact for rapid entry
            setFormData(prev => ({
                ...prev,
                questionHeader: "",
                questionBody: "",
                createdAt: new Date().toISOString()
            }));
            handleTypeChange({ target: { value: formData.questionType } });

        } catch (error) {
            console.error('Error creating question:', error);
            setSubmitError(error.response?.data?.message || 'Failed to create question. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ===========================================================================
    // 6. RENDER HELPERS
    // ===========================================================================
    const renderDynamicSection = () => {
        if (formData.questionType === 'MCQ') {
            return (
                <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Multiple Choice Options (Select all correct answers)</Typography>
                    <Stack spacing={2}>
                        {metadata.options?.map((opt, index) => (
                            <Stack direction="row" spacing={2} alignItems="center" key={index}>
                                <Checkbox
                                    checked={metadata.correctIndices?.includes(index)}
                                    onChange={(e) => {
                                        let newIndices = [...(metadata.correctIndices || [])];
                                        if (e.target.checked) newIndices.push(index);
                                        else newIndices = newIndices.filter(i => i !== index);
                                        setMetadata({ ...metadata, correctIndices: newIndices });
                                    }}
                                    color="success"
                                />
                                <TextField size="small" fullWidth label={`Option ${index + 1}`} value={opt}
                                    onChange={(e) => {
                                        const newOpts = [...metadata.options];
                                        newOpts[index] = e.target.value;
                                        setMetadata({ ...metadata, options: newOpts });
                                    }}
                                />
                            </Stack>
                        ))}
                    </Stack>
                </Box>
            );
        }

        if (formData.questionType === 'Match') {
            // ... (Keep existing Match code)
            return (
                <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>Matching Pairs</Typography>
                    <Stack spacing={2}>
                        {metadata.pairs?.map((pair, index) => (
                            <Stack direction="row" spacing={2} alignItems="center" key={index}>
                                <TextField size="small" fullWidth label="Column A Item" value={pair.left} onChange={(e) => { const newPairs = [...metadata.pairs]; newPairs[index].left = e.target.value; setMetadata({ ...metadata, pairs: newPairs }); }} />
                                <Typography variant="body2" co
                                    lor="text.secondary">Matches</Typography>
                                <TextField size="small" fullWidth label="Column B Answer" value={pair.right} onChange={(e) => { const newPairs = [...metadata.pairs]; newPairs[index].right = e.target.value; setMetadata({ ...metadata, pairs: newPairs }); }} />
                                <IconButton color="error" disabled={metadata.pairs.length <= 1} onClick={() => setMetadata({ ...metadata, pairs: metadata.pairs.filter((_, i) => i !== index) })}><DeleteIcon /></IconButton>
                            </Stack>
                        ))}
                    </Stack>
                    <Button startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={() => setMetadata({ ...metadata, pairs: [...metadata.pairs, { left: '', right: '' }] })}>Add Pair</Button>
                </Box>
            );
        }

        if (formData.questionType === 'FillInBlanks') {
            // ... (Keep existing FillInBlanks code)
            return (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #bbdefb' }}>
                    <Typography variant="body2" color="primary.dark" gutterBottom><b>Tip:</b> Type <code>___</code> (three underscores) in the Question Body above to create a blank.</Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                        {metadata.answers?.map((ans, index) => (
                            <TextField key={index} size="small" fullWidth label={`Correct Answer for Blank ${index + 1}`} value={ans} onChange={(e) => { const newAnswers = [...metadata.answers]; newAnswers[index] = e.target.value; setMetadata({ ...metadata, answers: newAnswers }); }} />
                        ))}
                    </Stack>
                </Box>
            );
        }

        if (formData.questionType === 'GroupedYesNo') {
            // ... (Keep existing GroupedYesNo code)
            return (
                <Box sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Yes/No Statements</Typography>
                    <Stack spacing={3}>
                        {metadata.statements?.map((stmt, index) => (
                            <Paper key={index} elevation={1} sx={{ p: 2, border: '1px solid #ddd' }}>
                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>{index + 1}.</Typography>
                                    <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                        <TextField size="small" fullWidth multiline label="Statement Text" value={stmt.text} onChange={(e) => { const newStmts = [...metadata.statements]; newStmts[index].text = e.target.value; setMetadata({ ...metadata, statements: newStmts }); }} />
                                        <Stack direction="row" spacing={2}>
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                <InputLabel>Correct Answer</InputLabel>
                                                <Select label="Correct Answer" value={stmt.correct} onChange={(e) => { const newStmts = [...metadata.statements]; newStmts[index].correct = e.target.value; setMetadata({ ...metadata, statements: newStmts }); }}>
                                                    <MenuItem value="Yes">Yes</MenuItem>
                                                    <MenuItem value="No">No</MenuItem>
                                                </Select>
                                            </FormControl>
                                            <TextField size="small" fullWidth label="Explanation" value={stmt.explanation} onChange={(e) => { const newStmts = [...metadata.statements]; newStmts[index].explanation = e.target.value; setMetadata({ ...metadata, statements: newStmts }); }} />
                                        </Stack>
                                    </Stack>
                                    <IconButton color="error" disabled={metadata.statements.length <= 1} onClick={() => setMetadata({ ...metadata, statements: metadata.statements.filter((_, i) => i !== index) })}><DeleteIcon /></IconButton>
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                    <Button startIcon={<AddIcon />} sx={{ mt: 2 }} onClick={() => setMetadata({ ...metadata, statements: [...metadata.statements, { text: '', correct: 'Yes', explanation: '' }] })}>Add Another Statement</Button>
                </Box>
            );
        }
        return null;
    };

    // ===========================================================================
    // 7. MAIN RENDER
    // ===========================================================================
    return (
        <>
            <NavigationBar />
            <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto" }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
                    Create New Question
                </Typography>

                <Snackbar open={submitSuccess} autoHideDuration={6000} onClose={() => setSubmitSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <Alert onClose={() => setSubmitSuccess(false)} severity="success" sx={{ width: '100%' }}>Question created successfully!</Alert>
                </Snackbar>
                <Snackbar open={!!submitError} autoHideDuration={6000} onClose={() => setSubmitError('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                    <Alert onClose={() => setSubmitError('')} severity="error" sx={{ width: '100%' }}>{submitError}</Alert>
                </Snackbar>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {loadingTopics ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /><Typography sx={{ ml: 2 }}>Loading topics...</Typography></Box>
                            ) : (
                                <>
                                    <Stack direction="row" spacing={2}>
                                        <FormControl fullWidth error={touched.topic && !!fieldErrors.topic}>
                                            <InputLabel>Select Topic *</InputLabel>
                                            <Select label="Select Topic *" name="topic" value={formData.topic} onChange={handleChange} onBlur={handleBlur}>
                                                {topics.map((t) => (
                                                    <MenuItem key={t.rowKey || t.id} value={t.rowKey || t.id}>{t.name || t.title}</MenuItem>
                                                ))}
                                            </Select>
                                            {touched.topic && fieldErrors.topic && <FormHelperText>{fieldErrors.topic}</FormHelperText>}
                                        </FormControl>

                                        {/* Dynamic Chapter/Module Dropdown */}
                                        <FormControl fullWidth error={touched.subject && !!fieldErrors.subject} disabled={!formData.topic || loadingChapters}>
                                            <InputLabel>{loadingChapters ? "Loading Chapters..." : "Select Chapter *"}</InputLabel>
                                            <Select label={loadingChapters ? "Loading Chapters..." : "Select Chapter *"} name="subject" value={formData.subject} onChange={handleChange} onBlur={handleBlur}>
                                                {chapters.map((c) => (
                                                    <MenuItem key={c.rowKey || c.id || c} value={c.rowKey || c.id || c}>
                                                        {c.name || c.title || c}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {touched.subject && fieldErrors.subject && <FormHelperText>{fieldErrors.subject}</FormHelperText>}
                                        </FormControl>
                                    </Stack>

                                    <Stack direction="row" spacing={2}>
                                        <TextField fullWidth required label="Question Header" name="questionHeader" value={formData.questionHeader} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., Identify the correct statement" error={touched.questionHeader && !!fieldErrors.questionHeader} helperText={touched.questionHeader && fieldErrors.questionHeader} />

                                        <FormControl fullWidth>
                                            <InputLabel>Question Type</InputLabel>
                                            <Select label="Question Type" value={formData.questionType} onChange={handleTypeChange}>
                                                <MenuItem value="MCQ">Multiple Choice (MCQ)</MenuItem>
                                                <MenuItem value="Match">Match the Columns</MenuItem>
                                                <MenuItem value="FillInBlanks">Fill in the Blanks</MenuItem>
                                                <MenuItem value="GroupedYesNo">Grouped Yes/No (Azure Style)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Stack>

                                    <TextField fullWidth required={formData.questionType !== 'Match'} multiline rows={3} label={formData.questionType === 'GroupedYesNo' ? "Scenario Context" : "Question Body"} name="questionBody" value={formData.questionBody} onChange={handleChange} onBlur={handleBlur} placeholder={formData.questionType === 'GroupedYesNo' ? "Enter the overall scenario or architecture details here..." : "Enter the main question text here..."} error={touched.questionBody && !!fieldErrors.questionBody} helperText={touched.questionBody && fieldErrors.questionBody} />

                                    {renderDynamicSection()}

                                    <Divider sx={{ my: 2 }}>Audit Details (Auto-generated)</Divider>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}><TextField fullWidth label="Created By" value={formData.createdBy} disabled variant="filled" /></Grid>
                                        <Grid item xs={12} sm={6}><TextField fullWidth label="Created At (UTC)" value={new Date(formData.createdAt).toLocaleString()} disabled variant="filled" /></Grid>
                                    </Grid>

                                    <Button variant="contained" size="large" onClick={handleSubmit} disabled={isSubmitting || validationErrors.length > 0} sx={{ mt: 2, alignSelf: 'flex-start' }}>
                                        {isSubmitting ? <><CircularProgress size={20} sx={{ mr: 1 }} color="inherit" /> Saving...</> : 'Save Question'}
                                    </Button>
                                </>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20, bgcolor: validationErrors.length === 0 ? '#f1f8f4' : '#fff3f3', border: validationErrors.length === 0 ? '1px solid #c8e6c9' : '1px solid #ffcdd2' }}>
                            <Typography variant="h6" color={validationErrors.length === 0 ? 'success.main' : 'error.main'} gutterBottom>Validation Status</Typography>
                            <Divider sx={{ mb: 2 }} />
                            {validationErrors.length === 0 ? (
                                <Alert severity="success">✓ All fields are valid. Ready to save!</Alert>
                            ) : (
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>Please fix the following issues:</Typography>
                                    {validationErrors.map((error, index) => <Alert key={index} severity="error" sx={{ mb: 1, py: 0 }}>{error}</Alert>)}
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}
