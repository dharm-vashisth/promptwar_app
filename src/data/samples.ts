import { PresetSample } from '../types';

export const presetSamples: PresetSample[] = [
  {
    id: 'scam-electric',
    type: 'scam',
    labelBadge: '⚠️ Urgent Shutoff Scam',
    badgeType: 'danger',
    title: 'Fake Electric Power Cut',
    description: 'Threatens immediate disconnect in 45 minutes with phishing link',
    payload: {
      'en-US':
        'URGENT NOTICE: Power Disconnect Notice. Your electricity will be turned off in 45 minutes due to an unpaid balance of $112.40. Click link now to pay immediately: http://bit.ly/power-urgent-pay or call +1 (555) 019-9234.',
      'hi-IN':
        'बिजली विभाग चेतावनी: आपका पिछला बिजली बिल बकाया है। आज रात 9:30 बजे आपके घर की बिजली काट दी जाएगी। अपनी बिजली चालू रखने के लिए तुरंत इस लिंक पर भुगतान करें: http://bit.ly/power-pay-xyz या +91 98765 00112 पर बात करें।',
      'ja-JP':
        '東京電力 送電停止予告：未払い料金12,400円のお支払い期限が過ぎています。本日中に下記リンクより支払われない場合、直ちに送電を停止いたします。http://bit.ly/power-pay-jp',
    },
  },
  {
    id: 'safe-water-bill',
    type: 'safe_bill',
    labelBadge: '✅ Normal Water Bill',
    badgeType: 'safe',
    title: 'City Water Utility Statement',
    description: 'Monthly municipal bill with routine auto-pay deduction',
    payload: {
      'en-US':
        'City Water Utility: Your monthly statement for October is $34.50. Scheduled automatic bank deduction on November 12. Account #4920-1823. No further action needed.',
      'hi-IN':
        'नगर निगम जल विभाग: अक्टूबर माह का सामान्य पानी का बिल ₹350 प्राप्त हुआ। खाता संख्या 4920-1823। देय तिथि 15 नवंबर है। आपके बैंक खाते से स्वतः भुगतान हो जाएगा। कोई चिंता की बात नहीं।',
      'ja-JP':
        '東京都水道局：10月分水道料金のお知らせ。ご請求金額は3,450円です。指定口座より11月12日に自動振替いたします。特別な手続きは不要です。',
    },
  },
  {
    id: 'safe-med-notice',
    type: 'med_notice',
    labelBadge: '💊 Pharmacy Prescription',
    badgeType: 'safe',
    title: 'CVS Pharmacy Refill Notice',
    description: 'Legitimate prescription ready for regular delivery',
    payload: {
      'en-US':
        'CVS Pharmacy: Prescription #883920 for Lisinopril 10mg is ready and packaged. Free senior home courier delivery scheduled for 2:00 PM today. Thank you.',
      'hi-IN':
        'अपोलो फार्मेसी: आपकी रक्तचाप की नियमित दवा तैयार है। हमारा सहयोगी आज दोपहर 2:00 बजे घर पर डिलीवरी देने आएगा। किसी भी सहायता के लिए अपने डॉक्टर से संपर्क करें।',
      'ja-JP':
        'かかりつけ薬局：定期処方薬（血圧のお薬）の調剤が完了しました。本日午後2時にご自宅へお届け予定です。',
    },
  },
];
