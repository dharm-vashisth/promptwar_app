import React from 'react';
import { Coffee, ShieldCheck, Pill, Package, Volume2, Search } from 'lucide-react';
import { LocaleType } from '../types';
import { translations } from '../utils/i18n';

interface MorningCardProps {
  locale: LocaleType;
  onReadAloud: () => void;
  onGoToScanner: () => void;
  isSpeaking: boolean;
}

export const MorningCard: React.FC<MorningCardProps> = ({
  locale,
  onReadAloud,
  onGoToScanner,
  isSpeaking,
}) => {
  const t = translations[locale].morning;

  return (
    <section id="card-morning" className="flex-1 flex flex-col">
      <div className="bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-2xl p-5 sm:p-6 shadow-tactile flex-1 flex flex-col justify-between">
        <div>
          {/* Section Stamp */}
          <div className="flex items-center justify-between border-b border-[#E4DCD0] pb-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4EFE6] border border-[#D4CAC0] rounded-full text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              <Coffee className="w-3.5 h-3.5 text-[#7C4A03]" /> {t.stamp}
            </span>
            <span className="text-xs font-bold text-[#1E4D2B] flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#1E4D2B]" /> {t.badgeSafe}
            </span>
          </div>

          {/* Main Big Headline */}
          <h2 id="digest-headline" className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-snug mb-3.5">
            {t.headline}
          </h2>

          {/* 15-Word Plain Language Paragraph (High-Legibility, Min 19px font) */}
          <p
            id="digest-summary"
            className="text-lg sm:text-xl text-[#1A1A1A] leading-relaxed font-medium mb-5 bg-[#FDFBF7] p-4 rounded-xl border border-[#E4DCD0]"
          >
            {t.summary}
          </p>

          {/* Three Key Calming Facts */}
          <div className="space-y-3 mb-6">
            {/* 1. Bank & Accounts */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#F0F7F2] border border-[#C2E0C9]">
              <div className="w-10 h-10 rounded-full bg-[#1E4D2B] text-white flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#1E4D2B] uppercase tracking-wider">
                  {t.bankTitle}
                </div>
                <div id="bank-status-text" className="text-base sm:text-lg font-bold text-[#1A1A1A]">
                  {t.bankDetail}
                </div>
              </div>
            </div>

            {/* 2. Medicine Reminder */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#FAF7F0] border border-[#E4DCD0]">
              <div className="w-10 h-10 rounded-full bg-[#7C4A03] text-white flex items-center justify-center flex-shrink-0">
                <Pill className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#7C4A03] uppercase tracking-wider">
                  {t.medTitle}
                </div>
                <div id="med-status-text" className="text-base sm:text-lg font-bold text-[#1A1A1A]">
                  {t.medDetail}
                </div>
              </div>
            </div>

            {/* 3. Delivery / Errand */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[#FDFBF7] border border-[#E4DCD0]">
              <div className="w-10 h-10 rounded-full bg-[#3D3830] text-white flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider">
                  {t.deliveryTitle}
                </div>
                <div id="delivery-status-text" className="text-base sm:text-lg font-bold text-[#1A1A1A]">
                  {t.deliveryDetail}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons: Large, Tactile, High Contrast */}
        <div className="space-y-3 pt-4 border-t-2 border-[#E4DCD0]">
          <button
            id="read-morning-digest-btn"
            onClick={onReadAloud}
            className={`btn-tactile w-full py-4 px-4 font-bold text-lg sm:text-xl rounded-xl flex items-center justify-center gap-3 ${
              isSpeaking
                ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-tactile-crimson'
                : 'bg-[#1A1A1A] text-[#FDFBF7] shadow-tactile-dark hover:bg-[#333]'
            }`}
          >
            <Volume2 className="w-6 h-6 text-[#FDFBF7]" />
            <span>{isSpeaking ? (locale === 'hi-IN' ? 'आवाज़ रोकें (Stop)' : 'Stop Reading') : t.readAloudBtn}</span>
          </button>

          <button
            id="open-safety-scan-btn"
            onClick={onGoToScanner}
            className="btn-tactile w-full py-3.5 px-4 bg-[#FAF7F0] hover:bg-[#F4EFE6] text-[#1A1A1A] border-2 border-[#1A1A1A] font-bold text-base sm:text-lg rounded-xl flex items-center justify-center gap-2 shadow-tactile"
          >
            <Search className="w-5 h-5 text-[#1A1A1A]" />
            <span>{t.checkMessageBtn}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
