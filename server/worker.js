import { Worker } from "bullmq";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { QdrantVectorStore } from "@langchain/qdrant";

export const worker = new Worker(
  'file-upload-queue',
  async job => {
    console.log(job.data);
    const data = JSON.parse(job.data)

    const loader = new PDFLoader(data.path);
    const docs = await loader.load();
    console.log('docs',docs)
    const embeddings = new MistralAIEmbeddings({
        model: "mistral-embed",
        apiKey: 'x5wz7bgueh2KWCmJm3Gr96VIxUUIwVba'
    });
    console.log("embeddings",embeddings)
    let vectorStore;
try {
  vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: 'http://localhost:6333',
    collectionName: "langchainjs-testing",
  });
  console.log("Vector store created:", !!vectorStore);
} catch (err) {
  console.error("Error creating vector store:", err);
  return;
}

    try {
  console.log("Adding documents to vector store...");
await vectorStore.addDocuments(docs);
console.log("All data are added to vector store...");
} catch (err) {
  console.error("Error adding documents to vector store:", err);
}

//     const textSplitter = new CharacterTextSplitter({
//   chunkSize: 500,
//   chunkOverlap: 0,
// });
// const texts = await textSplitter.splitText(docs);

  },
  { connection: {
    host: "localhost",
    port: "6379"
  } },
);

