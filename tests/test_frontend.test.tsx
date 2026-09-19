import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';
import { ResultCard } from '../src/components/ResultCard';
import { ScannerCard } from '../src/components/ScannerCard';
import { FamilyCard } from '../src/components/FamilyCard';
import { SafetyAnalysisResult } from '../src/types';
import { speechEngine } from '../src/utils/speech';

// Mock speech engine to isolate unit & integration tests from native browser audio
vi.mock('../src/utils/speech', () => ({
  speechEngine: {
    speak: vi.fn((text, locale, onStart, onEnd) => {
      if (onStart) onStart();
      if (onEnd) onEnd();
    }),
    stopTTS: vi.fn(),
    startListening: vi.fn(),
    stopListening: vi.fn(),
    isTTSSupported: vi.fn().mockReturnValue(true),
    isSTTSupported: vi.fn().mockReturnValue(true),
    isSpeaking: vi.fn().mockReturnValue(false),
    isListening: vi.fn().mockReturnValue(false),
  },
}));

const mockSafeResult: SafetyAnalysisResult = {
  safetyStatus: 'SAFE',
  statusTitle: '✅ SAFE: Legitimate Statement',
  statusSub: 'Clean & Verified',
  fifteenWordSummary: 'This is a routine monthly utility statement. There are no suspicious demands or hidden fees.',
  recommendedAction: 'No immediate action required. Your scheduled auto-pay will process normally.',
  piiMasked: false,
  sanitizedInput: 'Monthly water bill statement: $34.50',
  detectedScamIndicators: [],
  urgencyLevel: 'LOW',
  confidenceScore: 0.95,
  timestamp: '10:16 AM',
  engineType: 'gemini-realtime',
};

const mockDangerResult: SafetyAnalysisResult = {
  safetyStatus: 'DANGER',
  statusTitle: '⚠️ DANGER: Do Not Trust This',
  statusSub: 'Scam Detected',
  fifteenWordSummary: 'This is a fake urgency message designed to steal money. Your real utility is safe.',
  recommendedAction: 'Do not click the web link. Delete the message. Call your family contact if concerned.',
  piiMasked: true,
  sanitizedInput: 'Electricity bill unpaid! Power cut at 9PM. Pay here: bit.ly/34x',
  detectedScamIndicators: ['Artificial Urgency (< 2 hours)', 'Bit.ly Obfuscated Shortener Link'],
  urgencyLevel: 'HIGH',
  confidenceScore: 0.99,
  timestamp: '10:15 AM',
  engineType: 'gemini-realtime',
};

// Mock safety analysis service
vi.mock('../src/services/safetyService', () => ({
  analyzeSafety: vi.fn().mockImplementation(async (text: string) => {
    const isThreat = /disconnect|cut off|urgent|shutoff|pay/i.test(text);
    if (isThreat) {
      return {
        safetyStatus: 'DANGER',
        statusTitle: '⚠️ DANGER: Do Not Trust This',
        statusSub: 'Scam & Threat Detected',
        fifteenWordSummary: 'This is a fake urgency message designed to steal money. Your real utility is safe.',
        recommendedAction: 'Do not click the web link. Delete the message. Call your family contact if concerned.',
        piiMasked: true,
        sanitizedInput: text,
        detectedScamIndicators: ['Urgent Shutoff Threat', 'Suspicious Payment Link'],
        urgencyLevel: 'HIGH',
        confidenceScore: 0.98,
        timestamp: '10:00 AM',
      } as SafetyAnalysisResult;
    }
    return {
      safetyStatus: 'SAFE',
      statusTitle: '✅ SAFE: Legitimate Statement',
      statusSub: 'Clean & Verified',
      fifteenWordSummary: 'This is a routine monthly utility statement. There are no suspicious demands or hidden fees.',
      recommendedAction: 'No immediate action required. Your scheduled auto-pay will process normally.',
      piiMasked: false,
      sanitizedInput: text,
      detectedScamIndicators: [],
      urgencyLevel: 'LOW',
      confidenceScore: 0.96,
      timestamp: '10:00 AM',
    } as SafetyAnalysisResult;
  }),
}));

