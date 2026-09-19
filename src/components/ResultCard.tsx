import React from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCheck,
  ArrowRightCircle,
  Volume2,
  PhoneCall,
  Check,
  ShieldAlert,
  Sparkles,
  Lock,
} from 'lucide-react';
import { LocaleType, SafetyAnalysisResult } from '../types';
import { translations } from '../utils/i18n';

interface ResultCardProps {
  locale: LocaleType;
  result: SafetyAnalysisResult;
  isSpeaking: boolean;
  onReadAdviceAloud: () => void;
  onCallFamily: () => void;
  onDismiss: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  locale,
  result,
  isSpeaking,
  onReadAdviceAloud,
  onCallFamily,
  onDismiss,
}) => {
  const t = translations[locale].result;
  const isDanger = result.safetyStatus === 'DANGER';

  return (
    <section id="card-result" className="flex-1 flex flex-col">
      <div
        id="result-wrapper"
        className="bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-2xl p-5 sm:p-6 shadow-tactile flex-1 flex flex-col justify-between"
      >
        <div>
          {/* Edge PII Sanitized Header Badge & Real-Time AI Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4DCD0] pb-3 mb-3">
            <span className="text-xs font-bold text-[#4A4A4A] uppercase flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4 text-[#1E4D2B]" />
              <span>{t.piiSanitizedBadge}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E4D2B] bg-[#E8F3EB] px-2.5 py-0.5 rounded-full border border-[#C2E0C9]">
                <Sparkles className="w-3 h-3 text-[#1E4D2B]" />
                <span>
                  {locale === 'hi-IN'
                    ? 'रीयल-टाइम जेमिनी एआई'
                    : locale === 'ja-JP'
                    ? 'Gemini生成AI稼働中'
                    : 'Real-Time Gemini AI'}
                </span>
              </span>
              <span className="text-xs font-bold text-[#4A4A4A]">{result.timestamp}</span>
            </div>
          </div>

          {/* Reassuring Privacy Confirmation Banner */}
          <div
            id="privacy-confirmation-banner"
            className="mb-4 bg-[#F0F7F2] border border-[#C2E0C9] rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1E4D2B]"
          >
            <Lock className="w-4 h-4 text-[#1E4D2B] shrink-0" />
            <span>
              {locale === 'hi-IN'
                ? '🔒 आपकी निजी जानकारी और नंबर पूरी तरह सुरक्षित व गुप्त रखे गए हैं'
                : locale === 'ja-JP'
                ? '🔒 個人情報や口座番号は完全に非表示・安全に保護されています'
                : '🔒 Your personal details are completely hidden and safe'}
            </span>
          </div>

          {/* PART 1: LARGE HIGH-CONTRAST RED / GREEN SAFETY BADGE */}
          <div
            id="result-status-badge"
            className={`p-4 rounded-xl border-2 mb-4 flex items-center gap-3.5 ${
              isDanger
                ? 'bg-[#FDF2F0] border-[#8C2D19] shadow-tactile-crimson'
                : 'bg-[#F0F7F2] border-[#1E4D2B] shadow-tactile-forest'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full text-white flex items-center justify-center flex-shrink-0 ${
                isDanger ? 'bg-[#8C2D19]' : 'bg-[#1E4D2B]'
              }`}
            >
              {isDanger ? (
                <AlertTriangle className="w-7 h-7 text-white" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <div
                className={`text-xs font-black uppercase tracking-wider ${
                  isDanger ? 'text-[#8C2D19]' : 'text-[#1E4D2B]'
                }`}
              >
                {isDanger ? t.dangerSub : t.safeSub}
              </div>
              <h3
                id="result-status-title"
                className={`font-serif text-xl sm:text-2xl font-bold leading-tight ${
                  isDanger ? 'text-[#8C2D19]' : 'text-[#1E4D2B]'
                }`}
              >
                {result.statusTitle}
              </h3>
            </div>
          </div>

          {/* Urgency Indicators Triggered (if any) */}
          {result.detectedScamIndicators && result.detectedScamIndicators.length > 0 && (
            <div className="mb-4 p-2.5 bg-[#FAF7F0] border border-[#E4DCD0] rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#8C2D19] flex-shrink-0" />
              <div className="text-xs font-bold text-[#1A1A1A]">
                <span className="text-[#8C2D19]">{t.detectedSignalsLabel} </span>
                <span>{result.detectedScamIndicators.join(', ')}</span>
              </div>
            </div>
          )}

          {/* PART 2: 15-WORD PLAIN LANGUAGE / REGIONAL SUMMARY (Senior Ergonomics) */}
          <div className="mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A4A4A] mb-1.5">
              {t.plainHeading}
            </h4>
            <p
              id="result-plain-summary"
              className="text-lg sm:text-xl font-semibold text-[#1A1A1A] bg-[#FDFBF7] p-4 rounded-xl border-2 border-[#E4DCD0] leading-relaxed"
            >
              {result.fifteenWordSummary}
            </p>
          </div>

          {/* PART 3: EXACTLY ONE SINGLE RECOMMENDED ACTION */}
          <div className="mb-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A4A4A] mb-1.5">
              {t.actionHeading}
            </h4>
            <div
              className={`p-4 rounded-xl border-2 flex items-start gap-3 bg-[#FAF7F0] ${
                isDanger ? 'border-[#8C2D19]' : 'border-[#1E4D2B]'
              }`}
            >
              <ArrowRightCircle
                className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                  isDanger ? 'text-[#8C2D19]' : 'text-[#1E4D2B]'
                }`}
              />
              <p
                id="result-recommended-action"
                className="text-base sm:text-lg font-bold text-[#1A1A1A] leading-snug"
              >
                {result.recommendedAction}
              </p>
            </div>
          </div>
        </div>

        {/* Tactile Affordances: Audio Reader, Call Family, Dismiss */}
        <div className="space-y-3 pt-3 border-t-2 border-[#E4DCD0]">
          <button
            type="button"
            id="read-result-advice-btn"
            onClick={onReadAdviceAloud}
            className={`btn-tactile w-full py-4 px-4 font-bold text-lg sm:text-xl rounded-xl flex items-center justify-center gap-3 ${
              isSpeaking
                ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-tactile-crimson'
                : 'bg-[#1A1A1A] text-[#FDFBF7] shadow-tactile-dark hover:bg-[#333]'
            }`}
          >
            <Volume2 className="w-6 h-6 text-[#FDFBF7]" />
            <span>
              {isSpeaking
                ? locale === 'hi-IN'
                  ? 'रोकें (Stop)'
                  : 'Stop Voice Reading'
                : t.listenAdviceBtn}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              id="result-call-family-btn"
              onClick={onCallFamily}
              className="btn-tactile py-3.5 px-3 bg-[#8C2D19] hover:bg-[#A3341D] text-[#FDFBF7] font-bold text-base sm:text-lg rounded-xl flex items-center justify-center gap-2 shadow-tactile-crimson border border-[#5E1D0F]"
            >
              <PhoneCall className="w-5 h-5 text-[#FDFBF7]" />
              <span>{t.callFamilyBtn}</span>
            </button>

            <button
              type="button"
              id="result-dismiss-btn"
              onClick={onDismiss}
              className="btn-tactile py-3.5 px-3 bg-[#FAF7F0] hover:bg-[#F4EFE6] border-2 border-[#1A1A1A] text-[#1A1A1A] font-bold text-base sm:text-lg rounded-xl flex items-center justify-center gap-2 shadow-tactile"
            >
              <Check className="w-5 h-5 text-[#1A1A1A]" />
              <span>{t.doneBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
