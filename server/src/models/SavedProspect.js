const mongoose = require('mongoose');

const savedProspectSchema = new mongoose.Schema({
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create a compound index to prevent duplicate saves
savedProspectSchema.index({ company_id: 1 }, { unique: true });

const SavedProspect = mongoose.model('SavedProspect', savedProspectSchema);

module.exports = SavedProspect; 