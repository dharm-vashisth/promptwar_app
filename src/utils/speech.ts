import { LocaleType } from '../types';

// Web Speech API interface definitions
interface IWindowSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

class SpeechEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognitionInstance: any = null;
  private isSpeakingState: boolean = false;
  private isListeningState: boolean = false;

  public isTTSSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
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
    if (!this.isTTSSupported()) {
      if (onError) onError(new Error('Speech synthesis not supported on this browser'));
      return;
    }

    this.stopTTS();

    if (!text || text.trim().length === 0) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      // Senior-friendly deliberate pacing (0.85x speed ensures high comprehension)
      utterance.rate = 0.86;
      utterance.pitch = 1.0;

      // Select voice matching language if available
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) => v.lang.startsWith(locale) || v.lang.includes(locale.split('-')[0]));
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
    if (this.isTTSSupported()) {
      window.speechSynthesis.cancel();
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
