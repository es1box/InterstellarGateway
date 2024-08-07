// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBo6sm-D7KpWhnYkjZrhJnoIE0sNwpTVIc",
    authDomain: "interstellargateway-149ae.firebaseapp.com",
    projectId: "interstellargateway-149ae",
    storageBucket: "interstellargateway-149ae.appspot.com",
    messagingSenderId: "665939536665",
    appId: "1:665939536665:web:ce35dc47d05810bf677388",
    measurementId: "G-BEH8RS3YGB",
    databaseURL: "https://interstellargateway-149ae-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore();
const realtimeDB = getDatabase(app);

// Elements
const registerForm = document.getElementById("registerForm");
const googleLoginBtn = document.getElementById("googleLogin");
const logoutBtn = document.getElementById("logout");
const newsList = document.getElementById("news-list");

// Registration
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const nickname = document.getElementById("nickname").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const age = document.getElementById("age").value;
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await setDoc(doc(db, "users", user.uid), {
                nickname: nickname,
                email: email,
                age: age,
                isAdmin: false,
                createdAt: serverTimestamp()
            });

            alert("Регистрация успешна! Пожалуйста, подтвердите вашу почту.");
            user.sendEmailVerification();
        } catch (error) {
            console.error("Ошибка при регистрации:", error);
        }
    });
}

// Google Login
if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, "users", user.uid), {
                    nickname: user.displayName,
                    email: user.email,
                    age: null,
                    isAdmin: false,
                    createdAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error("Ошибка входа через Google:", error);
        }
    });
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        try {
            await signOut(auth);
            alert("Вы вышли из системы");
            window.location.href = "index.html";
        } catch (error) {
            console.error("Ошибка при выходе:", error);
        }
    });
}

// Load News
if (newsList) {
    const newsRef = ref(realtimeDB, "news/");
    onValue(newsRef, (snapshot) => {
        const newsData = snapshot.val();
        newsList.innerHTML = "";
        for (const newsId in newsData) {
            const news = newsData[newsId];
            const newsItem = document.createElement("div");
            newsItem.className = "card";
            newsItem.innerHTML = `
                <h3>${news.title}</h3>
                <p>${news.content}</p>
                <button class="button" onclick="likeNews('${newsId}')">Лайк</button>
                <button class="button" onclick="addToFavorites('${newsId}')">В избранное</button>
            `;
            newsList.appendChild(newsItem);
        }
    });
}

window.likeNews = async (newsId) => {
    const user = auth.currentUser;
    if (user) {
        const likesRef = ref(realtimeDB, `likes/${newsId}/${user.uid}`);
        set(likesRef, {
            liked: true
        });
    } else {
        alert("Пожалуйста, войдите, чтобы ставить лайки");
    }
};

window.addToFavorites = async (newsId) => {
    const user = auth.currentUser;
    if (user) {
        await setDoc(doc(db, "users", user.uid, "favorites", newsId), {
            addedAt: serverTimestamp()
        });
        alert("Новость добавлена в избранное");
    } else {
        alert("Пожалуйста, войдите, чтобы добавлять в избранное");
    }
};

// User Profile
const userInfo = document.getElementById("user-info");
if (userInfo) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                userInfo.innerHTML = `
                    <p>Ник: ${userData.nickname}</p>
                    <p>Email: ${userData.email}</p>
                    <p>Возраст: ${userData.age}</p>
                `;
            }
        } else {
            userInfo.innerHTML = "<p>Вы не вошли в систему</p>";
        }
    });
}
