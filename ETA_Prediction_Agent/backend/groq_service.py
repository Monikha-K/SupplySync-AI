import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def generate_eta_summary(shipment, eta):

    prompt = f"""
You are an AI Logistics Assistant.

Shipment ID: {shipment['shipmentId']}
Pickup: {shipment['pickup']}
Destination: {shipment['destination']}
Current Location: {shipment['currentLocation']}
Remaining Distance: {shipment['remainingDistance']} km
Traffic: {shipment['traffic']}
Weather: {shipment['weather']}
ETA: {eta['formatted']}

Generate a professional ETA summary in 3 lines only.
"""

    response = client.chat.completions.create(

        model="llama-3.1-8b-instant",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]

    )

    return response.choices[0].message.content