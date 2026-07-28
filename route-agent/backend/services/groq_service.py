import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def explain_route(route, priority):

    prompt = f"""
You are an AI Route Optimization Expert.

Distance: {route['distance_km']} km

Duration: {route['duration_hr']} hours

Traffic: {route['traffic']}

Toll Cost: ${route['toll_cost']}

Priority: {priority}

Explain in 3-4 sentences why this route is recommended.

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