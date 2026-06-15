
const fetch = require("node-fetch");

require('dotenv').config({ path: './.env.local' });

const API_KEY = process.env.API_KEY;

async function test() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Say hello"
              }
            ]
          }
        ]
      })
    }
  );

  const data = await response.text();
  console.log(data);
}

test();