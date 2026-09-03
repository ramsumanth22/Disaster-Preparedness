// assets/js/auth.js

const API_BASE_URL = 'http://127.0.0.1:8000';

let isRegister = false;
let currentUser = null;

// Toggle between Login and Register forms
function toggleAuthMode() {
    isRegister = !isRegister;

    const errorEl = document.getElementById('auth-error');
    if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.innerText = '';
    }

    const emailEl = document.getElementById('input-email');
    const passEl = document.getElementById('input-password');
    const nameEl = document.getElementById('input-name');

    if (emailEl) emailEl.value = '';
    if (passEl) passEl.value = '';
    if (nameEl) nameEl.value = '';

    const titleEl = document.getElementById('auth-title');
    const subEl = document.getElementById('auth-sub');
    const groupNameEl = document.getElementById('group-name');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-toggle-text');

    if (titleEl) {
        titleEl.innerText = isRegister ? 'Create Account' : 'Welcome Back';
    }

    if (subEl) {
        subEl.innerText = isRegister
            ? 'Register to start 3D safety training'
            : 'Log in to enter the 3D Disaster World';
    }

    if (groupNameEl) {
        groupNameEl.style.display = isRegister ? 'block' : 'none';
    }

    if (submitBtn) {
        submitBtn.innerText = isRegister ? 'Register' : 'Login';
    }

    if (toggleText) {
        toggleText.innerHTML = isRegister
            ? 'Already have an account? <span onclick="toggleAuthMode()" style="color: var(--accent-blue); cursor: pointer; text-decoration: underline;">Login</span>'
            : 'Don\'t have an account? <span onclick="toggleAuthMode()" style="color: var(--accent-blue); cursor: pointer; text-decoration: underline;">Register</span>';
    }
}


// Handles Login & Registration
async function handleAuth(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    try {
        const roleEl = document.getElementById('input-role');
        const emailEl = document.getElementById('input-email');
        const passEl = document.getElementById('input-password');
        const nameEl = document.getElementById('input-name');

        const selectedRole = roleEl ? roleEl.value : 'student';
        const email = emailEl ? emailEl.value.trim().toLowerCase() : '';
        const password = passEl ? passEl.value : '';
        const name = nameEl ? nameEl.value.trim() : '';

        if (!email || !password) {
            showAuthError('Please fill in all required fields.');
            return;
        }

        if (isRegister && !name) {
            showAuthError('Please enter your name.');
            return;
        }

        // =========================================================
        // REGISTER
        // =========================================================

        if (isRegister) {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/register`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: name || email.split('@')[0],
                        email: email,
                        password: password,
                        role: selectedRole
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                showAuthError(
                    data.detail || 'Registration failed. Please try again.'
                );
                return;
            }

            alert('Account created successfully! Please log in.');

            toggleAuthMode();
            return;
        }


        // =========================================================
        // LOGIN
        // =========================================================

        const loginUrl =
            `${API_BASE_URL}/api/auth/login` +
            `?email=${encodeURIComponent(email)}` +
            `&password=${encodeURIComponent(password)}`;

        const response = await fetch(loginUrl, {
            method: 'POST'
        });

        const data = await response.json();

        if (!response.ok) {
            showAuthError(
                data.detail || 'Login failed. Please check your credentials.'
            );
            return;
        }

        // Save JWT token
        localStorage.setItem('edushield_token', data.access_token);

        // Save user information returned by backend
        currentUser = {
            id: data.user?.id || data.user_id || '',
            name: data.user?.name || name || email.split('@')[0],
            email: data.user?.email || email,
            role: data.user?.role || selectedRole
        };

        localStorage.setItem(
            'edushield_user',
            JSON.stringify(currentUser)
        );


        // =========================================================
        // UPDATE UI
        // =========================================================

        const userDisp = document.getElementById('user-display');
        const userNav = document.getElementById('user-nav');
        const staffBtn = document.getElementById('staff-nav-btn');

        if (userDisp) {
            userDisp.innerText =
                `👤 ${currentUser.name} (${currentUser.role.toUpperCase()})`;
        }

        if (userNav) {
            userNav.style.display = 'flex';
        }

        if (staffBtn) {
            staffBtn.style.display =
                currentUser.role === 'staff'
                    ? 'inline-block'
                    : 'none';
        }


        // =========================================================
        // INITIALIZE DASHBOARD
        // =========================================================

        if (typeof initDashboard === 'function') {
            initDashboard();
        }


        // =========================================================
        // ROUTE BASED ON ROLE
        // =========================================================

        if (currentUser.role === 'staff') {

            if (typeof openStaffDashboard === 'function') {
                openStaffDashboard();
            } else if (typeof showScreen === 'function') {
                showScreen('screen-staff-dashboard');
            }

        } else {

            if (typeof goDashboard === 'function') {
                goDashboard();
            } else if (typeof showScreen === 'function') {
                showScreen('screen-dashboard');
            }
        }

    } catch (error) {

        console.error('Auth System Error:', error);

        showAuthError(
            'Cannot connect to the EduShield server. Make sure the FastAPI backend is running.'
        );
    }
}


// =============================================================
// AUTH ERROR
// =============================================================

function showAuthError(msg) {

    const errorEl = document.getElementById('auth-error');

    if (errorEl) {
        errorEl.innerText = msg;
        errorEl.style.display = 'block';
    } else {
        alert(msg);
    }
}


// =============================================================
// GET AUTH TOKEN
// =============================================================

function getAuthToken() {
    return localStorage.getItem('edushield_token');
}


// =============================================================
// LOGOUT
// =============================================================

function logout() {

    currentUser = null;

    localStorage.removeItem('edushield_token');
    localStorage.removeItem('edushield_user');

    if (typeof window.userScores !== 'undefined') {
        window.userScores = {};
    }

    const userNav = document.getElementById('user-nav');

    if (userNav) {
        userNav.style.display = 'none';
    }

    if (typeof showScreen === 'function') {
        showScreen('screen-auth');
    }
}


// =============================================================
// RESTORE LOGIN SESSION
// =============================================================

function restoreAuthSession() {

    const token = getAuthToken();
    const savedUser = localStorage.getItem('edushield_user');

    if (!token || !savedUser) {
        return false;
    }

    try {

        currentUser = JSON.parse(savedUser);

        const userDisp = document.getElementById('user-display');
        const userNav = document.getElementById('user-nav');
        const staffBtn = document.getElementById('staff-nav-btn');

        if (userDisp) {
            userDisp.innerText =
                `👤 ${currentUser.name} (${currentUser.role.toUpperCase()})`;
        }

        if (userNav) {
            userNav.style.display = 'flex';
        }

        if (staffBtn) {
            staffBtn.style.display =
                currentUser.role === 'staff'
                    ? 'inline-block'
                    : 'none';
        }

        return true;

    } catch (error) {

        console.error('Session restore error:', error);

        logout();

        return false;
    }
}
// Restore an existing backend login after a page refresh.
document.addEventListener('DOMContentLoaded', () => {
    if (restoreAuthSession()) {
        if (typeof goDashboard === 'function') {
            goDashboard();
        }
    }
});
