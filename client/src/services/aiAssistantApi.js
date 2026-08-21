import axios from 'axios';

const AI_API_BASE_URL = import.meta.env.VITE_AI_ASSISTANT_URL || 'http://localhost:5001/api';

const aiApi = axios.create({
  baseURL: AI_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Ask the standalone AI Assistant a question
 * @param {string} message - User question
 */
export const askAIAssistant = async (message) => {
  try {
    const response = await aiApi.post('/chat', { message });
    return response.data;
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('AI Assistant is currently offline. Please ensure the AI service on port 5001 is running.');
  }
};

export default aiApi;
