const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env['DB_USER'],
  host: process.env['DB_HOST'],
  database: process.env['DB_DATABASE'],
  password: process.env['DB_PASSWORD'],
  port: process.env['DB_PORT'],
});

pool.connect(async (err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }

  console.log('PostgreSQL connected...');

  try {
    // Create the tables
    await createTables(client);

    // // Insert Cycle Information
    // await client.query(`
    //     INSERT INTO regions (name) VALUES ('SG'), ('US');
    //   `);

    // // Insert Questions
    // await client.query(`
    //   INSERT INTO questions (question_text, region_id) 
    //    VALUES ('What is your favorite color?', 1),
    //    ('What is your favorite food?', 1), 
    //    ('How do you define success?', 2),  
    //    ('What is your biggest challenge?', 2);
    // `);

    // // Insert Cycle Information
    // await client.query(`
    //   INSERT INTO cycles (region_id, start_date, duration_days)
    //    VALUES (1, '2024-10-21 19:00:00+08', 7),
    //    (2, '2024-10-21 19:00:00+08', 7);

    // `);

    // // Insert Users
    // await client.query(`
    //   INSERT INTO users (username, region_id) VALUES
    //     ('A', 1),
    //     ('B', 1),
    //     ('C', 2),
    //     ('D', 2);
    // `);

    // console.log('Test data inserted successfully');
  } catch (error) {
    console.error('Error executing queries', error.stack);
  } finally {
    // Always release the client when done
    release();
  }
});

// Make createTables async to use await properly
async function createTables(client) {
  const queries = [
    `
    CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,      
    name VARCHAR(100) NOT NULL  
    );`,
    `
    CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,        
    username VARCHAR(100) NOT NULL, 
    region_id INT REFERENCES regions(id) 
   );`,
    `
    CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,      
    question_text TEXT NOT NULL,  
    region_id INT REFERENCES regions(id) 
    );`,
    `
    CREATE TABLE IF NOT EXISTS cycles (
    id SERIAL PRIMARY KEY, 
    region_id INT REFERENCES regions(id),
    start_date TIMESTAMPTZ NOT NULL, 
    duration_days INT NOT NULL DEFAULT 7 
    );`,
    `CREATE TABLE IF NOT EXISTS region_question_assignments (
    region_id INT REFERENCES regions(id), 
    question_id INT REFERENCES questions(id),
    cycle_id INT REFERENCES cycles(id), 
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (region_id, cycle_id)
    );`
  ];

  for (const query of queries) {
    await client.query(query);
    console.log('Table created/verified');
  }
}
module.exports = pool;
