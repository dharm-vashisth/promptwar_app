"""
ElderEase - Enterprise Backend Test Suite
Framework: pytest, FastAPI TestClient (httpx), unittest.mock
Validates:
- Edge PII Sanitization (Phone, Email, Credit Card, SSN, Aadhaar)
- Scam Urgency Signal Heuristics
- Authentication Guardrails (X-ElderEase-API-Key)
- Health, Multimodal Analysis (Gemini Mocked), Deterministic Fallback Engine
- Emergency Alert Dispatcher
"""

import os
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Ensure workspace root and backend directory are in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / "backend"))

from backend.main import (
    app,
    sanitize_pii_edge,
    DEFAULT_API_KEY,
    API_KEY_NAME,
    LocaleEnum,
    SafetyStatusEnum,
    UrgencyLevelEnum,
    SafetyAnalysisResponse,
)


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


@pytest.fixture
def valid_headers():
    """Headers with valid X-ElderEase-API-Key."""
    return {
        API_KEY_NAME: DEFAULT_API_KEY,
        "Content-Type": "application/json",
    }


# =====================================================================
# 1. PII SANITIZATION & REDACTION TESTS (EDGE GUARDRAIL)
# =====================================================================
class TestPIISanitization:
    """Validates regex-based PII redaction pipeline before LLM submission."""

    def test_phone_number_redaction(self):
        """Verify phone numbers are masked and flag pii_masked = True."""
        sample = "Call me at +1 (555) 234-5678 or 9876543210 regarding your account."
        cleaned, masked, _ = sanitize_pii_edge(sample)

        assert masked is True
        assert "[PHONE_REDACTED]" in cleaned
        assert "+1 (555) 234-5678" not in cleaned
        assert "9876543210" not in cleaned

    def test_email_redaction(self):
        """Verify email addresses are masked and flag pii_masked = True."""
        sample = "Send your confirmation to alert-billing@scam-utility.org right away."
        cleaned, masked, _ = sanitize_pii_edge(sample)

        assert masked is True
        assert "[EMAIL_REDACTED]" in cleaned
        assert "alert-billing@scam-utility.org" not in cleaned

    def test_credit_card_masking(self):
        """Verify 16-digit card numbers are masked and flag pii_masked = True."""
        sample = "Charge card number 4128 0019 8832 9912 immediately."
        cleaned, masked, _ = sanitize_pii_edge(sample)

        assert masked is True
        assert "[CARD_MASKED]" in cleaned
        assert "4128 0019 8832 9912" not in cleaned

    def test_ssn_redaction(self):
        """Verify Social Security Numbers (SSN) are masked with [SSN_REDACTED]."""
        sample = "Your verified SSN is 123-45-6789 on file."
        cleaned, masked, _ = sanitize_pii_edge(sample)

        assert masked is True
        assert "[SSN_REDACTED]" in cleaned
        assert "123-45-6789" not in cleaned

    def test_aadhaar_redaction(self):
        """Verify Indian Aadhaar format (12 digits with spaces) is masked."""
        sample = "Aadhaar number 4589 1234 9876 required for immediate biometric sync."
        cleaned, masked, _ = sanitize_pii_edge(sample)

        assert masked is True
        assert "[AADHAAR_REDACTED]" in cleaned
        assert "4589 1234 9876" not in cleaned

    def test_clean_text_passes_unchanged(self):
        """Verify normal text without sensitive data passes through unmasked."""
        sample = "Your pharmacy prescription has been delivered to your doorstep. Have a nice day."
        cleaned, masked, signals = sanitize_pii_edge(sample)

        assert masked is False
        assert cleaned == sample
        assert signals == []

    def test_empty_and_none_handling(self):
        """Verify empty string or None returns safe tuple without raising exception."""
        assert sanitize_pii_edge("") == ("", False, [])
        assert sanitize_pii_edge(None) == ("", False, [])


