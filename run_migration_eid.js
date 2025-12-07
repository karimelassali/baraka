const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const sqlPath = path.join(__dirname, 'lib', 'supabase', 'eid_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running Eid al Adha migration...');
        await client.query(sql);
        console.log('Eid al Adha migration applied successfully!');

    } catch (err) {
        console.error('Error running migration:', err);
    } finally {
        await client.end();
    }
}

runMigration();
