// EduShield frontend ↔ FastAPI backend integration

const EDU_API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:8000';

let activeDisaster = null;
let userScores = {};
let currentQuestionIndex = 0;
let correctAnswersCount = 0;
let selectedAnswers = [];
let backendQuizzes = [];
let activeBackendQuiz = null;

function getAuthToken() {
    return localStorage.getItem('edushield_token');
}

function getBackendDisasterName(localItem) {
    if (!localItem) return '';
    const map = {
        earthquake: 'Earthquake',
        fire: 'Fire',
        flood: 'Flood',
        cyclone: 'Cyclone',
        lightning: 'Lightning',
        chemical: 'Chemical'
    };
    return map[localItem.id] || localItem.title;
}

function findLocalDisasterByBackendName(name) {
    if (typeof disasterWorldData === 'undefined') return null;
    const target = String(name || '').trim().toLowerCase();
    const all = [
        ...(disasterWorldData.natural || []),
        ...(disasterWorldData.human || [])
    ];
    return all.find(item => {
        const backendName = getBackendDisasterName(item).toLowerCase();
        const title = String(item.title || '').toLowerCase();
        return backendName === target || title === target;
    }) || null;
}

async function fetchBackendQuizzes() {
    try {
        const response = await fetch(`${EDU_API_BASE_URL}/api/quizzes/`);
        const data = await response.json();
        if (!response.ok) {
            console.error('Quiz API error:', data);
            return [];
        }
        backendQuizzes = data.quizzes || [];
        return backendQuizzes;
    } catch (error) {
        console.error('Failed to load quizzes:', error);
        return [];
    }
}

