# Chat History Implementation Guide

## Overview

This implementation adds persistent chat history to your PDF chatbot using SQLite database. Each user's conversations are stored and can be retrieved when they return to the application.

## Features Implemented

### 1. **Database Storage (SQLite)**

- **File**: `server/db.js`
- **Tables**:
  - `conversations`: Stores conversation metadata (user_id, title, timestamps)
  - `messages`: Stores individual messages with role, content, and document references
- **Automatic Creation**: Database and tables are created automatically on first run

### 2. **Backend API Endpoints**

Updated `server/index.js` with the following endpoints:

- `POST /conversations` - Create a new conversation
- `GET /conversations/:userId` - Get all conversations for a user
- `GET /conversations/:conversationId/messages` - Get all messages in a conversation
- `DELETE /conversations/:conversationId` - Delete a conversation
- `POST /chat` - Updated to save messages to database (requires conversationId)

### 3. **Frontend Components**

#### Chat Component (`client/app/components/chat.tsx`)

- Automatically creates a conversation when user starts chatting
- Saves all messages (user and assistant) to the database
- Uses Clerk authentication to identify users
- Maintains conversation context throughout the session

#### History Component (`client/app/components/history.tsx`)

- Displays all past conversations for the logged-in user
- Shows conversation titles and timestamps
- Allows viewing messages from any past conversation
- Includes delete functionality for conversations
- Real-time date formatting (e.g., "2h ago", "3d ago")

#### Main Page (`client/app/page.tsx`)

- Tab navigation to switch between "Chat" and "History"
- Modern UI with smooth transitions
- Maintains state when switching between tabs

## How It Works

### User Flow:

1. **User signs in** via Clerk authentication
2. **Starts chatting** - A new conversation is automatically created
3. **Messages are saved** - Both user questions and AI responses are stored in the database
4. **View history** - User can switch to the History tab to see all past conversations
5. **Resume conversations** - Click on any past conversation to view its messages
6. **Delete conversations** - Remove unwanted conversations with the delete button

### Data Flow:

```
User Message → Frontend (chat.tsx)
    ↓
POST /chat with conversationId
    ↓
Backend saves to database
    ↓
AI Response → Saved to database
    ↓
Response sent back to Frontend
```

### Database Schema:

```sql
conversations:
  - id (PRIMARY KEY)
  - user_id (Clerk user ID)
  - title (conversation title)
  - created_at (timestamp)
  - updated_at (timestamp)

messages:
  - id (PRIMARY KEY)
  - conversation_id (FOREIGN KEY)
  - role ('user' | 'assistant')
  - content (message text)
  - documents (JSON string of source documents)
  - created_at (timestamp)
```

## Key Technologies Used

- **Database**: better-sqlite3 (synchronous SQLite)
- **Authentication**: Clerk (provides user.id)
- **Backend**: Express.js with new REST endpoints
- **Frontend**: React with hooks for state management

## Benefits

1. **Persistent History**: Users can access their conversations anytime
2. **User-Specific**: Each user only sees their own conversations
3. **Organized**: Conversations are sorted by most recent activity
4. **Searchable**: Easy to find past conversations by title
5. **Deletable**: Users can clean up old conversations
6. **Lightweight**: SQLite requires no separate database server

## Files Modified/Created

### Server:

- ✅ `server/db.js` (NEW) - Database configuration and queries
- ✅ `server/index.js` (MODIFIED) - Added conversation endpoints
- ✅ `server/package.json` (MODIFIED) - Added better-sqlite3 dependency
- ✅ `server/chatbot.db` (AUTO-CREATED) - SQLite database file

### Client:

- ✅ `client/app/components/chat.tsx` (MODIFIED) - Added conversation support
- ✅ `client/app/components/history.tsx` (NEW) - History viewer
- ✅ `client/app/page.tsx` (MODIFIED) - Added tab navigation

## Usage

### For Users:

1. Sign in to the application
2. Upload a PDF and start chatting
3. All conversations are automatically saved
4. Click "History" tab to view past conversations
5. Click on any conversation to view its messages
6. Hover over a conversation and click the trash icon to delete it

### For Developers:

The database file (`chatbot.db`) will be created in the `server/` directory. You can:

- View it with any SQLite browser
- Back it up by copying the file
- Clear all data by deleting the file (it will be recreated)

## Future Enhancements (Optional)

1. **Search**: Add search functionality to find specific conversations
2. **Export**: Allow users to export conversations as PDF or text
3. **Conversation Titles**: Auto-generate better titles from first message
4. **Pagination**: Add pagination for users with many conversations
5. **Sharing**: Allow users to share conversations
6. **Analytics**: Track conversation metrics (length, topics, etc.)

## Notes

- The database is stored locally on the server
- For production, consider using PostgreSQL or MongoDB
- Conversations are tied to Clerk user IDs
- Messages include document references for context
