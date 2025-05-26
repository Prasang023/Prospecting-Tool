const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    website: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: String,
        trim: true
    },
    founded: {
        type: Number
    },
    region: {
        type: String,
        trim: true
    },
    locality: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true
    },
    industry: {
        type: String,
        trim: true
    },
    linkedin_url: {
        type: String,
        trim: true
    },
    ai_summary: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Text index for full-text search
companySchema.index({ name: 'text', industry: 'text', country: 'text', region: 'text', ai_summary: 'text' });

// Compound indexes for common query patterns
companySchema.index({ industry: 1, region: 1 }); // For industry + region queries
companySchema.index({ industry: 1, country: 1 }); // For industry + country queries
companySchema.index({ size: 1, founded: 1 }); // For size + founding year queries
companySchema.index({ country: 1, region: 1 }); // For country + region queries

// Single field indexes for frequently filtered fields
companySchema.index({ size: 1 }); // For size-based filtering
companySchema.index({ founded: 1 }); // For founding year filtering
companySchema.index({ industry: 1 }); // For industry filtering
companySchema.index({ country: 1 }); // For country filtering
companySchema.index({ region: 1 }); // For region filtering

// Index for timestamps (useful for recent additions)
companySchema.index({ createdAt: -1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company; 