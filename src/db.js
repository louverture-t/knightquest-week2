// Database Connection Module
// Knights Quest - Module 2 Capstone

import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create connection pool
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Log connection status (helpful for debugging)
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err.message);
});

/**
 * Execute a SQL query
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters (optional)
 * @returns {Promise} Query result
 */
const query = (text, params) => pool.query(text, params);

/**
 * Get a client for transactions
 * Use this when you need to run multiple queries as one atomic operation
 * @returns {Promise} Database client
 */
const getClient = () => pool.connect();

/**
 * Execute multiple queries as a transaction
 * If any query fails, all changes are rolled back
 * @param {Function} callback - Async function receiving client
 * @returns {Promise} Transaction result
 */
const transaction = async (callback) => {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');
        
        // Execute the callback with the client
        const result = await callback(client);
        
        // If successful, commit all changes
        await client.query('COMMIT');
        
        return result;
    } catch (error) {
        // If any error, undo all changes
        await client.query('ROLLBACK');
        throw error;
    } finally {
        // Always release the client back to the pool
        client.release();
    }
};

/**
 * Close the connection pool
 * Call this when shutting down the application
 */
const close = () => pool.end();

export { query, getClient, transaction, close, pool };
