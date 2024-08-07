// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBo6sm-D7KpWhnYkjZrhJnoIE0sNwpTVIc",
    authDomain: "interstellargateway-149ae.firebaseapp.com",
    projectId: "interstellargateway-149ae",
    storageBucket: "interstellargateway-149ae.appspot.com",
    messagingSenderId: "665939536665",
    appId: "1:665939536665:web:ce35dc47d05810bf677388",
    measurementId: "G-BEH8RS3YGB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Login Form
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "profile.html";
        } catch (error) {
            console.error("Ошибка при входе:", error);
            alert("Ошибка при входе: " + error.message);
        }
    });
}

// Google Login
const googleLoginBtn = document.getElementById("googleLogin");
if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDoc = doc(db, "users", user.uid);
            await setDoc(userDoc, {
                nickname: user.displayName,
                email: user.email,
                age: null,
                isAdmin: false,
                createdAt: serverTimestamp()
            }, { merge: true });

            window.location.href = "profile.html";
        } catch (error) {
            console.error("Ошибка входа через Google:", error);
            alert("Ошибка входа через Google: " + error.message);
        }
    });
}

// Link to Registration
const registerLink = document.getElementById("registerLink");
if (registerLink) {
    registerLink.addEventListener("click", () => {
        window.location.href = "register.html";
    });
}
