// ==== Toggle Sidebar ====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
    document.body.classList.toggle('sidebar-active');
}

// ==== Menampilkan konten berdasarkan menu ====
function showContent(section) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(function(sec) {
        sec.style.display = 'none';
    });

    const activeSection = document.getElementById(section);
    if (activeSection) {
        activeSection.style.display = 'block';
    }

    toggleSidebar(); // Tutup sidebar setelah memilih menu
}

// ==== Konfigurasi Firebase ====
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

// ==== Inisialisasi Firebase ====
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// ==== Fungsi Memuat Riwayat Pengukuran ====
function loadRiwayat(namaUser) {
    const ref = database.ref(`HASIL_PENGUKURAN/${namaUser}/HISTORI`);
    const list = document.getElementById('historyList');

    if (!list) {
        console.error("Element #historyList tidak ditemukan di HTML.");
        return;
    }

    ref.on('value', snapshot => {
        list.innerHTML = "";
        let index = 1;

        if (!snapshot.exists()) {
            list.innerHTML = "<li>Tidak ada data pengukuran</li>";
            return;
        }

        snapshot.forEach(childSnapshot => {
            const data = childSnapshot.val();
            const li = document.createElement("li");

            const tanggal = data.tanggal || "-";
            const waktu = data.waktu || "-";
            const bpm = data.BPM || "-";
            const sistole = data.SISTOLE || "-";
            const diastole = data.DIASTOLE || "-";

            li.textContent = `Pengukuran ${index}`;
            li.style.cursor = "pointer";
            li.addEventListener("click", () => {
                const query = new URLSearchParams({
                    tanggal: tanggal,
                    waktu: waktu,
                    BPM: bpm,
                    SISTOLE: sistole,
                    DIASTOLE: diastole
                }).toString();
                window.location.href = `detail.html?${query}`;
            });

            list.appendChild(li);
            index++;
        });
    }, error => {
        alert("Gagal memuat data: " + error.message);
    });
}

// ==== Fungsi Logout ====
function logoutUser() {
    auth.signOut()
        .then(() => {
            alert("Berhasil logout.");
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        })
        .catch(error => {
            alert("Gagal logout: " + error.message);
        });
}

// ==== Saat halaman dimuat, cek login dan ambil data ====
window.onload = function () {
    auth.onAuthStateChanged(user => {
        if (user) {
            const namaUser = (user.displayName || "PENGGUNA").trim(); // Ambil displayName dari Firebase Auth
            const pathNama = namaUser; // Nama pengguna digunakan langsung tanpa perubahan

            // Simpan ke localStorage untuk referensi nanti
            const currentUser = localStorage.setItem("loggedInUser", pathNama);

            const nameDisplay = document.getElementById("userNameDisplay");
            if (nameDisplay) {
                nameDisplay.textContent = namaUser;
            }

            loadRiwayat(pathNama); // Memuat riwayat pengukuran berdasarkan nama pengguna
        } else {
            alert("Anda belum login. Silakan login terlebih dahulu.");
            window.location.href = "login.html";
        }
    });

    // Tambahkan event listener untuk tombol logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
    }
};
