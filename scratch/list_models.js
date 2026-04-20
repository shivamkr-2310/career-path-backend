require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // There isn't a direct listModels in the client SDK usually, 
    // but we can try gemini-pro which is the most stable name.
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello");
    const response = await result.response;
    console.log("Gemini-pro works:", response.text());
  } catch (error) {
    console.error("Gemini-pro failed:", error.message);
  }
}

listModels();
