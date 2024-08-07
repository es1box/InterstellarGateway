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
// User Profile
const userInfo = document.getElementById("user-info");
const logoutButton = document.getElementById("logout");

auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        const userDoc = doc(db, "users", user.uid);
        userInfo.innerHTML = `
            <p><strong>Почта:</strong> ${user.email}</p>
            <p><strong>Никнейм:</strong> ${user.displayName || "Не указан"}</p>
            <p><strong>Возраст:</strong> ${user.age || "Не указан"}</p>
        `;

        // Check if user is admin
        if (user.isAdmin) {
            userInfo.innerHTML += `
                <p><strong>Роль:</strong> Администратор</p>
                <a href="admin.html" class="connect-button">Панель администратора</a>
            `;
        } else {
            userInfo.innerHTML += `<p><strong>Роль:</strong> Пользователь</p>`;
        }
    } else {
        // No user is signed in
        window.location.href = "auth.html";
    }
});

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await auth.signOut();
            window.location.href = "index.html";
        } catch (error) {
            console.error("Ошибка при выходе:", error);
        }
    });
}
// News Page
if (window.location.pathname.includes("news.html")) {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "auth.html";
        } else {
            loadNews();
        }
    });
}

async function loadNews() {
    const newsList = document.getElementById("news-list");
    // Load and display news
    const newsSnapshot = await getDocs(collection(db, "news"));
    newsSnapshot.forEach((doc) => {
        const newsItem = doc.data();
        const newsDiv = document.createElement("div");
        newsDiv.className = "news-item";
        newsDiv.innerHTML = `
            <h2>${newsItem.title}</h2>
            <p>${newsItem.summary}</p>
            <p><a href="#" class="read-more" data-id="${doc.id}">Читать больше</a></p>
        `;
        newsList.appendChild(newsDiv);
    });

    document.querySelectorAll(".read-more").forEach((link) => {
        link.addEventListener("click", openNews);
    });
}

async function openNews(event) {
    event.preventDefault();
    const newsId = event.target.getAttribute("data-id");
    const newsDoc = await getDoc(doc(db, "news", newsId));
    const newsData = newsDoc.data();

    const modal = document.createElement("div");
    modal.className = "news-modal";
    modal.innerHTML = `
        <div class="news-content">
            <h2>${newsData.title}</h2>
            <p>${newsData.content}</p>
            <button class="close-modal">Закрыть</button>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add("modal-open");

    document.querySelector(".close-modal").addEventListener("click", () => {
        document.body.removeChild(modal);
        document.body.classList.remove("modal-open");
    });
}
// Online Widget
async function updateOnlineCount() {
    const onlineCountElement = document.getElementById("online-count");
    if (onlineCountElement) {
        try {
            const response = await fetch("https://api.example.com/server/online"); // Пример запроса к API
            const data = await response.json();
            onlineCountElement.textContent = `${data.online} игроков онлайн`;
        } catch (error) {
            onlineCountElement.textContent = "Ошибка загрузки данных";
        }
    }
}

updateOnlineCount();
setInterval(updateOnlineCount, 60000); // Обновление каждые 60 секунд
