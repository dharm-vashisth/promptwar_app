import { LocaleType } from '../types';

// Web Speech API interface definitions
interface IWindowSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

class SpeechEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioPlayer: HTMLAudioElement | null = null;
  private recognitionInstance: any = null;
  private isSpeakingState: boolean = false;
  private isListeningState: boolean = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        this.cachedVoices = window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          this.cachedVoices = window.speechSynthesis.getVoices();
        };
      } catch (_) {}
    }
  }

  public isTTSSupported(): boolean {
    return typeof window !== 'undefined' && ('speechSynthesis' in window || typeof Audio !== 'undefined');
  }

  public isSTTSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as IWindowSpeech;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  public speak(
    text: string,
    locale: LocaleType,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: any) => void
  ) {
    this.stopTTS();

    if (!text || text.trim().length === 0) return;

    // Clean symbols & emojis so audio pronunciation is natural and pleasant
    const cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[⚠️✅💊🔍⚡📰📞]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // Priority 1: High-Fidelity Regional Speech Audio Streaming (Guaranteed Native Hindi)
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      try {
        const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&locale=${encodeURIComponent(locale)}`;
        const audio = new Audio(audioUrl);
        this.audioPlayer = audio;

        audio.onplay = () => {
          this.isSpeakingState = true;
          if (onStart) onStart();
        };

        audio.onended = () => {
          this.isSpeakingState = false;
          this.audioPlayer = null;
          if (onEnd) onEnd();
        };

        audio.onerror = () => {
          // If server audio fails (e.g., offline or network hiccup), fallback smoothly to SpeechSynthesis
          this.audioPlayer = null;
          this.speakViaSpeechSynthesis(cleanText, locale, onStart, onEnd, onError);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If browser autoplay policy prevents audio or fetch fails, fallback to SpeechSynthesis
            this.audioPlayer = null;
            this.speakViaSpeechSynthesis(cleanText, locale, onStart, onEnd, onError);
          });
        }
        return;
      } catch (audioErr) {
        // Fallback to speechSynthesis below
      }
    }

    // Priority 2: Web Speech API Browser Fallback
    this.speakViaSpeechSynthesis(cleanText, locale, onStart, onEnd, onError);
  }

  private speakViaSpeechSynthesis(
    cleanText: string,
    locale: LocaleType,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (error: any) => void
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onError) onError(new Error('Speech synthesis not supported on this device'));
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = locale;
      // Senior-friendly deliberate pacing (0.86x speed ensures high comprehension)
      utterance.rate = 0.86;
      utterance.pitch = 1.0;

      // Select voice matching language if available
      const voices =
        window.speechSynthesis.getVoices().length > 0
          ? window.speechSynthesis.getVoices()
          : this.cachedVoices;

      const langPrefix = locale.split('-')[0].toLowerCase();
      const matchingVoice = voices.find(
        (v) =>
          (v.lang &&
            (v.lang.toLowerCase() === locale.toLowerCase() ||
              v.lang.toLowerCase().replace('_', '-') === locale.toLowerCase() ||
              v.lang.toLowerCase().startsWith(langPrefix))) ||
          (langPrefix === 'hi' && /hindi|हिन्दी|swara|madhur|lekha/i.test(v.name)) ||
          (langPrefix === 'ja' && /japanese|日本語|kyoko/i.test(v.name))
      );

      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        this.isSpeakingState = true;
        this.currentUtterance = utterance;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isSpeakingState = false;
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this.isSpeakingState = false;
        this.currentUtterance = null;
        if (onError) onError(e);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      this.isSpeakingState = false;
      if (onError) onError(err);
    }
  }

  public stopTTS() {
    if (this.audioPlayer) {
      try {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
      } catch (_) {}
      this.audioPlayer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    this.isSpeakingState = false;
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }

  public startListening(
    locale: LocaleType,
    onResult: (transcript: string) => void,
    onEnd: () => void,
    onError: (err: any) => void
  ) {
    if (!this.isSTTSupported()) {
      onError(new Error('Speech recognition not supported in this browser'));
      return;
    }

    this.stopListening();
    this.stopTTS();

    try {
      const win = window as IWindowSpeech;
      const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
      const rec = new SpeechRec();

      rec.lang = locale;
      rec.continuous = false;
      rec.interimResults = true;

      rec.onstart = () => {
        this.isListeningState = true;
      };

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          onResult(transcript);
        }
      };

      rec.onerror = (err: any) => {
        this.isListeningState = false;
        onError(err);
      };

      rec.onend = () => {
        this.isListeningState = false;
        onEnd();
      };

      this.recognitionInstance = rec;
      rec.start();
    } catch (err) {
      this.isListeningState = false;
      onError(err);
    }
  }

  public stopListening() {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (_) {}
      this.recognitionInstance = null;
    }
    this.isListeningState = false;
  }

  public isListening(): boolean {
    return this.isListeningState;
  }
}

export const speechEngine = new SpeechEngine();
