import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require",
});

async function migrate() {
  try {
    // Try to drop the existing constraint. We might not know its exact name if it was auto-generated,
    // but usually it's something like conversations_type_check.
    // However, it's safer to just alter the column if possible or drop and recreate.

    console.log("Starting migration...");

    // Check if we can just drop the constraint by name.
    // In many Postgres versions, we can find the constraint name.
    const constraints = await sql`
      SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'conversations'::regclass
      AND contype = 'c'
      AND conname LIKE '%type%';
    `;

    for (const row of constraints) {
      console.log(`Dropping constraint ${row.conname}`);
      await sql.unsafe(
        `ALTER TABLE conversations DROP CONSTRAINT ${row.conname}`
      );
    }

    console.log("Adding new constraint...");
    await sql`
      ALTER TABLE conversations 
      ADD CONSTRAINT conversations_type_check 
      CHECK (type IN ('chat', 'summary', 'translation'));
    `;

    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

migrate();
