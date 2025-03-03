import fetch from 'node-fetch';

export class BardService {
  constructor(config) {
    this.apiKey = config.bardApiKey;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText';
  }

  async generateResponse(prompt) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          prompt: {
            text: prompt
          },
          temperature: 0.7,
          top_k: 40,
          top_p: 0.95,
          candidate_count: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Bard API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].output;
    } catch (error) {
      console.error('Bard service error:', error);
      throw error;
    }
  }
}
