import React, { useState } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    TextField,
    Select,
    MenuItem,
    Button,
    Grid,
    Box,
    Pagination,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Paper,
    Snackbar
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import CompanyCard from '../components/CompanyCard';

function SearchPage() {
    const [filters, setFilters] = useState({ name: '', industry: '', country: '', region: '', size: '', founded: '' });
    const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
        setError(null);
    };

    const clearFilters = () => {
        setFilters({ name: '', industry: '', country: '', region: '', size: '', founded: '' });
        setError(null);
    };

    const handleNaturalLanguageSearch = async (page = 1) => {
        if (!naturalLanguageQuery.trim()) return;
        
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:8000/api/companies/ai-search', {
                params: { 
                    query: naturalLanguageQuery,
                    page, 
                    limit: pagination.limit 
                }
            });
            const { data, pagination: paginationData, filters: parsedFilters } = response.data.data;
            setResults(data);
            setPagination({
                ...pagination,
                page,
                total: paginationData.total,
                totalPages: paginationData.totalPages
            });
            
            // Update filters with parsed values
            setFilters(prevFilters => ({
                ...prevFilters,
                ...parsedFilters
            }));
        } catch (error) {
            console.error('Error fetching companies:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch companies. Please try again.';
            setError(errorMessage);
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:8000/api/companies/search', {
                params: { ...filters, page, limit: pagination.limit }
            });
            const { data, pagination: paginationData } = response.data.data;
            setResults(data);
            setPagination({
                ...pagination,
                page,
                total: paginationData.total,
                totalPages: paginationData.totalPages
            });
        } catch (error) {
            console.error('Error fetching companies:', error);
            setError('Failed to fetch companies. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event, newPage) => {
        handleSearch(newPage);
    };

    const handleSaveCompany = async (companyId) => {
        try {
            await axios.post('http://localhost:8000/api/prospects', { company_id: companyId });
            setSnackbar({
                open: true,
                message: 'Company saved successfully!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error saving company:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save company. Please try again.',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <Box sx={{ py: 4, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Search Companies
                </Typography>
                {hasActiveFilters && (
                    <Button
                        onClick={clearFilters}
                        startIcon={<ClearIcon />}
                        size="small"
                        color="inherit"
                    >
                        Clear Filters
                    </Button>
                )}
            </Box>

            {/* Natural Language Search */}
            <Paper elevation={2} sx={{ p: 3, mb: 4, width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                    Natural Language Search
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Try queries like "banks in London founded in 2000"
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                        fullWidth
                        label="Search in natural language"
                        value={naturalLanguageQuery}
                        onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                        placeholder="e.g., banks in London founded in 2000"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleNaturalLanguageSearch(1);
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={() => handleNaturalLanguageSearch(1)}
                        disabled={loading || !naturalLanguageQuery.trim()}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </Button>
                </Box>
            </Paper>

            {/* Regular Search Filters */}
            <Paper elevation={2} sx={{ p: 3, mb: 4, width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                    Advanced Filters
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={4}>
                        <TextField
                            fullWidth
                            label="Company Name"
                            name="name"
                            value={filters.name}
                            onChange={handleInputChange}
                            placeholder="Enter company name"
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <TextField
                            fullWidth
                            label="Industry"
                            name="industry"
                            value={filters.industry}
                            onChange={handleInputChange}
                            placeholder="Enter industry"
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <TextField
                            fullWidth
                            label="Country"
                            name="country"
                            value={filters.country}
                            onChange={handleInputChange}
                            placeholder="Enter country"
                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <TextField
                            fullWidth
                            label="Region"
                            name="region"
                            value={filters.region}
                            onChange={handleInputChange}
                            placeholder="Enter region"
                        />
                    </Grid>
                    {/* <Grid item xs={12} md={6} lg={4}> */}
                    <Box sx={{ minWidth: 200 }}>
                        <FormControl>
                            <InputLabel>Company Size</InputLabel>
                            <Select
                                name="size"
                                value={filters.size}
                                onChange={handleInputChange}
                                label="Company Size"
                            >
                                <MenuItem value="">Select Size</MenuItem>
                                <MenuItem value="1-10">1-10</MenuItem>
                                <MenuItem value="11-50">11-50</MenuItem>
                                <MenuItem value="51-200">51-200</MenuItem>
                                <MenuItem value="201-500">201-500</MenuItem>
                                <MenuItem value="501-1000">501-1000</MenuItem>
                                <MenuItem value="1001-5000">1001-5000</MenuItem>
                                <MenuItem value="5001-10000">5001-10000</MenuItem>
                                <MenuItem value="10001+">10001+</MenuItem>
                            </Select>
                        </FormControl>
                            {/* <TextField
                                fullWidth
                                label="Region"
                                name="region"
                                value={filters.region}
                                onChange={handleInputChange}
                                placeholder="Enter region"
                            /> */}
                    {/* </Grid> */}
                    </Box>
                    <Grid item xs={12} md={6} lg={4}>
                        <TextField
                            fullWidth
                            label="Founded Year"
                            name="founded"
                            type="number"
                            value={filters.founded}
                            onChange={handleInputChange}
                            placeholder="Enter founded year"
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Button
                        variant="contained"
                        onClick={() => handleSearch(1)}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </Button>
                    {hasActiveFilters && (
                        <Typography variant="body2" color="text.secondary" marginTop={1}>
                            {pagination.total} results found
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            {/* Results Section */}
            <Paper elevation={2} sx={{ p: 3, width: '100%' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Results
                </Typography>
                {results.length > 0 ? (
                    <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
                            {results.map((company) => (
                                <CompanyCard
                                    key={company._id}
                                    company={company}
                                    onSave={handleSaveCompany}
                                />
                            ))}
                        </Box>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    count={pagination.totalPages}
                                    page={pagination.page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        )}
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <SentimentDissatisfiedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No results found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your search filters to find what you're looking for.
                        </Typography>
                    </Box>
                )}
            </Paper>

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

export default SearchPage; 