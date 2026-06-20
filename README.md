<div align="center">

# 📰 CivilDigest — AI-Powered UPSC News Summarizer

**Transform any news article into exam-ready UPSC study material in seconds.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [API Reference](#-api-reference) • [Contributing](#-contributing)

</div>

## 🎯 What is CivilDigest?

CivilDigest is a full-stack AI-powered study companion designed specifically for **UPSC Civil Services aspirants**. It takes any current affairs news URL (The Hindu, Indian Express, PIB, LiveMint, etc.) and uses **Anakin Scraper** to extract content from paywalled/protected articles, then feeds it to **Google Gemini 2.5 Flash** to generate:

- ✅ **5-Point Exam-Ready Summaries** — High-density summaries with relevant laws, constitutional articles, committee recommendations
- 🏷️ **UPSC Subject Classification** — Auto-maps to Polity, Economy, Environment, IR, Science & Tech, or GS
- 🔑 **Key UPSC Terminology** — Extracts 5–8 crucial keywords for answer enhancement
- ❓ **Prelims-Standard MCQ** — AI-generated practice questions with deep analytical explanations
- 📝 **Daily Revision Sheet** — Structured Markdown notes covering Syllabus Context, Core Arguments, Prelims Facts, Mains Angles, and Way Forward

## ✨ Features

### 🔍 Smart Article Scraping
- **Anakin Wire API** integration for bypassing paywalls and captcha-protected news sites
- Async job-based scraping with automatic polling
- Graceful fallback to direct HTTP scraping when Anakin is unavailable
- URL path-based title and source extraction as final fallback

### 🧠 AI-Powered Analysis
- **Gemini 2.5 Flash** with structured JSON output schema
- Enforced response format with `responseMimeType: "application/json"`
- Low temperature (0.2) for factual, exam-focused output
- Comprehensive UPSC-grade prompt engineering

### 📚 Article Library
- Firebase Firestore-backed persistent storage
- Real-time sync with Firestore `onSnapshot`
- Bookmark/star important articles for quick revision
- Delete custom articles (sample articles are preserved)
- Pre-loaded sample analyses for immediate exploration

### 📝 MCQ Practice Lab
- Interactive quiz interface with instant feedback
- Detailed explanations for correct and incorrect options
- Progress tracking with solved/correct counters
- Local storage persistence for sample article answers

### 📖 Revision Compiler
- Compile all starred/bookmarked articles into a single revision binder
- Rich Markdown rendering of revision sheets
- Organized by UPSC syllabus papers (GS I, II, III, IV)

### 📊 Aspirant Dashboard
- Articles scanned counter
- MCQs solved and accuracy tracking
- Daily streak system with localStorage persistence
- At-a-glance performance metrics

### 🔐 Authentication
- Firebase Anonymous Authentication for seamless onboarding
- User-scoped data isolation in Firestore
- No sign-up friction — start using immediately

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4 |
| **Animations** | Motion (Framer Motion) |
| **Icons** | Lucide React |
| **Backend** | Express.js, Node.js |
| **AI Engine** | Google Gemini 2.5 Flash (`@google/genai`) |
| **Web Scraper** | Anakin Wire API (`api.anakin.io/v1/url-scraper`) |
| **Database** | Firebase Firestore (real-time sync) |
| **Auth** | Firebase Anonymous Authentication |
| **Build Tool** | Vite 6 |
| **Dev Server** | TSX (TypeScript execution) |

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ installed
- **Gemini API Key** — Get one from [Google AI Studio](https://ai.studio.google.com)
- **Anakin API Key** — Get one from [Anakin.io](https://anakin.io/account#developer) (starts with `ask_`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tanya-garg10/CivilDigest-AI-Powered-UPSC-News-Summarizer.git
   cd CivilDigest-AI-Powered-UPSC-News-Summarizer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your keys:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   ANAKIN_API_KEY="ask_your_anakin_api_key_here"
   APP_URL="http://localhost:3005"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:3005
   ```

### Production Build

```bash
npm run build
npm start
```

## 🏗 Architecture

```
CivilDigest/
├── server.ts                  # Express backend + Vite middleware + API routes
├── index.html                 # Entry HTML
├── vite.config.ts             # Vite + Tailwind CSS v4 + React plugin config
├── postcss.config.cjs         # PostCSS configuration
├── firebase-applet-config.json # Firebase project configuration
├── firestore.rules            # Firestore security rules
├── .env.example               # Environment variable template
│
├── src/
│   ├── App.tsx                # Main application component (state, routing, logic)
│   ├── main.tsx               # React entry point
│   ├── index.css              # Global styles + Tailwind imports
│   ├── types.ts               # TypeScript interfaces (ArticleAnalysis, MCQ, UserStats)
│   │
│   ├── components/
│   │   ├── AnalysisWorkspace.tsx   # Article analysis display (summary, keywords, revision)
│   │   ├── AuthBar.tsx             # Authentication status bar
│   │   ├── LibraryWorkspace.tsx    # Article library grid with search & filters
│   │   ├── QuizView.tsx            # Interactive MCQ practice component
│   │   ├── RevisionCompiler.tsx    # Starred articles revision binder
│   │   └── StatsDashboard.tsx      # Aspirant performance metrics
│   │
│   ├── data/
│   │   └── samples.ts         # Pre-loaded sample UPSC article analyses
│   │
│   └── lib/
│       └── firebase.ts        # Firebase initialization & auth helpers
```

### Request Flow

```
User pastes URL → Frontend POST /api/analyze
                        ↓
              Anakin Scraper (async job)
              POST api.anakin.io/v1/url-scraper
                        ↓
              Poll GET /v1/url-scraper/{jobId}
              (every 3s, up to 10 retries)
                        ↓
              Extract markdown/content
                        ↓
              Gemini 2.5 Flash (structured JSON)
              Prompt: UPSC analysis + schema enforcement
                        ↓
              Response: title, category, summary[5],
              keywords[5-8], MCQ, revisionSheet
                        ↓
              Save to Firestore → Render in UI
```

### 📡 API Reference

### `POST /api/analyze`

Analyzes a news article URL and returns structured UPSC study material.

**Request Body:**
```json
{
  "url": "https://www.thehindu.com/news/article-slug/article12345.ece"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Impact of CBAM on India's Steel Exports",
    "source": "Thehindu",
    "category": "Economy & Development",
    "summary": ["...5 detailed summaries..."],
    "keywords": ["CBAM", "Carbon Border Tax", "..."],
    "mcq": {
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 1,
      "explanation": "..."
    },
    "revisionSheet": "# Markdown formatted revision notes...",
    "url": "...",
    "scrapedSuccessfully": true,
    "createdAt": "2026-06-20T15:00:00.000Z"
  }
}
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

<div align="center">

**Made with ❤️ for IAS & Civil Service Aspirants**

*CivilDigest © 2026*

</div>