async function fetchStudentResults() {
    const token = getAuthToken();
    if (!token) return [];

    try {
        const response = await fetch(`${EDU_API_BASE_URL}/api/student/results`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (!response.ok) {
            console.error('Student results API error:', data);
            return [];
        }
        return data.results || [];
    } catch (error) {
        console.error('Failed to load student results:', error);
        return [];
    }
}

// Initialize Dashboard from MongoDB/FastAPI
async function initDashboard() {
    // Render the disaster portal cards immediately from the frontend data.
    // This keeps the Disaster World interface visible even when the backend
    // is temporarily unavailable; backend data is then layered on top.
    renderDashboardCards();

    const token = getAuthToken();

    if (!token) {
        console.warn('No authentication token found.');
        updateOverallScore();
        return;
    }

    try {
        const [dashboardResponse, results, quizzes] = await Promise.all([
            fetch(`${EDU_API_BASE_URL}/api/student/dashboard`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetchStudentResults(),
            fetchBackendQuizzes()
        ]);

        const dashboardData = await dashboardResponse.json();

        if (!dashboardResponse.ok) {
            console.error('Dashboard API error:', dashboardData);
            if (dashboardResponse.status === 401) {
                logout();
            }
            return;
        }

        // Build module scores from backend results.
        // The latest result for a disaster is shown on its portal card.
        userScores = {};
        results.forEach(result => {
            const localItem = findLocalDisasterByBackendName(result.disaster);
            if (localItem && userScores[localItem.id] === undefined) {
                userScores[localItem.id] = Number(result.percentage) || 0;
            }
        });

        renderDashboardCards();

        const scoreEl = document.getElementById('total-score');
        if (scoreEl) {
            scoreEl.innerText = `${Number(dashboardData.preparedness_score) || 0}%`;
        }

        const quizCountEl = document.getElementById('quizzes-completed');
        if (quizCountEl) {
            quizCountEl.innerText = Number(dashboardData.quizzes_completed) || 0;
        }

        const averageScoreEl = document.getElementById('average-score');
        if (averageScoreEl) {
            averageScoreEl.innerText = `${Number(dashboardData.average_score) || 0}%`;
        }

        console.log('Dashboard loaded from backend:', dashboardData);
        console.log('Backend quizzes loaded:', quizzes.length);
        console.log('Backend student results loaded:', results.length);

    } catch (error) {
        // Keep the local disaster cards visible if the backend is offline.
        // The cards remain fully usable for opening the learning modules.
        console.error('Failed to load dashboard from backend; using local disaster cards:', error);
        renderDashboardCards();
        updateOverallScore();
    }
}

function renderDashboardCards() {
    if (typeof disasterWorldData === 'undefined') return;

    const renderCategory = (list, containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        list.forEach(item => {
            const card = document.createElement('div');
            card.className = 'portal-card';
            card.onclick = () => launchJourney(item.id);

            const score = userScores[item.id] !== undefined
                ? `${userScores[item.id]}%`
                : 'Not Started';

            card.innerHTML = `
                <div class="portal-badge" style="color: ${item.color}">${score}</div>
                <div class="card-icon" style="background: rgba(255,255,255,0.05); color: ${item.color}">
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <h3 style="font-size: 1.25rem;">${item.title}</h3>
                <p style="color: var(--text-sub); font-size: 0.9rem;">${item.desc}</p>
            `;

            container.appendChild(card);
        });
    };

    renderCategory(disasterWorldData.natural || [], 'grid-natural');
    renderCategory(disasterWorldData.human || [], 'grid-human');
}

// Return to Dashboard & Reset Background Video
function goDashboard() {
    const bgVideo = document.getElementById('bg-video');
    if (bgVideo) {
        bgVideo.pause();
        bgVideo.currentTime = 0;
        bgVideo.removeAttribute('src');
        bgVideo.load();
    }

    showScreen('screen-dashboard');
    initDashboard();
}

async function launchJourney(id) {
    if (typeof disasterWorldData === 'undefined') return;

    const item =
        (disasterWorldData.natural || []).find(x => x.id === id) ||
        (disasterWorldData.human || []).find(x => x.id === id);

    if (!item) return;

    currentQuestionIndex = 0;
    correctAnswersCount = 0;
    selectedAnswers = [];
    activeDisaster = item;

    // Use the backend quiz question set when one exists. This keeps the
    // submitted answer count exactly synchronized with MongoDB.
    if (backendQuizzes.length === 0) {
        await fetchBackendQuizzes();
    }

    const backendName = getBackendDisasterName(item).toLowerCase();
    activeBackendQuiz = backendQuizzes.find(q =>
        String(q.disaster || '').toLowerCase() === backendName
    ) || null;

    if (activeBackendQuiz && Array.isArray(activeBackendQuiz.questions)) {
        activeDisaster = {
            ...item,
            questions: activeBackendQuiz.questions.map(question => ({
                q: question.question,
                opts: (question.options || []).map(text => ({ text, correct: false }))
            }))
        };
    }

    const bgVideo = document.getElementById('bg-video');
    if (bgVideo && typeof disasterVideos !== 'undefined' && disasterVideos[id]) {
        bgVideo.src = disasterVideos[id];
        bgVideo.loop = true;
        bgVideo.load();
        bgVideo.play().catch(err => console.warn('Video playback restricted:', err));
    }

    const journeyTitle = document.getElementById('journey-title');
    if (journeyTitle) journeyTitle.innerText = item.title;

    const learnDesc = document.getElementById('learn-desc');
    const learnHazards = document.getElementById('learn-hazards');
    if (learnDesc) learnDesc.innerText = item.learn || '';
    if (learnHazards) {
        learnHazards.innerHTML = (item.hazards || [])
            .map(h => `<li>${h}</li>`).join('');
    }

    const prepChecklist = document.getElementById('prep-checklist');
    const prepAvoid = document.getElementById('prep-avoid');
    if (prepChecklist) {
        prepChecklist.innerHTML = (item.checklist || [])
            .map(c => `<li><i class="fa-solid fa-check" style="color: var(--accent-green);"></i> ${c}</li>`)
            .join('');
    }
    if (prepAvoid) {
        prepAvoid.innerHTML = (item.avoid || [])
            .map(a => `<li><i class="fa-solid fa-xmark" style="color: var(--accent-red);"></i> ${a}</li>`)
            .join('');
    }

    loadCurrentQuestion();
    switchStage('01');
    showScreen('screen-journey');
}

function loadCurrentQuestion() {
    if (!activeDisaster || !activeDisaster.questions) return;

    const qData = activeDisaster.questions[currentQuestionIndex];
    if (!qData) return;

    const qEl = document.getElementById('sim-question');
    if (qEl) qEl.innerText = qData.q;

    const simOpts = document.getElementById('sim-options');
    if (!simOpts) return;

    simOpts.innerHTML = '';

    (qData.opts || []).forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'sim-btn';
        btn.innerText = opt.text;
        btn.onclick = () => selectSimOption(activeBackendQuiz ? null : opt.correct, index);
        simOpts.appendChild(btn);
    });
}

