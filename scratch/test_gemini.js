require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  console.log("Testing Gemini API Key:", process.env.GEMINI_API_KEY);
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say 'Hello, AI is working!' if you can hear me.");
    const response = await result.response;
    console.log("RESPONSE:", response.text());
  } catch (error) {
    console.error("GEMINI TEST FAILED!");
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
    }
  }
}

testGemini();
