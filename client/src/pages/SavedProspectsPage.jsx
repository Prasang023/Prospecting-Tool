import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Paper,
    Snackbar
} from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import CompanyCard from '../components/CompanyCard';

function SavedProspectsPage() {
    const [savedProspects, setSavedProspects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const fetchSavedProspects = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/api/prospects');
            setSavedProspects(response.data.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching saved prospects:', error);
            setError('Failed to fetch saved prospects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedProspects();
    }, []);

    const handleRemoveProspect = async (companyId) => {
        try {
            await axios.delete(`http://localhost:8000/api/prospects/${companyId}`);
            setSnackbar({
                open: true,
                message: 'Company removed from saved prospects',
                severity: 'success'
            });
            // Refresh the list
            fetchSavedProspects();
        } catch (error) {
            console.error('Error removing prospect:', error);
            setSnackbar({
                open: true,
                message: 'Failed to remove company. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ py: 4, width: '100%' }}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Saved Prospects
            </Typography>

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {/* Loading State */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper elevation={2} sx={{ p: 3, width: '100%' }}>
                    {savedProspects.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                            {savedProspects.map((prospect) => (
                                <CompanyCard
                                    key={prospect.company_id._id}
                                    company={prospect.company_id}
                                    onSave={() => handleRemoveProspect(prospect.company_id._id)}
                                    isSaved={true}
                                />
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <SentimentDissatisfiedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No saved prospects
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Companies you save will appear here.
                            </Typography>
                        </Box>
                    )}
                </Paper>
            )}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default SavedProspectsPage; 