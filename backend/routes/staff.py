from fastapi import APIRouter, Depends, HTTPException
from database.connection import db
from auth_utils import get_current_user


router = APIRouter(
    prefix="/api/staff",
    tags=["Staff"]
)


# --------------------------------
# GET STAFF DASHBOARD
# --------------------------------

@router.get("/dashboard")
def get_staff_dashboard(
    current_user=Depends(get_current_user)
):

    # Only staff can access this endpoint
    if current_user.get("role", "").lower() != "staff":
        raise HTTPException(
            status_code=403,
            detail="Staff access required"
        )

    # Get all students
    students = list(
        db.users.find(
            {"role": "student"},
            {
                "_id": 1,
                "name": 1,
                "email": 1
            }
        )
    )

    student_data = []

    total_completed_quizzes = 0
    combined_average = 0

    for student in students:

        student_id = student["_id"]

        # Get this student's quiz results
        results = list(
            db.quiz_results.find(
                {"student_id": student_id}
            )
        )

        quizzes_completed = len(results)

        if quizzes_completed > 0:

            total_score = sum(
                result.get("percentage", 0)
                for result in results
            )

            average_score = round(
                total_score / quizzes_completed
            )

        else:
            average_score = 0

        total_completed_quizzes += quizzes_completed
        combined_average += average_score

        # Student status
        if quizzes_completed == 0:
            status = "Unrated"
        elif average_score >= 70:
            status = "Pass"
        else:
            status = "Needs Training"

        student_data.append({
            "id": str(student_id),
            "name": student.get("name", "Student"),
            "email": student.get("email", ""),
            "quizzes_completed": quizzes_completed,
            "average_score": average_score,
            "status": status
        })

    # Overall average
    if len(students) > 0:
        global_average = round(
            combined_average / len(students)
        )
    else:
        global_average = 0

    # Overall readiness
    if len(students) == 0:
        readiness = "NO DATA"
    elif global_average >= 75:
        readiness = "HIGH READINESS"
    elif global_average >= 50:
        readiness = "MODERATE"
    else:
        readiness = "CRITICAL RISK"

    return {
        "total_students": len(students),
        "total_completed_quizzes": total_completed_quizzes,
        "average_score": global_average,
        "readiness": readiness,
        "students": student_data
    }


# --------------------------------
# RESET STUDENT QUIZ RESULTS
# --------------------------------

@router.delete("/students/{student_id}/results")
def reset_student_results(
    student_id: str,
    current_user=Depends(get_current_user)
):

    # Only staff can perform this action
    if current_user.get("role", "").lower() != "staff":
        raise HTTPException(
            status_code=403,
            detail="Staff access required"
        )

    from bson import ObjectId

    try:
        object_id = ObjectId(student_id)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid student ID"
        )

    # Make sure student exists
    student = db.users.find_one({
        "_id": object_id,
        "role": "student"
    })

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    # Delete all quiz results
    result = db.quiz_results.delete_many({
        "student_id": object_id
    })

    return {
        "message": "Student quiz results reset successfully",
        "student": student.get("name", "Student"),
        "deleted_results": result.deleted_count
    }