# ElderEase 🛡️👵👴

> **Multimodal, Culturally-Adaptive GenAI Companion & Real-Time Fraud Defense Shield for Senior Citizens (65+)**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev/)
[![Gemini 3.6 Flash](https://img.shields.io/badge/Gemini-3.6--Flash-orange?logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-11%2F11%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%20AAA-success)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 🌟 Executive Summary

Digital fraud targeting older adults causes tens of billions in annual losses globally. Typical cybersecurity tools and banking applications overwhelm seniors with complex jargon ("phishing", "PII", "SSL mismatch"), tiny alert banners, and high-anxiety notifications.

**ElderEase** re-engineers fraud prevention through a senior-first lens:
1. **The "Newspaper & Bedside Radio" Calm UI**: Physical-grade tactile aesthetics, generous whitespace, warm newsprint palette, and large high-contrast typography (no dark mode fatigue, no infinite scrolling, no nested menus).
2. **Real-Time Generative AI Fraud Detection**: Powered by **Google Gemini 3.6 Flash**, analyzing text messages, suspicious bills, and photo uploads in real time.
3. **Strict 3-Part Output Contract**: Every analysis yields an instant Red/Green safety badge, a plain-language summary under 15 words at a 5th-grade reading level, and exactly one unambiguous recommended action.
4. **Zero-Trust Edge PII Sanitizer**: Automatically masks bank card numbers, SSNs, Aadhaar IDs, phone numbers, and email addresses before data touches any remote AI pipeline.
5. **Culturally-Adaptive Multi-Locale & Native Audio**: Contextual threat intelligence and dual-engine regional speech streaming in **Hindi (`hi-IN`)**, **Japanese (`ja-JP`)**, and **English (`en-US`)**.

---

## 📸 Key Features

| Capability | Senior Benefit | Technical Architecture |
| :--- | :--- | :--- |
| **Multimodal Scam Scanner** | Checks text messages, utility bills, or screenshot uploads for fraudulent demands. | Express API (`/api/analyze`) + Gemini 3.6 Flash with JSON schema validation. |
| **Edge PII Redaction** | Guarantees personal information never leaves the device unmasked. | Regex-based edge scrubber (`sanitize_pii_edge`) redacting cards, IDs, and phone numbers. |
| **Dual-Engine Regional Speech** | Reads alerts and morning summaries aloud in natural native Hindi, Japanese, or English at a calm 0.86x pace. | Priority `/api/tts` neural audio streaming endpoint with seamless fallback to `window.speechSynthesis`. |
| **Morning Digest** | Displays weather, medication reminders, and a comforting daily reassurance card. | Localized morning news card with single-tap voice narration. |
| **Emergency Family Hotline** | Replaces complex contact books with high-contrast, single-tap dialer cards. | Simulated direct-call launcher with instant telephone link fallback (`tel:`) and caregiver notifications. |
| **Interactive Demo Hook** | Allows evaluators and family members to test urgent SMS scams with one click. | Built-in "Inject Scam SMS" preset simulator across all three locales. |

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    User([👵 Senior Citizen]) --> UI[ElderEase Web Client]
    
    subgraph Frontend [React 18 + Vite SPA]
        UI --> MView[Morning Digest View]
        UI --> SView[Multimodal Scanner View]
        UI --> FView[Family Hotline View]
        SView --> EdgeSanitizer[Client Edge PII Sanitizer]
        UI --> SpeechEng[SpeechEngine: Audio Stream + WebSpeech API]
    end

    subgraph Backend [Express 5 Server / Node.js]
        EdgeSanitizer --> APIAnalyze[/api/analyze]
        APIAnalyze --> GeminiEngine[Gemini 3.6 Flash / Google GenAI SDK]
        APIAnalyze --> FallbackEngine[Heuristic Urgency Rule Engine]
        UI --> APITTS[/api/tts Streaming Proxy]
        APITTS --> GoogleTTS[Neural Regional Speech Stream]
        UI --> APIHealth[/api/health]
    end

    subgraph AlternativeCore [Python Core / Optional Parity]
        BackendPy[backend/main.py: FastAPI + Pydantic v2]
    end
```

---

## 📂 Repository Directory Layout

```
.
├── backend/
│   └── main.py                     # Optional FastAPI parity backend for Python deployments
├── src/
│   ├── components/
│   │   ├── FamilyCard.tsx          # Single-tap family emergency phone dialer
│   │   ├── Masthead.tsx            # Newspaper-style header with date and language switcher
│   │   ├── MorningCard.tsx         # Calm daily brief (weather, medicine, peaceful note)
│   │   ├── NavigationBar.tsx       # 3-segment bedside radio station selector
│   │   ├── ResultCard.tsx          # High-contrast Red/Green alert card with GenAI badge
│   │   └── ScannerCard.tsx         # Multimodal document/text analyzer & camera upload
│   ├── services/
│   │   └── safetyService.ts        # Client API proxy with client-side PII sanitizer
│   ├── utils/
│   │   ├── i18n.ts                 # Trilingual dictionary (en-US, hi-IN, ja-JP)
│   │   ├── piiSanitizer.ts         # Edge regex scrubbing for Aadhaar, SSN, cards, phones
│   │   └── speech.ts               # Dual-engine TTS/STT speech coordinator
│   ├── App.tsx                     # Main application state and demo scam hook
│   ├── index.css                   # Tailwind CSS styling and tactile box shadows
│   ├── main.tsx                    # React DOM entrypoint
│   └── types.ts                    # TypeScript domain interfaces and type definitions
├── tests/
│   ├── test_frontend.test.tsx      # Comprehensive Vitest unit & integration test suite (11 tests)
│   └── test_backend.py             # Backend Python validation suite
├── index.html                      # Semantic HTML5 entry point with Newsreader & Plus Jakarta fonts
├── metadata.json                   # App manifest and major capabilities declaration
├── package.json                    # Dependencies, scripts, and build setup
├── server.ts                       # Production Express server hosting Gemini & TTS streaming
├── tsconfig.json                   # TypeScript compiler configuration
└── vite.config.ts                  # Vite build tooling with React plugin
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS 4.0, Lucide Icons, Vite
- **AI & Cloud Engine**: Google Gemini 3.6 Flash (`@google/genai` TypeScript SDK)
- **Backend Service**: Express 5.x with tsx runtime (development) & esbuild bundled CommonJS (production)
- **Alternative Backend**: Python 3.10+ with FastAPI, Pydantic v2, and google-genai
- **Testing**: Vitest, React Testing Library, `@testing-library/jest-dom`
- **Typography**: Newsreader (Editorial Serif) paired with Plus Jakarta Sans (High-legibility Grotesque)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/)

### 1. Installation
Clone the repository and install project dependencies:
```bash
git clone https://github.com/your-username/elderease.git
cd elderease
npm install
```

### 2. Environment Configuration
Create a `.env` file in the project root:
```bash
cp .env.example .env
```
Populate your Gemini API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Start Development Server
Launch the full-stack server (binds to port 3000):
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Running the Production Build
```bash
# Build production client bundle and compile server
npm run build

# Start production server
npm start
```

---

## 🧪 Automated Test Suite

ElderEase features an enterprise test suite verifying accessibility, ARIA roles, PII scrubbing, locale switching, Hindi speech synthesis, and real-time AI states:

```bash
# Run Vitest test runner
npm test
```

### Test Coverage Highlights:
- ✅ **Component Rendering**: Verifies the core App shell, tactile masthead, and navigation bar.
- ✅ **Tab Transitions**: Smooth switching between Morning Digest, Scam Scanner, and Family Hotline.
- ✅ **Accessibility & Ergonomics**: Minimum 48px touch targets, accessible labels (`aria-label`), and contrast compliance.
- ✅ **Safety Alert States**: Verified rendering of `DANGER` (Red, 15-word summary, action) and `SAFE` states.
- ✅ **Interactive Scam Hook**: End-to-end simulation of incoming SMS threat and automatic voice alert.
- ✅ **Hindi Regional Speech**: Tests locale switching to `hi-IN` and verifies speech engine invocation with localized Hindi strings.
- ✅ **Real-Time Gemini AI Badge**: Confirms the GenAI badge is displayed on analyzed result cards.

---

## 📡 REST API Reference

### 1. Document & Scam Safety Analysis
Analyzes text or uploaded images for fraud, urgency manipulation, and hidden fees.

- **URL**: `POST /api/analyze`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "sanitizedText": "Your electric power will be cut off in 2 hours! Click bit.ly/pay-now to pay bill immediately.",
    "locale": "en-US",
    "detectedUrgencySignals": ["cut off", "in 2 hours"],
    "imageBase64": "data:image/jpeg;base64,..."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "safetyStatus": "DANGER",
    "statusTitle": "⚠️ DANGER: Do Not Trust This",
    "statusSub": "Scam & Threat Detected",
    "fifteenWordSummary": "This is a fake urgency message designed to steal money. Your real utility is safe.",
    "recommendedAction": "Do not click the web link. Delete the message. Call your family contact if concerned.",
    "detectedScamIndicators": ["Urgent Shutoff Threat", "Suspicious Payment Link"],
    "urgencyLevel": "HIGH",
    "confidenceScore": 0.98,
    "engineType": "gemini-realtime"
  }
  ```

### 2. High-Fidelity Regional Speech Audio
Streams native audio for Hindi, Japanese, and English.

- **URL**: `GET /api/tts?text=<encoded_text>&locale=<locale>`
- **Response**: `audio/mpeg` binary audio stream with caching headers.

### 3. Service Health Check
- **URL**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "ElderEase Security Core",
    "geminiEnabled": true,
    "timestamp": "2026-09-19T07:12:20.907Z"
  }
  ```

