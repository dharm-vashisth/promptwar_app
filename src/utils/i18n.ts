import { LocaleType } from '../types';

export interface TranslationDict {
  date: string;
  weather: string;
  salutation: string;
  salutationSub: string;
  audioBarTitle: string;
  audioBarCaption: string;
  masterListen: string;
  masterStop: string;
  tabs: {
    morning: string;
    scanner: string;
    family: string;
  };
  morning: {
    stamp: string;
    badgeSafe: string;
    headline: string;
    summary: string;
    bankTitle: string;
    bankDetail: string;
    medTitle: string;
    medDetail: string;
    deliveryTitle: string;
    deliveryDetail: string;
    readAloudBtn: string;
    checkMessageBtn: string;
  };
  scanner: {
    badge: string;
    piiStatus: string;
    title: string;
    instruction: string;
    samplesLabel: string;
    sampleScamTitle: string;
    sampleScamSub: string;
    sampleSafeTitle: string;
    sampleSafeSub: string;
    samplePrescriptionTitle: string;
    samplePrescriptionSub: string;
    inputLabel: string;
    inputPlaceholder: string;
    scanBtn: string;
    analyzingBtn: string;
    clearBtn: string;
    voiceDictateBtn: string;
    voiceDictating: string;
    cameraCaptureBtn: string;
    photoUploadBtn: string;
  };
  result: {
    piiSanitizedBadge: string;
    justNow: string;
    dangerTitle: string;
    safeTitle: string;
    dangerSub: string;
    safeSub: string;
    plainHeading: string;
    actionHeading: string;
    listenAdviceBtn: string;
    callFamilyBtn: string;
    doneBtn: string;
    detectedSignalsLabel: string;
  };
  family: {
    badge: string;
    availableBadge: string;
    title: string;
    sub: string;
    callBtn: string;
    backBtn: string;
    alertFamilyBtn: string;
    alertSentToast: string;
    contacts: Array<{
      id: string;
      name: string;
      relationship: string;
      phone: string;
      badge: string;
      initials: string;
      theme: 'forest' | 'amber' | 'radio';
    }>;
  };
  scamHook: {
    badge: string;
    buttonLabel: string;
    activeNotice: string;
  };
  footerNote: string;
}

