/* ============================================================
   STYLEHUB — LOGIN.JS
   ============================================================ */

const GOOGLE_CLIENT_ID = "480914933954-jc206qtlbb0cvp3b1qpa23onrhdqe978.apps.googleusercontent.com";
const FACEBOOK_APP_ID = "";
let googleButtonRendered = false;

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

function signInSocialUser(profile) {
  const users = getUsers();
  let user = users.find(u => u.email === profile.email);

  if (!user) {
    user = {
      firstName: profile.firstName || profile.name || "StyleHub",
      lastName: profile.lastName || "User",
      email: profile.email,
      password: "",
      provider: profile.provider
    };
    users.push(user);
    saveUsers(users);
  }

  localStorage.setItem("sh_currentUser", JSON.stringify(user));
  showAlert("loginAlert", ` Welcome back, ${user.firstName}! Redirecting...`, "success");
  setTimeout(() => { window.location.href = "index.html"; }, 1200);
}

function parseJwt(token) {
  const payload = token.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = decodeURIComponent(atob(base64).split("").map(char => {
    return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
  }).join(""));
  return JSON.parse(json);
}

function handleGoogleCredential(response) {
  if (!response || !response.credential) {
    return showAlert("loginAlert", " Google sign-in was cancelled.", "error");
  }

  try {
    const profile = parseJwt(response.credential);
    signInSocialUser({
      provider: "google",
      firstName: profile.given_name,
      lastName: profile.family_name,
      name: profile.name,
      email: profile.email
    });
  } catch (error) {
    showAlert("loginAlert", " Google sign-in failed. Please try again.", "error");
  }
}

function initGoogleSignIn() {
  if (googleButtonRendered) return true;
  if (!window.google || !google.accounts || !google.accounts.id) return;

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential
  });

  googleButtonRendered = true;

  return googleButtonRendered;
}

function handleGoogleSignIn() {
  if (!initGoogleSignIn()) {
    return showAlert("loginAlert", " Google sign-in is still loading. Please try again in a moment.", "error");
  }

  google.accounts.id.prompt(notification => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      showAlert("loginAlert", " Google sign-in could not open. Check your Google OAuth origin settings.", "error");
    }
  });
}

window.fbAsyncInit = function () {
  if (!FACEBOOK_APP_ID) return;

  FB.init({
    appId: FACEBOOK_APP_ID,
    cookie: true,
    xfbml: false,
    version: "v19.0"
  });
};

function handleFacebookSignIn() {
  if (!FACEBOOK_APP_ID) {
    return showAlert("loginAlert", " Facebook sign-in needs a Facebook App ID from Meta before it can run.", "error");
  }

  if (!window.FB) {
    return showAlert("loginAlert", " Facebook sign-in is still loading. Please try again in a moment.", "error");
  }

  FB.login(response => {
    if (!response.authResponse) {
      return showAlert("loginAlert", " Facebook sign-in was cancelled.", "error");
    }

    FB.api("/me", { fields: "first_name,last_name,name,email" }, profile => {
      if (!profile || !profile.email) {
        return showAlert("loginAlert", " Facebook did not return an email address.", "error");
      }

      signInSocialUser({
        provider: "facebook",
        firstName: profile.first_name,
        lastName: profile.last_name,
        name: profile.name,
        email: profile.email
      });
    });
  }, { scope: "public_profile,email" });
}

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

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  let attempts = 0;
  const googleTimer = setInterval(() => {
    attempts++;
    if (initGoogleSignIn() || attempts >= 10) clearInterval(googleTimer);
  }, 300);
});
