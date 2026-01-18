// Database Connection Module
// Knights Quest - Module 2 Capstone

import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create connection pool
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Track if we've logged the initial connection
let initialConnectionLogged = false;

// Log connection status (helpful for debugging) - only once
pool.on('connect', () => {
    if (!initialConnectionLogged) {
        initialConnectionLogged = true;
        // Connection message now handled by testConnection()
    }
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err.message);
});

/**
 * Test database connection
 * Use this at startup to verify connectivity before running queries
 * @returns {Promise<boolean>} True if connection successful
 */
const testConnection = async () => {
    try {
        await pool.query('SELECT 1');
        return true;
    } catch (error) {
        throw error;
    }
};

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

export { query, getClient, transaction, close, pool, testConnection };
