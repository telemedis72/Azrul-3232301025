const firebaseConfig = {
  apiKey: "AIzaSyAT1YuUSoKvAC_q1yxmB8Ggt4vR6f51Nkc",
  authDomain: "telemediss.firebaseapp.com",
  databaseURL: "https://telemediss-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "telemediss",
  storageBucket: "telemediss.appspot.com",
  messagingSenderId: "96895220603",
  appId: "1:96895220603:web:fc4c9d8c3bb243a1155bde"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const urlParams = new URLSearchParams(window.location.search);
const user = urlParams.get("from");
const admin = urlParams.get("to");
const path = `${user}|${admin}`;

const chatBox = document.getElementById("chat-box");
const msgInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");

let isRecording = false;
let recordStart;

// Load pesan
db.ref(`chats/${path}/pesan`).on("value", snap => {
  chatBox.innerHTML = "";
  const data = snap.val();
  if (!data) return;

  Object.entries(data).forEach(([id, msg]) => {
    const div = document.createElement("div");
    div.classList.add("msg");
    div.classList.add(msg.from === user ? "sent" : "received");

    if (msg.type === "file") {
      div.innerHTML = `<a href="${msg.content}" target="_blank">📎 File</a>`;
    } else if (msg.type === "audio") {
      div.innerHTML = `<audio controls src="${msg.content}"></audio>`;
    } else {
      div.textContent = msg.content;
    }

    const ts = document.createElement("div");
    ts.className = "timestamp";
    ts.textContent = new Date(msg.timestamp).toLocaleTimeString();
    div.appendChild(ts);
    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;

  Object.entries(data).forEach(([id, msg]) => {
    if (msg.to === user && !msg.read) {
      db.ref(`chats/${path}/pesan/${id}/read`).set(true);
    }
  });
});

function kirimPesan(teks) {
  const id = db.ref().push().key;
  db.ref(`chats/${path}/pesan/${id}`).set({
    from: user,
    to: admin,
    content: teks,
    type: "text",
    timestamp: Date.now(),
    read: false
  });
}

sendBtn.addEventListener("click", () => {
  if (isRecording) return;
  const teks = msgInput.value.trim();
  if (teks) {
    kirimPesan(teks);
    msgInput.value = "";
  }
});

sendBtn.addEventListener("mousedown", startRecord);
sendBtn.addEventListener("mouseup", stopRecord);

function startRecord() {
  isRecording = true;
  recordStart = Date.now();
  console.log("Mulai rekam (dummy mode)");
}

function stopRecord() {
  const duration = Date.now() - recordStart;
  isRecording = false;
  if (duration > 800) {
    const id = db.ref().push().key;
    db.ref(`chats/${path}/pesan/${id}`).set({
      from: user,
      to: admin,
      content: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      type: "audio",
      timestamp: Date.now(),
      read: false
    });
  }
}

fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const id = db.ref().push().key;
    db.ref(`chats/${path}/pesan/${id}`).set({
      from: user,
      to: admin,
      content: e.target.result,
      type: "file",
      timestamp: Date.now(),
      read: false
    });
  };
  reader.readAsDataURL(file);
});
