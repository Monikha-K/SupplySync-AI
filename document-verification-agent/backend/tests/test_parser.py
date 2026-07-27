import sys
import os

# Add app directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.parser_service import parse_driving_license_text

def test_identity_fields_parser():
    sample_ocr = """
    UNION OF INDIA
    Driving Licence (Tamil Nadu)
    DL No.
    TN6O 20000001759
    Date of Issue
    14-08-2000
    Valid Till
    17-12-2030
    Name
    29-06-1978
    0+
    SUGUMAR M
    Date of Birth
    29-06-1978
    Son of
    MURUGAN
    Blood Group
    0+
    Address
    123 STREET
    """

    result = parse_driving_license_text(sample_ocr)

    print("--- PARSER 7 IDENTITY FIELDS TEST RESULTS ---")
    print(f"Issuing Authority: {result.get('issuingAuthority')}")
    print(f"Document Type: {result.get('documentType')}")
    print(f"Full Name: {result.get('fullName')}")
    print(f"Date of Birth: {result.get('dateOfBirth')}")
    print(f"Issue Date: {result.get('issueDate')}")
    print(f"Expiry Date: {result.get('expiryDate')}")
    print(f"Document Number: {result.get('documentNumber')}")

    assert result.get('issuingAuthority') == "UNION OF INDIA"
    assert result.get('documentType') == "Driving Licence (Tamil Nadu)"
    assert result.get('fullName') == "SUGUMAR M"
    assert result.get('dateOfBirth') == "29-06-1978"
    assert result.get('issueDate') == "14-08-2000"
    assert result.get('expiryDate') == "17-12-2030"
    assert result.get('documentNumber') == "TN60 20000001759"

    print("\nALL IDENTITY FIELDS ASSERTIONS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    test_identity_fields_parser()