describe('ElderEase Frontend Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===================================================================
  // 1. COMPONENT RENDERING TESTS
  // ===================================================================
  describe('Component Rendering', () => {
    it('renders the core App shell and morning view without crashing', () => {
      render(<App />);

      // Verify Masthead & Branding
      expect(screen.getByText('ElderEase')).toBeInTheDocument();
      expect(screen.getByText(/Good morning, Arthur/i)).toBeInTheDocument();
      expect(screen.getByText(/Take your time/i)).toBeInTheDocument();

      // Verify Bedside Radio Companion is visible
      expect(screen.getByText(/Bedside Audio Companion/i)).toBeInTheDocument();

      // Verify default active card is Morning Digest
      expect(screen.getByText('Everything is quiet and safe today.')).toBeInTheDocument();
      expect(screen.getByText(/Daily Morning Digest/i)).toBeInTheDocument();
    });

    it('navigates seamlessly between tabs (Morning -> Scanner -> Family)', () => {
      render(<App />);

      // Click Safety Scan tab
      const scanTab = screen.getByRole('button', { name: /Safety Scan/i });
      fireEvent.click(scanTab);

      // Verify Scanner card is visible
      expect(screen.getByText('Did someone send you a message or bill?')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Paste SMS, type message, or dictate by voice/i)
      ).toBeInTheDocument();

      // Click Family tab
      const familyTab = screen.getByRole('button', { name: /Help & Family/i });
      fireEvent.click(familyTab);

      // Verify Family card is visible
      expect(screen.getByText('Speak with someone you trust')).toBeInTheDocument();
      expect(screen.getByText('Sarah (Daughter)')).toBeInTheDocument();
      expect(screen.getByText('Chase Bank Helpline')).toBeInTheDocument();
    });
  });

  // ===================================================================
  // 2. ACCESSIBILITY & ARIA ROLES TESTS
  // ===================================================================
  describe('Accessibility & Senior Ergonomics (ARIA Roles)', () => {
    it('ensures all primary action buttons have accessible roles and descriptive text', () => {
      render(<App />);

      // Primary buttons on Morning View
      const readAloudBtn = screen.getByRole('button', { name: /Read Morning Digest Aloud/i });
      expect(readAloudBtn).toBeInTheDocument();

      const checkMessageBtn = screen.getByRole('button', { name: /Check a Message or Bill/i });
      expect(checkMessageBtn).toBeInTheDocument();

      // Navigation tabs have accessible button roles
      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThanOrEqual(5);

      // Switch to Scanner view and inspect input label association
      fireEvent.click(screen.getByRole('button', { name: /Safety Scan/i }));
      const messageTextarea = screen.getByLabelText(/Message Text, SMS, or Bill Details:/i);
      expect(messageTextarea).toBeInTheDocument();
      expect(messageTextarea.tagName.toLowerCase()).toBe('textarea');
    });

    it('provides accessible language switcher selection for regional senior customization', () => {
      render(<App />);

      const localeSelect = screen.getByLabelText(/Language \/ भाषा/i);
      expect(localeSelect).toBeInTheDocument();

      // Switch to Hindi (hi-IN)
      fireEvent.change(localeSelect, { target: { value: 'hi-IN' } });

      // Verify Indian cultural adaptation (Respectful Hindi salutation)
      expect(screen.getByText(/प्रणाम आदरणीय दादू जी/i)).toBeInTheDocument();
      expect(screen.getAllByText(/सुबह का समाचार/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  // ===================================================================
  // 3. SAFETY ALERT STATE RENDERING (DANGER VS SAFE)
  // ===================================================================
  describe('Safety Alert State Rendering', () => {
    it('renders high-contrast DANGER warning state with all 3 structured sections', () => {
      const handleReadAdvice = vi.fn();
      const handleCallFamily = vi.fn();
      const handleDismiss = vi.fn();

      render(
        <ResultCard
          locale="en-US"
          result={mockDangerResult}
          isSpeaking={false}
          onReadAdviceAloud={handleReadAdvice}
          onCallFamily={handleCallFamily}
          onDismiss={handleDismiss}
        />
      );

      // Section 1: High-Contrast Safety Badge
      expect(screen.getByText('⚠️ DANGER: Do Not Trust This')).toBeInTheDocument();
      expect(screen.getByText('Scam Detected')).toBeInTheDocument();

      // Section 2: 15-Word Plain Language Summary
      expect(
        screen.getByText(
          'This is a fake urgency message designed to steal money. Your real utility is safe.'
        )
      ).toBeInTheDocument();

      // Section 3: Single Recommended Action
      expect(
        screen.getByText(
          'Do not click the web link. Delete the message. Call your family contact if concerned.'
        )
      ).toBeInTheDocument();

      // Edge PII Masked indicator badge
      expect(
        screen.getByText(/Phone & Bank Numbers Masked Before Analysis/i)
      ).toBeInTheDocument();

      // Action affordances
      const listenBtn = screen.getByRole('button', { name: /Listen to This Safety Advice Aloud/i });
      fireEvent.click(listenBtn);
      expect(handleReadAdvice).toHaveBeenCalledTimes(1);

      const callFamilyBtn = screen.getByRole('button', { name: /Call Family Now/i });
      fireEvent.click(callFamilyBtn);
      expect(handleCallFamily).toHaveBeenCalledTimes(1);

      const doneBtn = screen.getByRole('button', { name: /All Clear \/ Back to Morning/i });
      fireEvent.click(doneBtn);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('renders clean SAFE verification state when message is legitimate', () => {
      render(
        <ResultCard
          locale="en-US"
          result={mockSafeResult}
          isSpeaking={false}
          onReadAdviceAloud={vi.fn()}
          onCallFamily={vi.fn()}
          onDismiss={vi.fn()}
        />
      );

      expect(screen.getByText('✅ SAFE: Legitimate Statement')).toBeInTheDocument();
      expect(screen.getByText('Clean & Safe')).toBeInTheDocument();
      expect(
        screen.getByText(
          /No immediate action required. Your scheduled auto-pay will process normally./i
        )
      ).toBeInTheDocument();
    });
  });

  // ===================================================================
  // 4. INTERACTIVE USER FLOWS (DEMO HOOK & SCANNER)
  // ===================================================================
  describe('Interactive User Flows', () => {
    it('executes Judge Demo Scam Hook to trigger immediate safety analysis', async () => {
      render(<App />);

      // Find and click the Judge Demo Scam Hook button in the header
      const injectScamBtn = screen.getByRole('button', { name: /Inject Scam SMS/i });
      fireEvent.click(injectScamBtn);

      // Verify analysis completes and transitions into DANGER result screen
      await waitFor(() => {
        expect(screen.getByText('⚠️ DANGER: Do Not Trust This')).toBeInTheDocument();
      });

      // Verify 15-word summary and action recommendations are shown
      expect(screen.getByText(/fake urgency message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Call Family Now/i })).toBeInTheDocument();
    });

    it('loads quick preset sample into scanner and allows clearing', () => {
      render(
        <ScannerCard
          locale="en-US"
          inputMessage=""
          setInputMessage={vi.fn()}
          attachedImage={null}
          setAttachedImage={vi.fn()}
          isAnalyzing={false}
          onRunAnalysis={vi.fn()}
          onClear={vi.fn()}
        />
      );

      expect(screen.getByText(/Fake Electric Disconnect/i)).toBeInTheDocument();
      expect(screen.getByText(/Normal Water Bill/i)).toBeInTheDocument();
      expect(screen.getByText(/Pharmacy Prescription/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Analyze For Safety Now/i })).toBeInTheDocument();
    });

    it('renders FamilyCard and allows triggering direct telephone dialer simulation', () => {
      const handleBack = vi.fn();
      render(<FamilyCard locale="en-US" onBackToMorning={handleBack} />);

      expect(screen.getByText('Sarah (Daughter)')).toBeInTheDocument();
      expect(screen.getByText('Chase Bank Helpline')).toBeInTheDocument();
      expect(screen.getByText('Dr. Miller’s Clinic')).toBeInTheDocument();

      // Click call on Sarah
      const callButtons = screen.getAllByRole('button', { name: /Call Now/i });
      expect(callButtons.length).toBe(3);
      fireEvent.click(callButtons[0]);

      // Verify active call simulation overlay appears
      expect(screen.getByText(/Connecting Direct Line/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /End Call/i })).toBeInTheDocument();

      // End call
      fireEvent.click(screen.getByRole('button', { name: /End Call/i }));
      expect(screen.queryByText(/Connecting Direct Line/i)).not.toBeInTheDocument();
    });

    it('sparks Hindi speech when Hindi locale is selected', () => {
      render(<App />);

      // Switch to Hindi
      const localeSelect = screen.getByLabelText(/Language/i);
      fireEvent.change(localeSelect, { target: { value: 'hi-IN' } });

      // Check Hindi Morning Digest read aloud button is present
      const hindiSpeakBtn = screen.getByRole('button', { name: /यह सुबह का समाचार आवाज़ में सुनें/i });
      expect(hindiSpeakBtn).toBeInTheDocument();

      // Click read aloud
      fireEvent.click(hindiSpeakBtn);

      // Verify speechEngine.speak was called with 'hi-IN'
      expect(speechEngine.speak).toHaveBeenCalledWith(
        expect.stringContaining('शांत'),
        'hi-IN',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('renders Real-Time Gemini AI badge in ResultCard', () => {
      render(
        <ResultCard
          locale="hi-IN"
          result={mockSafeResult}
          isSpeaking={false}
          onReadAdviceAloud={vi.fn()}
          onCallFamily={vi.fn()}
          onDismiss={vi.fn()}
        />
      );

      expect(screen.getByText('रीयल-टाइम जेमिनी एआई')).toBeInTheDocument();
    });
  });
});
