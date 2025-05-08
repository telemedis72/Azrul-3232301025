// ==== Konfigurasi Firebase ====
const firebaseConfig = {
    apiKey: "AIzaSyAT1YuUSoKvAC_q1yxmB8Ggt4vR6f51Nkc",
    authDomain: "telemediss.firebaseapp.com",
    databaseURL: "https://telemediss-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "telemediss",
    storageBucket: "telemediss.appspot.com", // diperbaiki dari firebasestorage.app
    messagingSenderId: "96895220603",
    appId: "1:96895220603:web:fc4c9d8c3bb243a1155bde",
    measurementId: "G-RSN040MZWR"
  };
  
  // ==== Inisialisasi Firebase ====
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const auth = firebase.auth(); // Tambahkan jika autentikasi digunakan
  
  // ==== Referensi elemen UI ====
  const adminListDiv = document.getElementById("adminList");
  const searchBox = document.getElementById("searchBox");
  
  // ==== Fungsi untuk memuat list admin ====
  function loadAdmins(currentUser) {
    db.ref("akun").once("value", snapshot => {
      const data = snapshot.val();
      adminListDiv.innerHTML = "";
  
      for (const username in data) {
        if (data.hasOwnProperty(username)) {
          const user = data[username];
  
          if (user.role === "admin") {
            const safeFrom = encodeURIComponent(currentUser);
            const safeTo = encodeURIComponent(username);
            const chatPath = `chats/${safeFrom}|${safeTo}`;
  
            db.ref(`${chatPath}/status/${safeFrom}`).once("value", statusSnap => {
              const status = statusSnap.val() === "unread"
                ? '<span class="status">Belum dibaca</span>'
                : '';
  
              const div = document.createElement("div");
              div.className = "admin-item";
              div.innerHTML = `<span>${user.nama}</span> ${status}`;
  
              div.onclick = () => {
                window.location.href = `chat-user.html?to=${safeTo}&from=${safeFrom}`;
              };
  
              adminListDiv.appendChild(div);
            });
          }
        }
      }
    });
  }
  
  // ==== Fungsi pencarian nama admin ====
  searchBox.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const items = adminListDiv.querySelectorAll(".admin-item");
  
    items.forEach(item => {
      const name = item.innerText.toLowerCase();
      item.style.display = name.includes(query) ? "flex" : "none";
    });
  });
  
  // ==== Autentikasi dan Muat Admin Setelah Login ====
  auth.onAuthStateChanged(user => {
    if (user) {
      const namaUser = (user.displayName || "PENGGUNA").trim();
      localStorage.setItem("loggedInUser", namaUser);
      loadAdmins(namaUser); // Muat daftar admin menggunakan nama login
    } else {
      alert("Anda belum login. Silakan login terlebih dahulu.");
      window.location.href = "login.html";
    }
  });
  