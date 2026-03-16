import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {
    Box, Container, Typography, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    FormControlLabel, Switch, Snackbar, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TableSortLabel, IconButton, Chip, Select, MenuItem, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { NavigationBar } from '../common/NavigationBar';

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

    // Table State (Sorting & Filtering)
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('examCode');
    const [filters, setFilters] = useState({
        topic: '',
        examCode: '',
        examName: '',
        examDescription: '',
        isActive: 'all' // 'all', 'active', 'retired'
    });

    // Edit Modal State
    const [openEditModal, setOpenEditModal] = useState(false);
    const [editData, setEditData] = useState({
        partitionKey: '', rowKey: '', examCode: '', examName: '',
        examNumber: '', topic: '', examDescription: '', isActive: false
    });

    // Notification State
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // --- 1. Fetch Data ---
    const fetchExams = () => {
        setLoading(true);
        api.get('/Exam/GetAllExams')
            .then((response) => {
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

    // --- 2. Handlers for Table Features ---
    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleFilterChange = (columnId, value) => {
        setFilters(prev => ({
            ...prev,
            [columnId]: value
        }));
    };

    // --- 3. Sorting and Filtering Logic (Memoized for performance) ---
    const filteredAndSortedExams = useMemo(() => {
        // 1. Filter
        let processedData = exams.filter((exam) => {
            return Object.keys(filters).every((key) => {
                const filterValue = filters[key];
                if (!filterValue || filterValue === 'all') return true;

                if (key === 'isActive') {
                    const isActiveTarget = filterValue === 'active';
                    return exam.isActive === isActiveTarget;
                }

                const examValue = String(exam[key] || '').toLowerCase();
                return examValue.includes(filterValue.toLowerCase());
            });
        });

        // 2. Sort
        processedData.sort((a, b) => {
            let valA = a[orderBy] || '';
            let valB = b[orderBy] || '';

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return processedData;
    }, [exams, filters, order, orderBy]);

    const handleDetailsClick = (exam) => {
        // Replace 'exam.url' with the actual property name from your database
        if (exam && exam.detailsLink) {
            window.location.href = exam.detailsLink;
        } else {
            console.error("No URL provided for this exam.");
        }
    }
    // --- 4. Edit Handlers ---
    const handleEditClick = (exam) => {
        setEditData({
            partitionKey: exam.partitionKey,
            rowKey: exam.rowKey,
            examCode: exam.examCode,
            examName: exam.examName,
            examNumber: exam.examNumber || '',
            topic: exam.topic,
            examDescription: exam.examDescription,
            isActive: exam.isActive
        });
        setOpenEditModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveUpdate = () => {
        api.put('/Exam/UpdateExam', editData)
            .then(() => {
                setNotification({ open: true, message: 'Exam updated successfully!', severity: 'success' });
                setOpenEditModal(false);
                fetchExams();
            })
            .catch((err) => {
                console.error("Update failed:", err);
                setNotification({ open: true, message: 'Failed to update exam.', severity: 'error' });
            });
    };

    const handleCloseNotification = () => setNotification({ ...notification, open: false });

    // --- Columns Configuration ---
    const columns = [
        { id: 'topic', label: 'Topic' },
        { id: 'examCode', label: 'Exam Code' },
        { id: 'examName', label: 'Exam Name' },
        { id: 'examDescription', label: 'Description' },
        { id: 'isActive', label: 'Status' }
    ];

    // --- Render ---
    if (loading) return (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.15)", zIndex: 1300 }}>
            <CircularProgress size={60} thickness={4} />
        </div>
    );

    if (error) return <div style={{ textAlign: 'center', color: 'red', marginTop: 50 }}><ErrorOutlineIcon sx={{ mr: 1 }} />{error}</div>;

    // Utility function to safely extract plain text from HTML (for description preview)
    const renderRichText = (htmlString) => {
        if (!htmlString) return '';

        return (
            <Box
                dangerouslySetInnerHTML={{ __html: htmlString }}
                sx={{
                    // 1. Safely truncate the text with an ellipsis (...) for the table
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',

                    // 2. Force block elements (like <p> from the editor) to stay inline
                    '& p, & div, & h1, & h2, & h3, & h4, & h5, & h6': {
                        display: 'inline',
                        margin: 0,
                        fontSize: 'inherit'
                    },

                    // 3. Enforce bold, italics, and underlines
                    '& strong, & b': { fontWeight: 'bold' },
                    '& em, & i': { fontStyle: 'italic' },
                    '& u': { textDecoration: 'underline' }
                }}
            />
        );
    };
    return (
        <>
            <NavigationBar />
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        Azure Certification Library
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Showing {filteredAndSortedExams.length} of {exams.length} Exams
                    </Typography>
                </Box>

                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="exam table">
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableCell key={col.id} sx={{ verticalAlign: 'top', minWidth: 150 }}>
                                        <TableSortLabel
                                            active={orderBy === col.id}
                                            direction={orderBy === col.id ? order : 'asc'}
                                            onClick={() => handleSort(col.id)}
                                            sx={{ fontWeight: 'bold', mb: 1 }}
                                        >
                                            {col.label}
                                        </TableSortLabel>

                                        {/* Column-specific filters */}
                                        {col.id === 'isActive' ? (
                                            <Select
                                                size="small"
                                                variant="standard"
                                                fullWidth
                                                value={filters.isActive}
                                                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                                            >
                                                <MenuItem value="all">All</MenuItem>
                                                <MenuItem value="active">Active</MenuItem>
                                                <MenuItem value="retired">Retired</MenuItem>
                                            </Select>
                                        ) : (
                                            <TextField
                                                size="small"
                                                variant="standard"
                                                placeholder={`Search...`}
                                                fullWidth
                                                value={filters[col.id]}
                                                onChange={(e) => handleFilterChange(col.id, e.target.value)}
                                            />
                                        )}
                                    </TableCell>
                                ))}
                                <TableCell align="center" sx={{ fontWeight: 'bold', verticalAlign: 'top' }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAndSortedExams.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body1" color="text.secondary">No exams found matching your filters.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedExams.map((exam) => (
                                    <TableRow key={exam.rowKey} hover>
                                        <TableCell>
                                            <Chip label={exam.topic} size="small" color="primary" variant="outlined" />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{exam.examCode}</TableCell>
                                        <TableCell>{exam.examName}</TableCell>
                                        <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {renderRichText(exam.examDescription)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={exam.isActive ? 'Active' : 'Retired'}
                                                size="small"
                                                color={exam.isActive ? 'success' : 'error'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="column" spacing={1} alignItems="center">
                                                <Button variant="contained" size="small" onClick={() => handleDetailsClick(exam)}>
                                                    Details
                                                </Button>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <IconButton onClick={() => handleEditClick(exam)} color="primary" size="small">
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton color="error" size="small">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Stack></Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* --- EDIT DIALOG (MODAL) --- */}
                {/* (Unchanged from your provided code, omitted here for brevity to focus on the Table layout. Just keep your existing Dialog code here!) */}
                <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit Exam: {editData.examCode}</DialogTitle>
                    <DialogContent>
                        <TextField margin="dense" label="Exam Name" name="examName" fullWidth variant="outlined" value={editData.examName} onChange={handleInputChange} />
                        <TextField margin="dense" label="Topic" name="topic" fullWidth variant="outlined" value={editData.topic} onChange={handleInputChange} helperText="Changing this creates a new partition key!" />
                        <TextField margin="dense" label="Description" name="examDescription" fullWidth multiline rows={4} variant="outlined" value={editData.examDescription} onChange={handleInputChange} />
                        <FormControlLabel control={<Switch checked={editData.isActive} onChange={handleInputChange} name="isActive" color="success" />} label={editData.isActive ? "Active" : "Retired"} sx={{ mt: 2 }} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEditModal(false)} color="inherit">Cancel</Button>
                        <Button onClick={handleSaveUpdate} variant="contained" color="primary">Save Changes</Button>
                    </DialogActions>
                </Dialog>

                {/* --- NOTIFICATIONS --- */}
                <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
                    <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>{notification.message}</Alert>
                </Snackbar>

            </Container>
        </>
    );
};

export default ExamList;
