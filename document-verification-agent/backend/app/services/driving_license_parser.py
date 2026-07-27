import re
import logging

logger = logging.getLogger(__name__)

KNOWN_LABELS_PATTERN = r'(?i)\b(name|date\s+of\s+birth|dob|date\s+of\s+issue|doi|valid\s+till|expiry|dl\s*no|licence|license|address|son\s+of|daughter\s+of|wife\s+of|s/o|d/o|w/o|blood|rto|govt|union\s+of\s+india)\b'

def normalize_ocr_text(text: str) -> str:
    """Normalizes noisy OCR text before parsing."""
    if not text:
        return ""
    lines = [line.strip() for line in text.split('\n')]
    cleaned_text = "\n".join([line for line in lines if line])

    cleaned_text = re.sub(r'(?i)\bdl\s*no\.?', 'DL No.', cleaned_text)
    cleaned_text = re.sub(r'(?i)\bdt\s*of\s*issue\b', 'Date of Issue', cleaned_text)
    cleaned_text = re.sub(r'(?i)\bval(?:id)?\s*till\b', 'Valid Till', cleaned_text)
    cleaned_text = re.sub(r'(?i)\bdob\b', 'Date of Birth', cleaned_text)
    cleaned_text = re.sub(r'[ \t]+', ' ', cleaned_text)
    return cleaned_text

def normalize_dl_number(dl_str: str) -> str:
    """Normalizes DL number strings."""
    if not dl_str:
        return "Not Found"
    dl_clean = dl_str.strip().upper()
    prefix = dl_clean[:2]
    rest = dl_clean[2:]
    rest_fixed = []
    for char in rest:
        if char == 'O':
            rest_fixed.append('0')
        elif char == 'I':
            rest_fixed.append('1')
        elif char == 'S' and len(rest_fixed) > 0 and rest_fixed[-1].isdigit():
            rest_fixed.append('5')
        else:
            rest_fixed.append(char)
    rest_str = "".join(rest_fixed)
    combined = prefix + rest_str
    match = re.search(r'([A-Z]{2}\s*\d{2})\s*(\d{11}|\d{7})', combined)
    if match:
        state_rto = match.group(1).replace(" ", "")
        number_part = match.group(2)
        return f"{state_rto} {number_part}"
    return combined

def extract_issuing_authority(lines: list[str], full_text: str) -> str:
    for line in lines:
        if re.search(r'(?i)\b(union\s+of\s+india|government\s+of\s+[a-z\s]+|govt\s+of\s+[a-z\s]+)\b', line):
            return line.strip().upper()
    match = re.search(r'(?i)(union\s+of\s+india|govt\s+of\s+[a-z\s]+|government\s+of\s+[a-z\s]+)', full_text)
    if match:
        return match.group(1).strip().upper()
    return "Not Found"

def extract_document_type(lines: list[str], full_text: str) -> str:
    for line in lines:
        if re.search(r'(?i)driving\s+licence', line):
            return line.strip()
    match = re.search(r'(?i)(driving\s+licence(?:\s*\([^\)]+\))?)', full_text)
    if match:
        return match.group(1).strip()
    return "Not Found"

def extract_document_number(lines: list[str], full_text: str) -> str:
    for i, line in enumerate(lines):
        if re.search(r'(?i)dl\s*no\.?|licence\s*no\.?', line):
            window = lines[i:min(i + 6, len(lines))]
            for window_line in window:
                match = re.search(r'([A-Z]{2}[0-9OIS]{2}\s*[0-9OIS]{7,15})', window_line)
                if match:
                    return normalize_dl_number(match.group(1))
    match = re.search(r'\b([A-Z]{2}[0-9O]{2}\s*[0-9O]{7,15})\b', full_text)
    if match:
        return normalize_dl_number(match.group(1))
    return "Not Found"

def extract_full_name(lines: list[str]) -> str:
    blood_groups = r'^(0\+|o\+|0-|o-|a\+|a-|b\+|b-|ab\+|ab-)$'
    for i, line in enumerate(lines):
        if re.search(r'(?i)^\s*name\b', line) or re.search(r'(?i)\bname\b', line):
            same_line_val = re.sub(r'(?i)^.*?name[\s:#\.-]*', '', line).strip()
            if same_line_val and len(same_line_val) >= 2:
                if re.match(r'^[A-Za-z\s]{2,35}$', same_line_val) and not re.search(KNOWN_LABELS_PATTERN, same_line_val):
                    return same_line_val.upper()
            window = lines[i + 1:min(i + 7, len(lines))]
            for window_line in window:
                cand = window_line.strip()
                if not cand or re.search(r'\d', cand) or re.match(blood_groups, cand, re.IGNORECASE) or len(cand) < 2 or re.search(KNOWN_LABELS_PATTERN, cand):
                    continue
                if re.match(r'^[A-Za-z\s]{2,35}$', cand):
                    return cand.upper()
    return "Not Found"

