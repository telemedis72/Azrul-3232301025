// Fungsi toggle sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    document.body.classList.toggle('sidebar-active');
}

// Menampilkan konten sesuai menu yang dipilih dan menutup sidebar
function showContent(section) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(function(sec) {
        sec.style.display = 'none';
    });

    const activeSection = document.getElementById(section);
    if (activeSection) {
        activeSection.style.display = 'block';
    }

    toggleSidebar();
}

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAT1YuUSoKvAC_q1yxmB8Ggt4vR6f51Nkc",
    authDomain: "telemediss.firebaseapp.com",
    databaseURL: "https://telemediss-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "telemediss",
    storageBucket: "telemediss.appspot.com",
    messagingSenderId: "96895220603",
    appId: "1:96895220603:web:fc4c9d8c3bb243a1155bde",
    measurementId: "G-RSN040MZWR"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Cek status login saat halaman dibuka
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        const namaUser = (user.displayName || "PENGGUNA").trim();
        localStorage.setItem("loggedInUser", namaUser);
        window.adminName = namaUser;

        // Jika ada fungsi khusus untuk admin, bisa dipanggil di sini:
        // loadAdmins(namaUser);

        // Muat data akun setelah login terverifikasi
        tampilkanDataAkun();
    } else {
        alert("Anda belum login. Silakan login terlebih dahulu.");
        window.location.href = "login.html";
    }
});

// Menyimpan data akun
let akunData = [];
let dataSiap = false;

// Menampilkan semua akun dengan role user
function tampilkanDataAkun() {
    const akunList = document.getElementById('akun-list');
    akunList.innerHTML = '';

    database.ref('akun').get().then((snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            akunData = []; // reset data

            for (let id in data) {
                const akun = data[id];
                if (akun.role === "user") {
                    akunData.push(akun);

                    const divAkun = document.createElement('div');
                    divAkun.classList.add('akun');
                    divAkun.innerHTML = `<h2>${akun.nama}</h2>`;
                    divAkun.onclick = () => redirectToSensorPage(akun.nama);
                    akunList.appendChild(divAkun);
                }
            }

            dataSiap = true;
        } else {
            akunList.innerHTML = '<p>Tidak ada data akun.</p>';
        }
    }).catch((error) => {
        akunList.innerHTML = `<p>Terjadi kesalahan: ${error.message}</p>`;
    });
}

// Fungsi filter pencarian
function filterData() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    const filtered = akunData.filter(akun => akun.nama.toLowerCase().includes(searchInput));

    const akunList = document.getElementById('akun-list');
    akunList.innerHTML = '';

    filtered.forEach(akun => {
        const divAkun = document.createElement('div');
        divAkun.classList.add('akun');
        divAkun.innerHTML = `<h2>${akun.nama}</h2>`;
        divAkun.onclick = () => redirectToSensorPage(akun.nama);
        akunList.appendChild(divAkun);
    });
}

// Fungsi untuk mengarahkan ke halaman sensor dan menyimpan nama pengguna ke localStorage
function redirectToSensorPage(namaUser) {
    localStorage.setItem("loggedInUser", namaUser); // simpan nama user ke localStorage
    window.location.href = `user-detail.html?user=${encodeURIComponent(namaUser)}`;
}

// Fungsi untuk memulai scan QR
function startScan() {
    const scanResultElement = document.getElementById('scan-result');

    if (!dataSiap) {
        alert("Tunggu sebentar, data akun masih dimuat...");
        return;
    }

    const html5QrCode = new Html5Qrcode("scan-result");

    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        (decodedText) => {
            console.log(`Hasil mentah scan: "${decodedText}"`);
            const cleanedText = decodedText.trim().replace(/[\n\r\u200B-\u200D\uFEFF]/g, "").toLowerCase();

            scanResultElement.innerText = `Hasil Scan: ${cleanedText}`;

            const hasil = akunData.filter(akun => 
                akun.nama.trim().toLowerCase() === cleanedText
            );

            if (hasil.length > 0) {
                localStorage.setItem("loggedInUser", hasil[0].nama);
                redirectToSensorPage(hasil[0].nama);
            } else {
                scanResultElement.innerText = 'Akun tidak ditemukan.';
            }
        },
        (errorMessage) => {
            console.log(`QR Scan Error: ${errorMessage}`);
        }
    ).catch(err => {
        scanResultElement.innerText = `Gagal memulai scan: ${err}`;
    });
}

// Ambil elemen form dan input untuk ubah password
const form = document.getElementById('change-password-form');
const oldPasswordInput = document.getElementById('old-password');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const errorMessage = document.getElementById('error-message');

// Fungsi untuk mengubah password
form.addEventListener('submit', (event) => {
    event.preventDefault();

    const oldPassword = oldPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword !== confirmPassword) {
        errorMessage.textContent = "Password baru dan konfirmasi password tidak cocok.";
        return;
    }

    const user = firebase.auth().currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, oldPassword);

    user.reauthenticateWithCredential(credential).then(() => {
        user.updatePassword(newPassword).then(() => {
            alert("Password berhasil diubah.");
            form.reset();
        }).catch((error) => {
            errorMessage.textContent = "Gagal mengubah password: " + error.message;
        });
    }).catch((error) => {
        errorMessage.textContent = "Password lama salah: " + error.message;
    });
});

// Tunggu seluruh konten HTML dimuat
document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (event) {
            event.preventDefault();

            const user = firebase.auth().currentUser;
            if (user) {
                firebase.auth().signOut().then(() => {
                    alert("Logout berhasil");
                    localStorage.removeItem("loggedInUser");
                    window.location.href = 'login.html';
                }).catch((error) => {
                    alert("Gagal logout: " + error.message);
                });
            } else {
                alert("Tidak ada pengguna yang sedang login.");
            }
        });
    } else {
        console.error("Elemen logoutButton tidak ditemukan.");
    }
});