function switchStage(stageNum) {
    document.querySelectorAll('.stage-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.stage-content').forEach(c => c.classList.remove('active'));

    const activeTab = document.getElementById(`tab-${stageNum}`);
    const activeStage = document.getElementById(`stage-${stageNum}`);

    if (activeTab) activeTab.classList.add('active');
    if (activeStage) activeStage.classList.add('active');

    if (stageNum === '03' && activeDisaster && typeof init3DScene === 'function') {
        if (typeof scene === 'undefined' || !scene) init3DScene();
        if (typeof loadDisaster3DModel === 'function') loadDisaster3DModel(activeDisaster.id);
    } else if (typeof stop3DScene === 'function') {
        stop3DScene();
    }
}

function selectSimOption(isCorrect, selectedIndex) {
    if (!activeDisaster || !activeDisaster.questions) return;

    if (isCorrect === true) correctAnswersCount++;
    selectedAnswers.push(selectedIndex);
    currentQuestionIndex++;

    if (currentQuestionIndex < activeDisaster.questions.length) {
        loadCurrentQuestion();
    } else {
        calculateFinalScore();
        switchStage('04');
    }
}

async function calculateFinalScore() {
    if (!activeDisaster || !activeDisaster.questions?.length) return;

    const totalQ = activeDisaster.questions.length;
    const accuracy = activeBackendQuiz
        ? null
        : Math.round((correctAnswersCount / totalQ) * 100);

    const evalAcc = document.getElementById('eval-acc');
    const evalGrade = document.getElementById('eval-grade');
    const statusEl = document.getElementById('eval-status');

    if (accuracy !== null) {
        if (evalAcc) evalAcc.innerText = `${accuracy}%`;
        if (evalGrade) evalGrade.innerText = `${accuracy} / 100`;

        if (statusEl) {
            statusEl.innerText = accuracy >= 70 ? 'WELL PREPARED' : 'NEEDS REVISION';
            statusEl.style.color = accuracy >= 70
                ? 'var(--accent-green)'
                : 'var(--accent-red)';
        }

        // Show local score immediately while the backend saves the official result.
        userScores[activeDisaster.id] = accuracy;
    } else if (statusEl) {
        statusEl.innerText = 'CALCULATING...';
    }

    const token = getAuthToken();
    if (!token) {
        alert('Your login session is missing. Please log in again.');
        return;
    }

    // IMPORTANT: use backend quiz ID, not the frontend disaster ID.
    const backendDisasterName = getBackendDisasterName(activeDisaster).toLowerCase();
    const quiz = activeBackendQuiz || backendQuizzes.find(q =>
        String(q.disaster || '').toLowerCase() === backendDisasterName
    );

    if (!quiz) {
        console.warn(`No backend quiz exists yet for ${activeDisaster.title}.`);
        alert(`${activeDisaster.title} content is available in the 3D world, but its backend quiz has not been added yet.`);
        return;
    }

    console.log('Submitting quiz to backend:', {
        quizId: quiz.id,
        answers: selectedAnswers
    });

    try {
        const response = await fetch(
            `${EDU_API_BASE_URL}/api/quizzes/${quiz.id}/submit`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answers: selectedAnswers })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('Quiz submission failed:', data);
            if (response.status === 401) {
                alert('Your session expired. Please log in again.');
                logout();
                return;
            }
            alert(data.detail || 'Quiz submission failed.');
            return;
        }

        console.log('Quiz submitted successfully:', data);

        if (typeof data.percentage === 'number') {
            userScores[activeDisaster.id] = data.percentage;
            if (evalAcc) evalAcc.innerText = `${data.percentage}%`;
            if (evalGrade) evalGrade.innerText = `${data.percentage} / 100`;
        }

        if (data.feedback && statusEl) {
            statusEl.innerText = data.feedback;
        }

        console.log('Quiz saved to MongoDB successfully.');

    } catch (error) {
        console.error('Cannot connect to EduShield server:', error);
        alert(
            'Cannot connect to the EduShield server.\n\n' +
            'Check that FastAPI is running at http://127.0.0.1:8000 and that the frontend is opened through a local web server (not file://).'
        );
    }
}

