// Firebase Configuration
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
  const auth = firebase.auth();
  const db = firebase.database();
  
  function showNotif(message) {
    const notif = document.getElementById('notif');
    notif.innerText = message;
    notif.style.display = 'flex';
    setTimeout(() => {
      notif.style.display = 'none';
    }, 3000);
  }
  
  function register() {
    const nama = document.getElementById("nama").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const isAdmin = document.getElementById("isAdmin").checked;
    const errorMsg = document.getElementById("errorMsg");
    const loading = document.getElementById("loading");
  
    if (!nama || !email || !password || !confirmPassword) {
      showNotif("Semua field wajib diisi!");
      return;
    }
  
    if (password !== confirmPassword) {
      errorMsg.textContent = "Password tidak cocok.";
      return;
    }
  
    errorMsg.textContent = "";
    loading.style.display = "flex";
  
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const userId = userCredential.user.uid;
        const role = isAdmin ? "admin" : "user";
  
        db.ref("akun/" + nama).set({
          nama: nama,
          email: email,
          role: role
        }).then(() => {
          loading.style.display = "none";
          alert("Registrasi berhasil!");
          window.location.href = "login.html"; // Ganti ke halaman login jika ada
        });
      })
      .catch((error) => {
        loading.style.display = "none";
        errorMsg.textContent = error.message;
      });
  }
  