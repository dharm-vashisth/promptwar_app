import React, { useState } from 'react';
import {
  Users,
  Phone,
  ShieldCheck,
  ArrowLeft,
  Send,
  PhoneCall,
  CheckCircle2,
  X,
} from 'lucide-react';
import { LocaleType } from '../types';
import { translations } from '../utils/i18n';

interface FamilyCardProps {
  locale: LocaleType;
  onBackToMorning: () => void;
}

export const FamilyCard: React.FC<FamilyCardProps> = ({ locale, onBackToMorning }) => {
  const t = translations[locale].family;
  const [activeCall, setActiveCall] = useState<{ name: string; phone: string } | null>(null);
  const [alertSent, setAlertSent] = useState(false);

  const handleCall = (name: string, phone: string) => {
    setActiveCall({ name, phone });
  };

  const handleSendAlert = () => {
    setAlertSent(true);
    setTimeout(() => {
      setAlertSent(false);
    }, 4500);
  };

  return (
    <section id="card-family" className="flex-1 flex flex-col relative">
      <div className="bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-2xl p-5 sm:p-6 shadow-tactile flex-1 flex flex-col justify-between">
        <div>
          {/* Header Status */}
          <div className="flex items-center justify-between border-b border-[#E4DCD0] pb-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F7F2] border border-[#C2E0C9] rounded-full text-xs font-bold text-[#1E4D2B] uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> {t.badge}
            </span>
            <span className="text-xs font-bold text-[#1E4D2B] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {t.availableBadge}
            </span>
          </div>

          <h2 id="family-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-2 leading-tight">
            {t.title}
          </h2>
          <p id="family-sub" className="text-base sm:text-lg text-[#4A4A4A] mb-5 font-medium leading-normal">
            {t.sub}
          </p>

          {/* Quick 1-Tap "Help Me Check" SMS Dispatcher */}
          <div className="mb-5 p-3.5 bg-[#FDFBF7] border-2 border-[#1E4D2B] rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <div className="text-xs font-black uppercase text-[#1E4D2B] tracking-wider">
                {locale === 'hi-IN' ? 'त्वरित पारिवारिक सुरक्षा' : 'One-Tap Security Guard'}
              </div>
              <div className="text-sm font-bold text-[#1A1A1A] mt-0.5">
                {t.alertFamilyBtn}
              </div>
            </div>
            <button
              type="button"
              id="send-help-sms-btn"
              onClick={handleSendAlert}
              className="btn-tactile px-3.5 py-2 bg-[#1E4D2B] hover:bg-[#163820] text-white font-bold text-xs sm:text-sm rounded-lg flex items-center gap-1.5 shadow-tactile-forest"
            >
              <Send className="w-4 h-4 text-white" />
              <span>{locale === 'hi-IN' ? 'भेजें (Send)' : 'Send SMS'}</span>
            </button>
          </div>

          {alertSent && (
            <div className="mb-4 p-3 bg-[#F0F7F2] border-2 border-[#1E4D2B] rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#1E4D2B] animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{t.alertSentToast}</span>
            </div>
          )}

          {/* Contact List: Tactile, Senior-Accessible Cards */}
          <div className="space-y-3.5">
            {t.contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 bg-[#FDFBF7] border-2 border-[#1A1A1A] rounded-xl flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      contact.theme === 'forest'
                        ? 'bg-[#1E4D2B]'
                        : contact.theme === 'amber'
                        ? 'bg-[#7C4A03]'
                        : 'bg-[#3D3830]'
                    }`}
                  >
                    {contact.initials}
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-[#1A1A1A] leading-tight">
                      {contact.name}
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[#1E4D2B] mt-0.5">
                      {contact.badge}
                    </div>
                    <div className="text-xs text-[#4A4A4A] font-semibold">{contact.phone}</div>
                  </div>
                </div>

                <button
                  type="button"
                  id={`call-contact-${contact.id}-btn`}
                  onClick={() => handleCall(contact.name, contact.phone)}
                  className={`btn-tactile px-4 py-3 text-white font-bold text-sm sm:text-base rounded-xl flex items-center gap-2 ${
                    contact.theme === 'forest'
                      ? 'bg-[#1E4D2B] shadow-tactile-forest'
                      : contact.theme === 'amber'
                      ? 'bg-[#7C4A03] shadow-tactile'
                      : 'bg-[#1A1A1A] shadow-tactile-dark'
                  }`}
                >
                  <Phone className="w-4 h-4 text-white" />
                  <span>{t.callBtn}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Morning Digest Navigation */}
        <div className="pt-4 border-t-2 border-[#E4DCD0] mt-6">
          <button
            type="button"
            id="back-to-morning-digest-btn"
            onClick={onBackToMorning}
            className="btn-tactile w-full py-3.5 px-4 bg-[#FAF7F0] hover:bg-[#F4EFE6] border-2 border-[#1A1A1A] text-[#1A1A1A] font-bold text-base sm:text-lg rounded-xl flex items-center justify-center gap-2 shadow-tactile"
          >
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
            <span>{t.backBtn}</span>
          </button>
        </div>
      </div>

      {/* Simulated Active Call Overlay */}
      {activeCall && (
        <div
          id="active-call-overlay"
          className="absolute inset-0 bg-[#1A1A1A]/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-6 z-50 text-white animate-fadeIn"
        >
          <div className="w-20 h-20 rounded-full bg-[#1E4D2B] flex items-center justify-center mb-4 animate-bounce">
            <PhoneCall className="w-10 h-10 text-white" />
          </div>
          <div className="text-xs font-bold text-amber-200 uppercase tracking-widest mb-1">
            {locale === 'hi-IN' ? 'सुरक्षित फ़ोन कॉल जारी है...' : 'Connecting Direct Line...'}
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-1">
            {activeCall.name}
          </h3>
          <p className="text-sm text-stone-300 font-mono mb-6">{activeCall.phone}</p>
          <p className="text-xs text-stone-300 text-center max-w-xs mb-8">
            {locale === 'hi-IN'
              ? 'आवाज़ साफ़ सुनाई दे रही है। आराम से बात करें, कोई जल्दबाज़ी नहीं।'
              : 'Direct senior-priority audio line connected. Take all the time you need.'}
          </p>

          <button
            type="button"
            onClick={() => setActiveCall(null)}
            className="btn-tactile px-8 py-3.5 bg-[#8C2D19] hover:bg-[#A3341D] text-white font-bold text-lg rounded-full flex items-center gap-2.5 shadow-tactile-crimson border-2 border-red-950"
          >
            <X className="w-6 h-6" />
            <span>{locale === 'hi-IN' ? 'कॉल समाप्त करें' : 'End Call'}</span>
          </button>
        </div>
      )}
    </section>
  );
};
