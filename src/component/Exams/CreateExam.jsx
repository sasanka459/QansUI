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
    Snackbar,
    FormHelperText
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
        examDescription: "",
        sortingOrder: 1,
        detailsLink: "",
        isActive: true,
        createdBy: getCurrentUser(),
        createdDate: new Date().toISOString(),
        updatedBy: "",
        updatedDate: "",
    });

    // Track which fields have been focused and blurred
    const [touched, setTouched] = useState({});

    // Store specific field errors for inline UI updates
    const [fieldErrors, setFieldErrors] = useState({});
    const [validationErrors, setValidationErrors] = useState([]);

    const [topics, setTopics] = useState([]);
    const [existingExams, setExistingExams] = useState([]); // Used for duplicate detection
    const [loading, setLoading] = useState(true);

    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch Topics
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

        // Fetch Existing Exams for duplicate detection
        // NOTE: Adjust the endpoint below if your fetch exams route is named differently
        api.get('/Exam/GetExam')
            .then((response) => {
                setExistingExams(response.data || []);
            })
            .catch((error) => {
                console.error('Error fetching existing exams for validation:', error);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Trigger validation visibility on focus loss
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const handleexamDescriptionChange = (content) => {
        setFormData((prev) => ({ ...prev, examDescription: content }));
        // Mark description as touched when they start typing
        if (!touched.examDescription) {
            setTouched((prev) => ({ ...prev, examDescription: true }));
        }
    };

    // Comprehensive Validation Effect
    useEffect(() => {
        const errors = [];
        const inlineErrors = {};

        // 1. Topic Validation
        if (!formData.topic) {
            errors.push("Topic is required.");
            inlineErrors.topic = "Topic is required.";
        }

        // 2. Exam Code Validation
        if (!formData.examCode.trim()) {
            errors.push("Exam Code is required.");
            inlineErrors.examCode = "Exam Code is required.";
        } else if (existingExams.some(e => e.examCode?.toUpperCase() === formData.examCode.trim().toUpperCase())) {
            errors.push("Exam Code already exists.");
            inlineErrors.examCode = "This Exam Code is already in use.";
        }

        // 3. Exam Number Validation
        // if (!formData.examNumber.trim()) {
        //     errors.push("Exam Number is required.");
        //     inlineErrors.examNumber = "Exam Number is required.";
        // } else if (existingExams.some(e => e.examNumber?.toLowerCase() === formData.examNumber.trim().toLowerCase())) {
        //     errors.push("Exam Number already exists.");
        //     inlineErrors.examNumber = "This Exam Number is already in use.";
        // }

        // 4. Exam Name Validation
        if (!formData.examName.trim()) {
            errors.push("Exam Name is required.");
            inlineErrors.examName = "Exam Name is required.";
        } else if (existingExams.some(e => e.examName?.toLowerCase() === formData.examName.trim().toLowerCase())) {
            errors.push("Exam Name already exists.");
            inlineErrors.examName = "This Exam Name is already in use.";
        }

        // 5. Exam Description Validation (Strips basic HTML tags to check if genuinely empty)
        const cleanDescription = formData.examDescription.replace(/<[^>]*>?/gm, '').trim();
        if (!cleanDescription) {
            errors.push("Exam Description is required.");
            inlineErrors.examDescription = "Exam Description is required.";
        }

        // 6. Sorting Order Validation
        if (formData.sortingOrder === "" || formData.sortingOrder < 1) {
            errors.push("Sorting Order must be a valid number of at least 1.");
            inlineErrors.sortingOrder = "Must be at least 1.";
        }

        setValidationErrors(errors);
        setFieldErrors(inlineErrors);
    }, [formData, existingExams]);

    // =============  Handle form submission =============
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError('');

        // Mark all fields as touched to show errors if they try to bypass blur
        const allTouched = {
            topic: true, examCode: true,
            examName: true, examDescription: true, sortingOrder: true, detailsLink: true
        };
        setTouched(allTouched);

        if (validationErrors.length > 0) {
            setIsSubmitting(false);
            return;
        }

        try {
            const examData = {
                topic: formData.topic,
                examCode: formData.examCode.trim(),
                examNumber: formData.examNumber.trim(),
                examName: formData.examName.trim(),
                examDescription: formData.examDescription,
                sortingOrder: parseInt(formData.sortingOrder),
                detailsLink: formData.detailsLink.trim(),
                isActive: formData.isActive,
                createdBy: formData.createdBy,
                createdDate: formData.createdDate,
                updatedBy: formData.updatedBy || null,
                updatedDate: formData.updatedDate || null,
            };

            const response = await api.post('/Exam/CreateExam', examData);

            // Success! Add the new exam to our local duplicate detection list
            if (response.data) {
                setExistingExams(prev => [...prev, examData]);
            }

            setSubmitSuccess(true);
            setTouched({}); // Reset touched state

            setFormData({
                topic: "",
                examCode: "",
                examNumber: "",
                examName: "",
                examDescription: "",
                sortingOrder: 1,
                detailsLink: "",
                isActive: true,
                createdBy: getCurrentUser(),
                createdDate: new Date().toISOString(),
                updatedBy: "",
                updatedDate: "",
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
            <Box sx={{ p: 3, maxWidth: 1400, margin: "0 auto" }}>
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
                    <Grid item xs={8}>
                        <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                    <Typography sx={{ ml: 2 }}>Loading topics...</Typography>
                                </Box>
                            ) : (
                                <>
                                    <FormControl fullWidth error={touched.topic && !!fieldErrors.topic}>
                                        <InputLabel>Select Topic *</InputLabel>
                                        <Select
                                            label="Select Topic *"
                                            name="topic"
                                            value={formData.topic}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            {topics.map((t) => (
                                                <MenuItem key={t.rowKey} value={t.rowKey}>
                                                    {t.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {touched.topic && fieldErrors.topic && (
                                            <FormHelperText>{fieldErrors.topic}</FormHelperText>
                                        )}
                                    </FormControl>

                                    <TextField
                                        fullWidth
                                        required
                                        label="Exam Code"
                                        name="examCode"
                                        value={formData.examCode}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="e.g., EX-2024-001"
                                        error={touched.examCode && !!fieldErrors.examCode}
                                        helperText={touched.examCode && fieldErrors.examCode}
                                    />

                                    {/* <TextField
                                        fullWidth
                                        required
                                        label="Exam Number"
                                        name="examNumber"
                                        type="text"
                                        value={formData.examNumber}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="e.g., 001 or EX-001"
                                        error={touched.examNumber && !!fieldErrors.examNumber}
                                        helperText={touched.examNumber && fieldErrors.examNumber}
                                    /> */}

                                    <TextField
                                        fullWidth
                                        required
                                        label="Exam Name"
                                        name="examName"
                                        type="text"
                                        value={formData.examName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="e.g., Midterm Assessment"
                                        error={touched.examName && !!fieldErrors.examName}
                                        helperText={touched.examName && fieldErrors.examName}
                                    />

                                    <Box sx={{ mt: 1, mb: 1 }}>
                                        {RichTextEditor ? (
                                            <Box>
                                                <RichTextEditor
                                                    label="Exam Description "
                                                    value={formData.examDescription}
                                                    onChange={handleexamDescriptionChange}
                                                    height={200}
                                                />
                                                {touched.examDescription && fieldErrors.examDescription && (
                                                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2, display: 'block' }}>
                                                        {fieldErrors.examDescription}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ) : (
                                            <TextField
                                                fullWidth
                                                required
                                                multiline
                                                rows={4}
                                                label="Exam Description"
                                                name="examDescription"
                                                value={formData.examDescription}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.examDescription && !!fieldErrors.examDescription}
                                                helperText={
                                                    (touched.examDescription && fieldErrors.examDescription) ||
                                                    "Rich text editor failed to load. Using plain text."
                                                }
                                            />
                                        )}
                                    </Box>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Details Link"
                                        name="detailsLink"
                                        type="text"
                                        value={formData.detailsLink}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        placeholder="e.g., Midterm Assessment"
                                        error={touched.detailsLink && !!fieldErrors.detailsLink}
                                        helperText={touched.detailsLink && fieldErrors.detailsLink}
                                    />

                                    <TextField
                                        fullWidth
                                        required
                                        label="Sorting Order"
                                        name="sortingOrder"
                                        type="number"
                                        value={formData.sortingOrder}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        sx={{ maxWidth: 200 }}
                                        inputProps={{ min: 1 }}
                                        error={touched.sortingOrder && !!fieldErrors.sortingOrder}
                                        helperText={touched.sortingOrder && fieldErrors.sortingOrder}
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
                                                value={new Date(formData.createdDate).toLocaleString()}
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
                                                value={formData.updatedDate ? new Date(formData.updatedDate).toLocaleString() : 'Not yet updated'}
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

                    <Grid item xs={4} >
                        <Paper
                            elevation={3}
                            sx={{
                                p: 3,

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
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}
