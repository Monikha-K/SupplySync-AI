import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.parser_factory import get_parser

def test_parser_factory_architecture():
    dl_sample = """
    UNION OF INDIA
    Driving Licence (Tamil Nadu)
    DL No. TN6O 20000001759
    Date of Issue 14-08-2000
    Valid Till 17-12-2030
    Name
    29-06-1978
    SUGUMAR M
    Date of Birth 29-06-1978
    """

    rc_sample = """
    REGISTRATION CERTIFICATE
    Vehicle Class: M-Cycle/Scooter
    Maker's Name
    Regn. Number
    OLA ELECTRIC TECHNOLOGIES PVT LTD
    TN58BS6328
    Model Name
    OLA S1 X2KWH (GEN3)
    Chassis Number
    MBHJK123456789012
    Engine Number
    E123456789
    """

    # Test Driving Licence Routing via Factory
    dl_parser = get_parser("driving_license")
    dl_res = dl_parser(dl_sample)
    print("--- DL PARSER FACTORY RESULT ---")
    print(dl_res)
    assert dl_res["fullName"] == "SUGUMAR M"
    assert dl_res["documentNumber"] == "TN60 20000001759"

    # Test RC Book Routing via Factory
    rc_parser = get_parser("rc_book")
    rc_res = rc_parser(rc_sample)
    print("--- RC PARSER FACTORY RESULT ---")
    print(rc_res)
    assert rc_res["registrationNumber"] == "TN58BS6328"
    assert rc_res["makersName"] == "OLA ELECTRIC TECHNOLOGIES PVT LTD"
    assert rc_res["modelName"] == "OLA S1 X2KWH (GEN3)"
    assert rc_res["vehicleClass"] == "M-Cycle/Scooter"
    assert rc_res["chassisNumber"] == "MBHJK123456789012"
    assert rc_res["engineNumber"] == "E123456789"

    print("\nALL FACTORY ARCHITECTURE ASSERTIONS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    test_parser_factory_architecture()
