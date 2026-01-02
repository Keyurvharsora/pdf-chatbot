import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, {
  ssl: "require",
});

// Initialize tables
async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      type TEXT NOT NULL CHECK(type IN ('chat', 'summary')) DEFAULT 'chat',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      documents JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);`;
}

initDb().catch(console.error);

export const queries = {
  // Conversations
  createConversation: async (userId, title, type) => {
    const [conversation] = await sql`
      INSERT INTO conversations (user_id, title, type) 
      VALUES (${userId}, ${title || "New Conversation"}, ${type || "chat"}) 
      RETURNING *
    `;
    return conversation;
  },

  getConversationsByUser: async (userId) => {
    return await sql`
      SELECT c.* FROM conversations c 
      WHERE c.user_id = ${userId} 
      AND EXISTS (SELECT 1 FROM messages m WHERE m.conversation_id = c.id) 
      ORDER BY c.updated_at DESC
    `;
  },

  getConversation: async (id) => {
    const [conversation] =
      await sql`SELECT * FROM conversations WHERE id = ${id}`;
    return conversation;
  },

  updateConversationTitle: async (title, id) => {
    return await sql`
      UPDATE conversations 
      SET title = ${title}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id}
    `;
  },

  updateConversationTimestamp: async (id) => {
    return await sql`
      UPDATE conversations 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id}
    `;
  },

  deleteConversation: async (id) => {
    return await sql`DELETE FROM conversations WHERE id = ${id}`;
  },

  // Messages
  createMessage: async (conversationId, role, content, documents) => {
    const [message] = await sql`
      INSERT INTO messages (conversation_id, role, content, documents) 
      VALUES (${conversationId}, ${role}, ${content}, ${documents}) 
      RETURNING *
    `;
    return message;
  },

  getMessagesByConversation: async (conversationId) => {
    return await sql`
      SELECT * FROM messages 
      WHERE conversation_id = ${conversationId} 
      ORDER BY created_at ASC
    `;
  },

  deleteMessage: async (id) => {
    return await sql`DELETE FROM messages WHERE id = ${id}`;
  },
};

export default sql;