function finishJourney() {
    goDashboard();
}

function updateOverallScore() {
    const scoreEl = document.getElementById('total-score');
    if (!scoreEl) return;

    const keys = Object.keys(userScores);
    if (keys.length === 0) {
        scoreEl.innerText = '0%';
        return;
    }

    const total = keys.reduce((acc, k) => acc + (Number(userScores[k]) || 0), 0);
    const avg = Math.round(total / keys.length);
    scoreEl.innerText = `${avg}%`;
}

// Staff console remains frontend-local because the current backend has no staff-management API.
// --------------------------------
// STAFF DASHBOARD - BACKEND
// --------------------------------

async function openStaffDashboard() {
    if (typeof showScreen === 'function') {
        showScreen('screen-staff-dashboard');
    }

    const tableBody = document.getElementById('staff-student-table');

    if (!tableBody) {
        console.error('Staff student table not found.');
        return;
    }

    const token = getAuthToken();

    if (!token) {
        alert('Your login session is missing. Please log in again.');
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-sub);">
                Loading student data...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(
            `${EDU_API_BASE_URL}/api/staff/dashboard`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log('Staff dashboard response:', data);

        if (!response.ok) {
            console.error('Staff dashboard API error:', data);

            if (response.status === 401) {
                alert('Your session has expired. Please log in again.');
                logout();
                return;
            }

            if (response.status === 403) {
                alert('Staff access required.');
                return;
            }

            alert(data.detail || 'Failed to load staff dashboard.');
            return;
        }

        // --------------------------------
        // UPDATE STAFF STATISTICS
        // --------------------------------

        const totalStudentsEl =
            document.getElementById('stat-total-students');

        const totalCompletedEl =
            document.getElementById('stat-total-completed');

        const avgScoreEl =
            document.getElementById('stat-avg-score');

        const readinessEl =
            document.getElementById('stat-readiness-level');

        if (totalStudentsEl) {
            totalStudentsEl.innerText = data.total_students || 0;
        }

        if (totalCompletedEl) {
            totalCompletedEl.innerText =
                data.total_completed_quizzes || 0;
        }

        if (avgScoreEl) {
            avgScoreEl.innerText =
                `${Number(data.average_score) || 0}%`;
        }

        if (readinessEl) {
            readinessEl.innerText =
                data.readiness || 'NO DATA';

            if (data.readiness === 'HIGH READINESS') {
                readinessEl.style.color = 'var(--accent-green)';
            } else if (data.readiness === 'MODERATE') {
                readinessEl.style.color = 'var(--accent-orange)';
            } else if (data.readiness === 'CRITICAL RISK') {
                readinessEl.style.color = 'var(--accent-red)';
            } else {
                readinessEl.style.color = 'var(--text-sub)';
            }
        }

        // --------------------------------
        // UPDATE STUDENT TABLE
        // --------------------------------

        tableBody.innerHTML = '';

        const students = data.students || [];

        if (students.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6"
                        style="padding: 2rem; text-align: center; color: var(--text-sub);">
                        No registered students found.
                    </td>
                </tr>
            `;

            return;
        }

        students.forEach(student => {

            const quizzesCount =
                Number(student.quizzes_completed) || 0;

            const averageScore =
                Number(student.average_score) || 0;

            let ratingTag = '';

            if (student.status === 'Unrated') {

                ratingTag = `
                    <span style="color: var(--text-sub);">
                        Unrated
                    </span>
                `;

            } else if (student.status === 'Pass') {

                ratingTag = `
                    <span style="
                        color: var(--accent-green);
                        font-weight: 700;
                    ">
                        Pass
                    </span>
                `;

            } else {

                ratingTag = `
                    <span style="
                        color: var(--accent-red);
                        font-weight: 700;
                    ">
                        Needs Training
                    </span>
                `;
            }

            const row = document.createElement('tr');

            row.className = 'student-row';

            row.style.borderBottom =
                '1px solid var(--glass-border)';

            row.innerHTML = `
                <td style="
                    padding: 1rem;
                    font-weight: 600;
                ">
                    ${student.name || 'Student'}
                </td>

                <td style="
                    padding: 1rem;
                    color: var(--text-sub);
                ">
                    ${student.email || ''}
                </td>

                <td style="padding: 1rem;">
                    ${quizzesCount} Module(s)
                </td>

                <td style="
                    padding: 1rem;
                    font-weight: 700;
                ">
                    ${averageScore}%
                </td>

                <td style="padding: 1rem;">
                    ${ratingTag}
                </td>

                <td style="
                    padding: 1rem;
                    text-align: right;
                ">
                    <button
                        class="btn-outline"
                        style="
                            padding: 0.3rem 0.6rem;
                            font-size: 0.75rem;
                        "
                        onclick="resetStudentScore('${student.id}', '${student.name || 'Student'}')"
                    >
                        Reset Scores
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        console.log(
            `Loaded ${students.length} students from MongoDB.`
        );

    } catch (error) {

        console.error(
            'Cannot connect to EduShield Staff API:',
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="
                        padding: 2rem;
                        text-align: center;
                        color: var(--accent-red);
                    ">
                    Cannot connect to the EduShield server.
                </td>
            </tr>
        `;

        alert(
            'Cannot connect to the EduShield server.\n\n' +
            'Make sure FastAPI is running at ' +
            'http://127.0.0.1:8000'
        );
    }
}


// --------------------------------
// RESET STUDENT RESULTS - BACKEND
// --------------------------------

async function resetStudentScore(studentId, studentName) {

    const confirmed = confirm(
        `Are you sure you want to reset all quiz scores for ${studentName}?`
    );

    if (!confirmed) return;

    const token = getAuthToken();

    if (!token) {
        alert('Your login session is missing. Please log in again.');
        return;
    }

    try {

        const response = await fetch(
            `${EDU_API_BASE_URL}/api/staff/students/${studentId}/results`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log('Reset student response:', data);

        if (!response.ok) {

            if (response.status === 401) {
                alert('Your session has expired. Please log in again.');
                logout();
                return;
            }

            if (response.status === 403) {
                alert('Staff access required.');
                return;
            }

            alert(
                data.detail ||
                'Failed to reset student quiz results.'
            );

            return;
        }

        alert(
            `${studentName}'s quiz results have been reset successfully.`
        );

        // Reload Staff dashboard from MongoDB
        await openStaffDashboard();

    } catch (error) {

        console.error(
            'Failed to reset student results:',
            error
        );

        alert(
            'Cannot connect to the EduShield server.'
        );
    }
}

function filterStudentRoster() {
    const query = (document.getElementById('staff-search-input')?.value || '').toLowerCase();
    const rows = document.querySelectorAll('.student-row');

    rows.forEach(row => {
        row.style.display = row.innerText.toLowerCase().includes(query) ? '' : 'none';
    });
}

function submitSurvey(e) {
    if (e && e.preventDefault) e.preventDefault();
    alert('Safety Audit Submitted Successfully!');
    goDashboard();
}
