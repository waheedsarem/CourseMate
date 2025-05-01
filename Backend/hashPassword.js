const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// Database Configuration
const config = {
    user: "ss",
    password: "pass",
    server: "HP_ENVY_X360\\SQLEXPRESS",
    database: "ProjectDB",
    options: {
        trustServerCertificate: true,
        trustedConnection: false,
        enableArithAbort: true,
        instancename: "SQLEXPRESS"
    },
    port: 1433
};

// Connect to DB
sql.connect(config)
    .then(() => console.log("✅ Connected to the database"))
    .catch((err) => console.error("❌ DB connection failed:", err));
(async () => {
  const rollNo = 's01'; // 👈 your test roll_no
  const plainPassword = 'nice'; // 👈 plain password
  const hashed = await bcrypt.hash(plainPassword, 10); // 🔐 hash it

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('roll_no', sql.VarChar(10), rollNo)
      .input('password', sql.VarChar(255), hashed)
      .query('INSERT INTO log_in (roll_no, password) VALUES (@roll_no, @password)');

    console.log('✅ User added with hashed password.');
  } catch (err) {
    console.error('❌ Error inserting user:', err.message);
  } finally {
    sql.close();
  }
})();
