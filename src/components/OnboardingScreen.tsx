import React, { useState, useEffect } from 'react';
import { UserProfile, LocaleType, EmergencyContact } from '../types';
import { speechEngine } from '../utils/speech';
import { ShieldCheck, Volume2, VolumeX, User, Globe, Phone, HeartHandshake, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface OnboardingScreenProps {
  initialProfile?: UserProfile | null;
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
}

const COUNTRIES = [
  'United States',
  'India',
  'Japan',
  'United Kingdom',
  'Canada',
  'Australia',
  'Other',
];

const LOCALES: { code: LocaleType; label: string; native: string; flag: string }[] = [
  { code: 'en-US', label: 'English (US)', native: 'English', flag: '🇺🇸' },
  { code: 'hi-IN', label: 'Hindi (India)', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ja-JP', label: 'Japanese', native: '日本語', flag: '🇯🇵' },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  initialProfile,
  onComplete,
  onCancel,
}) => {
  const [preferredName, setPreferredName] = useState(initialProfile?.preferredName || '');
  const [country, setCountry] = useState(initialProfile?.country || 'United States');
  const [preferredLanguage, setPreferredLanguage] = useState<LocaleType>(
    initialProfile?.preferredLanguage || 'en-US'
  );
  const [emergencyName, setEmergencyName] = useState(
    initialProfile?.emergencyContact.fullName || ''
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    initialProfile?.emergencyContact.phoneNumber || ''
  );
  const [emergencyRelationship, setEmergencyRelationship] = useState(
    initialProfile?.emergencyContact.relationship || 'Daughter'
  );

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaved, setIsSaved] = useState(false);

  // Sync language with country selection intelligently if first-time setup
  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    if (!initialProfile) {
      if (selectedCountry === 'India') {
        setPreferredLanguage('hi-IN');
      } else if (selectedCountry === 'Japan') {
        setPreferredLanguage('ja-JP');
      } else {
        setPreferredLanguage('en-US');
      }
    }
  };

  // Stop voice speech when component unmounts
  useEffect(() => {
    return () => {
      speechEngine.stopTTS();
    };
  }, []);

  // Vocalize full page guidance in selected language
  const handleToggleReadAloud = () => {
    if (isSpeaking) {
      speechEngine.stopTTS();
      setIsSpeaking(false);
      return;
    }

    let speechText = '';
    if (preferredLanguage === 'hi-IN') {
      speechText =
        'एल्डरईज़ में आपका स्वागत है। पहला चरण: अपना नाम लिखें। दूसरा चरण: अपना देश और भाषा चुनें। तीसरा चरण: अपने परिवार के विश्वसनीय सदस्य का नाम और फोन नंबर दर्ज करें। हम आपसे कभी कोई पासवर्ड नहीं मांगते। सब भरने के बाद, नीचे दिया गया सुरक्षित करें बटन दबाएं।';
    } else if (preferredLanguage === 'ja-JP') {
      speechText =
        'ElderEase へようこそ。ステップ1：お名前を入力してください。ステップ2：国と主要言語を選択してください。ステップ3：緊急時のご家族連絡先の氏名とお電話番号を入力してください。パスワードは一切不要です。入力が完了したら、保存して次へボタンを押してください。';
    } else {
      speechText =
        'Welcome to ElderEase. Step one: enter your preferred name. Step two: select your country and preferred language. Step three: enter your emergency family contact name and phone number. We never require passwords or codes. When you are ready, tap Save and Continue at the bottom.';
    }

    setIsSpeaking(true);
    speechEngine.speak(
      speechText,
      preferredLanguage,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!preferredName.trim() || preferredName.trim().length < 2) {
      newErrors.preferredName =
        preferredLanguage === 'hi-IN'
          ? 'कृपया अपना नाम दर्ज करें (कम से कम 2 अक्षर)'
          : preferredLanguage === 'ja-JP'
          ? 'お名前を2文字以上で入力してください'
          : 'Please enter your preferred name (at least 2 letters)';
    }

    if (!emergencyName.trim() || emergencyName.trim().length < 2) {
      newErrors.emergencyName =
        preferredLanguage === 'hi-IN'
          ? 'कृपया परिवार के विश्वसनीय सदस्य का नाम दर्ज करें'
          : preferredLanguage === 'ja-JP'
          ? '緊急連絡先のご家族のお名前を入力してください'
          : 'Please enter your emergency family contact name';
    }

    // Phone validation: allow digits, dashes, spaces, plus sign; require at least 6 digits
    const cleanedDigits = emergencyPhone.replace(/\D/g, '');
    if (!cleanedDigits || cleanedDigits.length < 6) {
      newErrors.emergencyPhone =
        preferredLanguage === 'hi-IN'
          ? 'कृपया एक सही फोन नंबर दर्ज करें (कम से कम 6 अंक)'
          : preferredLanguage === 'ja-JP'
          ? '正しいお電話番号（数字6桁以上）を入力してください'
          : 'Please enter a valid phone number (at least 6 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to error notice gently
      const errorEl = document.getElementById('onboarding-error-banner');
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const contact: EmergencyContact = {
      fullName: emergencyName.trim(),
      phoneNumber: emergencyPhone.trim(),
      relationship: emergencyRelationship.trim() || 'Family',
    };

    const newProfile: UserProfile = {
      preferredName: preferredName.trim(),
      country,
      preferredLanguage,
      emergencyContact: contact,
      isOnboarded: true,
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
    };

    // Store in localStorage safely
    try {
      localStorage.setItem('elderease_profile', JSON.stringify(newProfile));
    } catch (err) {
      console.warn('Could not persist profile to localStorage:', err);
    }

    setIsSaved(true);

    // Call onComplete after brief visual confirmation
    setTimeout(() => {
      onComplete(newProfile);
    }, 450);
  };

  // Localized string dictionary for Onboarding
  const strings = {
    'en-US': {
      title: 'Welcome to ElderEase',
      subtitle: 'Personalized scam protection & emergency support designed for you.',
      readAloud: isSpeaking ? 'Stop Reading' : '🔊 Read Page Aloud',
      privacyBadge: '🔒 Zero Passwords Required • Stored Securely on This Device Only',
      sec1Title: '1. What should we call you?',
      sec1Helper: 'We use this to greet you politely every morning.',
      nameLabel: 'Your Preferred Name',
      namePlaceholder: 'e.g. Arthur, Martha, or Robert',
      sec2Title: '2. Your Location & Language',
      sec2Helper: 'Ensures scam alerts match your local utility and regional fraud patterns.',
      countryLabel: 'Country of Residence',
      langLabel: 'Preferred Reading & Spoken Language',
      sec3Title: '3. Emergency Family Contact',
      sec3Helper: 'If you ever encounter an urgent threat, you can reach this person with a single tap.',
      contactNameLabel: 'Family Member Name',
      contactNamePlaceholder: 'e.g. Emily (Daughter) or David (Son)',
      contactPhoneLabel: 'Direct Phone Number',
      contactPhonePlaceholder: 'e.g. 555-0199 or (212) 555-0144',
      relationshipLabel: 'Relationship (Optional)',
      saveBtn: 'Save & Enter ElderEase',
      savingBtn: 'Saving Preferences...',
      cancelBtn: 'Keep Existing Settings',
      fixErrorsMsg: 'Please review the highlighted items below to continue:',
    },
    'hi-IN': {
      title: 'एल्डरईज़ (ElderEase) में आपका स्वागत है',
      subtitle: 'वरिष्ठ नागरिकों के लिए समर्पित, सुरक्षित और सरल सुरक्षा साथी।',
      readAloud: isSpeaking ? 'आवाज़ रोकें' : '🔊 बोलकर सुनाएं',
      privacyBadge: '🔒 पासवर्ड की कोई ज़रूरत नहीं • आपकी जानकारी केवल इसी फ़ोन में सुरक्षित है',
      sec1Title: '१. हम आपको किस नाम से बुलाएं?',
      sec1Helper: 'हम हर सुबह आपका आदरपूर्वक इसी नाम से स्वागत करेंगे।',
      nameLabel: 'आपका शुभ नाम',
      namePlaceholder: 'उदा. रामप्रसाद जी, कमला देवी',
      sec2Title: '२. आपका देश एवं भाषा',
      sec2Helper: 'ताकि आपको अपनी क्षेत्रीय भाषा में सटीक जानकारी और सुरक्षा मिले।',
      countryLabel: 'आपका देश',
      langLabel: 'पढ़ने और सुनने की प्राथमिक भाषा',
      sec3Title: '३. परिवार का आपातकालीन संपर्क',
      sec3Helper: 'किसी भी संदिग्ध संदेश पर आप सीधे एक बटन दबाकर इनसे संपर्क कर सकेंगे।',
      contactNameLabel: 'परिवार के सदस्य का नाम',
      contactNamePlaceholder: 'उदा. अमित (बेटा) या प्रिया (बेटी)',
      contactPhoneLabel: 'उनका फोन नंबर',
      contactPhonePlaceholder: 'उदा. +91 98765 43210',
      relationshipLabel: 'संबंध (वैकल्पिक)',
      saveBtn: 'सुरक्षित करें और आगे बढ़ें',
      savingBtn: 'सुरक्षित हो रहा है...',
      cancelBtn: 'पुराने विवरण रखें',
      fixErrorsMsg: 'कृपया आगे बढ़ने से पहले नीचे दी गई जानकारी पूरी करें:',
    },
    'ja-JP': {
      title: 'ElderEase へようこそ',
      subtitle: 'シニアの皆様のための安心・安全な見守り詐欺対策アプリです。',
      readAloud: isSpeaking ? '音声を停止' : '🔊 ページを読み上げる',
      privacyBadge: '🔒 パスワード不要 • 個人情報は端末内にのみ安全に保持されます',
      sec1Title: '1. お名前をお知らせください',
      sec1Helper: '毎朝のお便りやご案内の挨拶に使用いたします。',
      nameLabel: 'お名前（呼び名）',
      namePlaceholder: '例：太郎、花子、鈴木様',
      sec2Title: '2. お住まいの国と主要言語',
      sec2Helper: '地域の詐欺手口に応じた正確なアドバイスをお届けします。',
      countryLabel: 'お住まいの地域',
      langLabel: '表示および音声読み上げの言語',
      sec3Title: '3. ご家族の緊急連絡先',
      sec3Helper: '不審な請求やメッセージがあった際、ボタン一つで通話や連絡が可能です。',
      contactNameLabel: 'ご家族・信頼できる方のお名前',
      contactNamePlaceholder: '例：美咲（娘）、健太（息子）',
      contactPhoneLabel: 'お電話番号',
      contactPhonePlaceholder: '例：090-1234-5678',
      relationshipLabel: 'ご関係（任意）',
      saveBtn: '保存して ElderEase を始める',
      savingBtn: '保存中...',
      cancelBtn: '変更せずに戻る',
      fixErrorsMsg: '入力を完了するため、以下の項目をご確認ください：',
    },
  }[preferredLanguage];

  return (
    <div
      id="elderease-onboarding-screen"
      className="w-full max-w-3xl mx-auto my-6 p-6 sm:p-8 bg-[#FAF7F0] border-2 border-[#2D2821] rounded-2xl shadow-tactile-dark"
      role="region"
      aria-label="ElderEase Profile Setup"
    >
      {/* Top Header with Tactile Newspaper Banner & Voice Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#2D2821]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block px-3 py-1 bg-[#1A1A1A] text-[#FAF7F0] text-xs uppercase font-bold tracking-wider rounded-md">
              Senior Safety Profile
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1A1A] tracking-tight">
            {strings.title}
          </h1>
          <p className="text-lg text-[#4A453E] mt-1 font-medium">{strings.subtitle}</p>
        </div>

        {/* Read Page Aloud Voice Button */}
        <button
          type="button"
          id="onboarding-read-aloud-btn"
          onClick={handleToggleReadAloud}
          aria-pressed={isSpeaking}
          aria-label={strings.readAloud}
          className={`min-h-[56px] px-5 py-3 rounded-xl border-2 border-[#2D2821] font-bold text-base flex items-center justify-center gap-2 btn-tactile transition-all shrink-0 ${
            isSpeaking
              ? 'bg-[#8C2D19] text-[#FAF7F0] shadow-tactile-crimson animate-pulse'
              : 'bg-[#FAF7F0] text-[#1A1A1A] hover:bg-[#F0EAE1] shadow-tactile'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-6 h-6" />
              <span>{strings.readAloud}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-6 h-6 text-[#1A1A1A]" />
              <span>{strings.readAloud}</span>
            </>
          )}
        </button>
      </div>

      {/* Privacy Guarantee Banner */}
      <div
        className="mt-6 p-4 bg-[#EBF3ED] border-2 border-[#1E4D2B] rounded-xl flex items-center gap-3 text-[#12331C]"
        role="status"
      >
        <ShieldCheck className="w-7 h-7 text-[#1E4D2B] shrink-0" />
        <span className="text-base sm:text-lg font-bold">{strings.privacyBadge}</span>
      </div>

      {/* Validation Error Alert Banner */}
      {Object.keys(errors).length > 0 && (
        <div
          id="onboarding-error-banner"
          role="alert"
          className="mt-6 p-5 bg-[#FDF0EE] border-2 border-[#8C2D19] rounded-xl text-[#5E1D0F]"
        >
          <div className="flex items-center gap-2 font-bold text-lg mb-2">
            <AlertTriangle className="w-6 h-6 text-[#8C2D19]" />
            <span>{strings.fixErrorsMsg}</span>
          </div>
          <ul className="list-disc pl-6 space-y-1 text-base font-semibold">
            {Object.values(errors).map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Configuration Form */}
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-8">
        {/* SECTION 1: User's Preferred Name */}
        <div className="p-6 bg-white border-2 border-[#2D2821] rounded-xl shadow-tactile">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-6 h-6 text-[#1A1A1A]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A]">
              {strings.sec1Title}
            </h2>
          </div>
          <p className="text-base text-[#4A453E] mb-4">{strings.sec1Helper}</p>

          <div>
            <label
              htmlFor="preferred-name-input"
              className="text-lg sm:text-xl font-bold text-[#1A1A1A] block mb-2"
            >
              {strings.nameLabel} <span className="text-[#8C2D19]">*</span>
            </label>
            <input
              id="preferred-name-input"
              type="text"
              value={preferredName}
              onChange={(e) => {
                setPreferredName(e.target.value);
                if (errors.preferredName) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.preferredName;
                    return next;
                  });
                }
              }}
              placeholder={strings.namePlaceholder}
              autoComplete="name"
              aria-required="true"
              aria-invalid={!!errors.preferredName}
              aria-describedby={errors.preferredName ? 'name-error-msg' : undefined}
              className={`w-full min-h-[56px] px-5 py-4 text-xl text-[#1A1A1A] bg-[#FAF7F0] border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1A1A1A]/20 transition-all font-medium ${
                errors.preferredName ? 'border-[#8C2D19] bg-[#FFF5F5]' : 'border-[#2D2821]'
              }`}
            />
            {errors.preferredName && (
              <p id="name-error-msg" className="mt-2 text-base font-bold text-[#8C2D19]">
                ⚠️ {errors.preferredName}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 2: Country & Language Selector */}
        <div className="p-6 bg-white border-2 border-[#2D2821] rounded-xl shadow-tactile">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-6 h-6 text-[#1A1A1A]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A]">
              {strings.sec2Title}
            </h2>
          </div>
          <p className="text-base text-[#4A453E] mb-4">{strings.sec2Helper}</p>

          {/* Country Selection Dropdown */}
          <div className="mb-6">
            <label
              htmlFor="country-select"
              className="text-lg sm:text-xl font-bold text-[#1A1A1A] block mb-2"
            >
              {strings.countryLabel} <span className="text-[#8C2D19]">*</span>
            </label>
            <select
              id="country-select"
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
              aria-label={strings.countryLabel}
              className="w-full min-h-[56px] px-5 py-4 text-xl text-[#1A1A1A] bg-[#FAF7F0] border-2 border-[#2D2821] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1A1A1A]/20 font-medium cursor-pointer"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="text-lg">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Language Tactile Radio Buttons */}
          <div>
            <label className="text-lg sm:text-xl font-bold text-[#1A1A1A] block mb-2">
              {strings.langLabel} <span className="text-[#8C2D19]">*</span>
            </label>
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              role="radiogroup"
              aria-label={strings.langLabel}
            >
              {LOCALES.map((loc) => {
                const isSelected = preferredLanguage === loc.code;
                return (
                  <button
                    key={loc.code}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setPreferredLanguage(loc.code)}
                    className={`min-h-[56px] p-4 rounded-xl border-2 font-bold text-left btn-tactile transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-[#FAF7F0] border-[#1A1A1A] shadow-tactile-dark'
                        : 'bg-[#FAF7F0] text-[#1A1A1A] border-[#2D2821] hover:bg-[#EFEAE1]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl">{loc.flag}</span>
                      {isSelected && <CheckCircle2 className="w-6 h-6 text-[#A3E635]" />}
                    </div>
                    <span className="text-lg mt-2">{loc.native}</span>
                    <span
                      className={`text-xs ${
                        isSelected ? 'text-[#FAF7F0]/80' : 'text-[#4A453E]'
                      }`}
                    >
                      {loc.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 3: Emergency Family Contact */}
        <div className="p-6 bg-white border-2 border-[#2D2821] rounded-xl shadow-tactile">
          <div className="flex items-center gap-2 mb-2">
            <HeartHandshake className="w-6 h-6 text-[#1A1A1A]" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1A1A]">
              {strings.sec3Title}
            </h2>
          </div>
          <p className="text-base text-[#4A453E] mb-4">{strings.sec3Helper}</p>

          <div className="space-y-4">
            {/* Contact Name */}
            <div>
              <label
                htmlFor="emergency-name-input"
                className="text-lg sm:text-xl font-bold text-[#1A1A1A] block mb-2"
              >
                {strings.contactNameLabel} <span className="text-[#8C2D19]">*</span>
              </label>
              <input
                id="emergency-name-input"
                type="text"
                value={emergencyName}
                onChange={(e) => {
                  setEmergencyName(e.target.value);
                  if (errors.emergencyName) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.emergencyName;
                      return next;
                    });
                  }
                }}
                placeholder={strings.contactNamePlaceholder}
                autoComplete="off"
                aria-required="true"
                aria-invalid={!!errors.emergencyName}
                aria-describedby={errors.emergencyName ? 'contact-name-error-msg' : undefined}
                className={`w-full min-h-[56px] px-5 py-4 text-xl text-[#1A1A1A] bg-[#FAF7F0] border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1A1A1A]/20 transition-all font-medium ${
                  errors.emergencyName ? 'border-[#8C2D19] bg-[#FFF5F5]' : 'border-[#2D2821]'
                }`}
              />
              {errors.emergencyName && (
                <p id="contact-name-error-msg" className="mt-2 text-base font-bold text-[#8C2D19]">
                  ⚠️ {errors.emergencyName}
                </p>
              )}
            </div>

            {/* Direct Phone Number */}
            <div>
              <label
                htmlFor="emergency-phone-input"
                className="text-lg sm:text-xl font-bold text-[#1A1A1A] block mb-2"
              >
                {strings.contactPhoneLabel} <span className="text-[#8C2D19]">*</span>
              </label>
              <div className="relative">
                <input
                  id="emergency-phone-input"
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => {
                    setEmergencyPhone(e.target.value);
                    if (errors.emergencyPhone) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.emergencyPhone;
                        return next;
                      });
                    }
                  }}
                  placeholder={strings.contactPhonePlaceholder}
                  autoComplete="tel"
                  aria-required="true"
                  aria-invalid={!!errors.emergencyPhone}
                  aria-describedby={errors.emergencyPhone ? 'contact-phone-error-msg' : undefined}
                  className={`w-full min-h-[56px] px-5 py-4 text-xl text-[#1A1A1A] bg-[#FAF7F0] border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1A1A1A]/20 transition-all font-medium ${
                    errors.emergencyPhone ? 'border-[#8C2D19] bg-[#FFF5F5]' : 'border-[#2D2821]'
                  }`}
                />
              </div>
              {errors.emergencyPhone && (
                <p
                  id="contact-phone-error-msg"
                  className="mt-2 text-base font-bold text-[#8C2D19]"
                >
                  ⚠️ {errors.emergencyPhone}
                </p>
              )}
            </div>

            {/* Relationship (Optional) */}
            <div>
              <label
                htmlFor="emergency-relationship-input"
                className="text-lg sm:text-xl font-bold text-[#1A1A1A] block mb-2"
              >
                {strings.relationshipLabel}
              </label>
              <input
                id="emergency-relationship-input"
                type="text"
                value={emergencyRelationship}
                onChange={(e) => setEmergencyRelationship(e.target.value)}
                placeholder="e.g. Daughter, Son, Neighbor, Caregiver"
                className="w-full min-h-[56px] px-5 py-4 text-xl text-[#1A1A1A] bg-[#FAF7F0] border-2 border-[#2D2821] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#1A1A1A]/20 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons: Save & Continue */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            id="onboarding-submit-btn"
            disabled={isSaved}
            className="flex-1 min-h-[64px] px-8 py-4 bg-[#1E4D2B] text-[#FAF7F0] hover:bg-[#163820] border-2 border-[#12331C] rounded-xl text-xl sm:text-2xl font-bold btn-tactile shadow-tactile-forest flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-7 h-7 text-[#A3E635]" />
                <span>{strings.savingBtn}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-7 h-7 text-[#A3E635]" />
                <span>{strings.saveBtn}</span>
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              id="onboarding-cancel-btn"
              onClick={onCancel}
              className="min-h-[64px] px-6 py-4 bg-[#FAF7F0] text-[#1A1A1A] hover:bg-[#EFEAE1] border-2 border-[#2D2821] rounded-xl text-xl font-bold btn-tactile shadow-tactile transition-all cursor-pointer"
            >
              {strings.cancelBtn}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
