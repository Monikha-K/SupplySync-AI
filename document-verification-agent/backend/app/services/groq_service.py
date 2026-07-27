import os
import json
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", None)

# Gracefully import groq
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logger.warning("groq package not installed. AI verification will be unavailable.")

# Groq model to use
GROQ_MODEL = "llama-3.3-70b-versatile"

FALLBACK_RESPONSE = {
    "status": "Unavailable",
    "overallTrustScore": 0,
    "verificationSummary": "AI verification is currently unavailable. Please review manually.",
    "riskLevel": "Unknown",
    "documentQuality": "Unknown",
    "analysis": {
        "mandatoryFields": {"score": 0, "status": "Unknown", "remarks": "AI unavailable."},
        "documentValidity": {"score": 0, "status": "Unknown", "remarks": "AI unavailable."},
        "dateConsistency": {"score": 0, "status": "Unknown", "remarks": "AI unavailable."},
        "fieldCompleteness": {"score": 0, "status": "Unknown", "remarks": "AI unavailable."},
        "formatValidation": {"score": 0, "status": "Unknown", "remarks": "AI unavailable."},
    },
    "recommendations": ["AI verification unavailable. Manual review required."]
}

def _build_driving_license_prompt(data: dict) -> str:
    """Builds the verification prompt for Driving Licence documents."""
    return f"""You are an expert Logistics Document Verification Officer.

Analyze the following extracted Driving Licence data and return a detailed verification report.

Extracted Data:
{json.dumps(data, indent=2)}

Inspect:
1. Are all mandatory fields present and non-empty (Not Found values = missing)?
2. Is the licence number in a valid Indian DL format (e.g. TN60 20000001759)?
3. Is the expiry date still valid (compare against today's date 2026)?
4. Are the dates logically consistent (issue date before expiry date)?
5. Is the date of birth reasonable (person should be 18+ to hold a licence)?
6. Are there any suspicious, missing, or implausible values?
7. Rate OCR completeness based on how many fields were successfully extracted.

Trust Score Calculation (weighted):
- Mandatory Fields: 30%
- Document Validity (not expired): 25%
- Format Validation: 15%
- Date Consistency: 10%
- OCR Completeness: 10%
- Document Quality: 10%

Risk Levels:
- 90-100: Very Low Risk
- 75-89: Low Risk
- 60-74: Medium Risk
- 40-59: High Risk
- Below 40: Critical Risk

Return ONLY valid JSON. No explanation. No markdown. Just pure JSON:
{{
    "status": "Verified" | "Needs Review" | "Rejected",
    "overallTrustScore": <0-100>,
    "verificationSummary": "<one paragraph summary>",
    "riskLevel": "Very Low" | "Low" | "Medium" | "High" | "Critical",
    "documentQuality": "Excellent" | "Good" | "Fair" | "Poor",
    "analysis": {{
        "mandatoryFields": {{"score": <0-100>, "status": "Passed" | "Failed" | "Warning", "remarks": "..."}},
        "documentValidity": {{"score": <0-100>, "status": "Passed" | "Failed" | "Warning", "remarks": "..."}},
        "dateConsistency": {{"score": <0-100>, "status": "Passed" | "Failed" | "Warning", "remarks": "..."}},
        "fieldCompleteness": {{"score": <0-100>, "status": "Passed" | "Failed" | "Warning", "remarks": "..."}},
        "formatValidation": {{"score": <0-100>, "status": "Passed" | "Failed" | "Warning", "remarks": "..."}}
    }},
    "recommendations": ["...", "...", "..."]
}}"""

