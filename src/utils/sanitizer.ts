/**
 * Edge PII & Security Sanitizer
 * Redacts sensitive personal and financial identifiers BEFORE inputs are transmitted to the LLM.
 * Implements psychological urgency and scam heuristics for zero-latency edge detection.
 */

export interface SanitizerOutput {
  sanitizedText: string;
  piiDetected: boolean;
  redactedCount: number;
  detectedUrgencySignals: string[];
  isHighUrgency: boolean;
}

export function sanitizeEdgePII(rawText: string): SanitizerOutput {
  if (!rawText) {
    return {
      sanitizedText: '',
      piiDetected: false,
      redactedCount: 0,
      detectedUrgencySignals: [],
      isHighUrgency: false,
    };
  }

  let text = rawText;
  let redactedCount = 0;

  // 1. Bank Account / 16-Digit Credit Card Formats (Mask first to prevent phone overlap)
  const cardRegex = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g;
  const cardMatches = text.match(cardRegex);
  if (cardMatches) {
    redactedCount += cardMatches.length;
    text = text.replace(cardRegex, '[CARD_ACCOUNT_MASKED]');
  }

  // 2. Aadhaar Numbers (Indian 12-digit format: 1234 5678 9012)
  const aadhaarRegex = /\b\d{4}\s\d{4}\s\d{4}\b/g;
  const aadhaarMatches = text.match(aadhaarRegex);
  if (aadhaarMatches) {
    redactedCount += aadhaarMatches.length;
    text = text.replace(aadhaarRegex, '[AADHAAR_REDACTED]');
  }

  // 3. SSN Numbers (US 9-digit format: 123-45-6789)
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  const ssnMatches = text.match(ssnRegex);
  if (ssnMatches) {
    redactedCount += ssnMatches.length;
    text = text.replace(ssnRegex, '[SSN_REDACTED]');
  }

  // 4. Phone Numbers (US, Indian, and International formats)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
  const phoneMatches = text.match(phoneRegex);
  if (phoneMatches) {
    redactedCount += phoneMatches.length;
    text = text.replace(phoneRegex, '[PHONE_REDACTED]');
  }

  // 5. Email Addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = text.match(emailRegex);
  if (emailMatches) {
    redactedCount += emailMatches.length;
    text = text.replace(emailRegex, '[EMAIL_REDACTED]');
  }

  // 6. UPI ID format (e.g., payment@okaxis)
  const upiRegex = /[a-zA-Z0-9.\-_]{2,50}@(okaxis|okhdfcbank|okicici|paytm|upi|ybl)/gi;
  const upiMatches = text.match(upiRegex);
  if (upiMatches) {
    redactedCount += upiMatches.length;
    text = text.replace(upiRegex, '[UPI_HANDLE_REDACTED]');
  }

  // Detect Psychological Urgency & Regional Threat Patterns
  const urgencyKeywords = [
    '2 hours left',
    '45 minutes',
    'in 2 hours',
    'shutoff in',
    'shut off',
    'electricity cut',
    'power cut',
    'account suspended',
    'police arrest',
    'arrest warrant',
    'unpaid balance',
    'disconnect notice',
    'wire money',
    'gift card',
    'share otp',
    'immediate action',
    'final warning',
    'within 24 hours',

    // US Federal Impersonation & Senior Scams
    'irs audit',
    'internal revenue service',
    'social security suspended',
    'social security number suspended',
    'medicare refund',
    'federal warrant',
    'target gift card',
    'wire transfer immediately',
    'zelle payment required',

    // South Asian Utility & Bank KYC Scams
    'तुरंत',
    'काट दी जाएगी',
    'बिजली बिल बकाया',
    'बिजली काट',
    'विद्युत विच्छेदन',
    'खाता बंद',
    'खाता ब्लॉक',
    'केवाईसी अपडेट',
    'आधार लिंक',
    'गिरफ्तारी',
    'ओटीपी शेयर',
    'ओटीपी बताएं',
    'kyc blocked',
    'bank account blocked',
    'account blocked in 2 hours',

    // Japanese Impersonation & Pension Scams
    '送電停止',
    '未払い',
    '口座凍結',
    '本日中に',
    '緊急連絡',
    '年金還付金',
    '還付金',
    'マイナンバー停止',
    '受給資格停止',
    '東京電力停止',
    '法的措置'
  ];

  const detectedUrgencySignals: string[] = [];
  const lowerText = rawText.toLowerCase();

  for (const keyword of urgencyKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      detectedUrgencySignals.push(keyword);
    }
  }

  return {
    sanitizedText: text,
    piiDetected: redactedCount > 0,
    redactedCount,
    detectedUrgencySignals,
    isHighUrgency: detectedUrgencySignals.length > 0,
  };
}
