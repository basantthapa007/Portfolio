import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDw_xKS_-YaQi2or2klNbM3anDw1LfJsx0",
  authDomain: "presentation-46e60.firebaseapp.com",
  projectId: "presentation-46e60",
  storageBucket: "presentation-46e60.firebasestorage.app",
  messagingSenderId: "991487657505",
  appId: "1:991487657505:web:16d4ebc4044aacffc68560",
  measurementId: "G-HXRCQ5LMZX"
};

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const fileList = document.getElementById('file-list');

// Log In & Sign Up Handlers
document.getElementById('btn-signup').addEventListener('click', () => {
  createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .then(() => alert("Account created successfully!"))
    .catch(err => alert(err.message));
});

document.getElementById('btn-login').addEventListener('click', () => {
  signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .catch(err => alert(err.message));
});

document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    loadUserFiles(user.uid);
  } else {
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    fileList.innerHTML = '';
  }
});

// Upload PDF File
document.getElementById('btn-upload').addEventListener('click', () => {
  const file = document.getElementById('pdf-file').files[0];
  const user = auth.currentUser;
  if (!file || !user) return alert("Please select a file to upload.");

  const storageRef = ref(storage, `users/${user.uid}/${file.name}`);
  uploadBytes(storageRef, file).then(() => {
    alert('PDF uploaded successfully!');
    loadUserFiles(user.uid);
  }).catch(err => alert(err.message));
});

// Load PDF Files
function loadUserFiles(uid) {
  fileList.innerHTML = '';
  const userFolderRef = ref(storage, `users/${uid}`);
  listAll(userFolderRef).then((res) => {
    res.items.forEach((itemRef) => {
      getDownloadURL(itemRef).then((url) => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${url}" target="_blank">${itemRef.name}</a>`;
        fileList.appendChild(li);
      });
    });
  });
}
