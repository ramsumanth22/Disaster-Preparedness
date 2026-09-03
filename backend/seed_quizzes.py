from database.connection import db


quizzes = [
    {
        "title": "Earthquake Safety",
        "disaster": "Earthquake",
        "description": "Test your knowledge about earthquake safety.",
        "difficulty": "Easy",
        "questions": [
            {
                "question": "What should you do during an earthquake?",
                "options": [
                    "Run to the elevator",
                    "Drop, Cover and Hold",
                    "Stand near a window",
                    "Run onto the road"
                ],
                "correct_answer": 1
            },
            {
                "question": "Which place is generally safer during an earthquake?",
                "options": [
                    "Under a sturdy table",
                    "Near glass windows",
                    "Inside an elevator",
                    "On a balcony"
                ],
                "correct_answer": 0
            },
            {
                "question": "What should you avoid during an earthquake?",
                "options": [
                    "Protecting your head",
                    "Staying away from windows",
                    "Using an elevator",
                    "Taking cover"
                ],
                "correct_answer": 2
            }
        ]
    },

    {
        "title": "Fire Safety",
        "disaster": "Fire",
        "description": "Test your knowledge about fire prevention and evacuation.",
        "difficulty": "Easy",
        "questions": [
            {
                "question": "What should you do when you discover a fire?",
                "options": [
                    "Raise the alarm",
                    "Hide in a room",
                    "Use the elevator",
                    "Ignore it"
                ],
                "correct_answer": 0
            },
            {
                "question": "Which route should you use during an evacuation?",
                "options": [
                    "Emergency exit",
                    "Elevator",
                    "Locked door",
                    "Window"
                ],
                "correct_answer": 0
            },
            {
                "question": "What should you do if smoke is present?",
                "options": [
                    "Stay low and move toward an exit",
                    "Stand upright",
                    "Open every window",
                    "Use the elevator"
                ],
                "correct_answer": 0
            }
        ]
    },

    {
        "title": "Flood Safety",
        "disaster": "Flood",
        "description": "Test your knowledge about staying safe during floods.",
        "difficulty": "Medium",
        "questions": [
            {
                "question": "What should you do if flood water is rising?",
                "options": [
                    "Move to higher ground",
                    "Walk through fast water",
                    "Drive through flooded roads",
                    "Stay in a basement"
                ],
                "correct_answer": 0
            },
            {
                "question": "What should you avoid during a flood?",
                "options": [
                    "Higher ground",
                    "Emergency instructions",
                    "Flooded electrical areas",
                    "Safe shelters"
                ],
                "correct_answer": 2
            }
        ]
    },

    {
        "title": "Chemical and Gas Leak Safety",
        "disaster": "Chemical / Gas Leak",
        "description": "Test your knowledge about responding safely to chemical and gas leaks.",
        "difficulty": "Medium",
        "questions": [
            {
                "question": "What should you avoid doing when you suspect a gas leak?",
                "options": [
                    "Flipping light switches or striking matches",
                    "Moving away from the area",
                    "Notifying emergency services",
                    "Following evacuation instructions"
                ],
                "correct_answer": 0
            },
            {
                "question": "What should you do if a chemical or gas leak is suspected?",
                "options": [
                    "Move to a safe area away from the leak",
                    "Stay near the source",
                    "Use an open flame",
                    "Turn electrical switches on and off"
                ],
                "correct_answer": 0
            },
            {
                "question": "Who should be notified about a serious chemical or gas leak?",
                "options": [
                    "Campus emergency services",
                    "Only your friends",
                    "Nobody",
                    "Wait until the next day"
                ],
                "correct_answer": 0
            }
        ]
    },

    {
        "title": "Cyclone and Windstorm Safety",
        "disaster": "Cyclone / Windstorm",
        "description": "Test your knowledge about staying safe during cyclones and severe windstorms.",
        "difficulty": "Medium",
        "questions": [
            {
                "question": "What should you use to illuminate a room when the power goes out during a storm?",
                "options": [
                    "Battery-powered flashlights or LED lanterns",
                    "Wax candles near open windows",
                    "Gas-fueled camping stoves",
                    "Open flames"
                ],
                "correct_answer": 0
            },
            {
                "question": "What is the safest place during a severe windstorm?",
                "options": [
                    "Inside a sturdy building away from windows",
                    "Outside in an open area",
                    "Near large trees",
                    "On a balcony"
                ],
                "correct_answer": 0
            },
            {
                "question": "What should you do when authorities issue an evacuation order?",
                "options": [
                    "Follow the evacuation instructions",
                    "Ignore the warning",
                    "Wait until the storm becomes stronger",
                    "Go outside to observe the storm"
                ],
                "correct_answer": 0
            }
        ]
    }
]


# --------------------------------
# INSERT / FIX QUIZ DATA
# --------------------------------

# Fix existing disaster names so they match the frontend
db.quizzes.update_one(
    {"disaster": "Chemical / Gas Leak"},
    {"$set": {"disaster": "Chemical"}}
)

db.quizzes.update_one(
    {"disaster": "Cyclone / Windstorm"},
    {"$set": {"disaster": "Cyclone"}}
)


# Add only quizzes that are missing
for quiz in quizzes:

    existing_quiz = db.quizzes.find_one({
        "disaster": quiz["disaster"]
    })

    if existing_quiz:
        print(f"Already exists: {quiz['disaster']}")
    else:
        db.quizzes.insert_one(quiz)
        print(f"Added: {quiz['disaster']}")


print("\nQuiz data update completed!")