// src/config/db.js
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // Necessary for connecting to Render's PostgreSQL
  },
});

const createTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS tickets (
      id UUID PRIMARY KEY,
      vatin VARCHAR(50) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      created_at TIMESTAMP NOT NULL
    );
  `;
  try {
    await pool.query(queryText);
    console.log('Table "tickets" is ready');
  } catch (error) {
    console.error('Error creating table:', error);
  }
};

// Call createTable function to ensure the table is created on startup
createTable();

export const query = (text, params) => pool.query(text, params);
