import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    FormControlLabel,
    Checkbox,
    Grid,
    Paper,
    Typography,
    Button,
    Divider,
    Alert,
    CircularProgress,
    Snackbar
} from "@mui/material";
import { NavigationBar } from "../NavigationBar";
import RichTextEditor from "../textBox/textEditor";


const api = axios.create({
    baseURL: 'http://localhost:5100/api',
    headers: {
        'Content-Type': 'application/json',
    }
});




export default function CreateExam() {

    const getCurrentUser = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.displayName || user.email || 'Unknown User';
        }
        return 'System';
    };
    // ===========================================================================

    const [formData, setFormData] = useState({
        topic: "",
        examCode: "",
        examNumber: "",
        examName: "",
        description: "",
        sortingOrder: 1,
        isActive: true,
        createdBy: getCurrentUser(),
        createdAt: new Date().toISOString(),
        updatedBy: "",
        updatedAt: "",
    });

    const [validationErrors, setValidationErrors] = useState([]);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);


    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {

        api.get('/Topic/GetTopic')
            .then((response) => {
                const validTopics = response.data.filter(topic => topic?.rowKey && topic?.name);
                setTopics(validTopics);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching topics:', error);
                setLoading(false);
                setValidationErrors(prev => [...prev, "Failed to load Topics from server."]);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleDescriptionChange = (content) => {
        setFormData((prev) => ({ ...prev, description: content }));
    };

    useEffect(() => {
        const errors = [];
        if (!formData.topic) errors.push("Topic is required.");
        if (!formData.examCode.trim()) errors.push("Exam Code is required.");
        if (!formData.examNumber.trim()) errors.push("Exam Number is required.");
        if (!formData.examName.trim()) errors.push("Exam Name is required.");



        if (formData.sortingOrder < 1) errors.push("Sorting Order must be at least 1.");

        setValidationErrors(errors);
    }, [formData]);

    // =============  Handle form submission =============
    const handleSubmit = async () => {


        setIsSubmitting(true);
        setSubmitError('');

        try {
            const examData = {
                topic: formData.topic,
                examCode: formData.examCode,
                examNumber: formData.examNumber,
                examName: formData.examName,
                description: formData.description,
                sortingOrder: parseInt(formData.sortingOrder),
                isActive: formData.isActive,
                createdBy: formData.createdBy,
                createdAt: formData.createdAt,
            };

            const response = await api.post('/Exam/CreateExam', examData);

            // Success!
            setSubmitSuccess(true);

            setFormData({
                topic: "",
                examCode: "",
                examNumber: "",
                examName: "",
                description: "",
                sortingOrder: 1,
                isActive: true,
                createdBy: getCurrentUser(),
                createdAt: new Date().toISOString(),
                updatedBy: "",
                updatedAt: "",
            });


        } catch (error) {
            console.error('Error creating exam:', error);
            setSubmitError(
                error.response?.data?.message ||
                'Failed to create exam. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };
    // ======================================================================================

    return (
        <>
            <NavigationBar />
            <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
                    Create New Exam
                </Typography>

                {/* =============  Success/Error Snackbar ============= */}
                <Snackbar
                    open={submitSuccess}
                    autoHideDuration={6000}
                    onClose={() => setSubmitSuccess(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={() => setSubmitSuccess(false)} severity="success" sx={{ width: '100%' }}>
                        Exam created successfully!
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={!!submitError}
                    autoHideDuration={6000}
                    onClose={() => setSubmitError('')}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={() => setSubmitError('')} severity="error" sx={{ width: '100%' }}>
                        {submitError}
                    </Alert>
                </Snackbar>
                {/* ================================================================= */}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>


                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                    <Typography sx={{ ml: 2 }}>Loading topics...</Typography>
                                </Box>
                            ) : (
                                <>

                                    <FormControl fullWidth>
                                        <InputLabel>Select Topic</InputLabel>
                                        <Select
                                            label="Select Topic"
                                            name="topic"
                                            value={formData.topic}
                                            onChange={handleChange}
                                        >
                                            {topics.map((t) => (
                                                <MenuItem key={t.rowKey} value={t.rowKey}>
                                                    {t.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>


                                    <TextField
                                        fullWidth
                                        label="Exam Code"
                                        name="examCode"
                                        value={formData.examCode}
                                        onChange={handleChange}
                                        placeholder="e.g., EX-2024-001"
                                    />


                                    <TextField
                                        fullWidth
                                        label="Exam Number"
                                        name="examNumber"
                                        type="text"
                                        value={formData.examNumber}
                                        onChange={handleChange}
                                        placeholder="e.g., 001 or EX-001"
                                    />
                                    <TextField
                                        fullWidth
                                        label="Exam Name"
                                        name="examName"
                                        type="text"
                                        value={formData.examName}
                                        onChange={handleChange}
                                        placeholder="e.g., 001 or EX-001"
                                    />

                                    <Box sx={{ mt: 1, mb: 1 }}>
                                        {RichTextEditor ? (
                                            <RichTextEditor
                                                label="Description (Rich Text)"
                                                value={formData.description}
                                                onChange={handleDescriptionChange}
                                                helperText={
                                                    validationErrors.includes("Description cannot be empty.")
                                                        ? "Description is required"
                                                        : "Enter exam details"
                                                }
                                                error={validationErrors.includes("Description cannot be empty.")}
                                                height={200}
                                            />
                                        ) : (
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                label="Description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                helperText="Rich text editor failed to load. Using plain text."
                                            />
                                        )}
                                    </Box>


                                    <TextField
                                        fullWidth
                                        label="Sorting Order"
                                        name="sortingOrder"
                                        type="number"
                                        value={formData.sortingOrder}
                                        onChange={handleChange}
                                        sx={{ maxWidth: 200 }}
                                        inputProps={{ min: 1 }}
                                    />

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formData.isActive}
                                                onChange={handleChange}
                                                name="isActive"
                                                color="primary"
                                            />
                                        }
                                        label="Is Active"
                                    />

                                    <Divider sx={{ my: 2 }}>Audit Details (Auto-generated)</Divider>

                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                label="Created By"
                                                value={formData.createdBy}
                                                disabled
                                                variant="filled"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>

                                            <TextField
                                                fullWidth
                                                label="Created At (UTC)"
                                                value={new Date(formData.createdAt).toLocaleString()}
                                                disabled
                                                variant="filled"
                                            />

                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                label="Updated By"
                                                value={formData.updatedBy || 'Not yet updated'}
                                                disabled
                                                variant="filled"
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                fullWidth
                                                label="Updated At (UTC)"
                                                value={formData.updatedAt ? new Date(formData.updatedAt).toLocaleString() : 'Not yet updated'}
                                                disabled
                                                variant="filled"
                                            />
                                        </Grid>
                                    </Grid>

                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || validationErrors.length > 0}
                                        sx={{ mt: 2, alignSelf: 'flex-start' }}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Exam'
                                        )}
                                    </Button>

                                </>
                            )}
                        </Paper>
                    </Grid>

                    {/* <Grid item xs={12} md={4}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,
                                height: '100%',
                                bgcolor: validationErrors.length === 0 ? '#f1f8f4' : '#fff3f3',
                                border: validationErrors.length === 0 ? '1px solid #c8e6c9' : '1px solid #ffcdd2'
                            }}
                        >
                            <Typography
                                variant="h6"
                                color={validationErrors.length === 0 ? 'success.main' : 'error.main'}
                                gutterBottom
                            >
                                Validation Status
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            {validationErrors.length === 0 ? (
                                <Alert severity="success">✓ All fields are valid. Ready to submit!</Alert>
                            ) : (
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                                        Please fix the following issues:
                                    </Typography>
                                    {validationErrors.map((error, index) => (
                                        <Alert key={index} severity="error" sx={{ mb: 1 }}>
                                            {error}
                                        </Alert>
                                    ))}
                                </Box>
                            )}

                            <Box sx={{ mt: 4 }}>
                                <Typography variant="caption" color="textSecondary">
                                    * All fields except audit fields are mandatory.
                                    <br />
                                    * Audit fields are automatically populated.
                                    <br />
                                    * Form will reset after successful creation.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid> */}
                </Grid>
            </Box></>
    );
}