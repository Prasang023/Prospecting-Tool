const { SavedProspect, Company } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// POST /api/prospects
const saveProspect = async (req, res) => {
    try {
        const { company_id } = req.body;
        
        // Check if company exists
        const company = await Company.findById(company_id);
        if (!company) {
            return res.status(404).json(errorResponse('Company not found'));
        }

        // Check if already saved
        const existingProspect = await SavedProspect.findOne({ company_id });
        if (existingProspect) {
            return res.status(400).json(errorResponse('Company already saved as prospect'));
        }

        const savedProspect = new SavedProspect({ company_id });
        await savedProspect.save();
        res.status(201).json(successResponse(savedProspect, 'Prospect saved successfully'));
    } catch (error) {
        res.status(500).json(errorResponse('Server error', error));
    }
};

// GET /api/prospects
const getProspects = async (req, res) => {
    try {
        const prospects = await SavedProspect.find().populate('company_id');
        res.json(successResponse(prospects));
    } catch (error) {
        res.status(500).json(errorResponse('Server error', error));
    }
};

// DELETE /api/prospects/:id
const deleteProspect = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProspect = await SavedProspect.findOneAndDelete({ company_id: id });
        if (!deletedProspect) {
            return res.status(404).json(errorResponse('Prospect not found'));
        }
        res.json(successResponse(deletedProspect, 'Prospect deleted successfully'));
    } catch (error) {
        res.status(500).json(errorResponse('Server error', error));
    }
};

module.exports = { saveProspect, getProspects, deleteProspect }; 