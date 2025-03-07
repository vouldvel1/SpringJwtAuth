function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('profilePage').classList.add('hidden');
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
            const token = await response.text();
            localStorage.setItem('jwtToken', token);
            await loadUserProfile();
        }
    } catch (e) {
        console.error('Ошибка входа:', e);
    }
}

async function loadUserProfile() {
    const token = localStorage.getItem('jwtToken');

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
            logout();
        }
    } catch (e) {
        console.error('Ошибка загрузки профиля:', e);
    }
}

// Отображение профиля
function showProfile(user) {
    document.querySelectorAll('.auth-form, .profile-page').forEach(el => el.classList.add('hidden'));
    document.getElementById('profilePage').classList.remove('hidden');

    document.getElementById('userName').textContent = user.name || 'Не указано';
    document.getElementById('userEmail').textContent = user.email || 'Не указано';
    document.getElementById('userRoles').textContent = user.roles || 'USER';
}

function logout() {
    localStorage.removeItem('jwtToken');
    showLogin();
}

// Проверка токена при загрузке страницы
window.onload = () => {
    if (localStorage.getItem('jwtToken')) {
        loadUserProfile();
    }
};