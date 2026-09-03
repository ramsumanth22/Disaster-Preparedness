from fastapi import APIRouter, Depends
from auth_utils import get_current_user
from database.connection import db


router = APIRouter(
    prefix="/api/student",
    tags=["Student"]
)


@router.get("/profile")
def get_profile(current_user=Depends(get_current_user)):

    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "created_at": current_user["created_at"]
    }
@router.get("/results")
def get_student_results(
    current_user=Depends(get_current_user)
):

    results = list(
        db.quiz_results.find(
            {
                "student_id": current_user["_id"]
            },
            {
                "_id": 0,
                "quiz_id": 0,
                "student_id": 0
            }
        ).sort("completed_at", -1)
    )

    total_quizzes = len(results)

    if total_quizzes > 0:
        average_score = round(
            sum(result["percentage"] for result in results)
            / total_quizzes
        )
    else:
        average_score = 0

    for result in results:
        if "completed_at" in result:
            result["completed_at"] = result["completed_at"].isoformat()

    return {
        "total_quizzes": total_quizzes,
        "average_score": average_score,
        "results": results
    }
@router.get("/dashboard")
def get_student_dashboard(
    current_user=Depends(get_current_user)
):

    # Get this student's quiz results
    results = list(
        db.quiz_results.find(
            {
                "student_id": current_user["_id"]
            }
        ).sort("completed_at", -1)
    )

    # Basic statistics
    quizzes_completed = len(results)

    if quizzes_completed > 0:
        average_score = round(
            sum(result["percentage"] for result in results)
            / quizzes_completed
        )
    else:
        average_score = 0

    # Get unique disaster categories completed
    disasters_completed = list(
        set(
            result.get("disaster")
            for result in results
            if result.get("disaster")
        )
    )

    # Preparedness score
    preparedness_score = average_score

    # Determine level
    if preparedness_score >= 80:
        level = "Excellent"
    elif preparedness_score >= 60:
        level = "Good"
    elif preparedness_score >= 40:
        level = "Needs Improvement"
    else:
        level = "Beginner"

    # Badges
    # --------------------------------
# ACHIEVEMENTS / BADGES
# --------------------------------

    badges = []

# First quiz
    if quizzes_completed >= 1:
        badges.append({
            "name": "First Responder",
            "description": "Completed your first disaster preparedness quiz."
        })

# Fire achievement
    fire_results = [
        result for result in results
        if result.get("disaster") == "Fire"
    ]

    if any(result.get("percentage", 0) >= 80 for result in fire_results):
        badges.append({
            "name": "Fire Ready",
            "description": "Scored 80% or higher in Fire Safety."
        })

# Flood achievement
    flood_results = [
        result for result in results
        if result.get("disaster") == "Flood"
    ]

    if any(result.get("percentage", 0) >= 80 for result in flood_results):
        badges.append({
            "name": "Flood Guardian",
            "description": "Scored 80% or higher in Flood Safety."
        })

# Earthquake achievement
    earthquake_results = [
        result for result in results
        if result.get("disaster") == "Earthquake"
    ]

    if any(result.get("percentage", 0) >= 80 for result in earthquake_results):
        badges.append({
            "name": "Earthquake Ready",
            "description": "Scored 80% or higher in Earthquake Safety."
        })

# Explorer achievement
    if quizzes_completed >= 3:
        badges.append({
            "name": "Preparedness Explorer",
            "description": "Completed three or more disaster quizzes."
        })

# High preparedness achievement
    if preparedness_score >= 90:
        badges.append({
            "name": "EduShield Champion",
            "description": "Achieved a preparedness score of 90% or higher."
        })

    # Recent results
    recent_results = []

    for result in results[:5]:

        recent_results.append({
            "quiz_title": result.get("quiz_title"),
            "disaster": result.get("disaster"),
            "score": result.get("score"),
            "total": result.get("total"),
            "percentage": result.get("percentage"),
            "completed_at": (
                result["completed_at"].isoformat()
                if result.get("completed_at")
                else None
            )
        })

    return {
        "student": {
            "id": str(current_user["_id"]),
            "name": current_user.get("name"),
            "email": current_user.get("email")
        },
        "preparedness_score": preparedness_score,
        "level": level,
        "quizzes_completed": quizzes_completed,
        "average_score": average_score,
        "disasters_completed": len(disasters_completed),
        "disaster_categories": disasters_completed,
        "badges": badges,
        "recent_results": recent_results
    }