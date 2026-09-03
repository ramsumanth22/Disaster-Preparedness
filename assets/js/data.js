const disasterWorldData = {
    natural: [
        {
            id: "earthquake",
            title: "Earthquake",
            icon: "fa-house-crack",
            color: "var(--accent-orange)",
            desc: "Sudden tectonic displacement causing ground shaking and structural stresses.",
            learn: "Earthquakes occur when tectonic stress accumulated along faults exceeds friction, releasing energy seismic waves.",
            hazards: ["Structural collapses", "Glass shards & falling debris", "Soil liquefaction", "Gas line ruptures"],
            checklist: ["Identify drop-zones under heavy desks.", "Anchor tall bookcases and heavy cabinets.", "Prepare a go-bag with flashlight and emergency radio."],
            avoid: ["DO NOT run outside during active shaking.", "DO NOT use elevators.", "DO NOT stand near window panes."],
            questions: [
                {
                    q: "Q1/3: A violent seismic tremor begins...",
                    opts: [
                        { 
                            text: "Drop, Cover, and Hold On under a sturdy desk", 
                            correct: true,
                            // Add explanation here:
                            explanation: "Correct! Dropping under sturdy furniture protects your head and spine."
                        },
                        { 
                            text: "Run toward the elevators immediately", 
                            correct: false,
                            // Add explanation here:
                            explanation: "Incorrect! Elevators can lose power or get stuck during shaking."
                        }
                    ]
                }
            ]
        },
        {
            id: "cyclone",
            title: "Cyclone / Windstorm",
            icon: "fa-wind",
            color: "var(--accent-purple)",
            desc: "Extreme rotating low-pressure atmospheric systems with destructive winds.",
            learn: "Cyclones develop over warm oceanic waters, generating extreme winds, heavy precipitation, and storm surges.",
            hazards: ["High-speed flying debris", "Roof detachment", "Widespread power outages", "Flash flooding"],
            checklist: ["Board up external glass openings.", "Secure outdoor loose items.", "Charge all emergency devices."],
            avoid: ["DO NOT venture outside during the calm 'eye'.", "DO NOT stay inside temporary light structures."],
            questions: [
                {
                    q: "Q1/3: Extreme cyclone winds begin shattering exterior glass windows. Where do you move?",
                    opts: [
                        { text: "Move to a windowless interior room or hallway on a lower floor", correct: true },
                        { text: "Go to the rooftop to inspect wind damage", correct: false },
                        { text: "Stand behind light curtains to block shattered glass", correct: false }
                    ]
                },
                {
                    q: "Q2/3: The wind suddenly stops and the sky turns calm. What does this indicate?",
                    opts: [
                        { text: "You are in the 'eye' of the cyclone; stay indoors as extreme winds will resume shortly", correct: true },
                        { text: "The cyclone is completely over; it is safe to go outside", correct: false },
                        { text: "It is safe to go swimming or drive near the coast", correct: false }
                    ]
                },
                {
                    q: "Q3/3: Power goes out during the storm and it gets dark inside. How should you illuminate the room?",
                    opts: [
                        { text: "Use battery-powered flashlights or LED lanterns", correct: true },
                        { text: "Light wax candles near open windows", correct: false },
                        { text: "Use gas-fueled camping stoves for light", correct: false }
                    ]
                }
            ]
        },
        {
            id: "flood",
            title: "Flash Flood",
            icon: "fa-cloud-showers-heavy",
            color: "var(--accent-blue)",
            desc: "Rapid accumulation and inundation of land areas by rising waters.",
            learn: "Flash floods occur due to torrential rains exceeding soil absorption capacities and urban drainage limits.",
            hazards: ["Fast-moving currents", "Submerged electrical hazards", "Contaminated drinking water"],
            checklist: ["Know high-ground evacuation paths.", "Store fresh drinking water.", "Keep emergency lights charged."],
            avoid: ["DO NOT walk or drive through moving water.", "DO NOT touch submerged electrical panels."],
            questions: [
                {
                    q: "Q1/3: Floodwaters are rapidly rising into the ground floor of the campus building. What should you do?",
                    opts: [
                        { text: "Evacuate systematically to upper floors or rooftops", correct: true },
                        { text: "Attempt to wade across fast-moving water outside", correct: false },
                        { text: "Shelter in the basement storage area", correct: false }
                    ]
                },
                {
                    q: "Q2/3: You see a car stalled in fast-moving floodwater ahead. What is the safest course of action?",
                    opts: [
                        { text: "Never attempt to drive or walk through floodwaters; turn around", correct: true },
                        { text: "Drive quickly through to push water out of the way", correct: false },
                        { text: "Walk through the water to push the car out", correct: false }
                    ]
                },
                {
                    q: "Q3/3: Floodwaters have receded, but standing water remains inside a building. What is a hidden hazard?",
                    opts: [
                        { text: "Electrocution from submerged live electrical circuits and toxic contamination", correct: true },
                        { text: "Excessively fresh and safe drinking water supply", correct: false },
                        { text: "Immediate freezing ground temperatures", correct: false }
                    ]
                }
            ]
        }
    ],
    human: [
        {
            id: "fire",
            title: "Industrial / Campus Fire",
            icon: "fa-fire-flame-curled",
            color: "var(--accent-red)",
            desc: "Thermal combustion incidents producing toxic smoke, heat, and structural collapse.",
            learn: "Fires require fuel, heat, and oxygen. Industrial fires often involve flammable materials causing rapid fire spread.",
            hazards: ["Superheated toxic smoke", "Flashover combustion", "Oxygen depletion", "Structural collapse"],
            checklist: ["Locate nearest manual fire alarm pull stations.", "Memorize stairwell exits.", "Learn fire extinguisher PASS protocol."],
            avoid: ["DO NOT use elevators.", "DO NOT open hot door handles.", "DO NOT inhale smoke standing upright."],
            questions: [
                {
                    q: "Q1/3: Dense black smoke fills your exit hallway during a campus fire. How should you navigate?",
                    opts: [
                        { text: "Crawl low beneath the smoke layer toward the exit stairwell", correct: true },
                        { text: "Run upright while taking deep breaths", correct: false },
                        { text: "Take the elevator straight down to the ground floor", correct: false }
                    ]
                },
                {
                    q: "Q2/3: Before opening a closed door to exit a room on fire, what critical safety step must you perform?",
                    opts: [
                        { text: "Touch the door handle and upper door surface with the back of your hand to feel for intense heat", correct: true },
                        { text: "Kool-Aid man kick the door open immediately without checking", correct: false },
                        { text: "Pour water on your shoes and open the door wide", correct: false }
                    ]
                },
                {
                    q: "Q3/3: If your clothes accidentally catch fire while escaping, what action should you take immediately?",
                    opts: [
                        { text: "Stop, Drop to the ground, and Roll back and forth while covering your face", correct: true },
                        { text: "Run fast outside to fan the flames away", correct: false },
                        { text: "Wave your arms violently in the air while standing", correct: false }
                    ]
                }
            ]
        },
        {
            id: "chemical",
            title: "Chemical / Gas Leak",
            icon: "fa-flask-vial",
            color: "#eab308",
            desc: "Uncontrolled release of hazardous gaseous, liquid, or volatile compounds.",
            learn: "Chemical spills present toxicity, flammability, or corrosive atmospheric hazards requiring specialized containment.",
            hazards: ["Toxic vapor inhalation", "Chemical skin burns", "Explosive atmospheres"],
            checklist: ["Know location of eye-wash stations.", "Maintain shelter-in-place sealing materials.", "Memorize warning sirens."],
            avoid: ["DO NOT create open sparks or flames.", "DO NOT travel downwind toward fumes."],
            questions: [
                {
                    q: "Q1/3: A hazardous chemical vapor leak is detected upwind in the science block. What immediate evacuation route do you take?",
                    opts: [
                        { text: "Evacuate crosswind (perpendicular to the wind direction) or upwind", correct: true },
                        { text: "Run directly downwind following the spreading plume cloud", correct: false },
                        { text: "Hide inside an open outdoor courtyard", correct: false }
                    ]
                },
                {
                    q: "Q2/3: Chemical liquid splashes into your eyes during a lab session. What is the immediate first-aid requirement?",
                    opts: [
                        { text: "Flush eyes continuously at an eyewash station with clean water for at least 15 minutes", correct: true },
                        { text: "Rub your eyes with paper towels to wipe the chemical away", correct: false },
                        { text: "Keep your eyes tightly closed and wait for a paramedic", correct: false }
                    ]
                },
                {
                    q: "Q3/3: An unknown gas leak is suspected in a hallway. What should you strictly avoid doing?",
                    opts: [
                        { text: "Flipping light switches or striking matches, as electrical sparks could trigger an explosion", correct: true },
                        { text: "Notifying the campus emergency service", correct: false },
                        { text: "Covering your mouth with a damp cloth", correct: false }
                    ]
                }
            ]
        }
    ]
};

const disasterVideos = {
    earthquake: "assets/media/videos/earthquake.mp4",
    cyclone: "assets/media/videos/cyclone.mp4",
    flood: "assets/media/videos/flood.mp4",
    fire: "assets/media/videos/fire.mp4",
    chemical: "assets/media/videos/chemical.mp4"
};