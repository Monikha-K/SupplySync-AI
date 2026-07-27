import re
import logging

logger = logging.getLogger(__name__)

def parse_driving_license_text(ocr_text: str) -> dict:
    """
    Parses raw OCR text from a Driving Licence using Regex and Python pattern matching.

    Args:
        ocr_text (str): Extracted raw text from OCR.

    Returns:
        dict: Extracted structured fields or 'Not Found' for missing values.
    """
    if not ocr_text:
        return {
            "documentType": "Not Found",
            "driverName": "Not Found",
            "licenseNumber": "Not Found",
            "issueDate": "Not Found",
            "expiryDate": "Not Found",
            "vehicleClass": "Not Found",
            "issuingAuthority": "Not Found",
        }

    lines = [line.strip() for line in ocr_text.split('\n') if line.strip()]
    
    # 1. Document Type Detection
    document_type = "Not Found"
    if re.search(r'(?i)(driving|driver|licence|license|dl\b)', ocr_text):
        document_type = "Driving Licence"
    else:
        document_type = "Logistics Document"

    # 2. Driving Licence Number Detection (Indian / Standard DL Formats)
    license_number = "Not Found"
    # Examples: DL-1420110012345, DL14 20110012345, MH01 20201234567, etc.
    dl_pattern = r'(?i)(?:dl|licence|license|no|num|number)?[\s:#\.-]*([a-z]{2}[-\s]?\d{2}[-\s]?(?:\d{4}|\d{11})\d{7})'
    dl_match = re.search(dl_pattern, ocr_text)
    if dl_match:
        license_number = dl_match.group(1).upper()
    else:
        # Fallback regex for generic license numbers
        generic_dl = re.search(r'\b[A-Z]{2}[0-9]{2}[ -]?[0-9]{11}\b', ocr_text)
        if generic_dl:
            license_number = generic_dl.group(0)

    # 3. Dates Extraction (Issue Date & Expiry Date / Valid Till)
    issue_date = "Not Found"
    expiry_date = "Not Found"

    # Regex for standard date formats: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, etc.
    date_regex = r'\b(\d{2}[/\.-]\d{2}[/\.-]\d{4}|\d{4}[/\.-]\d{2}[/\.-]\d{2})\b'
    all_dates = re.findall(date_regex, ocr_text)

    # Search specifically with keyword context
    issue_match = re.search(r'(?i)(?:issue|doi|valid\s+from|from)[\s:#\.-]*(\d{2}[/\.-]\d{2}[/\.-]\d{4}|\d{4}[/\.-]\d{2}[/\.-]\d{2})', ocr_text)
    if issue_match:
        issue_date = issue_match.group(1)

    expiry_match = re.search(r'(?i)(?:exp|expiry|valid\s+till|to|validity)[\s:#\.-]*(\d{2}[/\.-]\d{2}[/\.-]\d{4}|\d{4}[/\.-]\d{2}[/\.-]\d{2})', ocr_text)
    if expiry_match:
        expiry_date = expiry_match.group(1)

    # Fallback using found dates list if keyword matching failed
    if issue_date == "Not Found" and len(all_dates) >= 1:
        issue_date = all_dates[0]
    if expiry_date == "Not Found" and len(all_dates) >= 2:
        expiry_date = all_dates[1]

    # 4. Driver Name Extraction
    driver_name = "Not Found"
    # Look for Name / Holder Name prefix
    name_match = re.search(r'(?i)(?:name|holder|driver)[\s:#\.-]+([a-z\s\.]{3,30})', ocr_text)
    if name_match:
        cleaned_name = name_match.group(1).strip()
        # Ensure name doesn't include noise numbers or labels
        if not re.search(r'\d', cleaned_name) and len(cleaned_name) > 2:
            driver_name = cleaned_name.title()

    if driver_name == "Not Found":
        # Strategy: Search line-by-line after "Name" keyword or capitalized word pairs
        for i, line in enumerate(lines):
            if re.search(r'(?i)\bname\b', line):
                # check current or next line
                if i + 1 < len(lines) and not re.search(r'\d', lines[i+1]):
                    driver_name = lines[i+1].title()
                    break

    # 5. Vehicle Class Extraction
    vehicle_class = "Not Found"
    # Matches MCWG, LMV, HMV, TRANS, HPMV, HGV, MCWOG, etc.
    cov_match = re.search(r'(?i)(?:cov|class|vehicle|veh)[\s:#\.-]*([A-Z0-9,\s/-]{2,20})', ocr_text)
    if cov_match:
        raw_cov = cov_match.group(1).strip()
        found_classes = re.findall(r'\b(MCWG|LMV|HMV|TRANS|MCWOG|3WNT|3WT|HPMV|HGV)\b', ocr_text, re.IGNORECASE)
        if found_classes:
            vehicle_class = ", ".join(set([c.upper() for c in found_classes]))
        elif len(raw_cov) < 25 and not re.search(r'(?i)(licence|driving|union|republic)', raw_cov):
            vehicle_class = raw_cov.upper()
    else:
        found_classes = re.findall(r'\b(MCWG|LMV|HMV|TRANS|MCWOG|3WNT|3WT|HPMV|HGV)\b', ocr_text, re.IGNORECASE)
        if found_classes:
            vehicle_class = ", ".join(set([c.upper() for c in found_classes]))

    # 6. Issuing Authority / State Detection
    issuing_authority = "Not Found"
    state_match = re.search(
        r'(?i)(?:transport\|authority\|rto\|govt\s+of|government\s+of)?[\s:#\.-]*'
        r'(MAHARASHTRA|DELHI|KARNATAKA|TAMIL\s+NADU|GUJARAT|UTTAR\s+PRADESH|TELANGANA|KERALA|WEST\s+BENGAL|RAJASTHAN|PUNJAB|HARYANA|MADHYA\s+PRADESH|ANDHRA\s+PRADESH)',
        ocr_text
    )
    if state_match:
        issuing_authority = f"RTO / Govt of {state_match.group(1).title()}"
    else:
        rto_match = re.search(r'(?i)(rto[\s\w,-]{2,30})', ocr_text)
        if rto_match:
            issuing_authority = rto_match.group(1).strip().title()

    return {
        "documentType": document_type,
        "driverName": driver_name,
        "licenseNumber": license_number,
        "issueDate": issue_date,
        "expiryDate": expiry_date,
        "vehicleClass": vehicle_class,
        "issuingAuthority": issuing_authority,
    }
