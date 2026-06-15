const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './.env.local' });

const { GoogleGenAI } = require('@google/genai');

const app = express();
const port = 3000;

// -------------------- GEMINI --------------------
const genAI = new GoogleGenAI({
  apiKey: process.env.API_KEY,
});

// -------------------- MIDDLEWARE --------------------
app.use(cors());
app.use(express.json());

// -------------------- MULTER --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// -------------------- HELPERS --------------------
function sanitize(str = '') {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function safeJSONParse(text) {
  try {
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.log("RAW MODEL OUTPUT:\n", text);
    throw new Error("Invalid JSON from Gemini");
  }
}

async function callGemini(prompt) {
  const result = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return result.text;
}

// -------------------- PDF --------------------
function extractText(data) {
  return data.text?.trim() || '';
}

// -------------------- ROUTES --------------------

// 1. PROCESS PDF
app.post('/process_pdf', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const data = await pdfParse(fs.readFileSync(file.path));
    const text = extractText(data);

    if (!text) return res.status(400).json({ error: 'Empty PDF' });

    const prompt = `
Return ONLY valid JSON.

Text:
${text}

Format:
{
  "title": "",
  "tags": ["", ""],
  "summary": ["", ""]
}
`;

    const raw = await callGemini(prompt);
    const cleaned = safeJSONParse(raw);

    fs.unlinkSync(file.path);

    res.json({
      responseText: cleaned
    });

  } catch (err) {
    console.error(err);
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'process_pdf failed' });
  }
});


// 2. GET SUMMARY
app.post('/get_summary', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const pageNumber = parseInt(req.body.page_no || 0);

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const data = await pdfParse(fs.readFileSync(file.path));
    const text = data.text?.trim();

    if (!text) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Empty PDF' });
    }

    const prompt = `
You are a strict JSON generator.

Return ONLY valid JSON:

{
  "summary": [
    "point 1",
    "point 2",
    "point 3",
    "point 4",
    "point 5"
  ]
}

TEXT:
${text.slice(0, 6000)}
`;

    const raw = await callGemini(prompt);

    let cleaned;
    try {
      cleaned = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      console.log("RAW GEMINI OUTPUT:", raw);
      return res.status(500).json({ error: "Invalid JSON from Gemini" });
    }

    fs.unlinkSync(file.path);

    res.json({
      responseText: cleaned
    });

  } catch (err) {
    console.error(err);
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'get_summary failed' });
  }
});


// 3. Q&A
app.post('/get_answer', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const question = sanitize(req.body.question || '');

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const data = await pdfParse(fs.readFileSync(file.path));
    const text = extractText(data);

    const prompt = `
Answer ONLY from context.

TEXT:
${sanitize(text)}

QUESTION:
${question}
`;

    const answer = await callGemini(prompt);

    fs.unlinkSync(file.path);

    res.json({
      responseText: answer
    });

  } catch (err) {
    console.error(err);
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'get_answer failed' });
  }
});


// 4. FLASHCARDS
app.post('/get_cards', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const data = await pdfParse(fs.readFileSync(file.path));
    const text = data.text.split(/\s+/).slice(0, 4000).join(' ');

    const prompt = `
Generate 10 flashcards.

Return ONLY JSON:
[
  { "question": "", "answer": "" }
]

Text:
${sanitize(text)}
`;

    const raw = await callGemini(prompt);
    const cleaned = safeJSONParse(raw);

    fs.unlinkSync(file.path);

    res.json({
      responseText: cleaned
    });

  } catch (err) {
    console.error(err);
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'get_cards failed' });
  }
});


// -------------------- START --------------------
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});