import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Mistral } from "@mistralai/mistralai";
import { queries } from "./db.js";

const client = new Mistral({ apiKey: "x5wz7bgueh2KWCmJm3Gr96VIxUUIwVba" });

const myQueue = new Queue("file-upload-queue", {
  connection: {
    host: "localhost",
    port: "6379",
  },
});

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
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  return res.json({ msg: "All Works" });
});

app.post("/upload/pdf", upload.single("pdf"), async (req, res) => {
  await myQueue.add(
    "file-ready",
    JSON.stringify({
      filename: req.file.originalname,
      destination: req.file.destination,
      path: req.file.path,
    })
  );
  return res.json({ msg: "PDF uploaded" });
});

// Create new conversation
app.post("/conversations", async (req, res) => {
  try {
    const { userId, title } = req.body;
    const conversation = queries.createConversation.get(
      userId,
      title || "New Conversation"
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
    const conversations = queries.getConversationsByUser.all(userId);
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
    const messages = queries.getMessagesByConversation.all(conversationId);

    // Parse documents JSON for each message
    const parsedMessages = messages.map((msg) => ({
      ...msg,
      documents: msg.documents ? JSON.parse(msg.documents) : null,
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
    queries.deleteConversation.run(conversationId);
    return res.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({ error: "Failed to delete conversation" });
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
      apiKey: "x5wz7bgueh2KWCmJm3Gr96VIxUUIwVba",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "langchainjs-testing",
      }
    );

    const retriever = vectorStore.asRetriever({ k: 2 });
    const result = await retriever.invoke(userQuery);

    const SYSTEM_PROMPT = `You are helpfull AI assistant query based on the available context from PDF file.
    Context: ${JSON.stringify(result)}
    `;

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userQuery },
      ],
    });

    const assistantMessage = chatResponse.choices[0].message.content;

    // Save messages to database if conversationId is provided
    if (conversationId) {
      // Save user message
      queries.createMessage.run(conversationId, "user", userQuery, null);

      // Save assistant message with documents
      queries.createMessage.run(
        conversationId,
        "assistant",
        assistantMessage,
        JSON.stringify(result)
      );

      // Update conversation timestamp
      queries.updateConversationTimestamp.run(conversationId);
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
