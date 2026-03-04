const fs = require('fs');
const path = require('path');
const sql = require('mssql');

const projectRoot = path.resolve(__dirname, '..', '..');
const schemaPath = path.join(projectRoot, 'Schema.sql');
const seedPath = path.join(projectRoot, 'Swapper Trigger and Sample Inserts.sql');

const config = {
  user: 'sa',
  password: 'StrongPass123!',
  server: '127.0.0.1',
  port: 11433,
  options: {
    trustServerCertificate: true,
    encrypt: false,
  },
};

function splitBatches(sqlText) {
  return sqlText
    .split(/^\s*GO\s*$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);
}

async function executeFile(pool, filePath, label) {
  const content = fs.readFileSync(filePath, 'utf8');
  const batches = splitBatches(content);

  for (let index = 0; index < batches.length; index += 1) {
    try {
      await pool.request().query(batches[index]);
    } catch (error) {
      throw new Error(`${label} failed at batch ${index + 1}: ${error.message}`);
    }
  }
}

async function main() {
  let pool;

  try {
    pool = await sql.connect({ ...config, database: 'master' });
    await pool.request().query(`
      IF DB_ID('ProjectDB') IS NOT NULL
      BEGIN
        ALTER DATABASE ProjectDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        DROP DATABASE ProjectDB;
      END;
      CREATE DATABASE ProjectDB;
    `);
    await pool.close();

    pool = await sql.connect({ ...config, database: 'ProjectDB' });

    await executeFile(pool, schemaPath, 'Schema.sql');
    await executeFile(pool, seedPath, 'Swapper Trigger and Sample Inserts.sql');

    const tableCountResult = await pool
      .request()
      .query("SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';");

    const studentCountResult = await pool.request().query('SELECT COUNT(*) AS count FROM Students;');

    console.log(`OK: tables=${tableCountResult.recordset[0].count}, students=${studentCountResult.recordset[0].count}`);
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (pool) {
      await pool.close();
    }
    await sql.close();
  }
}

main();
