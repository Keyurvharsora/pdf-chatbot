import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "chatbot.db"));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    title TEXT,
    created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    documents TEXT,
    created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
  CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
`);

// Migration: Add type column if it doesn't exist
try {
  db.exec(
    "ALTER TABLE conversations ADD COLUMN type TEXT NOT NULL CHECK(type IN ('chat', 'summary')) DEFAULT 'chat'"
  );
} catch (e) {
  // Column already exists or other error
}

// Prepared statements for better performance
export const queries = {
  // Conversations
  createConversation: db.prepare(
    "INSERT INTO conversations (user_id, title, type) VALUES (?, ?, ?) RETURNING *"
  ),
  getConversationsByUser: db.prepare(
    "SELECT c.* FROM conversations c WHERE c.user_id = ? AND EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id) ORDER BY c.updated_at DESC"
  ),
  getConversation: db.prepare("SELECT * FROM conversations WHERE id = ?"),
  updateConversationTitle: db.prepare(
    "UPDATE conversations SET title = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?"
  ),
  updateConversationTimestamp: db.prepare(
    "UPDATE conversations SET updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now') WHERE id = ?"
  ),
  deleteConversation: db.prepare("DELETE FROM conversations WHERE id = ?"),

  // Messages
  createMessage: db.prepare(
    "INSERT INTO messages (conversation_id, role, content, documents) VALUES (?, ?, ?, ?) RETURNING *"
  ),
  getMessagesByConversation: db.prepare(
    "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC"
  ),
  deleteMessage: db.prepare("DELETE FROM messages WHERE id = ?"),
};

export default db;
