const OpenAI = require('openai');

const DEFAULT_MODEL = 'gpt-5.4-mini';

function getModel() {
  return process.env.OPENAI_MODEL || DEFAULT_MODEL;
}

function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function extractJsonText(response) {
  if (response.output_text) return response.output_text;

  const chunks = [];
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) chunks.push(content.text);
    }
  }
  return chunks.join('\n');
}

async function analyzeImageWithPrompt({ imageData, prompt }) {
  const client = getClient();
  if (!client) return null;

  const response = await client.responses.create({
    model: getModel(),
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: prompt },
          { type: 'input_image', image_url: imageData, detail: 'high' },
        ],
      },
    ],
    text: {
      format: { type: 'json_object' },
    },
  });

  return JSON.parse(extractJsonText(response));
}

module.exports = {
  analyzeImageWithPrompt,
  getModel,
};
