# 🎙️ VoiceWell AI

<div align="center">

**Your voice-first AI health companion — speak, and get real answers.**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-voicewell--ai.vercel.app-00e87a?style=for-the-badge)](https://voicewell-ai.vercel.app/)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Powered by Groq](https://img.shields.io/badge/LLM-Groq_LLaMA_3.3_70B-FF6B00?style=for-the-badge)](https://groq.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com)

*Hackathon 2026 · AI Voice Agents Track · Healthcare & Wellness*

</div>

---

## What is VoiceWell?

VoiceWell is a **voice-first AI health companion** that lets you speak naturally about your health and get instant, actionable guidance — no typing needed. It combines real-time speech recognition, a powerful LLM, and a suite of specialized health tools into a single, beautiful interface.

> "Tell me how you're feeling — I'll help with symptoms, medications, nutrition, and more."

---

## ✨ Features

### 🎙️ Voice & Conversation
- **Real-time speech-to-text** via the Web Speech API — speak naturally, see your words appear live.
- **Text-to-speech responses** — the AI speaks back to you, with smart chunking to avoid browser TTS cutoffs.
- **Bilingual** — English and Hindi auto-detected; toggle manually at any time.
- **Emotion detection** — HuggingFace AI reads your emotional state and adapts the AI's tone (stressed → gentle, sad → empathetic, happy → upbeat).
- **Conversation memory** — last 10 messages sent to the LLM for full context awareness.
- **Session summary** — generate an overview of your entire health conversation.
- **Accessible UI** — assistant bubbles announce with `aria-live="polite"`, controls have descriptive `aria-label`s, status badges use `role="status"`.

### 🩺 Health Tools
| Tool | What it does |
|------|--------------|
| **Symptom Checker** | Tap any symptom card (fever, headache, nausea, body pain, anxiety, breathing) — get instant AI assessment with home remedies + OTC medicine suggestions. |
| **BMI Calculator** | Speak your height and weight — get your BMI, category, and personalised health tips. |
| **Drug Interaction Checker** | Ask "Can I take ibuprofen with aspirin?" — checks for dangerous combinations. |
| **4-7-8 Breathing Exercise** | Animated guided breathing — triggered automatically when stress is detected. |

### 🍽️ Nutrition
| Tool | What it does |
|------|--------------|
| **Food Nutrition Lookup** | "How many calories in dal?" — real data from Open Food Facts API. |
| **7-Day Meal Planner** | Always returns a **full 7-day** Indian meal plan (no partials). Supports veg, non-veg, vegan, high-protein/muscle-building, weight-loss, and diabetic-friendly goals. Calorie rings, macro bars, and expandable meals. |
| **Water Intake Tracker** | Log water, track daily goal progress, view intake history. |

### 💊 Medications
- **Smart reminders** — "Remind me to take metformin tonight at 9 PM" sets a real notification.
- **Browser notifications** — fires at the exact time with a voice alert.
- **Natural language parsing** — understands "remind me", "set a reminder for", typos like "remaind", medicine names, time words like "morning/evening/tonight".
- **Reminder management** — view and delete all active reminders from the Meds page.

### 📅 Appointments
- Book and manage doctor appointments through voice commands.

### 🏥 Doctor Finder
- GPS-based nearby clinic/hospital search using OpenStreetMap (Overpass API).
- Auto-retries with city fallback if GPS is unavailable.
- Direct Google Maps links for each result.
- Guarded intent: greetings like “Good morning doctor…” won’t trigger doctor search.

### 📊 Dashboard
- Session stats: turn count, average response latency, API call count.
- Mood timeline — tracks your emotional state across the conversation.
- Live performance metrics.

### 🚨 Safety First
Hard-coded emergency detection — no LLM involved:
- **Chest pain / can't breathe** → Immediate "Call 112" response.
- **Mental health crisis** → Directs to iCall (9152987821).
- **High fever in children** → Doctor referral.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite 5 + Tailwind CSS |
| **Speech Input (STT)** | Web Speech API (browser-native, Chrome) |
| **LLM Brain** | Groq Cloud — `llama-3.3-70b-versatile` |
| **Speech Output (TTS)** | Web Speech Synthesis API (browser-native, chunked) |
| **Emotion Detection** | HuggingFace — `j-hartmann/emotion-english-distilroberta-base` |
| **Nutrition Data** | Open Food Facts API |
| **Weather** | OpenWeatherMap API |
| **Doctor Finder** | OpenStreetMap Overpass API + Nominatim |
| **Drug Interactions** | OpenFDA API |
| **Meal Planning** | Groq LLM (Indian nutritionist persona) — enforces 7-day output |
| **Reminders Storage** | localStorage (mock) + Firebase Firestore (optional) |
| **Deployment** | Vercel |

---

## 🚀 Quick Start

### 1) Clone the repo
```bash
git clone https://github.com/Shubham2025-ai/voicewell-ai.git
cd voicewell-ai
```

### 2) Install dependencies
```bash
npm install
```

### 3) Configure environment variables
```bash
cp .env.example .env
```
Edit `.env`:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here        # required
VITE_HF_API_KEY=your_huggingface_api_key_here   # optional (emotion)
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here  # optional (weather)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```
Get a free Groq key at https://console.groq.com.

### 4) Run the dev server
```bash
npm run dev
```
Open http://localhost:5173 in **Chrome** (Web Speech API).

---

## 📁 Project Structure

```
voicewell-ai/
├── src/
│   ├── App.jsx                    # Central orchestrator — routes all voice queries
│   ├── main.jsx                   # React entry point
│   │
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── HomePage.jsx           # Hero + chat; accessibility: aria-live/labels
│   │   ├── HealthPage.jsx
│   │   ├── NutritionPage.jsx
│   │   ├── MedicationsPage.jsx
│   │   ├── AppointmentsPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ChatBubble.jsx         # aria-live, clarifier chips, TTS/copy buttons
│   │   ├── MealPlanCard.jsx
│   │   ├── BMICard.jsx
│   │   ├── DrugInteractionCard.jsx
│   │   ├── DoctorFinderCard.jsx
│   │   ├── AppointmentCard.jsx
│   │   ├── WaterCard.jsx
│   │   ├── BreathingExercise.jsx
│   │   ├── MicButton.jsx          # aria-label + status role
│   │   ├── SessionSummary.jsx
│   │   └── Waveform.jsx
│   │
│   ├── hooks/
│   │   ├── useSpeech.js           # Web Speech API STT
│   │   ├── useTTS.js              # TTS with smart chunking
│   │   ├── useGroq.js             # Groq LLM with emotion-aware prompt
│   │   ├── useEmotion.js
│   │   ├── useReminders.js
│   │   ├── useMealPlanner.js      # Enforced 7-day plans; goal/diet detection
│   │   ├── useNutrition.js
│   │   ├── useWaterIntake.js
│   │   ├── useWeather.js
│   │   ├── useDrugInteraction.js
│   │   ├── useBMI.js
│   │   ├── useDoctorFinder.js
│   │   └── useAppointment.js
│   │
│   └── utils/
│       └── helpers.js             # Time formatting, Hindi detection
│
├── public/
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🌐 Deployment

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```
Add env vars in Vercel → Project → Settings → Environment Variables.

One-click deploy:  
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Shubham2025-ai/voicewell-ai)

