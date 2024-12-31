const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'new_lib',
    password: 'admin',
    port: 5432, // Default PostgreSQL port
});

module.exports = pool;