---

## 🔒 Security & Privacy Architecture

ElderEase strictly implements **Privacy-by-Design**:
1. **Edge PII Redaction**: Phone numbers, credit cards, SSNs, and Aadhaar identifiers are intercepted and masked in the browser before network transmission.
2. **Zero Permanent Storage**: Incoming messages and uploaded photos are processed in memory and never stored in secondary databases or used for public model training.
3. **No Financial Credentials**: The application never asks for or stores credit card pins, banking passwords, or OTPs.
4. **Reassuring Transparency**: The result card explicitly informs the senior citizen that their personal details were shielded and kept confidential.

---

## 🌍 Supported Cultural Locales

| Locale Code | Language & Region | Cultural Scam Defense Focus | Spoken Accents |
| :--- | :--- | :--- | :--- |
| `en-US` | English (United States) | Medicare scams, fake utility shutoffs, IRS impersonation, delivery fraud. | Calm, reassuring conversational tone |
| `hi-IN` | Hindi (India) | Electricity disconnect fraud, WhatsApp lottery scams, fake Aadhaar/bank updates. | Respectful, clear Devanagari speech |
| `ja-JP` | Japanese (Japan) | Ore-ore sagi (family impersonation), electricity shutoff notices, Nenkin fraud. | Respectful Keigo (丁寧語) phrasing |

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  <b>ElderEase</b> — Protecting our elders with compassion, dignity, and cutting-edge AI.
</p>
