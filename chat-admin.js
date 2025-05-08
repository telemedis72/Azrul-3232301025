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
let isRecording = false;
let recordStart;

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
  adminName = localStorage.getItem("loggedInUser"); // Contoh: "AZRUL"

  if (!userName || !adminName) {
    alert("Nama pengguna tidak tersedia.");
    return;
  }

  path = `${userName}|${adminName}`; // Contoh: "AZRUL|AZRUL ASWAT"
  const chatRef = db.ref(`chats/${path}/pesan`).orderByChild("timestamp");
  
  chatRef.on("value", snapshot => {
    chatBox.innerHTML = "";
    const data = snapshot.val();
    if (data) {
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

// Fungsi rekam audio (simulasi)
function startRecord() {
  isRecording = true;
  recordStart = Date.now();
  console.log("Mulai rekam suara...");
}

function stopRecord() {
  const duration = Date.now() - recordStart;
  isRecording = false;
  if (duration > 800) {
    const dummyAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    const id = db.ref().push().key;
    db.ref(`chats/${path}/pesan/${id}`).set({
      from: adminName,
      to: userName,
      content: dummyAudioUrl,
      type: "audio",
      timestamp: Date.now(),
      read: false
    });
  }
}

// Kirim pesan teks
sendBtn.addEventListener("click", () => {
  if (isRecording) return;
  const teks = msgInput.value.trim();
  if (teks) {
    kirimPesan(teks);
    msgInput.value = "";
  }
});

// Tombol kirim digunakan untuk merekam suara juga
sendBtn.addEventListener("mousedown", startRecord);
sendBtn.addEventListener("mouseup", stopRecord);

// Unggah file
fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    uploadFile(file);
  }
});

// Autentikasi dan inisialisasi chat
auth.onAuthStateChanged(user => {
  if (user) {
    adminName = user.displayName || "Admin";
    localStorage.setItem("loggedInUser", adminName);
    loadChatInterface();
  } else {
    alert("Anda belum login. Silakan login terlebih dahulu.");
    window.location.href = "login.html";
  }
});