### Build for production
```bash
npm run build
npm run preview
```

---

## 🗣️ Example Voice Commands

```
"I have a fever and cold since yesterday"
"My weight is 70kg and height is 5 feet 8 inches"
"Can I take ibuprofen with aspirin?"
"Remind me to take vitamin D at 8 AM"
"Plan my vegetarian meals for the week"
"Plan a high protein non-veg diet for muscle building"
"How many calories in 2 chapati?"
"I drank 500ml of water"
"Find a hospital near me"
"What's the weather in Mumbai?"
"Give me a session summary"
"मुझे बुखार है"  (Hindi: "I have a fever")
```

---

## ⚠️ Important Notes

- **Chrome only** — Firefox/Safari lack Web Speech API; a warning is shown on unsupported browsers.
- **Mic permission** — allow microphone access when prompted.
- **HTTPS required** — works on HTTPS or localhost.
- **Not a medical device** — for general information only; consult a doctor for serious concerns.
- **No audio stored** — raw voice never leaves your browser; only text is sent to Groq.

---

## 🔑 API Keys Reference

| Key | Where to get it | Required? |
|-----|-----------------|-----------|
| `VITE_GROQ_API_KEY` | https://console.groq.com | ✅ Yes |
| `VITE_HF_API_KEY` | https://huggingface.co/settings/tokens | Optional (emotion) |
| `VITE_OPENWEATHER_API_KEY` | https://openweathermap.org/api | Optional (weather) |
| Firebase keys | https://console.firebase.google.com | Optional (reminders cloud sync) |

---

## 🏗️ Architecture

```
User Voice Input
      │
      ▼
Web Speech API (STT)
      │
      ▼
App.jsx — Intent Router
      │
      ├── Emergency? ─────────────► Hard-coded safe response (112 / iCall)
      ├── Breathing exercise? ────► BreathingExercise component
      ├── Reminder? ──────────────► useReminders → localStorage / Firebase
      ├── BMI query? ─────────────► useBMI (pure calculation)
      ├── Drug interaction? ─────► useDrugInteraction → OpenFDA API
      ├── Nutrition? ─────────────► useNutrition → Open Food Facts API
      ├── Water intake? ─────────► useWaterIntake (session state)
      ├── Meal plan? ─────────────► useMealPlanner → Groq (enforced 7-day JSON)
      ├── Doctor finder? ─────────► useDoctorFinder → OpenStreetMap API
      ├── Weather? ───────────────► useWeather → OpenWeatherMap API
      └── Everything else ────────► useGroq → LLaMA 3.3 70B
                                         │
                                   Emotion detection (HF)
                                         │
                                   Emotion-aware system prompt
                                         │
                                   LLM response
      │
      ▼
ChatBubble + Rich Card (MealPlanCard / BMICard / etc.) — aria-live
      │
      ▼
Web Speech Synthesis (TTS)
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo  
2. Create a feature branch (`git checkout -b feature/amazing-feature`)  
3. Commit your changes (`git commit -m 'Add amazing feature'`)  
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request  

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

<div align="center">

Built with ❤️ for **Hackathon 2026 — AI Voice Agents Track**

[🚀 Try it live](https://voicewell-ai.vercel.app/) · [🐛 Report a bug](https://github.com/Shubham2025-ai/voicewell-ai/issues) · [💡 Request a feature](https://github.com/Shubham2025-ai/voicewell-ai/issues)

</div>