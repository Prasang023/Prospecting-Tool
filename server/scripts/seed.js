require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { Company } = require('../src/models');
const readline = require('readline');

const connectDB = require('../config/db');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Clear existing data
        await Company.deleteMany({});
        console.log('Cleared existing companies');

        // Read the JSON file line by line
        const jsonPath = path.join(__dirname, '../../free_company_dataset.json');
        const fileStream = fs.createReadStream(jsonPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let count = 0;
        const companies = [];

        for await (const line of rl) {
            if (count >= 1000000) break; // Stop after 1000 companies
            try {
                const company = JSON.parse(line);
                // Skip if missing required fields
                if (!company.name || !company.website) continue;
                
                // Remove the id field as we'll use MongoDB's _id
                delete company.id;
                
                companies.push(company);
                count++;
            } catch (err) {
                console.error('Error parsing line:', err);
            }
        }

        // Insert companies in batches
        const batchSize = 100;
        for (let i = 0; i < companies.length; i += batchSize) {
            const batch = companies.slice(i, i + batchSize);
            await Company.insertMany(batch);
            console.log(`Inserted companies ${i + 1} to ${i + batch.length}`);
        }

        console.log(`Successfully seeded ${companies.length} companies`);

        // Create text index
        await Company.collection.createIndex({ 
            name: 'text', 
            industry: 'text', 
            country: 'text', 
            region: 'text' 
        });
        console.log('Created text indexes');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 