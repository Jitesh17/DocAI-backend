const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
let dbInstance;

async function connectToDatabase() {
    if (dbInstance) return dbInstance;

    try {
        const client = new MongoClient(uri, { useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB');
        dbInstance = client.db('documentDB');
        return dbInstance;
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
}

module.exports = { connectToDatabase };
