import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnboardingScreen } from '../src/components/OnboardingScreen';
import { speechEngine } from '../src/utils/speech';
import { UserProfile } from '../src/types';

// Mock speech engine to avoid native browser audio in test environments
vi.mock('../src/utils/speech', () => ({
  speechEngine: {
    speak: vi.fn((text, locale, onStart, onEnd) => {
      if (onStart) onStart();
    }),
    stopTTS: vi.fn(),
    isTTSSupported: vi.fn().mockReturnValue(true),
  },
}));

describe('ElderEase Onboarding & Configuration Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ===================================================================
  // 1. RENDER VERIFICATION & ACCESSIBILITY (WCAG AAA)
  // ===================================================================
  describe('Render Verification and Accessibility', () => {
    it('renders the onboarding form with all core accessibility roles and tactile inputs', () => {
      render(<OnboardingScreen onComplete={vi.fn()} />);

      // Verify Screen landmark and title
      expect(screen.getByRole('region', { name: /ElderEase Profile Setup/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: /Welcome to ElderEase/i })).toBeInTheDocument();

      // Verify persistent visual labels with required markers
      expect(screen.getByLabelText(/Your Preferred Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Country of Residence/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Preferred Reading & Spoken Language/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Family Member Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Direct Phone Number/i)).toBeInTheDocument();

      // Verify privacy assurance banner (Zero passwords)
      expect(screen.getByText(/Zero Passwords Required/i)).toBeInTheDocument();

      // Verify prominent Read Aloud button
      const readAloudBtn = screen.getByRole('button', { name: /Read Page Aloud/i });
      expect(readAloudBtn).toBeInTheDocument();

      // Verify Submit Button
      expect(screen.getByRole('button', { name: /Save & Enter ElderEase/i })).toBeInTheDocument();
    });

    it('triggers speech engine when "Read Page Aloud" button is pressed', () => {
      render(<OnboardingScreen onComplete={vi.fn()} />);

      const readAloudBtn = screen.getByRole('button', { name: /Read Page Aloud/i });
      fireEvent.click(readAloudBtn);

      expect(speechEngine.speak).toHaveBeenCalledTimes(1);
      expect(speechEngine.speak).toHaveBeenCalledWith(
        expect.stringContaining('Welcome to ElderEase'),
        'en-US',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('adapts instructions and vocalization when language is switched to Hindi or Japanese', () => {
      render(<OnboardingScreen onComplete={vi.fn()} />);

      // Switch language to Hindi (हिन्दी)
      const hindiRadio = screen.getByRole('radio', { name: /हिन्दी/i });
      fireEvent.click(hindiRadio);

      // Verify Hindi UI text
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/एल्डरईज़/i);
      expect(screen.getByLabelText(/आपका शुभ नाम/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /सुरक्षित करें और आगे बढ़ें/i })).toBeInTheDocument();

      // Trigger read aloud in Hindi
      const readAloudHindi = screen.getByRole('button', { name: /बोलकर सुनाएं/i });
      fireEvent.click(readAloudHindi);

      expect(speechEngine.speak).toHaveBeenCalledWith(
        expect.stringContaining('एल्डरईज़ में आपका स्वागत है'),
        'hi-IN',
        expect.any(Function),
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  // ===================================================================
  // 2. FORM VALIDATION & FAILURE STATES
  // ===================================================================
  describe('Form Validation & Senior-Friendly Error Banners', () => {
    it('displays high-contrast error banner when submitted with empty fields', async () => {
      const handleComplete = vi.fn();
      render(<OnboardingScreen onComplete={handleComplete} />);

      const submitBtn = screen.getByRole('button', { name: /Save & Enter ElderEase/i });
      fireEvent.click(submitBtn);

      // Verify error alert banner rendered
      const errorBanner = screen.getByRole('alert');
      expect(errorBanner).toBeInTheDocument();
      expect(errorBanner).toHaveTextContent(/Please review the highlighted items below to continue/i);

      // Verify field error indicators (present in banner summary and field message)
      expect(screen.getAllByText(/Please enter your preferred name/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Please enter your emergency family contact name/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Please enter a valid phone number/i).length).toBeGreaterThanOrEqual(1);

      // Ensure onComplete was NOT called
      expect(handleComplete).not.toHaveBeenCalled();
    });

    it('rejects invalid phone numbers with fewer than 6 digits', async () => {
      const handleComplete = vi.fn();
      render(<OnboardingScreen onComplete={handleComplete} />);

      // Fill name and contact name properly
      fireEvent.change(screen.getByLabelText(/Your Preferred Name/i), {
        target: { value: 'Margaret' },
      });
      fireEvent.change(screen.getByLabelText(/Family Member Name/i), {
        target: { value: 'Robert (Son)' },
      });
      // Fill invalid short phone number
      fireEvent.change(screen.getByLabelText(/Direct Phone Number/i), {
        target: { value: '123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Save & Enter ElderEase/i }));

      // Name errors should be gone, phone error remains
      expect(screen.queryByText(/Please enter your preferred name/i)).not.toBeInTheDocument();
      expect(screen.getAllByText(/Please enter a valid phone number/i).length).toBeGreaterThanOrEqual(1);
      expect(handleComplete).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // 3. SUCCESSFUL SUBMIT & LOCALSTORAGE PERSISTENCE
  // ===================================================================
  describe('Successful Submission and State Persistence', () => {
    it('persists profile to localStorage and invokes onComplete callback with sanitized model', async () => {
      const handleComplete = vi.fn();
      render(<OnboardingScreen onComplete={handleComplete} />);

      // Fill all fields validly
      fireEvent.change(screen.getByLabelText(/Your Preferred Name/i), {
        target: { value: 'Arthur Pendelton' },
      });

      fireEvent.change(screen.getByLabelText(/Country of Residence/i), {
        target: { value: 'United States' },
      });

      fireEvent.change(screen.getByLabelText(/Family Member Name/i), {
        target: { value: 'Emily (Daughter)' },
      });

      fireEvent.change(screen.getByLabelText(/Direct Phone Number/i), {
        target: { value: '555-0199' },
      });

      fireEvent.change(screen.getByLabelText(/Relationship/i), {
        target: { value: 'Daughter' },
      });

      // Submit the form
      const submitBtn = screen.getByRole('button', { name: /Save & Enter ElderEase/i });
      fireEvent.click(submitBtn);

      // Wait for persistence and callback execution
      await waitFor(() => {
        expect(handleComplete).toHaveBeenCalledTimes(1);
      });

      const calledProfile: UserProfile = handleComplete.mock.calls[0][0];
      expect(calledProfile.preferredName).toBe('Arthur Pendelton');
      expect(calledProfile.country).toBe('United States');
      expect(calledProfile.preferredLanguage).toBe('en-US');
      expect(calledProfile.emergencyContact.fullName).toBe('Emily (Daughter)');
      expect(calledProfile.emergencyContact.phoneNumber).toBe('555-0199');
      expect(calledProfile.emergencyContact.relationship).toBe('Daughter');
      expect(calledProfile.isOnboarded).toBe(true);

      // Verify localStorage persistence
      const storedItem = localStorage.getItem('elderease_profile');
      expect(storedItem).not.toBeNull();
      const parsedStored = JSON.parse(storedItem!);
      expect(parsedStored.preferredName).toBe('Arthur Pendelton');
      expect(parsedStored.emergencyContact.phoneNumber).toBe('555-0199');
    });

    it('pre-populates existing profile when passed initialProfile', () => {
      const existingProfile: UserProfile = {
        preferredName: 'Kamla Devi',
        country: 'India',
        preferredLanguage: 'hi-IN',
        emergencyContact: {
          fullName: 'Amit (Son)',
          phoneNumber: '+91 98765 43210',
          relationship: 'Son',
        },
        isOnboarded: true,
        createdAt: '2026-09-19T00:00:00Z',
      };

      render(<OnboardingScreen initialProfile={existingProfile} onComplete={vi.fn()} />);

      // Should render in Hindi since initialProfile has preferredLanguage hi-IN
      expect(screen.getByLabelText(/आपका शुभ नाम/i)).toHaveValue('Kamla Devi');
      expect(screen.getByLabelText(/परिवार के सदस्य का नाम/i)).toHaveValue('Amit (Son)');
      expect(screen.getByLabelText(/उनका फोन नंबर/i)).toHaveValue('+91 98765 43210');
    });

    it('triggers onLanguageChange when a user selects a different language', () => {
      const handleLanguageChange = vi.fn();
      render(<OnboardingScreen onComplete={vi.fn()} onLanguageChange={handleLanguageChange} />);

      // Click Hindi radio button
      const hindiBtn = screen.getByRole('radio', { name: /हिन्दी/i });
      fireEvent.click(hindiBtn);

      expect(handleLanguageChange).toHaveBeenCalledWith('hi-IN');
    });
  });
});
