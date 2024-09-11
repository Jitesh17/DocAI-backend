const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../db');

const getUserByUsername = async (username) => {
    const db = await connectToDatabase();
    return db.collection('users').findOne({ username });
};

const createUser = async (username, hashedPassword, role = 'user') => {
    const db = await connectToDatabase();
    return db.collection('users').insertOne({ username, password: hashedPassword, role });
};

module.exports = { getUserByUsername, createUser };
