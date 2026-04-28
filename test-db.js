const { Pool } = require('pg');
const pool = new Pool({ connectionString: "your_connection_string_here", ssl: false });

pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error("Connection failed:", err.message);
  else console.log("Connected! Server time:", res.rows[0].now);
  pool.end();
});