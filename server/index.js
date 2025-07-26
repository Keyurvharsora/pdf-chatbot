import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import { MistralAIEmbeddings } from '@langchain/mistralai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { Mistral } from '@mistralai/mistralai';

const client = new Mistral({apiKey: 'x5wz7bgueh2KWCmJm3Gr96VIxUUIwVba'});

const myQueue = new Queue('file-upload-queue', {connection: {
    host: "localhost",
    port: "6379"
  },
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})

const upload = multer({ storage: storage });

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Change if your frontend runs elsewhere
  credentials: true
}));

app.get('/', (req,res) => {
    return res.json({ msg: "All Works"})
})

app.post('/upload/pdf', upload.single('pdf'), async (req,res) => {
    await myQueue.add('file-ready', JSON.stringify({
        filename: req.file.originalname,
        destination: req.file.destination,
        path: req.file.path 
    }))
    return res.json({msg: "PDF uploaded"})
})

app.get('/chat', async (req,res) => {
  const userQuery = req.query.message;

   const embeddings = new MistralAIEmbeddings({
          model: "mistral-embed",
          apiKey: 'x5wz7bgueh2KWCmJm3Gr96VIxUUIwVba'
  });

  const  vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
      url: 'http://localhost:6333',
      collectionName: "langchainjs-testing",
    });

    const retriever = vectorStore.asRetriever({k:2});
    const result = await retriever.invoke(userQuery)

    const SYSTEM_PROMPT = `You are helpfull AI assistant query based on the available context from PDF file.
    Context: ${JSON.stringify(result)}
    `

    const chatResponse = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [
      {role: 'system', content: SYSTEM_PROMPT}, 
      {role: "user", content: userQuery}
    ],
  });

console.log('Chat:', chatResponse.choices[0].message.content);

    return res.json({ message: chatResponse.choices[0].message.content, docs: result })
})

app.listen(8000, () => console.log(`Server Started at 8000`));