// -----------------------------------------------
// routes/aiRoutes.js — Google Gemini AI Routes
// -----------------------------------------------
// POST /api/ai/ask  → Send a question, get an AI answer
// -----------------------------------------------

const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

// Lazy-initialize Gemini client so the server starts even without the key
let ai = null;
function getAI() {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in .env");
    }
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

// -----------------------------------------------
// POST /api/ai/ask
// -----------------------------------------------
// Body: { "question": "How do I learn AWS?" }
// Returns: { "success": true, "answer": "..." }
// -----------------------------------------------
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a question.",
      });
    }

    // System context to keep answers relevant to the tech community
    const systemPrompt =
      "You are a helpful AI assistant for DevDostHub, a developer community platform. " +
      "Give clear, concise, and beginner-friendly answers about " +
      "technology, programming, cloud computing, AI/ML, and career advice. " +
      "Keep responses under 300 words unless the user asks for more detail. " +
      "IMPORTANT: Do NOT use any markdown formatting in your responses. " +
      "No asterisks, no hashtags, no bold/italic markers, no bullet symbols. " +
      "Use plain numbered lists (1. 2. 3.) and simple line breaks for structure. " +
      "Write in clean, readable plain text only.";

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nUser question: ${question}` }],
        },
      ],
    });

    const answer = response.text || "Sorry, I could not generate a response.";

    res.json({
      success: true,
      question,
      answer,
    });
  } catch (error) {
    console.error("Gemini AI Error:", error.message);

    // Handle specific API errors
    if (error.message === "GEMINI_API_KEY is not set in .env") {
      return res.status(500).json({
        success: false,
        message: "AI service is not configured. Please set GEMINI_API_KEY.",
      });
    }

    // Handle quota / rate-limit errors
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      return res.status(429).json({
        success: false,
        message: "AI rate limit reached. Please wait a moment and try again.",
      });
    }

    res.status(500).json({
      success: false,
      message: "AI service encountered an error. Please try again.",
      error: error.message,
    });
  }
});

module.exports = router;
