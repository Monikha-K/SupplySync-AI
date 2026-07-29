import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def _summarize(route):
    """Return only the fields needed for the LLM — no geometry."""
    return {
        "route_name": route.get("route_name"),
        "distance_km": route.get("distance_km"),
        "duration_hr": route.get("duration_hr"),
        "traffic": route.get("traffic"),
        "toll_cost": route.get("toll_cost"),
        "score": route.get("score")
    }


def _format_route(route):
    return (
        f"Route Name: {route['route_name']}\n"
        f"Distance: {route['distance_km']} km\n"
        f"Duration: {route['duration_hr']} hours\n"
        f"Traffic: {route['traffic']}\n"
        f"Toll: ₹{route['toll_cost']}\n"
        f"Score: {route['score']}"
    )


def explain_best_route(best_route, alternatives, priority):

    best = _summarize(best_route)
    alts = [_summarize(r) for r in alternatives]

    alt_block = "\n\n".join(_format_route(r) for r in alts) or "None"

    prompt = f"""You are an AI Route Optimization Expert.

Priority: {priority}

Recommended Route:
{_format_route(best)}

Alternative Routes:
{alt_block}

In 2-3 professional sentences, explain why the recommended route is the best choice based on distance, duration, traffic, toll cost, and score.
Return ONLY the explanation."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    return response.choices[0].message.content.strip()
