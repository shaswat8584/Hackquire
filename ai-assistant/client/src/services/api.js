import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Send a message to the standalone AI Assistant API
 * @param {string} message - User query
 * @param {string} portalType - 'skillbridge' | 'university'
 * @param {object} customKnowledgeBase - Optional custom knowledge base
 * @param {Array} history - Recent conversation history
 */
export const sendMessage = async (message, portalType = 'skillbridge', customKnowledgeBase = null, history = []) => {
  try {
    const response = await api.post('/chat', {
      message,
      portalType,
      customKnowledgeBase,
      history,
    });
    return response.data;
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Could not connect to the AI Assistant server. Ensure the backend on port 5001 is running.');
  }
};

/**
 * Health check
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    return { status: 'offline', error: error.message };
  }
};

export default api;
