const express = require('express');
const router = express.Router();
const { saveProspect, getProspects, deleteProspect } = require('../controllers/prospectController');

// Save a company as a prospect
router.post('/', saveProspect);

// Get all saved prospects
router.get('/', getProspects);

// Delete a saved prospect
router.delete('/:id', deleteProspect);

module.exports = router; 