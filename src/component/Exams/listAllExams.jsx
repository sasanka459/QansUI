import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
    Box, Grid, Container, Typography, Card, CardContent, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    FormControlLabel, Switch, Snackbar, Alert
} from '@mui/material';
import { NavigationBar } from '../NavigationBar';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// API Configuration
const api = axios.create({
    baseURL: 'http://localhost:5100/api',
    headers: { 'Content-Type': 'application/json' }
});

const ExamList = () => {
    // --- State Management ---
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit Modal State
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editData, setEditData] = useState({
        partitionKey: '',
        rowKey: '',
        examCode: '',
        examName: '',
        examNumber: '',
        topic: '',
        examDescription: '',
        isActive: false
    });

    // Notification State
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // --- 1. Fetch Data ---
    const fetchExams = () => {
        setLoading(true);
        api.get('/Exam/GetAllExams')
            .then((response) => {
                // Ensure we include valid exams (both active and inactive so admins can see them)
                const validExams = response.data.filter(exam => exam?.rowKey && exam?.examName);
                setExams(validExams);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching exams:', err);
                setError("Failed to load Exams.");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchExams();
    }, []);

    // --- 2. Handlers ---

    // Open the modal and populate data
    const handleEditClick = (exam) => {
        setEditData({
            partitionKey: exam.partitionKey, // PK is usually Topic
            rowKey: exam.rowKey, // RK is usually ExamCode
            examCode: exam.examCode,
            examName: exam.examName,
            examNumber: exam.examNumber || '',
            topic: exam.topic,
            examDescription: exam.examDescription,
            isActive: exam.isActive
        });
        setOpenEditModal(true);
    };

    // Handle Input Changes in Modal
    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Submit Update to Backend
    const handleSaveUpdate = () => {
        api.put('/Exam/UpdateExam', editData)
            .then(() => {
                setNotification({ open: true, message: 'Exam updated successfully!', severity: 'success' });
                setOpenEditModal(false);
                fetchExams(); // Refresh list to show changes
            })
            .catch((err) => {
                console.error("Update failed:", err);
                setNotification({ open: true, message: 'Failed to update exam.', severity: 'error' });
            });
    };

    const handleCloseNotification = () => setNotification({ ...notification, open: false });

    // --- Render ---
    if (loading) return <div style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.15)", // optional overlay
        zIndex: 1300,
        color: "135deg(207, 220, 253)"
    }}>
        <CircularProgress size={60} thickness={4} />
    </div>;
    if (error) return <div style={{ textAlign: 'center', color: 'red', marginTop: 50 }}><ErrorOutlineIcon sx={{ mr: 1 }} />{error}</div>;

    return (
        <>
            <NavigationBar />
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        Azure Certification Library
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Available Exams: {exams.length}
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {exams.map((exam) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={exam.rowKey}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '16px', boxShadow: 3 }}>
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" mb={2}>
                                        <Chip label={exam.topic} size="small" color="primary" variant="outlined" />
                                        <Typography variant="caption" fontWeight="bold">{exam.examCode}</Typography>
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>{exam.examName}</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}>
                                        {exam.examDescription}
                                    </Typography>
                                </CardContent>

                                <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box display="flex" alignItems="center">
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: exam.isActive ? 'success.main' : 'error.main', mr: 1 }} />
                                        <Typography variant="caption" fontWeight="bold" color={exam.isActive ? 'success.main' : 'error.main'}>
                                            {exam.isActive ? 'Active' : 'Retired'}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <EditIcon
                                            color="primary"
                                            sx={{ cursor: 'pointer', mr: 1, '&:hover': { color: 'darkblue' } }}
                                            onClick={() => handleEditClick(exam)}
                                        />
                                        <DeleteIcon
                                            color="error"
                                            sx={{ cursor: 'pointer', '&:hover': { color: 'darkred' } }}
                                        />
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* --- EDIT DIALOG (MODAL) --- */}
                <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit Exam: {editData.examCode}</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Exam Name"
                            name="examName"
                            fullWidth
                            variant="outlined"
                            value={editData.examName}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="dense"
                            label="Topic"
                            name="topic"
                            fullWidth
                            variant="outlined"
                            value={editData.topic}
                            onChange={handleInputChange}
                            helperText="Changing this creates a new partition key!"
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            name="examDescription"
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            value={editData.examDescription}
                            onChange={handleInputChange}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={editData.isActive}
                                    onChange={handleInputChange}
                                    name="isActive"
                                    color="success"
                                />
                            }
                            label={editData.isActive ? "Active" : "Retired"}
                            sx={{ mt: 2 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEditModal(false)} color="inherit">Cancel</Button>
                        <Button onClick={handleSaveUpdate} variant="contained" color="primary">Save Changes</Button>
                    </DialogActions>
                </Dialog>

                {/* --- NOTIFICATIONS --- */}
                <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
                    <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};

export default ExamList;