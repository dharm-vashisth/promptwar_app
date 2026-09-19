import React from 'react';
import { LocaleType } from '../types';

interface AudioVisualizerProps {
  isSpeaking: boolean;
  onStop: () => void;
  locale: LocaleType;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isSpeaking, onStop, locale }) => {
  if (!isSpeaking) return null;

  return (
    <div
      id="audio-visualizer-bar"
      className="px-5 py-2.5 bg-[#FDF8EC] border-b-2 border-[#7C4A03]/30 flex items-center justify-between text-[#7C4A03] transition-all"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex items-end gap-1 h-5">
          <div className="wave-bar w-1 bg-[#7C4A03] rounded-full"></div>
          <div className="wave-bar w-1 bg-[#7C4A03] rounded-full"></div>
          <div className="wave-bar w-1 bg-[#7C4A03] rounded-full"></div>
          <div className="wave-bar w-1 bg-[#7C4A03] rounded-full"></div>
          <div className="wave-bar w-1 bg-[#7C4A03] rounded-full"></div>
        </div>
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
          {locale === 'hi-IN'
            ? 'स्पष्ट एवं धीमी गति में बोल रहे हैं...'
            : locale === 'ja-JP'
            ? '聞き取りやすい速度で読み上げています...'
            : 'Reading clearly at a calm, comfortable pace...'}
        </span>
      </div>
      <button
        id="stop-audio-pill-btn"
        onClick={onStop}
        className="text-xs sm:text-sm font-black uppercase underline text-[#8C2D19] hover:text-[#5E1D0F] p-1 cursor-pointer"
      >
        {locale === 'hi-IN' ? 'रोकें (Stop)' : locale === 'ja-JP' ? '停止 (Stop)' : 'Stop'}
      </button>
    </div>
  );
};
