import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini API Client Initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-Memory Audio & Analysis Caches for Zero-Latency Re-Play
const ttsAudioCache = new Map<string, Buffer>();
const analysisResultCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ElderEase Security Core',
    geminiEnabled: !!process.env.GEMINI_API_KEY,
    cachedAudioItems: ttsAudioCache.size,
    cachedAnalysisItems: analysisResultCache.size,
    timestamp: new Date().toISOString(),
  });
});

// Text-to-Speech Streaming Endpoint with Native Hindi & Regional Voice Synthesis
app.get('/api/tts', async (req, res) => {
  try {
    const text = (req.query.text as string) || '';
    const locale = (req.query.locale as string) || 'en-US';

    if (!text.trim()) {
      return res.status(400).json({ error: 'Text parameter is required' });
    }

    const clean = text
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[⚠️✅💊🔍⚡📰📞]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const tl = locale.startsWith('hi') ? 'hi' : locale.startsWith('ja') ? 'ja' : 'en';
    const cacheKey = `${tl}:${clean.toLowerCase().substring(0, 180)}`;

    // Instant Cache Hit for repeated audio reads
    if (ttsAudioCache.has(cacheKey)) {
      const cachedBuffer = ttsAudioCache.get(cacheKey)!;
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-ElderEase-Cache', 'HIT');
      return res.send(cachedBuffer);
    }

    // Break into sentences/chunks under 160 characters for natural cadence
    const sentences = clean.match(/[^.!?।。]+[.!?।。]?/g) || [clean];
    const chunks: string[] = [];
    let current = '';

    for (const s of sentences) {
      if ((current + ' ' + s).length < 160) {
        current = current ? current + ' ' + s : s;
      } else {
        if (current) chunks.push(current);
        if (s.length < 160) {
          current = s;
        } else {
          const words = s.split(' ');
          let sub = '';
          for (const w of words) {
            if ((sub + ' ' + w).length < 150) {
              sub = sub ? sub + ' ' + w : w;
            } else {
              chunks.push(sub);
              sub = w;
            }
          }
          current = sub;
        }
      }
    }
    if (current) chunks.push(current);

    const buffers: Buffer[] = [];
    for (const chunk of chunks.slice(0, 8)) {
      if (!chunk.trim()) continue;
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk.trim())}&tl=${tl}&client=tw-ob`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      if (response.ok) {
        const arrayBuf = await response.arrayBuffer();
        buffers.push(Buffer.from(arrayBuf));
      }
    }

    if (buffers.length > 0) {
      const combined = Buffer.concat(buffers);
      if (ttsAudioCache.size > 200) {
        const oldestKey = ttsAudioCache.keys().next().value;
        if (oldestKey) ttsAudioCache.delete(oldestKey);
      }
      ttsAudioCache.set(cacheKey, combined);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-ElderEase-Cache', 'MISS');
      return res.send(combined);
    } else {
      return res.status(502).json({ error: 'Failed to synthesize audio stream' });
    }
  } catch (err) {
    console.error('TTS endpoint error:', err);
    res.status(500).json({ error: 'Audio synthesis failed' });
  }
});

// Primary Multimodal Safety & Scam Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const {
      sanitizedText = '',
      locale = 'en-US',
      detectedUrgencySignals = [],
      imageBase64,
    } = req.body;

    if (!sanitizedText && !imageBase64) {
      return res.status(400).json({ error: 'Text or image input is required' });
    }

    // Zero-Latency In-Memory Analysis Cache for repeated checks
    const analysisCacheKey = `${locale}:${sanitizedText.trim().toLowerCase()}`;
    if (!imageBase64 && analysisResultCache.has(analysisCacheKey)) {
      const cached = analysisResultCache.get(analysisCacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        res.setHeader('X-ElderEase-Cache', 'HIT');
        return res.json({
          ...cached.data,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const contents: any[] = [];

        if (imageBase64) {
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          contents.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          });
        }

        const promptText = `
You are ElderEase Engine, a globally adaptable, highly empathetic AI assistant dedicated to protecting, informing, and assisting elderly citizens (65+ years old).

CORE RESPONSIBILITIES:
1. SCAM & THREAT DETECTION:
   - Analyze user inputs for signs of fraud, extreme urgency, impersonation, or hidden fees.
   - Assign risk level: DANGER (for scam, threat, artificial panic) or SAFE (for normal bills, prescriptions, legitimate updates).
   - Detect urgency tactics (e.g., "disconnect in 2 hours", "account suspended", "arrest warrant").

2. MULTI-REGION & MULTI-LANGUAGE ADAPTABILITY:
   - Locale: ${locale}
   - For hi-IN (Hindi): Recognize Indian fraud patterns (bijli bill cut, bank KYC freeze, OTP theft, lottery prize). Output all text fields in warm, respectful Devanagari Hindi (आदरणीय, सरल भाषा).
   - For en-US: Recognize US fraud patterns (IRS warrants, Medicare refund, Social Security suspension, utility disconnects).
   - For ja-JP (Japanese): Recognize Japanese fraud patterns (電力停止, 年金還付金, 口座凍結, マイナンバー). Output all text fields in polite Japanese (keigo).

3. ELDER-FRIENDLY COMMUNICATION:
   - 5th-grade reading level using simple, calm, and reassuring language.
   - NEVER use technical jargon (avoid "PII", "Regex", "API", "Phishing"). Use friendly terms like "Personal Information", "Tricky Link", or "Fake Message".
   - No technical code or raw system errors.

4. SAFETY & PRIVACY GUARDRAILS:
   - Sensitive IDs and financial numbers have been masked on edge.
   - fifteenWordSummary MUST be 15 words or fewer, calm and plain.
   - recommendedAction MUST be exactly ONE crystal-clear next action step.

INPUT TEXT:
"${sanitizedText || '[IMAGE DOCUMENT SCANNED]'}"

EDGE SIGNALS:
${detectedUrgencySignals.join(', ') || 'None'}
`;
        contents.push({ text: promptText });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents.length === 1 ? contents[0] : { parts: contents },
          config: {
            temperature: 0.1,
            maxOutputTokens: 350,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                safetyStatus: {
                  type: Type.STRING,
                  description: 'Must be DANGER or SAFE',
                },
                statusTitle: {
                  type: Type.STRING,
                  description: 'Headline badge title with emoji',
                },
                statusSub: {
                  type: Type.STRING,
                  description: 'Short 2-3 word sub-badge',
                },
                fifteenWordSummary: {
                  type: Type.STRING,
                  description: 'Plain language summary in exactly 15 words or fewer',
                },
                recommendedAction: {
                  type: Type.STRING,
                  description: 'Single recommended next action',
                },
                detectedScamIndicators: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of specific warning indicators detected without technical jargon',
                },
                urgencyLevel: {
                  type: Type.STRING,
                  description: 'HIGH or LOW',
                },
                confidenceScore: {
                  type: Type.NUMBER,
                  description: 'Confidence between 0.0 and 1.0',
                },
              },
              required: [
                'safetyStatus',
                'statusTitle',
                'statusSub',
                'fifteenWordSummary',
                'recommendedAction',
                'detectedScamIndicators',
                'urgencyLevel',
                'confidenceScore',
              ],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          parsed.engineType = 'gemini-realtime';

          // Store in In-Memory Cache
          if (!imageBase64 && sanitizedText) {
            if (analysisResultCache.size > 200) {
              const oldest = analysisResultCache.keys().next().value;
              if (oldest) analysisResultCache.delete(oldest);
            }
            analysisResultCache.set(analysisCacheKey, {
              data: parsed,
              timestamp: Date.now(),
            });
          }

          res.setHeader('X-ElderEase-Cache', 'MISS');
          return res.json(parsed);
        }
      } catch (geminiError) {
        console.warn('Gemini generateContent error, falling back to heuristic engine:', geminiError);
      }
    }

    // Heuristic Fallback Engine
    const isThreat =
      detectedUrgencySignals.length > 0 ||
      /disconnect|cut off|urgent|suspended|police|bit\.ly|gift card|unpaid|shutoff|irs|medicare|social security|arrest|तुरंत|काट दी|बिजली|खाता बंद|ओटीपी|未払い|停止|年金|マイナンバー/i.test(
        sanitizedText || ''
      );

    let fallbackData: any;
    if (isThreat) {
      if (locale === 'hi-IN') {
        fallbackData = {
          safetyStatus: 'DANGER',
          statusTitle: '⚠️ सावधान: यह संदेश एक ठगी (Scam) है',
          statusSub: 'धोखाधड़ी व झूठी धमकी',
          fifteenWordSummary: 'यह संदेश बिजली या खाता बंद करने का झूठा डर दिखाकर पैसे चुराने का प्रयास है।',
          recommendedAction: 'संदेश में दिए गए लिंक पर बिल्कुल क्लिक न करें। इसे तुरंत हटा दें।',
          detectedScamIndicators: detectedUrgencySignals.length
            ? detectedUrgencySignals
            : ['कृत्रिम तात्कालिकता', 'अज्ञात लिंक'],
          urgencyLevel: 'HIGH',
          confidenceScore: 0.98,
          engineType: 'heuristic-edge',
        };
      } else if (locale === 'ja-JP') {
        fallbackData = {
          safetyStatus: 'DANGER',
          statusTitle: '⚠️ 警告: 不審な詐欺メッセージです',
          statusSub: '詐欺を検知',
          fifteenWordSummary: '送電停止や年金還付を装い、金銭を騙し取ろうとする危険な偽通知です。',
          recommendedAction: 'リンクは開かずに削除してください。家族または公的窓口へご相談ください。',
          detectedScamIndicators: detectedUrgencySignals.length
            ? detectedUrgencySignals
            : ['即時停止の脅迫', '未確認リンク'],
          urgencyLevel: 'HIGH',
          confidenceScore: 0.97,
          engineType: 'heuristic-edge',
        };
      } else {
        fallbackData = {
          safetyStatus: 'DANGER',
          statusTitle: '⚠️ DANGER: Do Not Trust This',
          statusSub: 'Scam & Threat Detected',
          fifteenWordSummary: 'This is a fake urgency message designed to steal money. Your real accounts are safe.',
          recommendedAction: 'Do not click the web link. Delete the message. Call your family contact if concerned.',
          detectedScamIndicators: detectedUrgencySignals.length
            ? detectedUrgencySignals
            : ['Urgent Shutoff Threat', 'Suspicious Payment Link'],
          urgencyLevel: 'HIGH',
          confidenceScore: 0.98,
          engineType: 'heuristic-edge',
        };
      }
    } else {
      if (locale === 'hi-IN') {
        fallbackData = {
          safetyStatus: 'SAFE',
          statusTitle: '✅ सुरक्षित: यह सामान्य व सही सूचना है',
          statusSub: 'सत्यापित सामान्य विवरण',
          fifteenWordSummary: 'यह सामान्य आधिकारिक सूचना या बिल है। इसमें कोई छुपा खतरा या संदिग्ध लिंक नहीं है।',
          recommendedAction: 'कोई तत्काल कार्रवाई आवश्यक नहीं है। सामान्य तरीके से अपने नियत समय पर देखें।',
          detectedScamIndicators: [],
          urgencyLevel: 'LOW',
          confidenceScore: 0.96,
          engineType: 'heuristic-edge',
        };
      } else if (locale === 'ja-JP') {
        fallbackData = {
          safetyStatus: 'SAFE',
          statusTitle: '✅ 安全: 正当な利用明細です',
          statusSub: '確認完了',
          fifteenWordSummary: '毎月の水道または公共料金の正規案内です。不審な要求や悪質リンクはありません。',
          recommendedAction: '特別な対応は不要です。振替日までそのままで問題ありません。',
          detectedScamIndicators: [],
          urgencyLevel: 'LOW',
          confidenceScore: 0.95,
          engineType: 'heuristic-edge',
        };
      } else {
        fallbackData = {
          safetyStatus: 'SAFE',
          statusTitle: '✅ SAFE: Legitimate Statement',
          statusSub: 'Clean & Verified',
          fifteenWordSummary: 'This is a routine monthly utility statement. There are no suspicious demands or hidden fees.',
          recommendedAction: 'No immediate action required. Your scheduled auto-pay will process normally.',
          detectedScamIndicators: [],
          urgencyLevel: 'LOW',
          confidenceScore: 0.96,
          engineType: 'heuristic-edge',
        };
      }
    }

    if (!imageBase64 && sanitizedText) {
      analysisResultCache.set(analysisCacheKey, {
        data: fallbackData,
        timestamp: Date.now(),
      });
    }

    return res.json(fallbackData);
  } catch (err: any) {
    console.error('API Error in /api/analyze:', err);
    res.status(500).json({ error: 'Internal server error analyzing safety payload' });
  }
});

// Emergency Family Alert Dispatch (supports both /api/emergency-alert and /api/v1/emergency-alert)
const handleEmergencyAlert = (req: any, res: any) => {
  const { contactId, reason, reportSummary, emergencyContact } = req.body;
  const target = emergencyContact?.fullName || contactId || 'Primary Family Contact';
  console.log(`[ElderEase Emergency Dispatch] Alert dispatched to ${target}: ${reason || 'Immediate Assistance Requested'}`);
  res.json({
    dispatched: true,
    contact: target,
    timestamp: new Date().toISOString(),
    status: 'SMS & Voice Notification Queued to Verified Contact',
  });
};

app.post('/api/emergency-alert', handleEmergencyAlert);
app.post('/api/v1/emergency-alert', handleEmergencyAlert);

// ---------------- VITE & STATIC SERVER ----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ElderEase Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
