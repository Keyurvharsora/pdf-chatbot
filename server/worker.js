import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { QdrantVectorStore } from "@langchain/qdrant";

export const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    console.log("Processing job:", job.id);
    const data = JSON.parse(job.data);

    const loader = new PDFLoader(data.path);
    const docs = await loader.load();

    // 1. Split text into chunks to avoid Mistral's token limit
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`Split into ${splitDocs.length} chunks`);

    const embeddings = new MistralAIEmbeddings({
      model: "mistral-embed",
      apiKey: process.env.MISTRAL_API_KEY,
    });

    try {
      const collectionName = process.env.QDRANT_COLLECTION_NAME;
      const qdrantUrl = process.env.QDRANT_URL;

      // 2. Clear old data from collection
      console.log(`Resetting collection: ${collectionName}`);
      try {
        await fetch(`${qdrantUrl}/collections/${collectionName}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.warn("Collection reset skipped (might be new).");
      }

      // 3. Add chunks to vector store
      console.log("Vectorizing and adding to Qdrant...");
      await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
        url: qdrantUrl,
        collectionName: collectionName,
      });

      console.log("Success: PDF is now searchable.");
      return { success: true };
    } catch (err) {
      console.error("Worker processing error:", err);
      throw err; // Ensure job fails in BullMQ if processing fails
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  }
);
