import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("Missing Pinecone API key");
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key");
}

const pinecone = new Pinecone();

export async function queryDocuments(query: string): Promise<string> {
  try {
    // Initialize the index - use PINECONE_INDEX_TWO for 1536 dimensions
    const index = pinecone.Index(process.env.PINECONE_INDEX_TWO || "smallindex");

    // Initialize OpenAI embeddings (1536 dimensions)
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize the vector store
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: process.env.PINECONE_NAMESPACE,
    });

    // Initialize the model
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4-turbo-preview",
      temperature: 0,
    });

    // Create the chain
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
      returnSourceDocuments: true,
      verbose: true,
    });

    // Execute the query
    const response = await chain.call({
      query,
    });

    return response.text;
  } catch (error) {
    console.error("Error querying documents:", error);
    return "I encountered an error while searching the documents. Please try again.";
  }
} 