# =====================================================================
# 2. URGENCY SIGNAL DETECTION TESTS (PSYCHOLOGICAL HEURISTICS)
# =====================================================================
class TestUrgencySignalDetection:
    """Validates edge detection of psychological urgency keywords used in scams."""

    def test_scam_urgency_keywords_extracted(self):
        """Verify panic keywords are accurately extracted into detected_signals."""
        sample = (
            "URGENT: Power cut scheduled! You have 2 hours left before electricity cut. "
            "Your account suspended due to unpaid balance."
        )
        _, _, signals = sanitize_pii_edge(sample)

        assert "power cut" in signals
        assert "2 hours left" in signals
        assert "account suspended" in signals
        assert "electricity cut" in signals

    def test_multilingual_urgency_keywords_hindi_and_japanese(self):
        """Verify regional urgency triggers in Hindi and Japanese are recognized."""
        hindi_sample = "तुरंत बिजली बिल बकाया भरें वरना लाइन काट दी जाएगी।"
        _, _, hindi_signals = sanitize_pii_edge(hindi_sample)
        assert "तुरंत" in hindi_signals
        assert "काट दी जाएगी" in hindi_signals

        japanese_sample = "本日中に未払い料金をお支払いください。送電停止となります。"
        _, _, ja_signals = sanitize_pii_edge(japanese_sample)
        assert "送電停止" in ja_signals
        assert "未払い" in ja_signals

    def test_benign_text_no_urgency(self):
        """Verify peaceful routine statements generate an empty signals list."""
        benign_sample = "City Water Utility: Your monthly statement for October is $34.50. Thank you."
        _, _, signals = sanitize_pii_edge(benign_sample)
        assert len(signals) == 0


