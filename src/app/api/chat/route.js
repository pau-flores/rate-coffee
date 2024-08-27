import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

// Create systemprompt for the ai
const systemPrompt = `You are a friendly AI assistant with access to 1.2k coffee reviews. Your role is to recommend coffees based on user preferences like flavor notes (e.g., fruity, nutty), roast level (light, medium, dark), origin, and other useful information. Start by asking about their preferences, then search the database to suggest a few matching options, including brief descriptions. Offer additional details like origin, tasting notes, and user ratings. Maintain a warm, approachable tone, and ask follow-up questions if needed to refine your recommendations. Your responses should be short and concise.`;

// Initialize openai with openrouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Initialize pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pinecone
  .Index(process.env.PINECONE_INDEX_NAME)
  .namespace(process.env.PINECONE_NAMESPACE);

// Function to get embeddings from Hugging Face
async function getHuggingFaceEmbeddings(text) {
  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${process.env.HUGGINGFACE_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Embedding not found in the HuggingFace API response.");
    }

    return data;
  } catch (error) {
    console.error("Error getting embeddings:", error);
    throw error;
  }
}

export async function POST(req) {
  const { messages } = await req.json();

  const lastUserMessage = messages[messages.length - 1]?.content;

  let queryResult = null;
  if (lastUserMessage) {
    const raw_query_embedding = await getHuggingFaceEmbeddings(lastUserMessage);

    // Query pinecone api
    const queryResponse = await index.query({
      vector: raw_query_embedding,
      topK: 5,
      includeMetadata: true,
    });

    // Filter query data
    let queryString = "";
    queryResponse.matches.forEach((match) => {
      queryString += `
      Returned Results:
      Coffee: ${match.metadata.name}
      Review: ${match.metadata.review}
      Origin: ${match.metadata.origin}
      Rating: ${match.metadata.rating}
      Roaster: ${match.metadata.roaster}
      \n\n`;
    });

    /*
    queryResult = queryResponse.matches
      .map((match) => match.metadata.text)
      .filter((text) => text)
      .join("\n\n");
    */
  }

  const completionMessages = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...messages,
  ];

  if (queryResult) {
    completionMessages.push({
      role: "system",
      content: `The following information was retrieved from the database:\n\n${queryResult}`,
    });
  }

  const completion = await openai.chat.completions.create({
    messages: completionMessages,
    model: "meta-llama/llama-3.1-8b-instruct:free",
    stream: true,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
