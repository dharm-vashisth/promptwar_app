import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock Web Speech API SpeechSynthesis for JSDOM
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
      onvoiceschanged: null,
      speaking: false,
      paused: false,
      pending: false,
    },
  });

  // Mock SpeechSynthesisUtterance
  class MockSpeechSynthesisUtterance {
    text: string;
    lang: string = 'en-US';
    rate: number = 1.0;
    pitch: number = 1.0;
    volume: number = 1.0;
    voice: any = null;
    onstart: any = null;
    onend: any = null;
    onerror: any = null;
    constructor(text: string = '') {
      this.text = text;
    }
  }

  (window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
