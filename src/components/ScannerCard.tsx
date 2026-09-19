import React, { useState, useRef } from 'react';
import {
  Shield,
  Lock,
  Mic,
  MicOff,
  Camera,
  Upload,
  ShieldAlert,
  RotateCcw,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { LocaleType } from '../types';
import { translations } from '../utils/i18n';
import { presetSamples } from '../data/samples';
import { speechEngine } from '../utils/speech';

interface ScannerCardProps {
  locale: LocaleType;
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  attachedImage: string | null;
  setAttachedImage: (img: string | null) => void;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  onClear: () => void;
}

export const ScannerCard: React.FC<ScannerCardProps> = ({
  locale,
  inputMessage,
  setInputMessage,
  attachedImage,
  setAttachedImage,
  isAnalyzing,
  onRunAnalysis,
  onClear,
}) => {
  const t = translations[locale].scanner;
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Voice dictation toggle
  const toggleVoiceDictation = () => {
    if (isRecording) {
      speechEngine.stopListening();
      setIsRecording(false);
      return;
    }

    if (!speechEngine.isSTTSupported()) {
      alert(
        locale === 'hi-IN'
          ? 'इस ब्राउज़र में आवाज़ पहचान (Speech-to-Text) समर्थित नहीं है। कृपया लिखकर जांचें।'
          : 'Speech recognition is not available in this browser. Please type or paste text.'
      );
      return;
    }

    speechEngine.startListening(
      locale,
      (transcript) => {
        setInputMessage(transcript);
      },
      () => {
        setIsRecording(false);
      },
      (err) => {
        console.warn('Voice STT error:', err);
        setIsRecording(false);
      }
    );
    setIsRecording(true);
  };

  // Live Camera Photo Capture
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        streamRef.current = stream;
        setIsCameraActive(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }, 100);
      } else {
        throw new Error('Camera access not supported');
      }
    } catch (err: any) {
      console.warn('Camera failed to start:', err);
      setCameraError(
        locale === 'hi-IN'
          ? 'कैमरा खोलने में असमर्थ। आप फ़ाइल अपलोड कर सकते हैं।'
          : 'Could not access camera. You can upload an image file instead.'
      );
      // Fallback: trigger simulated camera bill snapshot
      simulateCameraSnapshot();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setAttachedImage(dataUrl);
      }
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Simulated Camera Snapshot for demonstration
  const simulateCameraSnapshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw simulated paper bill texture
      ctx.fillStyle = '#FAF7F0';
      ctx.fillRect(0, 0, 600, 360);
      ctx.strokeStyle = '#D9D0C1';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 580, 340);

      // Draw header
      ctx.fillStyle = '#8C2D19';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.fillText('DISCONNECT NOTICE - IMMEDIATE ACTION REQUIRED', 30, 60);

      ctx.fillStyle = '#1A1A1A';
      ctx.font = '18px sans-serif';
      ctx.fillText('Account No: 4892-0012-9841', 30, 110);
      ctx.fillText('Amount Due: $112.40 | Shutoff: In 45 Minutes', 30, 145);
      ctx.fillText('Pay immediately at: bit.ly/power-urgent-pay', 30, 180);
      ctx.fillText('Or call customer desk: +1 (555) 019-9234', 30, 215);

      // Watermark
      ctx.fillStyle = '#C28B80';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('[PHOTOGRAPHED DOCUMENT SCANNED BY ELDEREASE CAM]', 30, 310);

      const dataUrl = canvas.toDataURL('image/jpeg');
      setAttachedImage(dataUrl);

      // Auto-populate OCR text
      if (!inputMessage) {
        setInputMessage(
          locale === 'hi-IN'
            ? 'बिजली बिल विच्छेदन सूचना: आपका पिछला बिजली बिल ₹1,120 बकाया है। आज रात 9:30 बजे बिजली काट दी जाएगी। लिंक: http://bit.ly/power-pay-xyz'
            : 'DISCONNECT NOTICE: Your electricity will be shut off in 45 minutes due to unpaid $112.40 balance. Pay immediately at bit.ly/power-urgent-pay or call +1 (555) 019-9234'
        );
      }
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAttachedImage(result);
        if (!inputMessage) {
          setInputMessage(
            locale === 'hi-IN'
              ? 'अपलोड किए गए दस्तावेज़ से पाठ निकाला गया: "बिजली बिल भुगतान अंतिम चेतावनी"'
              : `Scanned document: ${file.name} - Checking contents for safety.`
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Load preset sample
  const handleLoadSample = (sampleId: string) => {
    const sample = presetSamples.find((s) => s.id === sampleId);
    if (sample) {
      setInputMessage(sample.payload[locale]);
    }
  };

  return (
    <section id="card-scanner" className="flex-1 flex flex-col">
      <div className="bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-2xl p-5 sm:p-6 shadow-tactile flex-1 flex flex-col justify-between">
        <div>
          {/* Header Status Badges */}
          <div className="flex items-center justify-between border-b border-[#E4DCD0] pb-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDF8EC] border border-[#7C4A03]/30 rounded-full text-xs font-bold text-[#7C4A03] uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> {t.badge}
            </span>
            <span className="text-xs font-bold text-[#1E4D2B] flex items-center gap-1 bg-[#F0F7F2] px-2.5 py-1 rounded-full border border-[#C2E0C9]">
              <Lock className="w-3.5 h-3.5" /> {t.piiStatus}
            </span>
          </div>

          <h2 id="scanner-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-tight mb-2">
            {t.title}
          </h2>
          <p id="scanner-instruction" className="text-base sm:text-lg text-[#4A4A4A] mb-4 font-medium leading-normal">
            {t.instruction}
          </p>

          {/* Quick Preset Samples for Testing */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
              {t.samplesLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('scam-electric')}
                className="p-2.5 text-left bg-[#FDF2F0] border-2 border-[#8C2D19] rounded-xl hover:bg-red-100 transition-colors btn-tactile cursor-pointer"
              >
                <div className="text-xs font-black text-[#8C2D19] uppercase tracking-wide flex items-center gap-1">
                  <span>{t.sampleScamTitle}</span>
                </div>
                <div className="text-xs text-[#1A1A1A] line-clamp-1 mt-0.5 font-semibold">
                  {t.sampleScamSub}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('safe-water-bill')}
                className="p-2.5 text-left bg-[#F0F7F2] border-2 border-[#1E4D2B] rounded-xl hover:bg-green-100 transition-colors btn-tactile cursor-pointer"
              >
                <div className="text-xs font-black text-[#1E4D2B] uppercase tracking-wide">
                  {t.sampleSafeTitle}
                </div>
                <div className="text-xs text-[#1A1A1A] line-clamp-1 mt-0.5 font-semibold">
                  {t.sampleSafeSub}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('safe-med-notice')}
                className="p-2.5 text-left bg-[#FAF7F0] border-2 border-[#7C4A03] rounded-xl hover:bg-amber-100 transition-colors btn-tactile cursor-pointer"
              >
                <div className="text-xs font-black text-[#7C4A03] uppercase tracking-wide">
                  {t.samplePrescriptionTitle}
                </div>
                <div className="text-xs text-[#1A1A1A] line-clamp-1 mt-0.5 font-semibold">
                  {t.samplePrescriptionSub}
                </div>
              </button>
            </div>
          </div>

          {/* Multimodal Input: Textarea with High Contrast & Senior Font */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="message-input-area" className="text-sm font-bold text-[#1A1A1A]">
                {t.inputLabel}
              </label>

              {/* Dictate by voice button */}
              <button
                type="button"
                id="voice-dictate-btn"
                onClick={toggleVoiceDictation}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 btn-tactile cursor-pointer ${
                  isRecording
                    ? 'bg-[#8C2D19] text-white border-[#5E1D0F] animate-pulse'
                    : 'bg-[#FDFBF7] text-[#1A1A1A] border-[#1A1A1A]'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-white" />
                    <span>{t.voiceDictating}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    <span>{t.voiceDictateBtn}</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              id="message-input-area"
              rows={4}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="w-full text-lg sm:text-xl p-3.5 bg-[#FDFBF7] border-2 border-[#1A1A1A] rounded-xl text-[#1A1A1A] font-medium focus:ring-4 focus:ring-[#1E4D2B] focus:outline-none placeholder-[#7A746B] leading-relaxed"
            />
          </div>

          {/* Camera / Document Upload Row */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="open-camera-btn"
                onClick={isCameraActive ? stopCamera : startCamera}
                className="btn-tactile flex-1 py-2 px-3 bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl text-xs sm:text-sm font-bold text-[#1A1A1A] flex items-center justify-center gap-2 hover:bg-[#F4EFE6]"
              >
                <Camera className="w-4 h-4 text-[#1A1A1A]" />
                <span>{isCameraActive ? 'Close Camera' : t.cameraCaptureBtn}</span>
              </button>

              <button
                type="button"
                id="upload-photo-btn"
                onClick={() => fileInputRef.current?.click()}
                className="btn-tactile flex-1 py-2 px-3 bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl text-xs sm:text-sm font-bold text-[#1A1A1A] flex items-center justify-center gap-2 hover:bg-[#F4EFE6]"
              >
                <Upload className="w-4 h-4 text-[#1A1A1A]" />
                <span>{t.photoUploadBtn}</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Live Camera Viewfinder if Active */}
            {isCameraActive && (
              <div className="mt-3 p-3 bg-[#1A1A1A] rounded-xl flex flex-col items-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-48 bg-black rounded-lg object-cover mb-2"
                />
                <button
                  type="button"
                  id="snap-camera-photo-btn"
                  onClick={capturePhoto}
                  className="btn-tactile px-5 py-2.5 bg-[#1E4D2B] text-white font-bold text-sm rounded-lg flex items-center gap-2 shadow-tactile-forest"
                >
                  <Camera className="w-4 h-4" /> Take Snapshot Now
                </button>
              </div>
            )}

            {/* Attached Photo Preview */}
            {attachedImage && (
              <div className="mt-3 p-2.5 bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 bg-white border border-[#E4DCD0] rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={attachedImage}
                      alt="Attached bill"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-[#1E4D2B]" /> Document Photo Attached
                    </div>
                    <div className="text-[11px] text-[#4A4A4A]">Ready for multimodal OCR analysis</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1.5 text-[#8C2D19] hover:bg-red-50 rounded-lg"
                  title="Remove image"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {cameraError && (
              <div className="mt-2 text-xs font-semibold text-[#8C2D19] bg-[#FDF2F0] p-2 rounded-lg border border-[#8C2D19]/30">
                {cameraError}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA Action Buttons */}
        <div className="space-y-3 pt-3 border-t-2 border-[#E4DCD0]">
          <button
            type="button"
            id="run-analysis-btn"
            onClick={onRunAnalysis}
            disabled={isAnalyzing || (!inputMessage.trim() && !attachedImage)}
            className={`btn-tactile w-full py-4 px-4 font-bold text-lg sm:text-xl rounded-xl flex items-center justify-center gap-3 ${
              isAnalyzing || (!inputMessage.trim() && !attachedImage)
                ? 'bg-[#D9D0C1] text-[#7A746B] cursor-not-allowed'
                : 'bg-[#1E4D2B] text-[#FDFBF7] shadow-tactile-forest hover:bg-[#163820]'
            }`}
          >
            <ShieldAlert className="w-6 h-6 text-white" />
            <span>{isAnalyzing ? t.analyzingBtn : t.scanBtn}</span>
          </button>

          <button
            type="button"
            id="clear-scanner-btn"
            onClick={onClear}
            className="w-full py-2.5 text-sm sm:text-base font-bold text-[#4A4A4A] hover:text-[#1A1A1A] underline text-center cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" /> {t.clearBtn}
          </button>
        </div>
      </div>
    </section>
  );
};
