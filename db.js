const { MongoClient } = require('mongodb');
require('dotenv').config(); // Load environment variables

const uri = process.env.MONGO_URI; // MongoDB URI from .env file
let dbInstance;

async function connectToDatabase() {
    if (dbInstance) return dbInstance; // Reuse existing connection

    try {
        const client = new MongoClient(uri);
        await client.connect(); // Establish connection
        console.log('Connected to MongoDB');
        dbInstance = client.db('documentDB'); // Set the database name
        return dbInstance;
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
}

module.exports = { connectToDatabase };
