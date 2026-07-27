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
You are an expert logistics AI.

Shipment Details:
{json.dumps(shipment.model_dump(), indent=2)}

Candidate Drivers:
{json.dumps(drivers, indent=2)}

Choose ONLY ONE best driver.

Respond ONLY in JSON.

Example:

{{
  "driver_id":"DR001",
  "reason":"Explain why this driver is best."
}}
"""

    response = client.chat.completions.create(

        model="llama-3.3-70b-versatile",

        messages=[
            {
                "role":"user",
                "content":prompt
            }
        ],

        temperature=0.2
    )

    return json.loads(
        response.choices[0].message.content
    )