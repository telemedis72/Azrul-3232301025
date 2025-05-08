// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAT1YuUSoKvAC_q1yxmB8Ggt4vR6f51Nkc",
  authDomain: "telemediss.firebaseapp.com",
  databaseURL: "https://telemediss-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "telemediss",
  storageBucket: "telemediss.appspot.com",
  messagingSenderId: "96895220603",
  appId: "1:96895220603:web:fc4c9d8c3bb243a1155bde"
};

// Pastikan Firebase hanya dimuat sekali
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Jika Firebase sudah diinisialisasi sebelumnya, gunakan instance yang ada
}

const db = firebase.database();
const auth = firebase.auth();

let adminName;

// === Autentikasi dan Mulai Aplikasi ===
auth.onAuthStateChanged(user => {
  if (user) {
    const namaUser = (user.displayName || "PENGGUNA").trim();
    localStorage.setItem("loggedInUser", namaUser);
    adminName = namaUser; // Menetapkan nama admin
    loadChatInterface(namaUser); // Pastikan fungsi ini didefinisikan atau hapus panggilan ini
  } else {
    alert("Anda belum login. Silakan login terlebih dahulu.");
    window.location.href = "login.html";
  }
});

// Fungsi untuk memformat waktu
function formatWaktu(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short"
  });
}

// Fungsi untuk memuat antarmuka chat
function loadChatInterface(namaUser) {
  console.log(`Memuat antarmuka chat untuk: ${namaUser}`);
  // Logika lebih lanjut untuk memuat antarmuka chat bisa ditambahkan di sini
  // Misalnya, Anda bisa menampilkan daftar percakapan atau lainnya
}

// Fungsi untuk menampilkan daftar pengguna yang terhubung
function tampilkanPengguna(cari = "") {
  db.ref("chats").once("value", snapshot => {
    const data = snapshot.val();
    if (!data) return;

    const daftar = [];

    Object.entries(data).forEach(([path, chatData]) => {
      const [user1, user2] = path.split("|");
      const pengguna = user1 === adminName ? user2 : (user2 === adminName ? user1 : null);
      if (!pengguna || !pengguna.toLowerCase().includes(cari.toLowerCase())) return;

      const lastMessage = Object.values(chatData.pesan || {}).pop();
      const lastTime = lastMessage?.timestamp || 0;

      daftar.push({ pengguna, lastTime });
    });

    // Urutkan berdasarkan waktu terakhir
    daftar.sort((a, b) => b.lastTime - a.lastTime);

    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    daftar.forEach(({ pengguna, lastTime }) => {
      const div = document.createElement("div");
      div.className = "user";
      div.onclick = () => {
        // Menandai pesan sebagai dibaca saat percakapan dibuka
        tandaiPesanDibaca(adminName, pengguna);

        // Arahkan ke halaman percakapan
        window.location.href = `chat-admin.html?from=${adminName}&to=${pengguna}`;
      };

      const foto = `https://ui-avatars.com/api/?name=${encodeURIComponent(pengguna)}&background=random`;

      div.innerHTML = `
        <div class="user-left">
          <img src="${foto}" class="profile-img" alt="${pengguna}">
          <div class="user-info">
            <div class="user-name">${pengguna}</div>
            <div class="user-time">${formatWaktu(lastTime)}</div>
          </div>
        </div>
      `;

      userList.appendChild(div);
    });
  });
}

// Fungsi untuk menandai pesan sebagai dibaca
function tandaiPesanDibaca(from, to) {
  db.ref("chats")
    .child(`${from}|${to}`)
    .child("pesan")
    .once("value", snapshot => {
      const pesanData = snapshot.val();
      if (!pesanData) return;

      // Memperbarui setiap pesan yang belum dibaca menjadi 'dibaca'
      Object.entries(pesanData).forEach(([key, pesan]) => {
        if (pesan.to === adminName && !pesan.read) {
          db.ref("chats")
            .child(`${from}|${to}`)
            .child("pesan")
            .child(key)
            .update({ read: true });
        }
      });
    });
}

// Mendeteksi perubahan pada input pencarian
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", e => {
  tampilkanPengguna(e.target.value);
});

// Menampilkan pengguna saat pertama kali halaman dimuat
tampilkanPengguna();
