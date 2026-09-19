import React, { useState, useEffect } from 'react';
import { Masthead } from './components/Masthead';
import { AudioVisualizer } from './components/AudioVisualizer';
import { MorningCard } from './components/MorningCard';
import { ScannerCard } from './components/ScannerCard';
import { ResultCard } from './components/ResultCard';
import { FamilyCard } from './components/FamilyCard';
import { LocaleType, CardMode, SafetyAnalysisResult } from './types';
import { translations } from './utils/i18n';
import { speechEngine } from './utils/speech';
import { analyzeSafety } from './services/safetyService';
import { presetSamples } from './data/samples';
import { Zap } from 'lucide-react';

export default function App() {
  const [locale, setLocale] = useState<LocaleType>('en-US');
  const [currentMode, setCurrentMode] = useState<CardMode>('morning');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SafetyAnalysisResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[locale];

  // Stop any active speech on unmount
  useEffect(() => {
    return () => {
      speechEngine.stopTTS();
      speechEngine.stopListening();
    };
  }, []);

  // Stop speech when switching locales
  const handleLocaleChange = (newLocale: LocaleType) => {
    speechEngine.stopTTS();
    setIsSpeaking(false);
    setLocale(newLocale);
  };

  // Switch card mode
  const handleSwitchMode = (mode: CardMode) => {
    speechEngine.stopTTS();
    setIsSpeaking(false);
    setCurrentMode(mode);
  };

  // Trigger Speech for active view
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      speechEngine.stopTTS();
      setIsSpeaking(false);
      return;
    }

    if (currentMode === 'morning') {
      handleReadMorningDigest();
    } else if (currentMode === 'result' && analysisResult) {
      handleReadAdviceAloud();
    } else if (currentMode === 'family') {
      const text = `${t.family.title}. ${t.family.sub}`;
      speechEngine.speak(
        text,
        locale,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    } else {
      const text = `${t.scanner.title}. ${t.scanner.instruction}`;
      speechEngine.speak(
        text,
        locale,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  // Read Morning Digest Aloud
  const handleReadMorningDigest = () => {
    speechEngine.stopTTS();
    const digest = t.morning;
    const textToRead = `${digest.headline}. ${digest.summary}. ${digest.bankTitle}: ${digest.bankDetail}. ${digest.medTitle}: ${digest.medDetail}.`;

    speechEngine.speak(
      textToRead,
      locale,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  // Read Result Card Aloud
  const handleReadAdviceAloud = () => {
    if (!analysisResult) return;
    speechEngine.stopTTS();
    const stepPrefix = locale === 'hi-IN' ? 'सलाह: ' : locale === 'ja-JP' ? '推奨対応: ' : 'Recommended step: ';
    const textToRead = `${analysisResult.statusTitle}. ${analysisResult.fifteenWordSummary}. ${stepPrefix}${analysisResult.recommendedAction}`;

    speechEngine.speak(
      textToRead,
      locale,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  // Multimodal Analysis Execution
  const handleRunAnalysis = async () => {
    if (!inputMessage.trim() && !attachedImage) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeSafety(inputMessage, locale, attachedImage || undefined);
      setAnalysisResult(result);
      setCurrentMode('result');
    } catch (err) {
      console.error('Error in handleRunAnalysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear scanner inputs
  const handleClearScanner = () => {
    setInputMessage('');
    setAttachedImage(null);
  };

  // JUDGE DEMO "HOOK" FEATURE: 1-Click Scam Injection & Instant Voice Warning
  const handleTriggerScamHook = async () => {
    speechEngine.stopTTS();
    setIsSpeaking(false);

    // Get scam sample matching current locale
    const scamSample = presetSamples.find((s) => s.type === 'scam');
    const text = scamSample
      ? scamSample.payload[locale]
      : 'URGENT NOTICE: Your power will be disconnected in 45 minutes. Pay immediately at bit.ly/power-pay-now';

    setInputMessage(text);
    setIsAnalyzing(true);
    setToastMessage(t.scamHook.activeNotice);

    // Instant zero-latency edge evaluation
    const result = await analyzeSafety(text, locale);
    setAnalysisResult(result);
    setIsAnalyzing(false);
    setCurrentMode('result');

    // Automatically trigger clear voice warning for the judges
    setTimeout(() => {
      const voiceWarning = `${result.statusTitle}. ${result.fifteenWordSummary}. ${result.recommendedAction}`;
      speechEngine.speak(
        voiceWarning,
        locale,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }, 400);

    // Dismiss toast after 5s
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-0 sm:p-4 bg-[#F4EFE6] text-[#1A1A1A]">
      {/* Mobile-Centric Device Shell (Bedside Newspaper / Radio Form) */}
      <main
        id="app-container"
        className="w-full max-w-lg min-h-screen bg-[#FDFBF7] border-x-2 border-[#E4DCD0] relative flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Newspaper Tactile Grain Texture */}
        <div className="absolute inset-0 newsprint-grain pointer-events-none z-0" />

        {/* Persistent Masthead & Bedside Audio Radio Bar */}
        <div className="relative z-10">
          <Masthead
            locale={locale}
            onLocaleChange={handleLocaleChange}
            isSpeaking={isSpeaking}
            onToggleSpeech={handleToggleSpeech}
            onTriggerScamHook={handleTriggerScamHook}
          />

          {/* Audio Visualizer Bar (Appears when reading aloud) */}
          <AudioVisualizer
            isSpeaking={isSpeaking}
            onStop={() => {
              speechEngine.stopTTS();
              setIsSpeaking(false);
            }}
            locale={locale}
          />
        </div>

        {/* Demo Hook Notice Toast */}
        {toastMessage && (
          <div className="relative z-20 mx-4 mt-3 p-3 bg-[#FDF2F0] border-2 border-[#8C2D19] rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#8C2D19] shadow-tactile-crimson animate-fadeIn">
            <Zap className="w-5 h-5 flex-shrink-0 fill-current text-[#8C2D19]" />
            <span className="flex-1">{toastMessage}</span>
          </div>
        )}

        {/* SINGLE-FOCUS CONTAINER: Strictly EXACTLY ONE card visible at a time */}
        <div className="relative z-10 flex-1 px-4 py-5 flex flex-col justify-start">
          {/* Calm Navigation Bar (3 Primary Senior Modes) */}
          <nav
            aria-label="Navigation Tabs"
            className="flex items-center justify-between bg-[#F4EFE6] p-1.5 rounded-xl border border-[#E4DCD0] mb-5"
          >
            <button
              id="tab-btn-morning"
              onClick={() => handleSwitchMode('morning')}
              className={`flex-1 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base text-center transition-all cursor-pointer ${
                currentMode === 'morning'
                  ? 'bg-[#1A1A1A] text-[#FDFBF7] shadow-tactile-dark'
                  : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
              }`}
            >
              {t.tabs.morning}
            </button>

            <button
              id="tab-btn-scanner"
              onClick={() => handleSwitchMode('scanner')}
              className={`flex-1 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base text-center transition-all cursor-pointer ${
                currentMode === 'scanner' || currentMode === 'result'
                  ? 'bg-[#1A1A1A] text-[#FDFBF7] shadow-tactile-dark'
                  : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
              }`}
            >
              {t.tabs.scanner}
            </button>

            <button
              id="tab-btn-family"
              onClick={() => handleSwitchMode('family')}
              className={`flex-1 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base text-center transition-all cursor-pointer ${
                currentMode === 'family'
                  ? 'bg-[#1A1A1A] text-[#FDFBF7] shadow-tactile-dark'
                  : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
              }`}
            >
              {t.tabs.family}
            </button>
          </nav>

          {/* ACTIVE SCREEN RENDERER: Exactly One Card */}
          {currentMode === 'morning' && (
            <MorningCard
              locale={locale}
              onReadAloud={handleReadMorningDigest}
              onGoToScanner={() => handleSwitchMode('scanner')}
              isSpeaking={isSpeaking}
            />
          )}

          {currentMode === 'scanner' && (
            <ScannerCard
              locale={locale}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              attachedImage={attachedImage}
              setAttachedImage={setAttachedImage}
              isAnalyzing={isAnalyzing}
              onRunAnalysis={handleRunAnalysis}
              onClear={handleClearScanner}
            />
          )}

          {currentMode === 'result' && analysisResult && (
            <ResultCard
              locale={locale}
              result={analysisResult}
              isSpeaking={isSpeaking}
              onReadAdviceAloud={handleReadAdviceAloud}
              onCallFamily={() => handleSwitchMode('family')}
              onDismiss={() => handleSwitchMode('morning')}
            />
          )}

          {currentMode === 'family' && (
            <FamilyCard
              locale={locale}
              onBackToMorning={() => handleSwitchMode('morning')}
            />
          )}
        </div>

        {/* Persistent Tactile Footer (Bedside Radio Feel) */}
        <footer className="relative z-10 px-5 py-3 bg-[#FAF7F0] border-t-2 border-[#1A1A1A] flex items-center justify-between text-xs text-[#1A1A1A] font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E4D2B] animate-pulse" />
            <span>{t.footerNote}</span>
          </div>
          <div className="text-right">
            <span className="font-serif italic text-xs text-[#4A4A4A]">Zero-FOMO • 65+ Guardrail</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
