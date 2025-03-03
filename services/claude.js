import fetch from 'node-fetch';

export class ClaudeService {
  constructor(config) {
    this.apiKey = config.claudeApiKey;
    this.apiUrl = 'https://api.anthropic.com/v1/complete';
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
          prompt: prompt,
          max_tokens_to_sample: 1000,
          stop_sequences: ['\n\nHuman:'],
          temperature: 0.7,
          top_p: 1,
          model: 'claude-v1'
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.completion;
    } catch (error) {
      console.error('Claude service error:', error);
      throw error;
    }
  }
}
