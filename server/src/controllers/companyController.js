const { Company } = require('../models');
const { scrapeHomepage } = require('../utils/scraper');
const axios = require('axios');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper function to parse natural language query using LLM
const parseNaturalLanguageQuery = async (query) => {
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [
                {
                    role: 'system',
                    content: `You are a search query parser. Convert natural language queries about companies into structured filters.
                    Return a JSON object with the following possible fields:
                    - name: string (company name or keywords)
                    - industry: string (specific industry)
                    - country: string (country name) Add country name only if it is a valid country name else add in region, do not use short forms like USA, UK, etc.
                    - region: string (region or state)
                    - size: string (company size) (e.g. "1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10001+")
                    - founded: should be only anumber (founding year)
                    - product: string (specific product or service)
                    - location: string (specific location)
                    
                    Example input: "Fastest growing AR companies in Silicon Valley"
                    Example output: {"industry":"augmented reality","region":"silicon valley"}
                    
                    Important JSON formatting rules:
                    1. Use double quotes for all keys and string values
                    2. Include commas between all properties
                    3. Do not include trailing commas
                    4. Ensure all JSON is properly formatted
                    5. Return ONLY the JSON object, no additional text
                    
                    Only include fields that are explicitly mentioned in the query.`
                },
                { role: 'user', content: query }
            ],
            temperature: 0.3, // Lower temperature for more consistent results
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.LLM_SECRET}`,
                'Content-Type': 'application/json'
            }
        });

        const content = response.data.choices[0].message.content.trim();
        
        // Clean the response to ensure it's valid JSON
        let cleanedContent = content;
        // Remove any text before the first {
        cleanedContent = cleanedContent.substring(cleanedContent.indexOf('{'));
        // Remove any text after the last }
        cleanedContent = cleanedContent.substring(0, cleanedContent.lastIndexOf('}') + 1);
        
        try {
            const parsed = JSON.parse(cleanedContent);
            console.log(parsed);
            // Validate that we have at least one valid field
            if (Object.keys(parsed).length === 0) {
                throw new Error('Empty filter object');
            }
            return parsed;
        } catch (parseError) {
            console.error('Failed to parse LLM response as JSON:', {
                original: content,
                cleaned: cleanedContent,
                error: parseError.message
            });
            throw new Error('Invalid response format from LLM');
        }
    } catch (error) {
        console.error('Error parsing natural language query:', error);
        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again in a few moments.');
        } else if (error.response?.status === 401) {
            throw new Error('Invalid API key configuration');
        }
        throw new Error('Failed to parse search query');
    }
};

// GET /api/companies/ai-search
const aiSearchCompanies = async (req, res) => {
    try {
        const { query, page = 1, limit = 20 } = req.query;

        if (!query) {
            return res.status(400).json(errorResponse('Search query is required'));
        }

        // Parse natural language query into structured filters
        const filters = await parseNaturalLanguageQuery(query);
        console.log('Parsed filters:', filters);

        // Build MongoDB filter object
        const filter = {};
        if (filters.name) filter.name = { $regex: filters.name, $options: 'i' };
        if (filters.industry) filter.industry = { $regex: filters.industry, $options: 'i' };
        if (filters.country) filter.country = { $regex: filters.country, $options: 'i' };
        if (filters.region) filter.region = { $regex: filters.region, $options: 'i' };
        if (filters.size) filter.size = filters.size;
        if (filters.founded) filter.founded = filters.founded;
        if (filters.product) {
            // Search in ai_summary for product mentions
            filter.ai_summary = { $regex: filters.product, $options: 'i' };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        let sort = { name: 1 }; // Default sort
        if (filters.sort) {
            sort = { [filters.sort.field]: filters.sort.order === 'desc' ? -1 : 1 };
        }

        // Query database
        const [results, total] = await Promise.all([
            Company.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Company.countDocuments(filter)
        ]);

        res.json(successResponse({
            data: results,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            },
            filters: filters // Include parsed filters in response
        }));
    } catch (error) {
        console.error('AI Search error:', error);
        res.status(500).json(errorResponse('Server error', error));
    }
};

// GET /api/companies/search
// Query params: name, industry, country, region, size, founded, page, limit
const searchCompanies = async (req, res) => {
    try {
        const {
            name,
            industry,
            country,
            region,
            size,
            founded,
            page = 1,
            limit = 20
        } = req.query;

        // Build filter object
        const filter = {};
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (industry) filter.industry = { $regex: industry, $options: 'i' };
        if (country) filter.country = { $regex: country, $options: 'i' };
        if (region) filter.region = { $regex: region, $options: 'i' };
        if (size) filter.size = size;
        if (founded) filter.founded = parseInt(founded);

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Query database
        const [results, total] = await Promise.all([
            Company.find(filter)
                .sort({ name: 1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Company.countDocuments(filter)
        ]);

        res.json(successResponse({
            data: results,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        }));
    } catch (error) {
        res.status(500).json(errorResponse('Server error', error));
    }
};

// GET /api/companies/:id/enrich
const enrichCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findById(id);
        if (!company) {
            return res.status(404).json(errorResponse('Company not found'));
        }

        // Scrape homepage
        const content = await scrapeHomepage(company.website);

        // Call OpenAI for summarization with retry logic
        const maxRetries = 3;
        let retries = 0;
        let ai_summary;

        while (retries < maxRetries) {
            try {
                console.log('Attempting to call OpenAI API...');
                const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                    model: 'mistralai/devstral-small:free',
                    messages: [
                        { role: 'system', content: 'Summarize this company and its product in ~100 words.' },
                        { role: 'user', content }
                    ]
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.LLM_SECRET}`,
                        'Content-Type': 'application/json'
                    }
                });

                ai_summary = response.data.choices[0].message.content;
                console.log('Successfully generated AI summary');
                break; // Success, exit the loop
            } catch (error) {
                console.error('OpenAI API Error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message
                });

                if (error.response?.status === 429) {
                    retries++;
                    console.log(`Rate limit hit. Retry attempt ${retries} of ${maxRetries}`);
                    if (retries < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
                    } else {
                        throw new Error('OpenAI API rate limit exceeded after retries');
                    }
                } else if (error.response?.status === 401) {
                    throw new Error('OpenAI API key is invalid or not set');
                } else {
                    throw new Error(`OpenAI API error: ${error.message}`);
                }
            }
        }

        // Update company with AI summary
        company.ai_summary = ai_summary;
        await company.save();

        res.json(successResponse(company));
    } catch (error) {
        res.status(500).json(errorResponse('Server error', error));
    }
};

module.exports = { searchCompanies, enrichCompany, aiSearchCompanies }; 