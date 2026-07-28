import os
import json

from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def explain_best_route(best_route, alternatives, priority):

    prompt = f"""
You are an AI Route Optimization Expert.

Shipment Priority:

{priority}

Best Route:

{json.dumps(best_route, indent=2)}

Alternative Routes:

{json.dumps(alternatives, indent=2)}

Compare the best route with the alternatives.

Explain why the selected route is better.

Mention

- Distance
- Duration
- Traffic
- Toll Cost
- Score

Return ONLY the explanation.
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

    return response.choices[0].message.content.strip()