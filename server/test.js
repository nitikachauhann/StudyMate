require('dotenv').config({ path: './.env.local' });

const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

async function main() {
  const result = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: 'Say hello',
  });

  console.log(result.text);
}

main().catch(console.error);