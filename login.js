import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAT1YuUSoKvAC_q1yxmB8Ggt4vR6f51Nkc",
    authDomain: "telemediss.firebaseapp.com",
    databaseURL: "https://telemediss-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "telemediss",
    storageBucket: "telemediss.firebasestorage.app",
    messagingSenderId: "96895220603",
    appId: "1:96895220603:web:fc4c9d8c3bb243a1155bde",
    measurementId: "G-RSN040MZWR"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let loginAttempts = 0;

// Fungsi menampilkan notifikasi
function showNotification(message, color = '#4caf50', timeout = 3000) {
    const notification = document.getElementById('notification');
    notification.style.backgroundColor = color;
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, timeout);
}

// Fungsi menampilkan spinner
function showSpinner() {
    document.getElementById('loading-spinner').style.display = 'flex';
}

// Fungsi menyembunyikan spinner
function hideSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
}

// Validasi format email dengan regex
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
}

// Proses login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

    // Validasi email
    if (!email || !isValidEmail(email)) {
        errorMessage.textContent = "Format email tidak valid.";
        showNotification('Format email tidak valid.', '#f44336');
        return;
    }

    // Validasi password
    if (!password) {
        errorMessage.textContent = "Password tidak boleh kosong.";
        showNotification('Password tidak boleh kosong.', '#f44336');
        return;
    }

    showSpinner();

    try {
        // 1. Login menggunakan Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Cari pengguna di Realtime Database berdasarkan email (atau nama) pengguna
        const userRef = ref(db, 'akun');
        const snapshot = await get(userRef);

        let userData = null;
        if (snapshot.exists()) {
            const users = snapshot.val();
            // Mencari user berdasarkan email yang cocok
            for (const userKey in users) {
                if (users[userKey].email === email) {
                    userData = users[userKey];
                    break;
                }
            }
        }

        if (userData) {
            // 3. Jika pengguna ditemukan di database, arahkan ke dashboard sesuai role
            showNotification('Login berhasil! Mengarahkan...', '#4caf50');
            setTimeout(() => {
                if (userData.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'user-dashboard.html';
                }
            }, 1500);
        } else {
            // Jika tidak ditemukan di database
            errorMessage.textContent = "Data pengguna tidak ditemukan di database.";
            showNotification('Data pengguna tidak ditemukan.', '#f44336');
        }

    } catch (error) {
        loginAttempts++;
        errorMessage.textContent = "Email atau password salah.";
        showNotification('Email atau password salah.', '#f44336');

        if (loginAttempts >= 3) {
            document.getElementById('forgot-password').style.display = 'block';
            showNotification('Terlalu banyak gagal. Tampilkan opsi lupa password.', '#ff9800');
        }
    } finally {
        hideSpinner();
    }
});

// Opsi lupa password
document.getElementById('forgot-password').addEventListener('click', () => {
    showNotification('Menuju halaman lupa password.', '#2196f3');
    setTimeout(() => {
        window.location.href = 'forgot-password.html';
    }, 1000);
});

// Opsi register
document.getElementById('register-link').addEventListener('click', () => {
    showNotification('Menuju halaman pendaftaran.', '#2196f3');
    setTimeout(() => {
        window.location.href = 'register.html';
    }, 1000);
});

// Toggle password visibility
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye-slash');
    showNotification(type === 'text' ? 'Password ditampilkan.' : 'Password disembunyikan.', '#ff9800');
});
