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
- **Real-time speech-to-text** via the Web Speech API — speak naturally, see your words appear live
- **Text-to-speech responses** — the AI speaks back to you, with smart chunking to avoid browser TTS cutoffs
- **Bilingual** — English and Hindi auto-detected; toggle manually at any time
- **Emotion detection** — HuggingFace AI reads your emotional state and adapts the AI's tone (stressed → gentle, sad → empathetic, happy → upbeat)
- **Conversation memory** — last 10 messages sent to the LLM for full context awareness
- **Session summary** — generate an overview of your entire health conversation

### 🩺 Health Tools
| Tool | What it does |
|------|-------------|
| **Symptom Checker** | Tap any symptom card (fever, headache, nausea, body pain, anxiety, breathing) — get instant AI assessment with home remedies + OTC medicine suggestions |
| **BMI Calculator** | Speak your height and weight — get your BMI, category, and personalised health tips |
| **Drug Interaction Checker** | Ask "Can I take ibuprofen with aspirin?" — checks for dangerous combinations |
| **4-7-8 Breathing Exercise** | Animated guided breathing — triggered automatically when stress is detected |

### 🍽️ Nutrition
| Tool | What it does |
|------|-------------|
| **Food Nutrition Lookup** | "How many calories in dal?" — real data from Open Food Facts API |
| **7-Day Meal Planner** | "Plan my vegetarian meals for the week" — AI generates a full Indian meal plan with calorie rings, macro bars (protein/carbs/fat), and expandable meal details |
| **Water Intake Tracker** | Log water, track daily goal progress, view intake history |

### 💊 Medications
- **Smart reminders** — "Remind me to take metformin tonight at 9 PM" sets a real notification
- **Browser notifications** — fires at the exact time with a voice alert
- **Natural language parsing** — understands "remind me", "set a reminder for", typos like "remaind", medicine names, time words like "morning/evening/tonight"
- **Reminder management** — view and delete all active reminders from the Meds page

### 📅 Appointments
- Book and manage doctor appointments through voice commands

### 🏥 Doctor Finder
- GPS-based nearby clinic/hospital search using OpenStreetMap (Overpass API)
- Auto-retries with city fallback if GPS is unavailable
- Direct Google Maps links for each result

### 📊 Dashboard
- Session stats: turn count, average response latency, API call count
- Mood timeline — tracks your emotional state across the conversation
- Live performance metrics

### 🚨 Safety First
Hard-coded emergency detection — no LLM involved:
- **Chest pain / can't breathe** → Immediate "Call 112" response
- **Mental health crisis** → Directs to iCall (9152987821)
- **High fever in children** → Doctor referral

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite 5 + Tailwind CSS |
| **Speech Input (STT)** | Web Speech API (browser-native, Chrome) |
| **LLM Brain** | Groq Cloud — `llama-3.3-70b-versatile` |
| **Speech Output (TTS)** | Web Speech Synthesis API (browser-native, chunked) |
| **Emotion Detection** | HuggingFace — `j-hartmann/emotion-english-distilroberta-base` |
| **Nutrition Data** | Open Food Facts API (free, no key needed) |
| **Weather** | OpenWeatherMap API |
| **Doctor Finder** | OpenStreetMap Overpass API + Nominatim (free, no key needed) |
| **Drug Interactions** | OpenFDA API (free, no key needed) |
| **Meal Planning** | Groq LLM (Indian nutritionist persona) |
| **Reminders Storage** | localStorage (mock) + Firebase Firestore (optional) |
| **Deployment** | Vercel |

---

## 🚀 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/Shubham2025-ai/voicewell-ai.git
cd voicewell-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Open `.env` and fill in your keys:

