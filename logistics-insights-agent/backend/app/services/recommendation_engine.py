"""
recommendation_engine.py
Rule-based logistics recommendation generator.
No LLM / Groq — pure backend logic.
"""

from typing import List


def generate_recommendations(
    delay_minutes: float,
    performance_score: int,
    simulation_events: List[str],
) -> List[str]:
    """Return a list of human-readable recommendation strings."""

    recommendations: List[str] = []

    # ── Delay-based rules ──────────────────────────────────────────
    if delay_minutes == 0:
        recommendations.append("Excellent delivery performance. No delays recorded.")
    elif delay_minutes <= 20:
        recommendations.append(
            "Minor delay observed. Delivery was within acceptable limits."
        )
    else:
        recommendations.append(
            "Significant delay detected. Traffic or route conditions affected delivery time."
        )

    # ── Event-based rules ──────────────────────────────────────────
    event_set = {e.lower() for e in simulation_events}

    if "heavy traffic" in event_set:
        recommendations.append(
            "Avoid peak traffic hours on this route for future shipments."
        )
    if "heavy rain" in event_set:
        recommendations.append(
            "Weather impacted travel time. Monitor forecasts before dispatch."
        )
    if "road block" in event_set:
        recommendations.append(
            "Road block encountered. Alternative routing was handled successfully."
        )
    if "vehicle breakdown" in event_set:
        recommendations.append(
            "Vehicle breakdown occurred. Preventive maintenance is recommended."
        )

    # ── No-event fallback ──────────────────────────────────────────
    if not simulation_events:
        recommendations.append("Smooth delivery without any interruptions.")

    # ── Performance-based summary ──────────────────────────────────
    if performance_score >= 90:
        recommendations.append(
            "Overall route efficiency was excellent. This route is recommended for future shipments."
        )
    elif performance_score >= 70:
        recommendations.append(
            "Route performance was acceptable. Consider minor optimizations for better results."
        )
    else:
        recommendations.append(
            "Route performance was below expectations. A route review is strongly recommended."
        )

    return recommendations
