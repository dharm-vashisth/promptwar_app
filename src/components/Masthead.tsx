import React from 'react';
import { Volume2, Square, Radio, Sun, Zap } from 'lucide-react';
import { LocaleType } from '../types';
import { translations } from '../utils/i18n';

interface MastheadProps {
  locale: LocaleType;
  onLocaleChange: (locale: LocaleType) => void;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  onTriggerScamHook: () => void;
}

export const Masthead: React.FC<MastheadProps> = ({
  locale,
  onLocaleChange,
  isSpeaking,
  onToggleSpeech,
  onTriggerScamHook,
}) => {
  const t = translations[locale];

  return (
    <header className="relative px-5 pt-5 pb-3 border-b-2 border-[#1A1A1A] bg-[#FAF7F0]">
      {/* Date & Weather Masthead Line */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold tracking-wider uppercase border-b border-[#E4DCD0] pb-1.5 mb-3 text-[#4A4A4A]">
        <span id="masthead-date">{t.date}</span>
        <span className="flex items-center gap-1.5 text-[#1E4D2B] font-bold">
          <Sun className="w-4 h-4 text-[#7C4A03]" /> {t.weather}
        </span>
      </div>

      {/* App Title, Salutation & Locale Selector */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A]">
              ElderEase
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-extrabold uppercase bg-[#1A1A1A] text-[#FDFBF7] rounded tracking-wide">
              2.0
            </span>
          </div>
          <p id="salutation-text" className="text-base sm:text-lg text-[#1A1A1A] font-semibold mt-1 leading-snug">
            {t.salutation}
          </p>
          <p className="text-xs sm:text-sm text-[#4A4A4A] font-medium">
            {t.salutationSub}
          </p>
        </div>

        {/* Locale & Judge Demo Quick Hook */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex flex-col items-end">
            <label htmlFor="locale-select" className="text-[11px] font-bold text-[#4A4A4A] uppercase tracking-wider mb-0.5">
              Language / भाषा
            </label>
            <select
              id="locale-select"
              value={locale}
              onChange={(e) => onLocaleChange(e.target.value as LocaleType)}
              className="bg-[#FDFBF7] border-2 border-[#1A1A1A] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1E4D2B] cursor-pointer"
            >
              <option value="en-US">🇺🇸 English (US)</option>
              <option value="hi-IN">🇮🇳 हिन्दी (Hindi)</option>
              <option value="ja-JP">🇯🇵 日本語 (Japanese)</option>
            </select>
          </div>

          {/* JUDGE DEMO HOOK BUTTON */}
          <button
            id="scam-simulator-toggle-btn"
            onClick={onTriggerScamHook}
            title="Inject real-world scam SMS to test instant Voice Warning & Family Alert"
            className="btn-tactile px-2.5 py-1.5 bg-[#8C2D19] hover:bg-[#A3341D] text-[#FDFBF7] rounded-lg text-xs font-bold flex items-center gap-1 shadow-tactile-crimson border border-[#5E1D0F]"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
            <span>{t.scamHook.buttonLabel}</span>
          </button>
        </div>
      </div>

      {/* Bedside Radio Global Bar: One-Tap Audio Companion */}
      <div className="mt-3.5 bg-[#FAF7F0] border-2 border-[#3D3830] rounded-xl p-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-[#FDFBF7] flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1.5">
              <span>{t.audioBarTitle}</span>
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isSpeaking ? 'bg-[#8C2D19] animate-ping' : 'bg-[#1E4D2B]'
                }`}
              />
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#4A4A4A] line-clamp-1">
              {isSpeaking ? (locale === 'hi-IN' ? 'आवाज़ में पढ़ रहे हैं...' : 'Speaking aloud clearly...') : t.audioBarCaption}
            </div>
          </div>
        </div>

        {/* Global Master Audio Action Button */}
        <button
          id="global-radio-listen-btn"
          onClick={onToggleSpeech}
          className={`btn-tactile font-bold px-3.5 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-1.5 flex-shrink-0 ${
            isSpeaking
              ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-tactile-crimson'
              : 'bg-[#1A1A1A] hover:bg-[#333] text-[#FDFBF7] shadow-tactile-dark'
          }`}
        >
          {isSpeaking ? (
            <>
              <Square className="w-4 h-4 text-[#FDFBF7] fill-current" />
              <span>{t.masterStop}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-[#FDFBF7]" />
              <span>{t.masterListen}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