```env
# Required
VITE_GROQ_API_KEY=your_groq_api_key_here

# Optional — enables emotion detection
VITE_HF_API_KEY=your_huggingface_api_key_here

# Optional — enables weather feature
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here

# Optional — enables cloud reminder sync (Firebase)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

> Get your free Groq API key at [console.groq.com](https://console.groq.com) — no credit card needed.

### 4. Run the dev server
```bash
npm run dev
```

Open **http://localhost:5173** in **Chrome** (Chrome required for Web Speech API).

---

## 📁 Project Structure

```
voicewell-ai/
├── src/
│   ├── App.jsx                    # Central orchestrator — routes all voice queries
│   ├── main.jsx                   # React entry point
│   │
│   ├── components/
│   │   ├── Header.jsx             # Glassmorphism navbar with page navigation
│   │   ├── HomePage.jsx           # Hero landing + chat interface
│   │   ├── HealthPage.jsx         # Symptom checker + health tools grid
│   │   ├── NutritionPage.jsx      # Food lookup + water tracker
│   │   ├── MedicationsPage.jsx    # Reminders management
│   │   ├── AppointmentsPage.jsx   # Appointment booking
│   │   ├── DashboardPage.jsx      # Session stats + mood timeline
│   │   │
│   │   ├── ChatBubble.jsx         # Message bubbles with typing animation
│   │   ├── MealPlanCard.jsx       # 7-day plan with calorie ring + macro bars
│   │   ├── BMICard.jsx            # BMI result with category + tips
│   │   ├── DrugInteractionCard.jsx# Drug safety result card
│   │   ├── DoctorFinderCard.jsx   # Nearby clinics with map links
│   │   ├── AppointmentCard.jsx    # Appointment confirmation card
│   │   ├── WaterCard.jsx          # Water intake progress card
│   │   ├── BreathingExercise.jsx  # Animated 4-7-8 breathing guide
│   │   ├── MicButton.jsx          # Animated microphone button
│   │   ├── EmotionBadge.jsx       # Live emotion indicator
│   │   ├── SessionSummary.jsx     # Conversation summary card
│   │   ├── MoodTimeline.jsx       # Emotion history chart
│   │   └── Waveform.jsx           # Audio visualizer bars
│   │
│   ├── hooks/
│   │   ├── useSpeech.js           # Web Speech API — STT with interim results
│   │   ├── useTTS.js              # Text-to-speech with smart chunking + voice selection
│   │   ├── useGroq.js             # Groq LLM with emotion-aware system prompt
│   │   ├── useEmotion.js          # HuggingFace emotion detection + keyword fallback
│   │   ├── useReminders.js        # Medication reminders + browser notifications
│   │   ├── useMealPlanner.js      # AI 7-day meal plan generation
│   │   ├── useNutrition.js        # Food nutrition lookup
│   │   ├── useWaterIntake.js      # Daily water tracking
│   │   ├── useWeather.js          # Weather queries
│   │   ├── useDrugInteraction.js  # OpenFDA drug safety checks
│   │   ├── useBMI.js              # BMI calculation from natural language
│   │   ├── useDoctorFinder.js     # GPS-based clinic search with city fallback
│   │   └── useAppointment.js      # Appointment booking logic
│   │
│   └── utils/
│       └── helpers.js             # Time formatting, Hindi detection
│
├── public/
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
│
├── .env.example                   # Environment variable template
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## 🌐 Deployment

### Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel --prod
```

Then add your environment variables in the **Vercel dashboard** under Project → Settings → Environment Variables.

Or use the one-click deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Shubham2025-ai/voicewell-ai)

### Build for production
```bash
npm run build      # outputs to /dist
npm run preview    # preview the production build locally
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

- **Chrome only** — Firefox and Safari do not support the Web Speech API. The app shows a warning on unsupported browsers.
- **Mic permission** — Chrome will request microphone access on first use. Click "Allow".
- **HTTPS required** — Voice features only work on HTTPS or localhost. Vercel handles this automatically.
- **Not a medical device** — VoiceWell provides general health information and is not a substitute for professional medical advice. Always consult a doctor for serious health concerns.
- **No audio stored** — Raw voice audio never leaves your browser. Only the text transcript is sent to Groq's API.

---

## 🔑 API Keys Reference

| Key | Where to get it | Required? |
|-----|----------------|-----------|
| `VITE_GROQ_API_KEY` | [console.groq.com](https://console.groq.com) | ✅ Yes |
| `VITE_HF_API_KEY` | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | Optional (falls back to keyword detection) |
| `VITE_OPENWEATHER_API_KEY` | [openweathermap.org/api](https://openweathermap.org/api) | Optional (weather feature only) |
| Firebase keys | [console.firebase.google.com](https://console.firebase.google.com) | Optional (reminders use localStorage fallback) |

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
      ├── Emergency? ──────────────────► Hard-coded safe response (112 / iCall)
      ├── Breathing exercise? ─────────► BreathingExercise component
      ├── Reminder? ───────────────────► useReminders → localStorage / Firebase
      ├── BMI query? ──────────────────► useBMI (pure calculation)
      ├── Drug interaction? ───────────► useDrugInteraction → OpenFDA API
      ├── Nutrition? ──────────────────► useNutrition → Open Food Facts API
      ├── Water intake? ───────────────► useWaterIntake (session state)
      ├── Meal plan? ──────────────────► useMealPlanner → Groq API (JSON plan)
      ├── Doctor finder? ──────────────► useDoctorFinder → OpenStreetMap API
      ├── Weather? ────────────────────► useWeather → OpenWeatherMap API
      └── Everything else ─────────────► useGroq → Groq LLaMA 3.3 70B
                                              │
                                        Emotion detection
                                        (HuggingFace, parallel)
                                              │
                                        Emotion-aware system prompt
                                              │
                                        LLM response
      │
      ▼
ChatBubble + Rich Card (MealPlanCard / BMICard / etc.)
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