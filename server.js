// ✅ BizGenie AI backend — single file full version
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 🔹 Load environment variables
dotenv.config();

// 🔹 Setup Express app
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// 🔹 JSON parsing
app.use(bodyParser.json());

// 🔹 Read API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🔹 Serve index.html and frontend files
app.use(express.static(__dirname));

// 🔹 Route to generate AI business plan
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 3) {
      return res.status(400).json({ error: "براہ کرم درست متن لکھیں۔" });
    }

    const systemPrompt = `
      You are BizGenie AI — an expert startup idea generator.
      Return a creative, realistic, and clear business plan in Urdu or English.
      Include: Summary, AI use, Benefits, Monetization, Launch Steps, Tools, and 2 name ideas.
    `;

    // 🔹 Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        max_tokens: 1000,
        temperature: 0.8
      })
    });

    const data = await response.json();
    console.log("🔍 OpenAI Response:", JSON.stringify(data, null, 2));

    const aiText = data?.choices?.[0]?.message?.content;
    if (!aiText) {
      return res.status(500).json({ error: "AI نے کوئی جواب نہیں دیا۔", details: data });
    }

    res.json({ success: true, plan: aiText });
  } catch (err) {
    console.error("❌ Server Error:", err);
    res.status(500).json({ error: "سرور میں مسئلہ ہوا۔", details: err.message });
  }
});

// 🔹 Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 BizGenie backend running on http://localhost:${PORT}`);
});