# =====================================================================
# 3. API ENDPOINT TESTS (AUTHENTICATION, ANALYSIS, FALLBACK, EMERGENCY)
# =====================================================================
class TestAPIEndpoints:
    """Validates FastAPI routes, authentication security, and AI orchestration."""

    def test_health_endpoint(self, client):
        """Verify GET /health responds with 200 OK and healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "ElderEase 2.0 FastAPI Core" in data["service"]
        assert "gemini_configured" in data

    def test_analyze_endpoint_missing_auth(self, client):
        """Verify calling /api/v1/analyze without X-ElderEase-API-Key returns 401."""
        response = client.post(
            "/api/v1/analyze",
            json={"raw_text": "Hello world", "locale": "en-US"},
        )
        assert response.status_code == 401
        assert "Invalid or missing X-ElderEase-API-Key header" in response.json()["detail"]

    def test_analyze_endpoint_invalid_auth(self, client):
        """Verify calling /api/v1/analyze with invalid key returns 401 Unauthorized."""
        response = client.post(
            "/api/v1/analyze",
            headers={API_KEY_NAME: "wrong-malicious-key"},
            json={"raw_text": "Hello world", "locale": "en-US"},
        )
        assert response.status_code == 401

    @patch("backend.main.gemini_client")
    def test_analyze_success_with_mocked_gemini(self, mock_gemini, client, valid_headers):
        """Verify successful analysis when Gemini API responds with structured JSON."""
        mock_response_text = """
        {
            "safety_status": "DANGER",
            "status_title": "⚠️ DANGER: Do Not Trust This",
            "status_sub": "Scam Detected",
            "fifteen_word_summary": "Fake power cutoff notification designed to harvest payment credentials.",
            "recommended_action": "Do not click link. Delete message immediately.",
            "pii_masked": true,
            "sanitized_text": "[PHONE_REDACTED] shutoff notice",
            "detected_scam_indicators": ["Urgent shutoff", "Suspicious Link"],
            "urgency_level": "HIGH",
            "confidence_score": 0.99
        }
        """
        mock_model_response = MagicMock()
        mock_model_response.text = mock_response_text
        mock_gemini.models.generate_content.return_value = mock_model_response

        payload = {
            "raw_text": "Call 555-0199 now! Power shutoff in 45 minutes! Link: bit.ly/pay",
            "locale": "en-US",
        }

        response = client.post("/api/v1/analyze", headers=valid_headers, json=payload)
        assert response.status_code == 200

        data = response.json()
        assert data["safety_status"] == SafetyStatusEnum.DANGER.value
        assert data["status_title"] == "⚠️ DANGER: Do Not Trust This"
        assert "fifteen_word_summary" in data
        assert "recommended_action" in data
        assert data["urgency_level"] == UrgencyLevelEnum.HIGH.value
        assert data["pii_masked"] is True
        assert "[PHONE_REDACTED]" in data["sanitized_text"]

    @patch("backend.main.gemini_client")
    def test_analyze_fallback_engine_on_gemini_exception(self, mock_gemini, client, valid_headers):
        """Verify deterministic fallback engine kicks in when Gemini raises an exception."""
        mock_gemini.models.generate_content.side_effect = RuntimeError("API quota or network timeout")

        urgent_payload = {
            "raw_text": "URGENT: Disconnect notice! Electricity will be cut off in 2 hours. Wire money now.",
            "locale": "en-US",
        }

        response = client.post("/api/v1/analyze", headers=valid_headers, json=urgent_payload)
        assert response.status_code == 200

        data = response.json()
        assert data["safety_status"] == SafetyStatusEnum.DANGER.value
        assert "⚠️ DANGER" in data["status_title"]
        assert data["urgency_level"] == UrgencyLevelEnum.HIGH.value
        assert len(data["detected_scam_indicators"]) > 0

    def test_analyze_fallback_safe_routine_bill(self, client, valid_headers):
        """Verify fallback engine assigns SAFE status to routine, benign utility statements."""
        with patch("backend.main.gemini_client", None):
            safe_payload = {
                "raw_text": "City Water Utility: Your monthly statement for October is $34.50. Scheduled automatic deduction.",
                "locale": "en-US",
            }
            response = client.post("/api/v1/analyze", headers=valid_headers, json=safe_payload)
            assert response.status_code == 200

            data = response.json()
            assert data["safety_status"] == SafetyStatusEnum.SAFE.value
            assert "✅ SAFE" in data["status_title"]
            assert data["urgency_level"] == UrgencyLevelEnum.LOW.value
            assert "No immediate action required" in data["recommended_action"]

    def test_analyze_multilingual_locale_hindi(self, client, valid_headers):
        """Verify Hindi locale returns culturally respectful Hindi advice in fallback."""
        with patch("backend.main.gemini_client", None):
            hindi_scam_payload = {
                "raw_text": "तुरंत बिजली बिल बकाया भरें वरना आज रात लाइन काट दी जाएगी।",
                "locale": "hi-IN",
            }
            response = client.post("/api/v1/analyze", headers=valid_headers, json=hindi_scam_payload)
            assert response.status_code == 200

            data = response.json()
            assert data["safety_status"] == SafetyStatusEnum.DANGER.value
            assert "सावधान" in data["status_title"]
            assert "क्लिक न करें" in data["recommended_action"]

    def test_emergency_alert_endpoint_success(self, client, valid_headers):
        """Verify POST /api/v1/emergency-alert triggers emergency dispatch with HTTP 200."""
        alert_payload = {
            "contact_id": "daughter-sarah-01",
            "reason": "Scam utility shutoff threat detected",
            "incident_summary": "SMS claimed power shutoff in 45 minutes. Senior advised not to pay.",
        }

        response = client.post("/api/v1/emergency-alert", headers=valid_headers, json=alert_payload)
        assert response.status_code == 200

        data = response.json()
        assert data["dispatched"] is True
        assert data["contact_id"] == "daughter-sarah-01"
        assert "Urgent assistance alert successfully forwarded" in data["message"]

    def test_emergency_alert_missing_auth(self, client):
        """Verify calling /api/v1/emergency-alert without API key is denied."""
        response = client.post(
            "/api/v1/emergency-alert",
            json={"contact_id": "daughter-sarah-01", "reason": "help", "incident_summary": "test"},
        )
        assert response.status_code == 401
