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
const storage = firebase.storage();

// Elemen DOM
const chatBox = document.getElementById("chat-box");
const msgInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");

let adminName, userName, path;

// Format waktu Indonesia
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
function loadChatInterface() {
  const urlParams = new URLSearchParams(window.location.search);
  userName = urlParams.get("to"); // Contoh: "AZRUL ASWAT"
  adminName = localStorage.getItem("loggedInUser"); // Nama admin yang tersimpan di localStorage

  if (!userName || !adminName) {
      alert("Nama pengguna tidak tersedia.");
      return;
  }

  path = `${userName}|${adminName}`; // Contoh: "AZRUL ASWAT|AZRUL"
  console.log("Path yang digunakan untuk chat:", path); // Debug log untuk path

  const chatRef = db.ref(`chats/${path}/pesan`).orderByChild("timestamp");

  chatRef.on("value", snapshot => {
      chatBox.innerHTML = "";
      const data = snapshot.val();
      if (!data) {
          // Jika tidak ada pesan, tampilkan pesan info
          const div = document.createElement("div");
          div.classList.add("msg", "info");
          div.textContent = "Tidak ada pesan untuk ditampilkan.";
          chatBox.appendChild(div);
      } else {
          Object.entries(data).forEach(([id, msg]) => {
              const div = document.createElement("div");
              div.classList.add("msg", msg.from === adminName ? "sent" : "received");
              if (msg.type === "file") {
                  div.innerHTML = `<a href="${msg.content}" target="_blank">📎 File</a>`;
              } else if (msg.type === "audio") {
                  div.innerHTML = `<audio controls src="${msg.content}"></audio>`;
              } else {
                  div.textContent = msg.content;
              }
              const ts = document.createElement("div");
              ts.className = "timestamp";
              ts.textContent = formatWaktu(msg.timestamp);
              div.appendChild(ts);
              chatBox.appendChild(div);
          });
          chatBox.scrollTop = chatBox.scrollHeight;
      }
  });
}

// Fungsi kirim pesan teks
function kirimPesan(teks) {
  const id = db.ref().push().key;
  db.ref(`chats/${path}/pesan/${id}`).set({
      from: adminName,
      to: userName,
      content: teks,
      type: "text",
      timestamp: Date.now(),
      read: false
  });
}

// Fungsi upload file
function uploadFile(file) {
  const storageRef = storage.ref(`chats/${path}/files/${file.name}`);
  const uploadTask = storageRef.put(file);
  uploadTask.on("state_changed", snapshot => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`Upload is ${progress}% done`);
  }, error => {
      console.error("Error uploading file:", error);
  }, () => {
      uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
          const id = db.ref().push().key;
          db.ref(`chats/${path}/pesan/${id}`).set({
              from: adminName,
              to: userName,
              content: downloadURL,
              type: "file",
              timestamp: Date.now(),
              read: false
          });
      });
  });
}

// Fungsi login pengguna
function login(email, password) {
  auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
          const user = userCredential.user;
          console.log("Pengguna terautentikasi:", user.email);

          // Ambil nama pengguna berdasarkan email
          const userRef = db.ref(`akun`).orderByChild("email").equalTo(user.email).limitToFirst(1);
          userRef.once("value", snapshot => {
              if (snapshot.exists()) {
                  const data = snapshot.val();
                  const userKey = Object.keys(data)[0]; // Ambil key pengguna yang ditemukan
                  adminName = data[userKey].nama; // Ambil nama pengguna
                  localStorage.setItem("loggedInUser", adminName); // Simpan nama pengguna ke localStorage
                  window.location.href = "chat.html"; // Redirect ke halaman chat
              } else {
                  console.error("Pengguna tidak ditemukan di database.");
              }
          });
      })
      .catch(error => {
          console.error("Login gagal:", error.message);
      });
}

// Fungsi login dengan akun Google
function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
      .then(result => {
          const user = result.user;
          console.log("Pengguna terautentikasi dengan Google:", user.email);

          // Ambil nama pengguna berdasarkan email
          const userRef = db.ref(`akun`).orderByChild("email").equalTo(user.email).limitToFirst(1);
          userRef.once("value", snapshot => {
              if (snapshot.exists()) {
                  const data = snapshot.val();
                  const userKey = Object.keys(data)[0]; // Ambil key pengguna yang ditemukan
                  adminName = data[userKey].nama; // Ambil nama pengguna
                  localStorage.setItem("loggedInUser", adminName); // Simpan nama pengguna ke localStorage
                  window.location.href = "chat.html"; // Redirect ke halaman chat
              } else {
                  console.error("Pengguna tidak ditemukan di database.");
              }
          });
      })
      .catch(error => {
          console.error("Login Google gagal:", error.message);
      });
}

// Event Listener untuk kirim pesan teks
sendBtn.addEventListener("click", () => {
  const teks = msgInput.value.trim();
  if (teks) {
      kirimPesan(teks);
      msgInput.value = "";
  }
});

// Event Listener untuk unggah file
fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
      uploadFile(file);
  }
});

// Autentikasi dan inisialisasi chat
auth.onAuthStateChanged(user => {
  console.log("Status login berubah");
  if (user) {
      console.log("Pengguna terautentikasi:", user.email);

      // Ambil nama pengguna berdasarkan email
      const userRef = db.ref(`akun`).orderByChild("email").equalTo(user.email).limitToFirst(1);
      userRef.once("value", snapshot => {
          if (snapshot.exists()) {
              const data = snapshot.val();
              const userKey = Object.keys(data)[0]; // Ambil key pengguna yang ditemukan
              adminName = data[userKey].nama; // Ambil nama pengguna
              localStorage.setItem("loggedInUser", adminName); // Simpan nama pengguna ke localStorage
              loadChatInterface(); // Panggil fungsi untuk memuat antarmuka chat
          } else {
              console.error("Pengguna tidak ditemukan di database.");
          }
      });
  } else {
      console.log("Pengguna tidak terautentikasi");
      alert("Anda belum login. Silakan login terlebih dahulu.");
      window.location.href = "login.html"; // Redirect ke halaman login
  }
});

// Menampilkan nama pengguna yang sedang login
console.log("Nama pengguna yang terautentikasi:", localStorage.getItem("loggedInUser"));
