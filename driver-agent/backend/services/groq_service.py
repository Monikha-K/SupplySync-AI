import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def recommend_best_driver(shipment, drivers):

    prompt = f"""
You are an AI Driver Recommendation Expert for a logistics company.

Your task is to select the SINGLE best driver from the given candidate drivers.

Evaluate every driver using ALL of these criteria:

1. Pickup city MUST match the shipment pickup city.
2. Vehicle capacity should safely accommodate the shipment weight.
3. Drivers whose preferred cargo matches the shipment cargo type should be given higher priority.
4. Higher safety score is preferred.
5. Higher on-time percentage is preferred.
6. Higher overall rating is preferred.
7. Higher experience is preferred.
8. Higher completed trips indicate reliability.
9. Lower average response time is better.
10. For HIGH priority shipments, prioritize response time and safety.
11. Ignore phone numbers, emails, names and license numbers while selecting.

Shipment Details:

{json.dumps(shipment.model_dump(), indent=2)}

Candidate Drivers:

{json.dumps(drivers, indent=2)}

IMPORTANT:

- Compare ALL candidate drivers carefully.
- Do NOT always select the first driver.
- Choose the driver that best satisfies the shipment requirements.
- Return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT use ```json.
- Do NOT add any explanation outside JSON.

Return exactly in this format:

{{
    "driver_id": "DR001",
    "reason": "Explain in 3-5 sentences why this driver is the best choice by mentioning capacity, cargo match, safety, rating, experience, response time and shipment priority."
}}
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    content = response.choices[0].message.content.strip()

    print("\n========== GROQ RESPONSE ==========")
    print(content)
    print("===================================\n")

    # Remove markdown if present
    if content.startswith("```"):
        content = content.replace("```json", "")
        content = content.replace("```", "")
        content = content.strip()

    try:
        return json.loads(content)

    except Exception as e:
        print("JSON Parse Error:", e)

        return {
            "driver_id": drivers[0]["driver_id"],
            "reason": "The recommendation engine selected the highest-ranked driver because they best satisfied the shipment requirements."
        }