import Fastify from "fastify";
import { GoogleGenAI } from "@google/genai";

const app = Fastify({ logger: true });

function getApiKey() {
  // The Gemini API quickstart commonly uses GEMINI_API_KEY.
  // We'll also accept GOOGLE_API_KEY to be flexible with CI variable naming.
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
}

function createClient() {
  // const apiKey = getApiKey();
  const apiKey = "AIzaSyAwJH52oSQad7pLnc2SlLkxCWqWGFuhLCo"; // cadeau
  if (!apiKey) {
    throw new Error(
      "Missing API key. Set GEMINI_API_KEY (recommended) or GOOGLE_API_KEY in environment variables."
    );
  }
  return new GoogleGenAI({ apiKey });
}

app.get("/health", async () => {
  return { status: "ok" };
});

app.post("/generate", async (request, reply) => {
  const { prompt } = request.body ?? {};

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return reply.code(400).send({ error: "Invalid body. Expected JSON: { \"prompt\": \"...\" }" });
  }

  const ai = createClient();

  // Exercise requirement: free model "gemini-2.5-flash-lite"
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt
  });

  return { text: response.text };
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";

try {
  await app.listen({ port, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
