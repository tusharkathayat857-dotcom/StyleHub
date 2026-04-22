/* ============================================================
   STYLEHUB — LOGIN.JS
   ============================================================ */

function switchTab(tab) {
  const loginForm    = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const tabs = document.querySelectorAll(".tab-btn");

  if (tab === "login") {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    tabs[0].classList.add("active");
    tabs[1].classList.remove("active");
  } else {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    tabs[0].classList.remove("active");
    tabs[1].classList.add("active");
  }
}

/* ---- Helpers ---- */
function showAlert(id, message, type) {
  const el = document.getElementById(id);
  el.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => { el.innerHTML = ""; }, 4000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---- Get stored users ---- */
function getUsers() { return JSON.parse(localStorage.getItem("sh_users") || "[]"); }
function saveUsers(u) { localStorage.setItem("sh_users", JSON.stringify(u)); }

/* ---- LOGIN ---- */
function handleLogin() {
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    return showAlert("loginAlert", " Please fill in all fields.", "error");
  }
  if (!isValidEmail(email)) {
    return showAlert("loginAlert", " Please enter a valid email address.", "error");
  }

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return showAlert("loginAlert", " Incorrect email or password. Please try again.", "error");
  }

  localStorage.setItem("sh_currentUser", JSON.stringify(user));
  showAlert("loginAlert", ` Welcome back, ${user.firstName}! Redirecting...`, "success");
  setTimeout(() => { window.location.href = "index.html"; }, 1500);
}

/* ---- REGISTER ---- */
function handleRegister() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const email     = document.getElementById("regEmail").value.trim();
  const password  = document.getElementById("regPassword").value;
  const confirm   = document.getElementById("regConfirm").value;
  const terms     = document.getElementById("termsCheck").checked;

  if (!firstName || !lastName || !email || !password || !confirm) {
    return showAlert("registerAlert", " Please fill in all required fields.", "error");
  }
  if (!isValidEmail(email)) {
    return showAlert("registerAlert", " Please enter a valid email address.", "error");
  }
  if (password.length < 8) {
    return showAlert("registerAlert", " Password must be at least 8 characters.", "error");
  }
  if (password !== confirm) {
    return showAlert("registerAlert", " Passwords do not match.", "error");
  }
  if (!terms) {
    return showAlert("registerAlert", " Please accept the Terms & Conditions.", "error");
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return showAlert("registerAlert", " An account with this email already exists. Try signing in.", "error");
  }

  const newUser = { firstName, lastName, email, password };
  users.push(newUser);
  saveUsers(users);
  localStorage.setItem("sh_currentUser", JSON.stringify(newUser));

  showAlert("registerAlert", `🎉 Account created! Welcome to StyleHub, ${firstName}!`, "success");
  setTimeout(() => { window.location.href = "index.html"; }, 1800);
}

/* ---- Cart badge ---- */
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("sh_cart") || "[]");
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll(".cart-badge, .cart-count").forEach(el => el.textContent = total);
}

document.addEventListener("DOMContentLoaded", updateCartBadge);