import re
import logging

logger = logging.getLogger(__name__)

# List of known field labels to filter out during value extraction
KNOWN_LABELS = [
    r"regn\.?\s*number", r"regn\.?\s*no", r"registration\s*number", r"registration\s*no",
    r"model\s*name", r"vehicle\s*class", r"colour", r"color", r"body\s*type", r"owner\s*name",
    r"engine\s*number", r"engine\s*no", r"chassis\s*number", r"chassis\s*no",
    r"date\s*of\s*regn", r"registration\s*validity", r"month-year\s*of\s*mfg",
    r"number\s*of\s*cylinders", r"number\s*of\s*axle", r"financer\s*name", r"address",
    r"maker\'?s?\s*name", r"fuel", r"unladen\s*wt", r"cubic\s*cap"
]

def is_label(line: str) -> bool:
    """
    Returns True if the OCR line matches any known field label.
    """
    if not line:
        return False
    clean_line = line.strip()
    for pattern in KNOWN_LABELS:
        if re.search(r'(?i)^\s*' + pattern + r'[\s:#\.-]*$', clean_line) or re.search(r'(?i)\b' + pattern + r'\b', clean_line):
            return True
    return False

def is_company_name(line: str) -> bool:
    """
    Returns True if line contains mostly uppercase letters and company indicator keywords.
    """
    if not line or is_label(line):
        return False
    
    company_keywords = [r"PVT", r"LTD", r"LIMITED", r"MOTORS", r"TECHNOLOGIES", r"AUTO", r"CORP", r"ELECTRIC", r"VEHICLES", r"INDIA", r"HONDA", r"HERO", r"TATA", r"MARUTI", r"HYUNDAI", r"YAMAHA", r"SUZUKI", r"ROYAL", r"ENFIELD", r"BAJAJ", r"TVS"]
    for kw in company_keywords:
        if re.search(r'(?i)\b' + kw + r'\b', line):
            return True
    return False

def normalize_ocr_text(text: str) -> str:
    """Normalizes noisy OCR text for RC Book parsing."""
    if not text:
        return ""
    lines = [line.strip() for line in text.split('\n')]
    cleaned_text = "\n".join([line for line in lines if line])

    cleaned_text = re.sub(r'(?i)\bregn\.?\s*number\b', 'Regn. Number', cleaned_text)
    cleaned_text = re.sub(r'(?i)\bregistration\s*number\b', 'Registration Number', cleaned_text)
    cleaned_text = re.sub(r'(?i)\bchassis\s*number\b', 'Chassis Number', cleaned_text)
    cleaned_text = re.sub(r'(?i)\bengine\s*(?:/\s*motor)?\s*number\b', 'Engine Number', cleaned_text)
    cleaned_text = re.sub(r'(?i)\bmaker\'?s?\s*name\b', 'Maker\'s Name', cleaned_text)
    cleaned_text = re.sub(r'(?i)\bmodel\s*name\b', 'Model Name', cleaned_text)
    cleaned_text = re.sub(r'(?i)\bvehicle\s*class\b', 'Vehicle Class', cleaned_text)
    cleaned_text = re.sub(r'[ \t]+', ' ', cleaned_text)
    return cleaned_text

def extract_registration_number(lines: list[str], full_text: str) -> str:
    regn_pattern = r'\b([A-Z]{2}[0-9O]{2}[A-Z0-9]{1,3}[0-9]{4})\b'
    for i, line in enumerate(lines):
        if re.search(r'(?i)regn|registration', line):
            window = lines[i:min(i + 8, len(lines))]
            for w_line in window:
                match = re.search(regn_pattern, w_line.replace(" ", ""))
                if match:
                    res = match.group(1).upper()
                    return res[:2] + res[2:4].replace('O', '0') + res[4:]
    match = re.search(regn_pattern, full_text.replace(" ", ""))
    if match:
        res = match.group(1).upper()
        return res[:2] + res[2:4].replace('O', '0') + res[4:]
    return "Not Found"

def extract_chassis_number(lines: list[str], full_text: str) -> str:
    chassis_pattern = r'\b([A-HJ-NPR-Z0-9]{12,18})\b'
    for i, line in enumerate(lines):
        if re.search(r'(?i)chassis', line):
            window = lines[i:min(i + 8, len(lines))]
            for w_line in window:
                if is_label(w_line):
                    continue
                match = re.search(chassis_pattern, w_line.strip())
                if match and not re.search(r'(?i)chassis', match.group(1)):
                    return match.group(1).upper()
    match = re.search(r'(?i)chassis[\s:#\.-]*([A-HJ-NPR-Z0-9]{12,18})', full_text)
    if match:
        return match.group(1).upper()
    return "Not Found"

