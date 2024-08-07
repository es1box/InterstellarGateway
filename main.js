import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, createUserWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, setDoc, doc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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

// Проверка аутентификации и перенаправление
onAuthStateChanged(auth, async (user) => {
    const path = window.location.pathname;

    if (user) {
        // Если пользователь на странице входа или регистрации, перенаправить на страницу профиля
        if (path === "/auth.html" || path === "/register.html") {
            window.location.href = "profile.html";
        }
    } else {
        // Если пользователь на странице новостей или профиля, перенаправить на страницу входа
        if (path === "/news.html" || path === "/profile.html") {
            window.location.href = "auth.html";
        }
    }
});

// Логика формы входа
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

// Логика входа через Google
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

// Логика ссылки на регистрацию
const registerLink = document.getElementById("registerLink");
if (registerLink) {
    registerLink.addEventListener("click", () => {
        window.location.href = "register.html";
    });
}

// Логика формы регистрации
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nickname = document.getElementById("registerNickname").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            const user = auth.currentUser;
            const userDoc = doc(db, "users", user.uid);
            await setDoc(userDoc, {
                nickname: nickname,
                email: email,
                age: null,
                isAdmin: false,
                createdAt: serverTimestamp()
            });

            window.location.href = "profile.html";
        } catch (error) {
            console.error("Ошибка при регистрации:", error);
            alert("Ошибка при регистрации: " + error.message);
        }
    });
}

// Логика ссылки на вход
const loginLink = document.getElementById("loginLink");
if (loginLink) {
    loginLink.addEventListener("click", () => {
        window.location.href = "auth.html";
    });
}

// Загрузка новостей
const newsList = document.getElementById("news-list");
if (newsList) {
    const loadNews = async () => {
        // Пример загрузки новостей из Firestore
        const newsRef = doc(db, "news", "latest");
        const newsSnap = await getDoc(newsRef);

        if (newsSnap.exists()) {
            const newsData = newsSnap.data();
            const newsItem = document.createElement("div");
            newsItem.className = "news-item";
            newsItem.innerHTML = `
                <h2>${newsData.title}</h2>
                <p>${newsData.content}</p>
            `;
            newsList.appendChild(newsItem);
        } else {
            console.log("Документ не найден!");
        }
    };

    loadNews();
}

// Всплывающее окно для новостей
const newsModal = document.getElementById("news-modal");
const closeModalBtn = document.getElementById("close-modal");

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
        newsModal.style.display = "none";
    });
}

// Функция генерации пароля
function generatePassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

// Обновление полей для регистрации и входа
const showPasswordToggle = (toggleId, passwordId) => {
    const toggle = document.getElementById(toggleId);
    const passwordField = document.getElementById(passwordId);
    
    if (toggle) {
        toggle.addEventListener("click", () => {
            passwordField.type = passwordField.type === "password" ? "text" : "password";
        });
    }
};

showPasswordToggle("showLoginPassword", "loginPassword");
showPasswordToggle("showRegisterPassword", "registerPassword");
