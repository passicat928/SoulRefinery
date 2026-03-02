const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google-generative-ai/generative-ai");

// 從雲端保險箱讀取隱藏金鑰
const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

exports.getGeminiResponse = onCall({ 
    secrets: [GEMINI_API_KEY],
    cors: true 
}, async (request) => {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent(request.data.prompt);
        return { text: result.response.text() };
    } catch (error) {
        return { error: error.message };
    }
});