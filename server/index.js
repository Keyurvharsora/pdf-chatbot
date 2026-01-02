import express from "express";
import { createClient } from "redis";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Mistral } from "@mistralai/mistralai";
import { queries } from "./db.js";

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

// Redis client initialization as requested
const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.on("error", (err) => console.error("Redis Error", err));
await redisClient.connect();

const connection = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

const myQueue = new Queue("file-upload-queue", { connection });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://192.168.0.114:3000",
  "http://192.168.0.114:3001",
  "https://pdf-chatbot-zeta.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      console.log("Incoming Origin:", origin);

      const isVercel = origin.endsWith(".vercel.app");
      const isAllowed = allowedOrigins.includes(origin) || isVercel;

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log("CORS Rejected for:", origin);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  return res.json({ msg: "All Works" });
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  const job = await myQueue.add(
    "file-ready",
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );
  return res.json({ msg: "PDF uploaded", jobId: job.id });
});

app.get("/upload-status/:jobId", async (req, res) => {
  const { jobId } = req.params;
  const job = await myQueue.getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const state = await job.getState();
  return res.json({ state });
});

// Create new conversation
app.post("/conversations", async (req, res) => {
  try {
    const { userId, title, type } = req.body;
    const conversation = await queries.createConversation(
      userId,
      title || "New Conversation",
      type || "chat"
    );
    return res.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Get all conversations for a user
app.get("/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await queries.getConversationsByUser(userId);
    return res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get messages for a conversation
app.get("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await queries.getMessagesByConversation(conversationId);

    // Parse documents JSON for each message
    const parsedMessages = messages.map((msg) => ({
      ...msg,
      documents: msg.documents || null,
    }));

    return res.json(parsedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Delete conversation
app.delete("/conversations/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    await queries.deleteConversation(conversationId);
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({ error: "Failed to delete conversation" });
  }
});
// Summarize endpoint
app.post("/summarize", async (req, res) => {
  try {
    const { userId, filename } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const embeddings = new MistralAIEmbeddings({
      model: "mistral-embed",
      apiKey: process.env.MISTRAL_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        collectionName: process.env.QDRANT_COLLECTION_NAME,
      }
    );

    // Retrieve a larger set of chunks for summary
    const retriever = vectorStore.asRetriever({ k: 10 });
    const docs = await retriever.invoke(
      "Provide a comprehensive summary of this document."
    );

    const context = docs.map((d) => d.pageContent).join("\n\n");

    const SYSTEM_PROMPT = `You are a professional document summarizer. 
    Create a concise yet comprehensive summary of the provided text.
    Use bullet points for key takeaways and start with a brief 2-3 sentence overview.
    
    Document Name: ${filename || "Uploaded PDF"}
    `;

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Context: ${context}` },
      ],
    });

    const summary = chatResponse.choices[0].message.content;

    // Create a new summary type conversation
    const conversation = await queries.createConversation(
      userId,
      `Summary: ${filename || "Document"}`,
      "summary"
    );

    // Save the summary as an assistant message
    await queries.createMessage(conversation.id, "assistant", summary, docs);

    return res.json({
      summary,
      conversationId: conversation.id,
      docs,
    });
  } catch (error) {
    console.error("Summary error:", error);
    return res.status(500).json({ error: "Failed to generate summary" });
  }
});

// Chat endpoint with conversation support
app.post("/chat", async (req, res) => {
  try {
    const { message: userQuery, conversationId } = req.body;

    if (!userQuery) {
      return res.status(400).json({ error: "Message is required" });
    }

    const embeddings = new MistralAIEmbeddings({
      model: "mistral-embed",
      apiKey: process.env.MISTRAL_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRANT_URL,
        collectionName: process.env.QDRANT_COLLECTION_NAME,
      }
    );

    const retriever = vectorStore.asRetriever({ k: 2 });
    const result = await retriever.invoke(userQuery);

    const SYSTEM_PROMPT = `Answer strictly using the provided context only.
    Do not infer, assume, or add external information.
    Context: ${JSON.stringify(result)}
    `;

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
    });
    console.log("🚀 ~ chatResponse:", chatResponse);

    const assistantMessage = chatResponse.choices[0].message.content;

    // Save messages to database if conversationId is provided
    if (conversationId) {
      // If this is a "New Conversation", update the title using the first user question
      const currentConversation = await queries.getConversation(conversationId);
      if (
        currentConversation &&
        currentConversation.title === "New Conversation"
      ) {
        const newTitle =
          userQuery.length > 50
            ? userQuery.substring(0, 50) + "..."
            : userQuery;
        await queries.updateConversationTitle(newTitle, conversationId);
      }

      // Save user message
      await queries.createMessage(conversationId, "user", userQuery, null);

      // Save assistant message with documents
      await queries.createMessage(
        conversationId,
        "assistant",
        assistantMessage,
        result
      );

      // Update conversation timestamp
      await queries.updateConversationTimestamp(conversationId);
    }

    console.log("Chat:", assistantMessage);

    return res.json({
      message: assistantMessage,
      docs: result,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({ error: "Failed to process chat message" });
  }
});

app.listen(8000, () => console.log(`Server Started at 8000`));
