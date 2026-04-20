const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getGeminiResponse = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    console.log("Using model: gemini-2.5-flash-lite");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    if (!text) throw new Error("Empty response from Gemini");
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error(`Gemini API Error: ${error.message || "Unknown error"}`);
  }
};

module.exports = { getGeminiResponse };