def _build_rc_book_prompt(data: dict) -> str:
    """Builds the verification prompt for RC Book documents."""
    return f"""You are an expert Logistics Document Verification Officer.

Analyze the following extracted Vehicle Registration Certificate (RC Book) data and return a detailed verification report.

Extracted Data:
{json.dumps(data, indent=2)}

Inspect:
1. Are all mandatory fields present and non-empty (Not Found values = missing)?
2. Is the registration number in a valid Indian vehicle format (e.g. TN58BS6328)?
3. Is the chassis number plausible (typically 17 alphanumeric characters for VIN)?
4. Is the engine number plausible?
5. Are the maker's name and model consistent with known vehicle brands?
6. Is the vehicle class valid (e.g. M-Cycle/Scooter, LMV, Transport Vehicle)?
7. Are there any suspicious, missing, or implausible values?
8. Rate OCR completeness based on how many fields were successfully extracted.

Trust Score Calculation (weighted):
- Mandatory Fields: 30%
- Format Validation: 25%
- Field Completeness: 20%
- Manufacturer/Model Consistency: 15%
- OCR Completeness: 10%

Risk Levels:
- 90-100: Very Low Risk
- 75-89: Low Risk
- 60-74: Medium Risk
- 40-59: High Risk
- Below 40: Critical Risk

Return ONLY valid JSON. No explanation. No markdown. Just pure JSON:
{{
    "status": "Verified" | "Needs Review" | "Rejected",
    "overallTrustScore": <0-100>,
    "verificationSummary": "<one paragraph summary>",
    "riskLevel": "Very Low" | "Low" | "Medium" | "High" | "Critical",
    "documentQuality": "Excellent" | "Good" | "Fair" | "Poor",
    "analysis": {{
        "mandatoryFields": {{"score": <0-100>, "status": "Passed" | "Failed" | "Warning", "remarks": "..."}},
        "documentValidity": {{"score": <0-100>, "status": "Passed" | "Failed" | "Warning", "remarks": "..."}},
        "dateConsistency": {{"score": <0-100>, "status": "Passed" | "Failed" | "Warning", "remarks": "..."}},
        "fieldCompleteness": {{"score": <0-100>, "status": "Passed" | "Failed" | "Warning", "remarks": "..."}},
        "formatValidation": {{"score": <0-100>, "status": "Passed" | "Failed" | "Warning", "remarks": "..."}}
    }},
    "recommendations": ["...", "...", "..."]
}}"""

def verify_with_groq(document_type: str, extracted_data: dict) -> dict:
    """
    Sends extracted document fields to Groq LLM for intelligent verification.

    Args:
        document_type (str): 'driving_license' or 'rc_book'
        extracted_data (dict): Structured parsed fields from the parser service.

    Returns:
        dict: AI verification report with status, trust score, analysis, and recommendations.
    """
    if not GROQ_AVAILABLE:
        logger.error("groq package is not installed.")
        return FALLBACK_RESPONSE

    if not GROQ_API_KEY:
        logger.error("GROQ_API_KEY is not set in environment variables.")
        return FALLBACK_RESPONSE

    try:
        client = Groq(api_key=GROQ_API_KEY)

        doc_type_clean = (document_type or "").strip().lower()
        if doc_type_clean == "rc_book":
            prompt = _build_rc_book_prompt(extracted_data)
        else:
            prompt = _build_driving_license_prompt(extracted_data)

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert document verification officer for a logistics company. You analyze extracted document data and return structured JSON verification reports. Always return ONLY valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=GROQ_MODEL,
            temperature=0.1,
            max_tokens=1024,
        )

        raw_response = chat_completion.choices[0].message.content.strip()

        # Strip markdown code fences if Groq returns them despite instructions
        if raw_response.startswith("```"):
            raw_response = raw_response.split("```")[1]
            if raw_response.startswith("json"):
                raw_response = raw_response[4:]
            raw_response = raw_response.strip()

        result = json.loads(raw_response)
        logger.info(f"Groq verification completed successfully. Status: {result.get('status')}")
        return result

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Groq JSON response: {e}")
        return FALLBACK_RESPONSE
    except Exception as e:
        logger.error(f"Groq API call failed: {e}")
        return FALLBACK_RESPONSE
