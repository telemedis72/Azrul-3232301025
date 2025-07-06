// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAT1YuUSoKvAC_q1yxmB8Ggt4vR6f51Nkc",
    authDomain: "telemediss.firebaseapp.com",
    databaseURL: "https://telemediss-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "telemediss",
    storageBucket: "telemediss.appspot.com",
    messagingSenderId: "96895220603",
    appId: "1:96895220603:web:fc4c9d8c3bb243a1155bde"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Ambil akun ID dari URL atau localStorage
const urlParams = new URLSearchParams(window.location.search);
let akunId = urlParams.get('user') || window.localStorage.getItem('selectedAkunId');

// Fungsi untuk memperbarui akun
function updateAkun(id) {
    const akunRef = db.ref('akun/' + id);
    akunRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            const akun = snapshot.val();
            document.getElementById('akun-nama').innerText = akun.nama;
            window.localStorage.setItem('selectedAkunId', id);
        } else {
            document.getElementById('akun-nama').innerText = 'Akun tidak ditemukan';
        }
    });
}

// Fungsi untuk mendengarkan pembacaan pengukuran dari Firebase
function listenToMeasurements() {
    const dataRef = db.ref("data/node123");  // akses ke node baru

    dataRef.on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const bpm = data.bpm || "Data tidak tersedia";
            const sistole = data.sistole || "Data tidak tersedia";
            const diastole = data.diastole || "Data tidak tersedia";

            document.getElementById("bpm").textContent = bpm;
            document.getElementById("sistole").textContent = sistole;
            document.getElementById("diastole").textContent = diastole;

            document.getElementById('statusBpm').textContent = isNormalBpm(parseInt(bpm)) ? "Normal" : "Tidak Normal";
            document.getElementById('statusSistol').textContent = isNormalSistole(parseInt(sistole)) ? "Normal" : "Tidak Normal";
            document.getElementById('statusDiastol').textContent = isNormalDiastole(parseInt(diastole)) ? "Normal" : "Tidak Normal";
        }
    });
}


// Fungsi cek normal/tidak
function isNormalBpm(bpm) {
    return bpm >= 60 && bpm <= 100;
}

function isNormalSistole(sistole) {
    return sistole >= 90 && sistole <= 120;
}

function isNormalDiastole(diastole) {
    return diastole >= 60 && diastole <= 80;
}

// Fungsi untuk menyimpan data yang dibaca otomatis dari Firebase
function saveData() {
    if (!akunId) {
        alert('Akun belum dipilih!');
        return;
    }

    const bpm = parseInt(document.getElementById("bpm").textContent);
    const sistole = parseInt(document.getElementById("sistole").textContent);
    const diastole = parseInt(document.getElementById("diastole").textContent);

    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID');
    const waktu = now.toLocaleTimeString('id-ID');

    const hasilPengukuran = {
        BPM: bpm.toString(),
        DIASTOLE: diastole.toString(),
        SISTOLE: sistole.toString(),
        tanggal: tanggal,
        waktu: waktu
    };

    db.ref('HASIL_PENGUKURAN/' + akunId + '/HISTORI').push(hasilPengukuran)
        .then(() => {
            alert("Data berhasil disimpan!");
        });
}

// Fungsi untuk memuat riwayat pengukuran
function loadRiwayat() {
    const ref = db.ref(`HASIL_PENGUKURAN/${akunId}/HISTORI`);
    const list = document.getElementById('historyList');

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

            li.textContent = `Tanggal: ${tanggal}`;
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

// Fungsi untuk manual input dari form lalu simpan
const btnSave = document.getElementById('btnSave');
if (btnSave) {
    btnSave.addEventListener('click', () => {
        if (!akunId) {
            alert('Akun belum dipilih!');
            return;
        }

        const bpm = document.getElementById('editTextBPM').value;
        const sistolik = document.getElementById('editTextSistolik').value;
        const diastolik = document.getElementById('editTextDiastolik').value;

        if (bpm && sistolik && diastolik) {
            const now = new Date();
            const tanggal = now.toLocaleDateString('id-ID').replace(/\//g, '-');
            const waktu = now.toLocaleTimeString('id-ID');

            db.ref('HASIL_PENGUKURAN/' + akunId + '/HISTORI').push({
                BPM: bpm,
                SISTOLE: sistolik,
                DIASTOLE: diastolik,
                tanggal: tanggal,
                waktu: waktu
            }).then(() => {
                alert('Data berhasil disimpan!');

                const li = document.createElement('li');
                li.textContent = `BPM: ${bpm}, Sistolik: ${sistolik}, Diastolik: ${diastolik}, Tanggal: ${tanggal}, Waktu: ${waktu}`;
                document.getElementById('historyList').appendChild(li);

                document.getElementById('editTextBPM').value = '';
                document.getElementById('editTextSistolik').value = '';
                document.getElementById('editTextDiastolik').value = '';
            }).catch((error) => {
                alert('Gagal menyimpan data: ' + error.message);
            });
        } else {
            alert('Harap isi semua kolom!');
        }
    });
}

// Fungsi untuk scan QR
function onQRCodeScan(scannedData) {
    const id = scannedData; // hasil scan QR
    updateAkun(id);
}

// Fungsi klik nama user manual
const namaUser1Btn = document.getElementById('namaUser1');
if (namaUser1Btn) {
    namaUser1Btn.addEventListener('click', function() {
        const id = 'namaUser1'; // ganti sesuai kebutuhan
        updateAkun(id);
    });
}

// Setelah halaman siap, mulai mendengarkan pengukuran dan muat riwayat
document.addEventListener("DOMContentLoaded", function() {
    listenToMeasurements(); // Mulai mendengarkan perubahan data dari Firebase
    loadRiwayat(); // Muat riwayat pengukuran
});

// Toggle navbar untuk menu mobile
const hamburger = document.getElementById('.hamburger');
const navbar = document.querySelector(".navbar");

hamburger.addEventListener("click", () => {
    navbar.classList.toggle("active");
});
