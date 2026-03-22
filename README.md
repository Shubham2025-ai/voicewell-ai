# 🎙️ VoiceWell AI — Week 1 Starter

> AI Healthcare Voice Agent · Hackathon 2026 · Built with React + Vite + Groq

---

## Quick Start (5 minutes)

### 1. Install dependencies
```bash
cd voicewell
npm install
```

### 2. Add your Groq API key
```bash
cp .env.example .env
```
Open `.env` and replace `your_groq_api_key_here` with your key from [console.groq.com](https://console.groq.com)

### 3. Run dev server
```bash
npm run dev
```
Open **http://localhost:5173** in **Chrome** (must be Chrome for Web Speech API)

---

## Project Structure

```
voicewell/
├── src/
│   ├── hooks/
│   │   ├── useSpeech.js      # Day 2 — Web Speech API (STT)
│   │   ├── useGroq.js        # Day 3 — Groq LLM integration
│   │   └── useTTS.js         # Day 4 — Text-to-Speech output
│   ├── components/
│   │   ├── Header.jsx        # Top bar + language toggle
│   │   ├── ChatBubble.jsx    # Individual message bubbles
│   │   ├── MicButton.jsx     # Hero mic button with pulse animation
│   │   ├── TypingIndicator.jsx  # 3-dot loading indicator
│   │   └── Waveform.jsx      # Animated bars while agent speaks
│   ├── utils/
│   │   └── helpers.js        # Time formatting, Hindi detection
│   ├── App.jsx               # Main app — wires everything together
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind + custom animations
├── .env.example              # API key template
├── .env                      # YOUR keys (never commit this!)
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## Week 1 Daily Checklist

| Day | Goal | Done? |
|-----|------|-------|
| Day 1 | Project scaffold + Groq API key working | ☐ |
| Day 2 | STT: speak → see transcript in browser | ☐ |
| Day 3 | Groq: transcript → LLM response in UI | ☐ |
| Day 4 | TTS: agent response spoken aloud | ☐ |
| Day 5 | Chat UI polished: bubbles, scroll, animations | ☐ |
| Day 6 | Full loop tested: 10 health queries end-to-end | ☐ |
| Day 7 | Deployed to Vercel, live URL working | ☐ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Speech Input (STT) | Web Speech API (browser-native, Chrome only) |
| LLM / Brain | Groq Cloud — `llama-3.3-70b-versatile` |
| Speech Output (TTS) | Web Speech Synthesis API (browser-native) |
| Multilingual | Hindi auto-detected via Devanagari Unicode range |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_GROQ_API_KEY` | Your Groq API key from console.groq.com |

> ⚠️ Never commit your `.env` file. It's already in `.gitignore`.

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```
Add `VITE_GROQ_API_KEY` as an environment variable in your Vercel project dashboard.

---

## Week 2 Preview

After Week 1 is complete, Week 2 adds:
- 🧠 Multi-turn context (last 8 messages sent to Groq every call — already wired!)
- 💊 Medication reminders (Firebase Firestore + Browser Notifications)
- 🇮🇳 Full Hindi mode (auto-detect + manual toggle — already wired!)
- 😟 Emotion detection (HuggingFace API — tone-aware responses)
- 🤒 Structured symptom triage conversation flow

---

## Important Notes

- **Chrome only** for voice features — Firefox/Safari do not support Web Speech API
- **Mic permission** — Chrome will ask for mic access on first use, click "Allow"
- **Short responses** — System prompt instructs Groq to keep replies under 60 words (optimised for TTS)
- **No audio stored** — Raw voice data never leaves your browser; only the text transcript is sent to Groq

---

## Hackathon Track
**AI Voice Agents: Giving Technology a Human Voice**  
Challenge Area: Healthcare & Wellness Assistant  
Platform: Web (Browser-first)
