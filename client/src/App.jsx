import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SearchPage from './pages/SearchPage';
import SavedProspectsPage from './pages/SavedProspectsPage';

function App() {
    return (
        <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
                <AppBar position="static" sx={{ margin: 0 }}>
                    <Toolbar sx={{ 
                        maxWidth: '100%', 
                        mx: 'auto', 
                        width: '100%', 
                        px: { xs: 2, sm: 4, md: 6 },
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2
                    }}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'left' }}>
                            Company Prospecting Tool
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/"
                                startIcon={<SearchIcon />}
                                size="small"
                                sx={{
                                    '&:hover': {
                                        color: 'black'
                                    }
                                }}
                            >
                                Search
                            </Button>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/saved"
                                startIcon={<BookmarkIcon />}
                                size="small"
                                sx={{
                                    '&:hover': {
                                        color: 'black'
                                    }
                                }}
                            >
                                Saved
                            </Button>
                        </Stack>
                    </Toolbar>
                </AppBar>

                <Box sx={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: '100%', maxWidth: '100%', px: { xs: 2, sm: 4, md: 6 } }}>
                        <Routes>
                            <Route path="/" element={<SearchPage />} />
                            <Route path="/saved" element={<SavedProspectsPage />} />
                        </Routes>
                    </Box>
                </Box>
            </Box>
        </Router>
    );
}

export default App; 