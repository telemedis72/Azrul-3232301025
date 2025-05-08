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

// Inisialisasi Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const db = firebase.database();
const auth = firebase.auth();

let adminName = "";

// === Autentikasi dan Mulai Aplikasi ===
auth.onAuthStateChanged(user => {
  if (user) {
    const userEmail = user.email.toLowerCase(); // Ambil email user, convert ke lowercase

    // Ambil data akun dari Firebase dan cocokkan dengan email pengguna
    db.ref("akun").once("value").then(snapshot => {
      const akunData = snapshot.val();
      let namaUser = "PENGGUNA"; // Default jika tidak ditemukan

      // Mencari nama berdasarkan email
      for (const [id, data] of Object.entries(akunData)) {
        if (data.email && data.email.toLowerCase() === userEmail) {
          namaUser = data.nama;
          break;
        }
      }

      // Set nama user dan simpan di localStorage
      localStorage.setItem("loggedInUser", namaUser);
      adminName = namaUser;
      console.log("Admin Name:", adminName); // Debugging admin name
      tampilkanPengguna();

    }).catch(err => {
      console.error("Gagal mengambil data akun:", err);
      alert("Terjadi kesalahan saat mengambil data akun.");
    });

  } else {
    alert("Anda belum login. Silakan login terlebih dahulu.");
    window.location.href = "login.html";
  }
});

// Format waktu
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

// Menampilkan daftar pengguna yang terhubung
function tampilkanPengguna(cari = "") {
  db.ref("chats").once("value", snapshot => {
    const data = snapshot.val();
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    if (!data) {
      userList.innerHTML = "<p>Belum ada pengguna yang mengirim pesan.</p>";
      return;
    }

    const daftar = new Map();

    Object.entries(data).forEach(([path, chatData]) => {
      const [userA, userB] = path.split("|").map(n => n.trim());

      console.log("Path:", path); // Debugging untuk cek path

      if (adminName !== userA && adminName !== userB) {
        return; // hanya menampilkan chat yang melibatkan admin
      }

      const pengguna = (adminName === userA ? userB : userA);
      if (!pengguna.toLowerCase().includes(cari.toLowerCase())) return;

      const pesanArray = Object.values(chatData.pesan || {});
      if (pesanArray.length === 0) return;

      const lastMessage = pesanArray.reduce((a, b) => a.timestamp > b.timestamp ? a : b);
      const lastTime = lastMessage?.timestamp || 0;
      const unreadCount = pesanArray.filter(p => p.to === adminName && !p.read).length;

      // Hindari duplikat
      if (!daftar.has(pengguna)) {
        daftar.set(pengguna, { pengguna, lastTime, unreadCount });
      } else {
        const existing = daftar.get(pengguna);
        if (lastTime > existing.lastTime) {
          daftar.set(pengguna, { pengguna, lastTime, unreadCount });
        }
      }
    });

    const sortedList = Array.from(daftar.values()).sort((a, b) => b.lastTime - a.lastTime);

    if (sortedList.length === 0) {
      userList.innerHTML = "<p>Belum ada pengguna yang mengirim pesan.</p>";
      return;
    }

    sortedList.forEach(({ pengguna, lastTime, unreadCount }) => {
      const div = document.createElement("div");
      div.className = "user";
      div.onclick = () => {
        tandaiPesanDibaca(adminName, pengguna);
        window.location.href = `chat-admin.html?from=${adminName}&to=${pengguna}`;
      };

      const foto = `https://ui-avatars.com/api/?name=${encodeURIComponent(pengguna)}&background=random`;

      div.innerHTML = `
        <div class="user-left">
          <img src="${foto}" class="profile-img" alt="${pengguna}">
          <div class="user-info">
            <div class="user-name">${pengguna}</div>
            <div class="user-time">
              ${formatWaktu(lastTime)}
              ${unreadCount > 0 ? `<span class="badge">${unreadCount}</span>` : ""}
            </div>
          </div>
        </div>
      `;

      userList.appendChild(div);
    });
  });
}

// Fungsi tandai semua pesan sebagai sudah dibaca
function tandaiPesanDibaca(admin, pengguna) {
  const chatId1 = `${admin}|${pengguna}`;
  const chatId2 = `${pengguna}|${admin}`;

  [chatId1, chatId2].forEach(chatId => {
    db.ref(`chats/${chatId}/pesan`).once("value", snapshot => {
      snapshot.forEach(child => {
        const pesan = child.val();
        if (pesan.to === admin && !pesan.read) {
          db.ref(`chats/${chatId}/pesan/${child.key}/read`).set(true);
        }
      });
    });
  });
}

// Deteksi input pencarian
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", e => {
  tampilkanPengguna(e.target.value);
});