export const translations: Record<LocaleType, TranslationDict> = {
  'en-US': {
    date: 'Friday, October 24',
    weather: '72° Calm & Sunny',
    salutation: 'Good morning, Arthur.',
    salutationSub: 'Take your time. No rush today.',
    audioBarTitle: 'Bedside Audio Companion',
    audioBarCaption: 'Tap Listen on any card to read aloud clearly',
    masterListen: 'Listen',
    masterStop: 'Stop Audio',
    tabs: {
      morning: '📰 Morning',
      scanner: '🔍 Safety Scan',
      family: '📞 Help & Family',
    },
    morning: {
      stamp: 'Daily Morning Digest',
      badgeSafe: 'No Urgent Risks',
      headline: 'Everything is quiet and safe today.',
      summary: 'Your bank balance is verified. Your pharmacy delivery arrives at 2:00 PM. No bills are due today.',
      bankTitle: 'Bank & Accounts',
      bankDetail: 'All accounts safe. Zero strange charges.',
      medTitle: 'Medicine Reminder',
      medDetail: 'Blood pressure pill taken with breakfast.',
      deliveryTitle: 'Afternoon Delivery',
      deliveryDetail: 'CVS Pharmacy package expected at front door.',
      readAloudBtn: 'Read Morning Digest Aloud',
      checkMessageBtn: 'Check a Message or Bill',
    },
    scanner: {
      badge: 'Multimodal Safety Check',
      piiStatus: 'PII Masked On Edge',
      title: 'Did someone send you a message or bill?',
      instruction: 'Paste the text, dictate by voice, or snap a photo. We will check if it is safe or a scam.',
      samplesLabel: 'Quick Test Samples:',
      sampleScamTitle: '⚠️ Fake Electric Disconnect',
      sampleScamSub: 'Urgent shutoff SMS with phishing link',
      sampleSafeTitle: '✅ Normal Water Bill',
      sampleSafeSub: 'Monthly municipal statement $34.50',
      samplePrescriptionTitle: '💊 Pharmacy Prescription',
      samplePrescriptionSub: 'Refill ready notice from clinic',
      inputLabel: 'Message Text, SMS, or Bill Details:',
      inputPlaceholder: 'Paste SMS, type message, or dictate by voice...',
      scanBtn: 'Analyze For Safety Now',
      analyzingBtn: 'Reviewing Carefully...',
      clearBtn: 'Clear & Start Fresh',
      voiceDictateBtn: 'Dictate by Voice',
      voiceDictating: 'Listening to you...',
      cameraCaptureBtn: 'Camera Photo',
      photoUploadBtn: 'Upload Bill / Letter',
    },
    result: {
      piiSanitizedBadge: 'Phone & Bank Numbers Masked Before Analysis',
      justNow: 'Just now',
      dangerTitle: '⚠️ DANGER: Do Not Trust This',
      safeTitle: '✅ SAFE: Verified Normal Notice',
      dangerSub: 'Scam Detected',
      safeSub: 'Clean & Safe',
      plainHeading: '15-Word Plain Language Summary:',
      actionHeading: 'Single Recommended Next Action:',
      listenAdviceBtn: 'Listen to This Safety Advice Aloud',
      callFamilyBtn: 'Call Family Now',
      doneBtn: 'All Clear / Back to Morning',
      detectedSignalsLabel: 'Detected Urgency Triggers:',
    },
    family: {
      badge: 'One-Touch Verified Contacts',
      availableBadge: 'Always Available',
      title: 'Speak with someone you trust',
      sub: 'If anything feels confusing or scary, tap a button below to call immediately.',
      callBtn: 'Call Now',
      backBtn: 'Back to Morning Digest',
      alertFamilyBtn: 'Send One-Tap "Help Me Check" SMS',
      alertSentToast: 'SMS notification dispatched to daughter Sarah with safety report.',
      contacts: [
        {
          id: 'c1',
          name: 'Sarah (Daughter)',
          relationship: 'Primary Family Helper',
          phone: '+1 (555) 234-5678',
          badge: 'Verified Family',
          initials: 'S',
          theme: 'forest',
        },
        {
          id: 'c2',
          name: 'Chase Bank Helpline',
          relationship: 'Official Senior Support',
          phone: '1-800-935-9935',
          badge: 'Official Bank Number',
          initials: 'B',
          theme: 'amber',
        },
        {
          id: 'c3',
          name: 'Dr. Miller’s Clinic',
          relationship: 'Family Physician Desk',
          phone: '+1 (555) 890-1234',
          badge: 'Doctor Desk',
          initials: 'Dr',
          theme: 'radio',
        },
      ],
    },
    scamHook: {
      badge: 'Judge Demo Quick-Test',
      buttonLabel: '⚡ Inject Scam SMS',
      activeNotice: 'Scam injected: Instant voice warning + family alert workflow active.',
    },
    footerNote: 'Secure Guardrail Active • ElderEase v2.4 Calm Tech',
  },

  'hi-IN': {
    date: 'शुक्रवार, २४ अक्टूबर',
    weather: '२४° शांत एवं सुहावना मौसम',
    salutation: 'प्रणाम आदरणीय दादू जी।',
    salutationSub: 'नमस्ते। आज आपका दिन पूरी तरह शांत और सुखद रहेगा।',
    audioBarTitle: 'आवाज़ साथी (रेडियो मोड)',
    audioBarCaption: 'किसी भी समाचार या सूचना को साफ़-साफ़ सुनने के लिए दबाएँ',
    masterListen: 'आवाज़ में सुनें',
    masterStop: 'आवाज़ रोकें',
    tabs: {
      morning: '📰 सुबह का समाचार',
      scanner: '🔍 सुरक्षा जांच',
      family: '📞 परिवार से बात',
    },
    morning: {
      stamp: 'दैनिक सुबह की पत्रिका',
      badgeSafe: 'कोई चिंता नहीं',
      headline: 'आज सब कुछ शांत, सुरक्षित और व्यवस्थित है।',
      summary: 'आपके बैंक खाते में सब सुरक्षित है। दोपहर २ बजे दवाइयाँ घर पहुँचेंगी। आज कोई बिल नहीं भरना है।',
      bankTitle: 'बैंक व खाता सुरक्षा',
      bankDetail: 'सभी खाते पूरी तरह सुरक्षित हैं। कोई नया खर्च नहीं।',
      medTitle: 'दवाई की याददाश्त',
      medDetail: 'सुबह नाश्ते के बाद बी.पी. की गोली ले ली गई है।',
      deliveryTitle: 'दोपहर की डिलीवरी',
      deliveryDetail: 'दवाइयों का पार्सल दोपहर २ बजे दरवाज़े पर पहुँचेगा।',
      readAloudBtn: 'यह सुबह का समाचार आवाज़ में सुनें',
      checkMessageBtn: 'कोई नया संदेश या बिल जाँचें',
    },
    scanner: {
      badge: 'मल्टीमॉडल सुरक्षा पड़ताल',
      piiStatus: 'फ़ोन व खाता नंबर गुप्त रखे गए',
      title: 'क्या किसी ने नया संदेश, चिट्ठी या बिल भेजा है?',
      instruction: 'संदेश यहाँ लिखें, बोलकर बताएँ, या कैमरे से तस्वीर खींचें। हम तुरंत बताएँगे कि यह असली है या कोई ठगी।',
      samplesLabel: 'परीक्षण के लिए नमूना चुनें:',
      sampleScamTitle: '⚠️ बिजली काटने का झूठा संदेश',
      sampleScamSub: 'तुरंत बिजली काटने की धमकी व लिंक',
      sampleSafeTitle: '✅ पानी का सामान्य बिल',
      sampleSafeSub: 'नगर निगम का सामान्य ३५० रुपये का बिल',
      samplePrescriptionTitle: '💊 दवाई की रसीद',
      samplePrescriptionSub: 'क्लिनिक से दवाई मँगाने की पर्ची',
      inputLabel: 'संदेश या बिल का ब्यौरा:',
      inputPlaceholder: 'यहाँ संदेश लिखें, या माइक दबाकर बोलें...',
      scanBtn: 'तुरंत सुरक्षा जाँच करें',
      analyzingBtn: 'गंभीरता से जाँच हो रही है...',
      clearBtn: 'साफ़ करें और नया देखें',
      voiceDictateBtn: 'बोलकर लिखें (माइक)',
      voiceDictating: 'आपकी बात सुन रहे हैं...',
      cameraCaptureBtn: 'कैमरे से फ़ोटो लें',
      photoUploadBtn: 'बिल या पर्ची अपलोड करें',
    },
    result: {
      piiSanitizedBadge: 'फ़ोन और बैंक नंबर सुरक्षित रूप से हटा दिए गए',
      justNow: 'अभी-अभी',
      dangerTitle: '⚠️ सावधान: यह संदेश एक ठगी (Scam) है',
      safeTitle: '✅ सुरक्षित: यह संदेश असली व सही है',
      dangerSub: 'धोखाधड़ी पहचानी गई',
      safeSub: 'पूर्णतः सुरक्षित',
      plainHeading: 'सरल व स्पष्ट सारांश:',
      actionHeading: 'आपको अब क्या करना चाहिए:',
      listenAdviceBtn: 'यह सलाह आवाज़ में सुनें',
      callFamilyBtn: 'परिवार को फ़ोन मिलाएँ',
      doneBtn: 'सब ठीक है / वापस मुख्य पृष्ठ पर जाएँ',
      detectedSignalsLabel: 'पहचाने गए ख़तरे के संकेत:',
    },
    family: {
      badge: 'एक-स्पर्श सत्यापित संपर्क',
      availableBadge: 'सदैव उपलब्ध',
      title: 'अपने प्रियजनों से बात करें',
      sub: 'अगर कोई भी बात समझ न आए या चिंता हो, बेझिझक नीचे दिया बटन दबाएँ।',
      callBtn: 'फ़ोन मिलाएँ',
      backBtn: 'सुबह के समाचार पर लौटें',
      alertFamilyBtn: 'बेटी आरती को "जाँच में मदद" का एसएमएस भेजें',
      alertSentToast: 'बेटी आरती को पूरी रिपोर्ट के साथ संदेश भेज दिया गया है।',
      contacts: [
        {
          id: 'c1',
          name: 'आरती (बेटी)',
          relationship: 'मुख्य पारिवारिक सहयोगी',
          phone: '+91 98765 43210',
          badge: 'सत्यापित परिजन',
          initials: 'आ',
          theme: 'forest',
        },
        {
          id: 'c2',
          name: 'भारतीय स्टेट बैंक सुरक्षा',
          relationship: 'वरिष्ठ नागरिक हेल्पलाइन',
          phone: '1800 11 2211',
          badge: 'आधिकारिक बैंक हेल्पलाइन',
          initials: 'बैं',
          theme: 'amber',
        },
        {
          id: 'c3',
          name: 'डॉक्टर वर्मा क्लिनिक',
          relationship: 'पारिवारिक चिकित्सक',
          phone: '+91 98100 11223',
          badge: 'डॉक्टर सहायता',
          initials: 'डॉ',
          theme: 'radio',
        },
      ],
    },
    scamHook: {
      badge: 'जज डेमो टेस्ट (१-क्लिक)',
      buttonLabel: '⚡ ठगी संदेश टेस्ट करें',
      activeNotice: 'बिजली कटने का फ़र्ज़ी संदेश लोड हुआ: तुरंत आवाज़ चेतावनी व परिवार अलर्ट तैयार!',
    },
    footerNote: 'सुरक्षा घेरा सक्रिय • एल्डरईज़ v2.4 काम-टेक',
  },

  'ja-JP': {
    date: '10月24日 金曜日',
    weather: '22° 穏やかな秋晴れ',
    salutation: 'おはようございます、タナカ様。',
    salutationSub: 'ごゆっくりお過ごしください。本日は安心な一日です。',
    audioBarTitle: '枕元ラジオ音声アシスタント',
    audioBarCaption: '「聞く」を押すと、はっきりとした声でお知らせします',
    masterListen: '音声で聞く',
    masterStop: '停止する',
    tabs: {
      morning: '📰 朝のお便り',
      scanner: '🔍 安全スキャン',
      family: '📞 ご家族・相談',
    },
    morning: {
      stamp: '毎朝の安心ダイジェスト',
      badgeSafe: '不審な点なし',
      headline: '本日も安心・平穏にお過ごしいただけます。',
      summary: '口座は安全に保護されています。お薬の配送は午後2時を予定しています。本日の支払い期限はありません。',
      bankTitle: '銀行・口座の安全',
      bankDetail: '口座は安全です。不審な引き落としはありません。',
      medTitle: 'お薬のリマインダー',
      medDetail: '朝食後の血圧のお薬は服用済みです。',
      deliveryTitle: '午後の定期便',
      deliveryDetail: 'かかりつけ薬局からのお届け物が午後2時に届きます。',
      readAloudBtn: '朝のお便りを音声で聞く',
      checkMessageBtn: '気になるメールや手紙を確認',
    },
    scanner: {
      badge: 'マルチモーダル安全チェック',
      piiStatus: '電話番号・口座番号を自動保護',
      title: '気になるメッセージや請求書が届きましたか？',
      instruction: '内容の入力、音声、またはカメラ撮影で確認できます。詐欺や偽の請求をやさしく判定します。',
      samplesLabel: 'テスト用サンプル:',
      sampleScamTitle: '⚠️ 送電停止を装う偽SMS',
      sampleScamSub: '電力会社をかたる未払い催促リンク',
      sampleSafeTitle: '✅ 水道局の通常明細',
      sampleSafeSub: '毎月の正規請求 3,400円',
      samplePrescriptionTitle: '💊 処方箋のお知らせ',
      samplePrescriptionSub: 'クリニックからの定期処方箋通知',
      inputLabel: '届いた文章・請求内容:',
      inputPlaceholder: 'メール文章を貼り付けるか、マイクで話してください...',
      scanBtn: '安全性を診断する',
      analyzingBtn: '診断中...',
      clearBtn: '消去して最初に戻る',
      voiceDictateBtn: '音声で入力する',
      voiceDictating: 'お話しください...',
      cameraCaptureBtn: 'カメラで撮影',
      photoUploadBtn: '書類の写真を読み込む',
    },
    result: {
      piiSanitizedBadge: '電話番号・口座情報は安全にマスキング済み',
      justNow: 'たった今',
      dangerTitle: '⚠️ 警告: 危険なメッセージです',
      safeTitle: '✅ 安全: 正規の通知です',
      dangerSub: '詐欺を検知',
      safeSub: '安全確認済み',
      plainHeading: 'わかりやすい要約:',
      actionHeading: '今すぐすべきこと:',
      listenAdviceBtn: 'このアドバイスを音声で聞く',
      callFamilyBtn: '家族に今すぐ電話',
      doneBtn: '確認完了 / 朝のお便りに戻る',
      detectedSignalsLabel: '検知された不安を煽るキーワード:',
    },
    family: {
      badge: 'ワンタッチ信頼連絡先',
      availableBadge: 'いつでも通話可能',
      title: '信頼できる方に相談する',
      sub: '少しでも怪しい・不安だと感じたときは、いつでもボタン一つで繋がります。',
      callBtn: '電話をかける',
      backBtn: '朝のお便りに戻る',
      alertFamilyBtn: '娘の美咲さんに「確認のお願い」SMSを送信',
      alertSentToast: '診断レポート付きで娘の美咲さんにSMSを送信しました。',
      contacts: [
        {
          id: 'c1',
          name: '美咲 (娘)',
          relationship: '最優先サポート家族',
          phone: '090-1234-5678',
          badge: '確認済み家族',
          initials: '美',
          theme: 'forest',
        },
        {
          id: 'c2',
          name: '銀行不正対策窓口',
          relationship: 'シニア専用サポート',
          phone: '0120-111-222',
          badge: '公式専用番号',
          initials: '銀',
          theme: 'amber',
        },
        {
          id: 'c3',
          name: '佐藤クリニック',
          relationship: 'かかりつけ医',
          phone: '03-3456-7890',
          badge: '医療相談窓口',
          initials: '佐',
          theme: 'radio',
        },
      ],
    },
    scamHook: {
      badge: '審査員クイック検証',
      buttonLabel: '⚡ 詐欺SMSを即時注入',
      activeNotice: '送電停止詐欺SMSを読み込みました：即時音声警告＋家族通知が動作します。',
    },
    footerNote: '安心安全ガードレール稼働中 • ElderEase v2.4 Calm Tech',
  },
};
