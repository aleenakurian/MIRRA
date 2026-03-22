from services.context_service import get_today_context
from services.recommendation_service import generate_recommendations

def handle_today_recommendations(profile_id):
    context = get_today_context(profile_id)
    recos = generate_recommendations(context)

    return {
        "date": context["date"],
        "recommendations": recos
    }