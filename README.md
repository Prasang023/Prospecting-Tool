# Company Prospecting Tool

A full-stack application for searching and managing company information with AI-powered natural language search capabilities.

## Features

- Advanced filtering options
- Company enrichment with AI-generated summaries
- Natural language search for companies
- Save and manage prospects
- Modern Material-UI interface

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- OpenRouter API key (for AI features) (can be obtained from: https://openrouter.ai/mistralai/devstral-small:free)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../client
   npm install
   ```

4. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/prospecting-tool
   LLM_SECRET=your_openrouter_api_key
   ```

5. Start MongoDB:
   ```bash
   # Make sure MongoDB is running on your system
   # Default port: 27017
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```
   The server will run on http://localhost:8000

2. Start the frontend development server:
   ```bash
   cd client
   npm start
   ```
   The application will open in your browser at http://localhost:3000

## Seed the database with sample data:

1. Add file free_company_dataset.json containing data to the root of repository (this file was provided along with this task)

2. run script to seed data
   ```bash
   cd server
   npm run seed
   ```
   This will populate your database with 1M initial company records for testing.
   
   Note: Make sure MongoDB is running before seeding the data.

## Future Prospects ( That I would implement if time permits)

1. Integrate Meilisearch for Enhanced Search Performance
   - Implement Meilisearch as a high-performance search engine to improve filtering and search capabilities
   - Benefits:
     - Lightning-fast search results with typo tolerance
     - Advanced filtering with numeric ranges (for company size, founding year)
     - Custom ranking rules to surface most relevant results
     - Built-in synonyms handling for better matching of industry terms
   - Integration with LLM:
     - More accurate matching of natural language query filters
     - Better handling of semantic search through custom synonyms
     - Ability to search across multiple fields simultaneously
     - Improved relevancy ranking based on multiple criteria
   - Performance improvements:
     - Reduced load on MongoDB for search operations
     - Faster response times for complex filter combinations
     - Better scalability for large datasets
     - Real-time indexing of new company data
     - optimised text search in ai-summary text field