def extract_engine_number(lines: list[str], full_text: str) -> str:
    engine_pattern = r'\b([A-Z0-9]{6,18})\b'
    for i, line in enumerate(lines):
        if re.search(r'(?i)engine|motor', line):
            same_line = re.sub(r'(?i)^.*?(?:engine|motor)\s*(?:/\s*motor)?\s*number[\s:#\.-]*', '', line).strip()
            if same_line and len(same_line) >= 4 and not is_label(same_line):
                match = re.search(engine_pattern, same_line)
                if match:
                    return match.group(1).upper()

            window = lines[i + 1:min(i + 8, len(lines))]
            for w_line in window:
                cand = w_line.strip()
                if cand and not is_label(cand):
                    match = re.search(engine_pattern, cand)
                    if match:
                        return match.group(1).upper()

    match = re.search(r'(?i)(?:engine|motor)[\s:#\.-]*([A-Z0-9]{6,18})', full_text)
    if match:
        return match.group(1).upper()
    return "Not Found"

def extract_makers_name(lines: list[str], full_text: str) -> str:
    """
    Locates "Maker's Name", looks ahead 8 lines, skips labels, dates, regn numbers,
    and returns the first valid company name.
    """
    regn_pattern = r'\b[A-Z]{2}[0-9O]{2}[A-Z0-9]{1,3}[0-9]{4}\b'
    date_pattern = r'\b\d{2}[/\.-]\d{2}[/\.-]\d{4}\b'

    for i, line in enumerate(lines):
        if re.search(r'(?i)maker', line):
            same_line = re.sub(r'(?i)^.*?maker\'?s?\s*name[\s:#\.-]*', '', line).strip()
            if same_line and not is_label(same_line) and not re.search(r'^\d+$', same_line):
                if is_company_name(same_line) or len(same_line) >= 3:
                    return same_line.upper()

            # Search next 8 OCR lines
            window = lines[i + 1:min(i + 9, len(lines))]
            for w_line in window:
                cand = w_line.strip()
                if not cand or is_label(cand):
                    continue
                if re.search(r'^\d+$', cand) or re.search(date_pattern, cand) or re.search(regn_pattern, cand.replace(" ", "")):
                    continue

                if is_company_name(cand) or re.match(r'^[A-Z0-9\s\.\&\-]{3,45}$', cand, re.IGNORECASE):
                    return cand.upper()

    return "Not Found"

def extract_model_name(lines: list[str], full_text: str) -> str:
    """
    Locates "Model Name", looks ahead 5 lines, skips labels (Colour, Body Type, Vehicle Class),
    and returns Model Name.
    """
    for i, line in enumerate(lines):
        if re.search(r'(?i)model', line):
            same_line = re.sub(r'(?i)^.*?model\s*name[\s:#\.-]*', '', line).strip()
            if same_line and len(same_line) >= 2 and not is_label(same_line):
                return same_line.upper()

            window = lines[i + 1:min(i + 6, len(lines))]
            for w_line in window:
                cand = w_line.strip()
                if cand and not is_label(cand):
                    if re.match(r'^[A-Z0-9\s\.\(\)\/\-]{2,40}$', cand, re.IGNORECASE):
                        return cand.upper()

    match = re.search(r'(?i)model\s*name[\s:#\.-]*([A-Z0-9\s\.\(\)\/\-]{2,35})', full_text)
    if match:
        return match.group(1).strip().upper()

    return "Not Found"

def extract_vehicle_class(lines: list[str], full_text: str) -> str:
    """
    Extracts Vehicle Class (e.g. M-Cycle/Scooter, LMV, MCWG, etc.).
    """
    classes_list = [
        "M-Cycle/Scooter", "Motor Cycle", "Motor Cycle/Scooter", "LMV", "MCWG",
        "Transport Vehicle", "Goods Carrier", "Motor Cab", "Three Wheeler", "E-Rickshaw"
    ]
    for v_class in classes_list:
        if re.search(r'\b' + re.escape(v_class) + r'\b', full_text, re.IGNORECASE):
            return v_class

    for i, line in enumerate(lines):
        if re.search(r'(?i)vehicle\s*class', line):
            same_line = re.sub(r'(?i)^.*?vehicle\s*class[\s:#\.-]*', '', line).strip()
            if same_line and len(same_line) >= 2 and not is_label(same_line):
                return same_line

            window = lines[i + 1:min(i + 6, len(lines))]
            for w_line in window:
                cand = w_line.strip()
                if cand and not is_label(cand):
                    return cand

    return "Not Found"

def parse_rc_book(ocr_text: str) -> dict:
    """Parses Vehicle Registration Certificate (RC Book) OCR text into structured dictionary."""
    if not ocr_text:
        return {
            "registrationNumber": "Not Found",
            "chassisNumber": "Not Found",
            "engineNumber": "Not Found",
            "makersName": "Not Found",
            "modelName": "Not Found",
            "vehicleClass": "Not Found",
        }

    normalized_text = normalize_ocr_text(ocr_text)
    lines = [line.strip() for line in normalized_text.split('\n') if line.strip()]

    registration_number = extract_registration_number(lines, normalized_text)
    chassis_number = extract_chassis_number(lines, normalized_text)
    engine_number = extract_engine_number(lines, normalized_text)
    makers_name = extract_makers_name(lines, normalized_text)
    model_name = extract_model_name(lines, normalized_text)
    vehicle_class = extract_vehicle_class(lines, normalized_text)

    return {
        "registrationNumber": registration_number,
        "chassisNumber": chassis_number,
        "engineNumber": engine_number,
        "makersName": makers_name,
        "modelName": model_name,
        "vehicleClass": vehicle_class,
    }
