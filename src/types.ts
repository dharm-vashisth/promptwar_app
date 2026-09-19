export type LocaleType = 'en-US' | 'hi-IN' | 'ja-JP';

export type CardMode = 'morning' | 'scanner' | 'result' | 'family' | 'onboarding';

export interface EmergencyContact {
  fullName: string;
  phoneNumber: string;
  relationship?: string;
}

export interface UserProfile {
  preferredName: string;
  country: string;
  preferredLanguage: LocaleType;
  emergencyContact: EmergencyContact;
  isOnboarded: boolean;
  createdAt?: string;
}

export interface SafetyAnalysisResult {
  safetyStatus: 'DANGER' | 'SAFE' | 'CAUTION';
  statusTitle: string;
  statusSub: string;
  fifteenWordSummary: string;
  recommendedAction: string;
  piiMasked: boolean;
  sanitizedInput: string;
  detectedScamIndicators: string[];
  urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
  timestamp: string;
  engineType?: 'gemini-realtime' | 'heuristic-edge';
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  avatarLetter: string;
  verifiedBadge: string;
  isPrimary: boolean;
  themeColor: 'forest' | 'amber' | 'radio' | 'crimson';
}

export interface PresetSample {
  id: string;
  type: 'scam' | 'safe_bill' | 'med_notice';
  labelBadge: string;
  badgeType: 'danger' | 'safe' | 'caution';
  title: string;
  description: string;
  payload: Record<LocaleType, string>;
}
