import { test } from "node:test";
import assert from "node:assert/strict";
import supertest from "supertest";
import Fastify from "fastify";
import { GoogleGenAI } from "@google/genai";

// We don't call the real API in tests.
// We stub the SDK by monkey-patching GoogleGenAI.prototype.models.

function buildAppForTest() {
  const app = Fastify();

  function getApiKey() {
    return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  }

  function createClient() {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("Missing API key");
    return new GoogleGenAI({ apiKey });
  }

  app.get("/health", async () => ({ status: "ok" }));

  app.post("/generate", async (request, reply) => {
    const { prompt } = request.body ?? {};
    if (typeof prompt !== "string" || prompt.trim().length === 0) {
      return reply.code(400).send({ error: "Invalid body. Expected JSON: { \"prompt\": \"...\" }" });
    }
    const ai = createClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt
    });
    return { text: response.text };
  });

  return app;
}

test("GET /health returns ok", async () => {
  const app = buildAppForTest();
  const res = await supertest(app.server).get("/health").expect(200);
  assert.equal(res.body.status, "ok");
  await app.close();
});

test("POST /generate validates body", async () => {
  process.env.GEMINI_API_KEY = "dummy";

  const originalModels = GoogleGenAI.prototype.models;
  GoogleGenAI.prototype.models = {
    generateContent: async () => ({ text: "stubbed" })
  };

  const app = buildAppForTest();
  await supertest(app.server).post("/generate").send({}).expect(400);
  await app.close();

  GoogleGenAI.prototype.models = originalModels;
});

test("POST /generate returns text", async () => {
  process.env.GEMINI_API_KEY = "dummy";

  const originalModels = GoogleGenAI.prototype.models;
  GoogleGenAI.prototype.models = {
    generateContent: async () => ({ text: "Hello from stubbed Gemini" })
  };

  const app = buildAppForTest();
  const res = await supertest(app.server)
    .post("/generate")
    .send({ prompt: "Say hello" })
    .expect(200);

  assert.equal(res.body.text, "Hello from stubbed Gemini");
  await app.close();

  GoogleGenAI.prototype.models = originalModels;
});
