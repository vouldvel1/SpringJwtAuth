function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('form-box').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('profilePage').classList.add('hidden');
    document.getElementById('form-box').classList.remove('hidden');
}

function handleLogin() {
    // Здесь будет запрос на сервер
    alert('Вход выполнен');
}

function handleRegister() {
    // Здесь будет запрос на регистрацию
    alert('Регистрация успешна');
}

async function register() {
    const user = {
        name: document.getElementById('regName').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        roles: 'ROLE_USER'
    };

    try {
        const response = await fetch(`http://localhost:8080/auth/addNewUser`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(user)
        });

        if (response.ok) {
            alert('Регистрация успешна!');
            showLogin();
        }
    } catch (e) {
        console.error('Ошибка регистрации:', e);
    }
}

async function login() {
    const authRequest = {
        username: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch(`http://localhost:8080/auth/generateToken`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(authRequest)
        });

        if (response.ok) {
            const { access_token, refresh_token } = await response.json();
            localStorage.setItem('accessToken', access_token);
            localStorage.setItem('refreshToken', refresh_token);
            await loadUserProfile();
        }
    } catch (e) {
        console.error('Ошибка входа:', e);
    }
}

async function loadUserProfile() {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        showLogin();
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/auth/user/userProfile`, {
            headers: {'Authorization': `Bearer ${token}`}
        });

        if (response.ok) {
            const user = await response.json();
            showProfile(user);
        }else{
            refreshAccessToken();
        }
    } catch (e) {
        console.error('Ошибка загрузки профиля:', e);
    }
}

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        logout();
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/auth/refreshToken`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ refreshToken })
        });

        if (response.ok) {
            const newAccessToken = await response.text();
            localStorage.setItem('accessToken', newAccessToken);
            loadUserProfile();
        } else {
            logout();
        }
    } catch (e) {
        console.error('Ошибка обновления токена:', e);
        logout();
    }
}

// Отображение профиля
function showProfile(user) {
    document.querySelectorAll('.form-box, .profile-page').forEach(el => el.classList.add('hidden'));
    document.getElementById('profilePage').classList.remove('hidden');

    document.getElementById('userName').textContent = user.name || 'Не указано';
    document.getElementById('userEmail').textContent = user.email || 'Не указано';
    document.getElementById('userRoles').textContent = user.roles || 'USER';
}

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    showLogin();
}

// Проверка токена при загрузке страницы
window.onload = () => {
    if (localStorage.getItem('accessToken')) {
        loadUserProfile();
    }else{
        showLogin();
    }
};