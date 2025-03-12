// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// API error handler
const handleApiError = (error) => {
  console.error('API Error:', error);
  throw new Error(error.message || 'An error occurred while processing your request');
};

// API client for making requests to the Flask backend
const apiClient = {
  // Send message to the Flask API
  async sendMessage(message) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Add more API methods as needed for different endpoints
  async getHealthStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  }
};

export default apiClient;
