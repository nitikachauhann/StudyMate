
# StudyMate 🧠

StudyMate is an AI-powered document learning platform that helps users understand PDF documents more efficiently. Users can upload PDF files and instantly generate summaries, extract key topics, ask questions about the content, and create study materials.

## Features

### 📄 PDF Analysis

* Upload PDF documents
* Extract document content
* Generate concise AI-powered summaries

### 🏷️ Smart Topic Extraction

* Automatic title generation
* Keyword and tag extraction
* Topic identification

### 🤖 AI Question Answering

* Ask questions related to uploaded PDFs
* Context-aware responses
* Interactive learning experience

### 🃏 Flashcard Generation

* Automatically generate flashcards from document content
* Useful for revision and exam preparation

### 🎯 Interactive UI

* Modern React interface
* Guided product tour using Shepherd.js
* Responsive design

---

## Tech Stack

### Frontend

* React.js
* React Router
* Axios
* Tailwind CSS
* Framer Motion
* Shepherd.js

### Backend

* Node.js
* Express.js
* Multer
* PDF-Parse
* Google Gemini API

### AI Model

* Gemini 2.5 Flash

---

## Project Structure

```text
StudyMate/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env.local
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/nitikachauhann/mindmesh.git
cd StudyMate
```

---

## Backend Setup

Navigate to server folder:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create `.env.local`

```env
API_KEY=YOUR_GEMINI_API_KEY
```

Start server:

```bash
npm start
```

Server runs on:

```text
http://localhost:3000
```

---

## Frontend Setup

Navigate to frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run application:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## API Endpoints

### Process PDF

```http
POST /process_pdf
```

Returns:

* Title
* Tags
* Summary

---

### Generate Summary

```http
POST /get_summary
```

Returns:

* AI-generated summary

---

### Ask Questions

```http
POST /get_answer
```

Returns:

* AI-generated answer based on PDF content

---

### Generate Flashcards

```http
POST /get_cards
```

Returns:

* Question-answer flashcards

---

## Future Improvements

* User Authentication
* PDF Page Navigation
* Quiz Generation
* Study Plan Generator
* Summary Export
* Notes Saving
* Chat History
* PDF Highlighting

---

## Disclaimer

This project is intended for educational and learning purposes. AI-generated content may occasionally produce inaccurate results and should be verified when necessary.

---

## Author

**Nitika Chauhan**

AI-Powered Learning Assistant Project 🚀

---

with your actual GitHub repository URL.
