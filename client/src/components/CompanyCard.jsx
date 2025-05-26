import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Chip,
    IconButton,
    Collapse,
    CircularProgress,
    Tooltip,
    Stack
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Save as SaveIcon,
    Delete as DeleteIcon,
    Language as WebsiteIcon,
    LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import axios from 'axios';

function CompanyCard({ company, onSave, isSaved = false }) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [aiSummary, setAiSummary] = useState(company?.ai_summary || null);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleEnrich = async () => {
        if (aiSummary) return;
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8000/api/companies/${company._id}/enrich`);
            setAiSummary(response.data.data.ai_summary);
        } catch (error) {
            console.error('Error enriching company:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        onSave(company._id);
    };

    if (!company) {
        return null;
    }

    return (
        <Card sx={{ width: '100%', mb: 2 }}>
            <CardContent sx={{ textAlign: 'left', width: '100%' }}>
                {/* Header Section */}
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    mb: 2 
                }}>
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                            fontWeight: 600,
                            textAlign: 'left'
                        }}
                    >
                        {company.name || 'Unnamed Company'}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Tooltip title={isSaved ? "Remove from Saved" : "Save Company"}>
                            <IconButton onClick={handleSave} size="small">
                                {isSaved ? <DeleteIcon /> : <SaveIcon />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Expand Details">
                            <IconButton
                                onClick={handleExpandClick}
                                sx={{
                                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s'
                                }}
                            >
                                <ExpandMoreIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Box>

                {/* Tags Section */}
                <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1, 
                    mb: 2,
                    justifyContent: 'flex-start'
                }}>
                    {company.industry && (
                        <Chip 
                            label={`Industry: ${company.industry}`} 
                            size="small"
                            sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}
                        />
                    )}
                    {company.size && (
                        <Chip 
                            label={`Size: ${company.size}`} 
                            size="small"
                            sx={{ backgroundColor: 'secondary.light', color: 'secondary.contrastText' }}
                        />
                    )}
                    {company.founded && (
                        <Chip 
                            label={`Founded: ${company.founded}`} 
                            size="small"
                            sx={{ backgroundColor: 'info.light', color: 'info.contrastText' }}
                        />
                    )}
                </Box>

                {/* Links Section */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    mb: 2,
                    justifyContent: 'flex-start'
                }}>
                    {company.website && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<WebsiteIcon />}
                            href={`https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textTransform: 'none' }}
                        >
                            Website
                        </Button>
                    )}
                    {company.linkedin_url && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<LinkedInIcon />}
                            href={`https://${company.linkedin_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textTransform: 'none' }}
                        >
                            LinkedIn
                        </Button>
                    )}
                </Box>

                {/* Expanded Details Section */}
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, textAlign: 'left' }}>
                        <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            gutterBottom
                            sx={{ textAlign: 'left' }}
                        >
                            Location
                        </Typography>
                        <Typography 
                            variant="body2" 
                            paragraph
                            sx={{ textAlign: 'left' }}
                        >
                            {[company.locality, company.region, company.country]
                                .filter(Boolean)
                                .join(', ') || 'Location not available'}
                        </Typography>

                        <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            gutterBottom
                            sx={{ textAlign: 'left' }}
                        >
                            AI Summary
                        </Typography>
                        {aiSummary ? (
                            <Typography 
                                variant="body2" 
                                paragraph
                                sx={{ 
                                    textAlign: 'left',
                                    backgroundColor: 'action.hover',
                                    p: 2,
                                    borderRadius: 1
                                }}
                            >
                                {aiSummary}
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleEnrich}
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : null}
                                    sx={{ textTransform: 'none' }}
                                >
                                    {loading ? 'Generating...' : 'Generate AI Summary'}
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}

export default CompanyCard; 