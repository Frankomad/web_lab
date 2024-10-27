import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
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

createTable();

export const query = (text, params) => pool.query(text, params);
