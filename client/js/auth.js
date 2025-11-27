// Backend API Base URL
const API_URL = "https://restaurant-billing-system-mini-project.onrender.com/auth";

// Redirect if user is not authenticated
function checkAuth() {
    const token = localStorage.getItem("token");

    if (!token &&
        !window.location.href.includes("index.html") &&
        !window.location.href.includes("signup.html")) {
        window.location.href = "index.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    
    // LOGIN
    
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;

            try {
                const res = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.msg || "Invalid email or password");
                    return;
                }

                // Save user & token
                localStorage.setItem("token", data.token);
                localStorage.setItem("currentUser", JSON.stringify(data.user));

                window.location.href = "dashboard.html";

            } catch (err) {
                alert("Unable to connect to server.");
            }
        });
    }

    
    // SIGNUP
    
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("signup-name").value;
            const email = document.getElementById("signup-email").value;
            const phone = document.getElementById("signup-phone").value;
            const password = document.getElementById("signup-password").value;

            try {
                const res = await fetch(`${API_URL}/signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, phone, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                    alert(data.msg || "Signup failed. Try different email.");
                    return;
                }

                alert("Signup successful! Please login now.");
                window.location.href = "index.html";

            } catch (err) {
                alert("Unable to connect to server.");
            }
        });
    }

    // Authentication check for protected pages
    if (!window.location.href.includes("index.html") &&
        !window.location.href.includes("signup.html")) {
        checkAuth();
    }
});
