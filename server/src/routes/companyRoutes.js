const express = require('express');
const router = express.Router();
const { searchCompanies, enrichCompany, aiSearchCompanies } = require('../controllers/companyController');

// GET /api/companies/search
router.get('/search', searchCompanies);

// GET /api/companies/ai-search
router.get('/ai-search', aiSearchCompanies);

// GET /api/companies/:id/enrich
router.get('/:id/enrich', enrichCompany);

module.exports = router; 