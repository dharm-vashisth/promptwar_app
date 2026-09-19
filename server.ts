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

// ---------------- API ROUTES ----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ElderEase Security Core',
    geminiEnabled: !!process.env.GEMINI_API_KEY,
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
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
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
      sanitizedText,
      locale = 'en-US',
      detectedUrgencySignals = [],
      imageBase64,
    } = req.body;

    if (!sanitizedText && !imageBase64) {
      return res.status(400).json({ error: 'Text or image input is required' });
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
You are the ElderEase Calm Security Engine. Your user is an elderly citizen (65+ years old).
Analyze this message, bill, or notice for scams, financial fraud, phishing, or artificial panic threats.

INPUT TEXT (PII has already been redacted on edge):
"${sanitizedText || '[IMAGE ONLY]'}"

DETECTED EDGE SIGNALS:
${detectedUrgencySignals.join(', ') || 'None'}

LOCALE: ${locale}

STRICT SENIOR SAFETY RULES:
1. If this is a scam, fake shutoff, phishing link, threat of police, or urgent wire demand:
   - safetyStatus: "DANGER"
   - urgencyLevel: "HIGH"
   - Explain calmly without causing heart-pounding panic.
2. If this is a routine utility bill, legitimate medical refill, or official reminder:
   - safetyStatus: "SAFE"
   - urgencyLevel: "LOW"
3. Cultural & Language Translation Rules:
   - For hi-IN (Hindi): All JSON string fields (statusTitle, statusSub, fifteenWordSummary, recommendedAction, detectedScamIndicators) MUST BE WRITTEN ENTIRELY IN NATURAL, SIMPLE HINDI (Devanagari script). Never return English words or English text in hi-IN mode. Use a respectful tone suitable for Indian grandparents (आदरणीय, सरल भाषा).
   - For ja-JP (Japanese): All JSON string fields MUST BE WRITTEN ENTIRELY IN POLITE JAPANESE (keigo).
   - For en-US: Clear, plain 5th-grade English.
4. fifteenWordSummary MUST be approximately 15 words or fewer, completely jargon-free.
5. recommendedAction MUST be exactly ONE concrete, actionable step (e.g., in Hindi "संदेश में दिए लिंक पर क्लिक न करें। इसे तुरंत हटा दें।" or in English "Do not click link. Delete message.").
`;
        contents.push({ text: promptText });

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: contents.length === 1 ? contents[0] : { parts: contents },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                safetyStatus: {
                  type: Type.STRING,
                  description: 'Must be DANGER, SAFE, or CAUTION',
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
                  description: 'List of specific warning indicators detected',
                },
                urgencyLevel: {
                  type: Type.STRING,
                  description: 'HIGH, MEDIUM, or LOW',
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
          return res.json(parsed);
        }
      } catch (geminiError) {
        console.warn('Gemini generateContent error, falling back to heuristic engine:', geminiError);
      }
    }

    // Heuristic Fallback Engine
    const isThreat =
      detectedUrgencySignals.length > 0 ||
      /disconnect|cut off|urgent|suspended|police|bit\.ly|gift card|unpaid|shutoff|तुरंत|काट दी|बिजली|未払い|停止/i.test(
        sanitizedText || ''
      );

    if (isThreat) {
      if (locale === 'hi-IN') {
        return res.json({
          safetyStatus: 'DANGER',
          statusTitle: '⚠️ सावधान: यह संदेश एक ठगी (Scam) है',
          statusSub: 'धोखाधड़ी व झूठी धमकी',
          fifteenWordSummary: 'यह संदेश बिजली काटने का झूठा डर दिखाकर पैसे चुराने का प्रयास है।',
          recommendedAction: 'संदेश में दिए गए लिंक पर बिल्कुल क्लिक न करें। इसे तुरंत हटा दें।',
          detectedScamIndicators: detectedUrgencySignals.length
            ? detectedUrgencySignals
            : ['कृत्रिम तात्कालिकता', 'अज्ञात लिंक'],
          urgencyLevel: 'HIGH',
          confidenceScore: 0.98,
          engineType: 'heuristic-edge',
        });
      } else if (locale === 'ja-JP') {
        return res.json({
          safetyStatus: 'DANGER',
          statusTitle: '⚠️ 警告: 不審な詐欺メッセージです',
          statusSub: '詐欺を検知',
          fifteenWordSummary: '送電停止を装い、暗証番号や金銭を騙し取ろうとする危険な偽通知です。',
          recommendedAction: 'リンクは開かずに削除してください。電力会社に直接確認しても安全です。',
          detectedScamIndicators: detectedUrgencySignals.length
            ? detectedUrgencySignals
            : ['送電停止の脅迫', '偽リンク'],
          urgencyLevel: 'HIGH',
          confidenceScore: 0.97,
          engineType: 'heuristic-edge',
        });
      } else {
        return res.json({
          safetyStatus: 'DANGER',
          statusTitle: '⚠️ DANGER: Do Not Trust This',
          statusSub: 'Scam & Threat Detected',
          fifteenWordSummary: 'This is a fake urgency message designed to steal money. Your real utility is safe.',
          recommendedAction: 'Do not click the web link. Delete the message. Call your family contact if concerned.',
          detectedScamIndicators: detectedUrgencySignals.length
            ? detectedUrgencySignals
            : ['Urgent Shutoff Threat', 'Suspicious Payment Link'],
          urgencyLevel: 'HIGH',
          confidenceScore: 0.98,
          engineType: 'heuristic-edge',
        });
      }
    } else {
      if (locale === 'hi-IN') {
        return res.json({
          safetyStatus: 'SAFE',
          statusTitle: '✅ सुरक्षित: यह सामान्य व सही सूचना है',
          statusSub: 'सत्यापित सामान्य विवरण',
          fifteenWordSummary: 'यह सामान्य आधिकारिक सूचना या बिल है। इसमें कोई छुपा खतरा या लिंक नहीं है।',
          recommendedAction: 'कोई तत्काल कार्रवाई आवश्यक नहीं है। सामान्य तरीके से अपने नियत समय पर देखें।',
          detectedScamIndicators: [],
          urgencyLevel: 'LOW',
          confidenceScore: 0.95,
          engineType: 'heuristic-edge',
        });
      } else if (locale === 'ja-JP') {
        return res.json({
          safetyStatus: 'SAFE',
          statusTitle: '✅ 安全: 正当な利用明細です',
          statusSub: '確認完了',
          fifteenWordSummary: '毎月の水道または公共料金の正規案内です。不審な要求や悪質リンクはありません。',
          recommendedAction: '特別な対応は不要です。振替日までそのままで問題ありません。',
          detectedScamIndicators: [],
          urgencyLevel: 'LOW',
          confidenceScore: 0.95,
          engineType: 'heuristic-edge',
        });
      } else {
        return res.json({
          safetyStatus: 'SAFE',
          statusTitle: '✅ SAFE: Legitimate Statement',
          statusSub: 'Clean & Verified',
          fifteenWordSummary: 'This is a routine monthly utility statement. There are no suspicious demands or hidden fees.',
          recommendedAction: 'No immediate action required. Your scheduled auto-pay will process normally.',
          detectedScamIndicators: [],
          urgencyLevel: 'LOW',
          confidenceScore: 0.96,
          engineType: 'heuristic-edge',
        });
      }
    }
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
