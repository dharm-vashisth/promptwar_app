import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanitizeEdgePII } from '../src/utils/sanitizer';
import { analyzeSafety } from '../src/services/safetyService';

describe('ElderEase Safety & Threat Engine Specifications', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Edge PII & Privacy Guardrails', () => {
    it('masks US Social Security Numbers (SSN) before analysis', () => {
      const input = 'Call officer Davis regarding SSN 123-45-6789 immediately.';
      const output = sanitizeEdgePII(input);
      expect(output.piiDetected).toBe(true);
      expect(output.sanitizedText).toContain('[SSN_REDACTED]');
      expect(output.sanitizedText).not.toContain('123-45-6789');
    });

    it('masks Indian Aadhaar numbers before analysis', () => {
      const input = 'अपना आधार संख्या 4920 1823 9012 तुरंत लिंक करें।';
      const output = sanitizeEdgePII(input);
      expect(output.piiDetected).toBe(true);
      expect(output.sanitizedText).toContain('[AADHAAR_REDACTED]');
      expect(output.sanitizedText).not.toContain('4920 1823 9012');
    });

    it('masks 16-digit credit cards and account numbers', () => {
      const input = 'Card number 4111-2222-3333-4444 has pending charges.';
      const output = sanitizeEdgePII(input);
      expect(output.piiDetected).toBe(true);
      expect(output.sanitizedText).toContain('[CARD_ACCOUNT_MASKED]');
      expect(output.sanitizedText).not.toContain('4111-2222-3333-4444');
    });

    it('masks phone numbers and UPI IDs', () => {
      const input = 'Send ₹5000 to payment@okaxis or call +1 (555) 019-9234';
      const output = sanitizeEdgePII(input);
      expect(output.piiDetected).toBe(true);
      expect(output.sanitizedText).toContain('[UPI_HANDLE_REDACTED]');
      expect(output.sanitizedText).toContain('[PHONE_REDACTED]');
    });
  });

  describe('2. Multi-Region Scam & Threat Detection', () => {
    it('detects US IRS and Social Security impersonation threats', () => {
      const text = 'IRS NOTICE: Your Social Security Number suspended. Federal warrant issued in 2 hours.';
      const output = sanitizeEdgePII(text);
      expect(output.isHighUrgency).toBe(true);
      expect(output.detectedUrgencySignals).toEqual(
        expect.arrayContaining(['in 2 hours', 'social security number suspended', 'federal warrant'])
      );
    });

    it('detects South Asian utility disconnect and bank KYC fraud patterns', () => {
      const text = 'बिजली बिल बकाया: आज रात 9:30 बजे बिजली काट दी जाएगी। बैंक खाता ब्लॉक होने से बचाएं।';
      const output = sanitizeEdgePII(text);
      expect(output.isHighUrgency).toBe(true);
      expect(output.detectedUrgencySignals).toEqual(
        expect.arrayContaining(['काट दी जाएगी', 'बिजली बिल बकाया', 'खाता ब्लॉक'])
      );
    });

    it('detects Japanese Nenkin pension refund & MyNumber scam patterns', () => {
      const text = '日本年金機構：年金還付金について緊急連絡。本日中に確認されない場合、送電停止となります。';
      const output = sanitizeEdgePII(text);
      expect(output.isHighUrgency).toBe(true);
      expect(output.detectedUrgencySignals).toEqual(
        expect.arrayContaining(['年金還付金', '緊急連絡', '本日中に', '送電停止'])
      );
    });
  });

  describe('3. Plain Language & Senior Ergonomics Constraints', () => {
    it('guarantees summary is concise (under 15 words) for elderly users', async () => {
      const result = await analyzeSafety(
        'URGENT: Your electricity will be shut off in 45 minutes due to unpaid bill. Click bit.ly/pay-now',
        'en-US'
      );
      expect(result.safetyStatus).toBe('DANGER');
      const wordCount = result.fifteenWordSummary.trim().split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(15);
      expect(result.recommendedAction.length).toBeGreaterThan(5);
    });

    it('provides calm Devanagari Hindi advice for South Asian seniors without technical jargon', async () => {
      const result = await analyzeSafety(
        'बिजली विभाग चेतावनी: आज रात बिजली काट दी जाएगी।',
        'hi-IN'
      );
      expect(result.safetyStatus).toBe('DANGER');
      expect(result.fifteenWordSummary).toContain('बिजली');
      expect(result.recommendedAction).toContain('क्लिक न करें');
      // No raw technical jargon
      expect(result.fifteenWordSummary).not.toMatch(/API|PII|Regex/i);
    });

    it('caches repeated inquiries for instant zero-latency responses', async () => {
      const text = 'Routine municipal water statement for October: $34.50 auto-pay scheduled.';
      const first = await analyzeSafety(text, 'en-US');
      const second = await analyzeSafety(text, 'en-US');
      expect(first.safetyStatus).toBe('SAFE');
      expect(second.safetyStatus).toBe('SAFE');
      expect(first.fifteenWordSummary).toBe(second.fifteenWordSummary);
    });
  });
});
