const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

let genAI = null;
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn('[Gemini Config] Warning: Could not initialize GoogleGenerativeAI client:', err.message);
  }
} else {
  console.log('[Gemini Config] Notice: GEMINI_API_KEY is not set in .env. Service will use grounded knowledge base fallback.');
}

const getGeminiClient = () => genAI;

module.exports = {
  getGeminiClient,
  isConfigured: () => Boolean(apiKey && genAI),
};