def extract_date_of_birth(lines: list[str], full_text: str) -> str:
    date_regex = r'\b(\d{2}[/\.-]\d{2}[/\.-]\d{4}|\d{4}[/\.-]\d{2}[/\.-]\d{2})\b'
    for i, line in enumerate(lines):
        if re.search(r'(?i)date\s+of\s+birth|dob', line):
            window = lines[i:min(i + 6, len(lines))]
            window_str = " ".join(window)
            match = re.search(date_regex, window_str)
            if match:
                return match.group(1).replace('/', '-')
    match = re.search(r'(?i)(?:date\s+of\s+birth|dob)[\s:#\.-]*(\d{2}[/\.-]\d{2}[/\.-]\d{4}|\d{4}[/\.-]\d{2}[/\.-]\d{2})', full_text)
    if match:
        return match.group(1).replace('/', '-')
    return "Not Found"

def extract_issue_date(lines: list[str], full_text: str) -> str:
    date_regex = r'\b(\d{2}[/\.-]\d{2}[/\.-]\d{4}|\d{4}[/\.-]\d{2}[/\.-]\d{2})\b'
    for i, line in enumerate(lines):
        if re.search(r'(?i)date\s+of\s+issue|issue\s+date', line):
            window = lines[i:min(i + 6, len(lines))]
            window_str = " ".join(window)
            match = re.search(date_regex, window_str)
            if match:
                return match.group(1).replace('/', '-')
    match = re.search(r'(?i)(?:date\s+of\s+issue|doi)[\s:#\.-]*(\d{2}[/\.-]\d{2}[/\.-]\d{4}|\d{4}[/\.-]\d{2}[/\.-]\d{2})', full_text)
    if match:
        return match.group(1).replace('/', '-')
    return "Not Found"

def extract_expiry_date(lines: list[str], full_text: str, issue_date: str, dob: str) -> str:
    date_regex = r'\b(\d{2}[/\.-]\d{2}[/\.-]\d{4}|\d{4}[/\.-]\d{2}[/\.-]\d{2})\b'
    for i, line in enumerate(lines):
        if re.search(r'(?i)valid\s+till|expiry\s+date', line):
            window = lines[i:min(i + 6, len(lines))]
            for w_line in window:
                match = re.search(date_regex, w_line)
                if match:
                    found_d = match.group(1).replace('/', '-')
                    if found_d != issue_date and found_d != dob:
                        return found_d
    matches = re.finditer(date_regex, full_text)
    for m in matches:
        d_val = m.group(1).replace('/', '-')
        if d_val != issue_date and d_val != dob and issue_date != "Not Found":
            return d_val
    return "Not Found"

def parse_driving_license(ocr_text: str) -> dict:
    """Parses Driving Licence OCR text into structured dictionary."""
    if not ocr_text:
        return {
            "issuingAuthority": "Not Found",
            "documentType": "Not Found",
            "documentNumber": "Not Found",
            "fullName": "Not Found",
            "dateOfBirth": "Not Found",
            "issueDate": "Not Found",
            "expiryDate": "Not Found",
        }

    normalized_text = normalize_ocr_text(ocr_text)
    lines = [line.strip() for line in normalized_text.split('\n') if line.strip()]

    issuing_authority = extract_issuing_authority(lines, normalized_text)
    document_type = extract_document_type(lines, normalized_text)
    document_number = extract_document_number(lines, normalized_text)
    full_name = extract_full_name(lines)
    date_of_birth = extract_date_of_birth(lines, normalized_text)
    issue_date = extract_issue_date(lines, normalized_text)
    expiry_date = extract_expiry_date(lines, normalized_text, issue_date, date_of_birth)

    return {
        "issuingAuthority": issuing_authority,
        "documentType": document_type,
        "documentNumber": document_number,
        "fullName": full_name,
        "dateOfBirth": date_of_birth,
        "issueDate": issue_date,
        "expiryDate": expiry_date,
    }
