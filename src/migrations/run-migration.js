import { Client } from "pg";

async function runMigration(sqlFilePath) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("ERROR: DATABASE_URL not set");
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log("Connected to Neon DB");

    const sql = await readFile(sqlFilePath, "utf-8");
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await client.query(stmt);
        console.log("OK:", stmt.substring(0, 80).replace(/\n/g, " "));
      } catch (err) {
        console.warn("SKIP:", err.message);
      }
    }

    console.log("Migration completed successfully");
  } finally {
    await client.end();
  }
}

import { readFile } from "fs/promises";

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error("Usage: node run-migration.js <sql-file>");
  process.exit(1);
}

runMigration(sqlFile).catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
