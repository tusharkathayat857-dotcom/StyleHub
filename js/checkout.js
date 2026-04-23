/* ============================================================
   STYLEHUB — CHECKOUT.JS
   ============================================================ */

const DELIVERY_COSTS = { standard: 3.99, express: 7.99, free: 0 };
const catColor = { women:"#f9e4d4", men:"#d4e4f9", accessories:"#d4f9e4", sale:"#f9f4d4" };

function getCart() { return JSON.parse(localStorage.getItem("sh_cart") || "[]"); }

/* ---- Render order summary ---- */
function updateOrderSummary() {
  const cart = getCart();
  const delivery = document.querySelector("input[name=delivery]:checked")?.value || "standard";
  const deliveryCost = DELIVERY_COSTS[delivery];

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = subtotal + deliveryCost;

  document.getElementById("ckSubtotal").textContent = "£" + subtotal.toFixed(2);
  document.getElementById("ckDelivery").textContent = deliveryCost === 0 ? "FREE" : "£" + deliveryCost.toFixed(2);
  document.getElementById("ckTotal").textContent    = "£" + total.toFixed(2);

  const itemsEl = document.getElementById("summaryItems");
  itemsEl.innerHTML = "";
  cart.forEach(item => {
    const color = catColor[item.cat] || "#f0f0f0";
    itemsEl.innerHTML += `
      <div class="summary-item">
        <div class="si-thumb" style="background:${color};"><img src="${item.img}" alt="${item.name}"></div>
        <div class="si-info">
          <div class="si-name">${item.name}</div>
          <div class="si-qty">Qty: ${item.qty}</div>
        </div>
        <div class="si-price">£${(item.price * item.qty).toFixed(2)}</div>
      </div>`;
  });
}

/* ---- Card number formatting ---- */
function formatCard(el) {
  let val = el.value.replace(/\D/g, "").substring(0, 16);
  el.value = val.match(/.{1,4}/g)?.join(" ") || val;
}

function formatExpiry(el) {
  let val = el.value.replace(/\D/g, "").substring(0, 4);
  if (val.length >= 2) val = val.substring(0, 2) + " / " + val.substring(2);
  el.value = val;
}

/* ---- Validation helpers ---- */
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function isValidCard(c)  { return c.replace(/\s/g, "").length === 16; }
function isValidExpiry(e) {
  const m = e.replace(/\s/g,"").split("/");
  if (m.length !== 2) return false;
  const month = parseInt(m[0]), year = parseInt("20" + m[1]);
  const now = new Date();
  return month >= 1 && month <= 12 && year >= now.getFullYear();
}

function showAlert(id, msg, type) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => { if (el) el.innerHTML = ""; }, 5000);
}

/* ---- Place Order ---- */
function placeOrder() {
  const cart = getCart();
  if (cart.length === 0) {
    return showAlert("formAlert", " Your cart is empty. Please add items before checking out.", "error");
  }

  // Collect values
  const first    = document.getElementById("chkFirst").value.trim();
  const last     = document.getElementById("chkLast").value.trim();
  const email    = document.getElementById("chkEmail").value.trim();
  const addr1    = document.getElementById("chkAddr1").value.trim();
  const city     = document.getElementById("chkCity").value.trim();
  const postcode = document.getElementById("chkPostcode").value.trim();
  const country  = document.getElementById("chkCountry").value;
  const cardName = document.getElementById("cardName").value.trim();
  const cardNum  = document.getElementById("cardNum").value.trim();
  const cardExp  = document.getElementById("cardExp").value.trim();
  const cardCvc  = document.getElementById("cardCvc").value.trim();

  // Validate
  if (!first || !last)       return showAlert("formAlert", " Please enter your full name.", "error");
  if (!isValidEmail(email))  return showAlert("formAlert", " Please enter a valid email address.", "error");
  if (!addr1 || !city || !postcode || !country)
    return showAlert("formAlert", " Please complete your delivery address.", "error");
  if (!cardName)             return showAlert("formAlert", " Please enter the name on your card.", "error");
  if (!isValidCard(cardNum)) return showAlert("formAlert", " Please enter a valid 16-digit card number.", "error");
  if (!isValidExpiry(cardExp)) return showAlert("formAlert", " Please enter a valid expiry date (MM / YY).", "error");
  if (cardCvc.length < 3)    return showAlert("formAlert", " Please enter a valid 3-digit CVC.", "error");

  // Generate order reference
  const ref = "SH-2025-" + Math.floor(Math.random() * 90000 + 10000);

  // Clear cart
  localStorage.removeItem("sh_cart");

  // Show confirmation
  document.getElementById("checkoutLayout").style.display = "none";
  const conf = document.getElementById("confirmationPage");
  conf.style.display = "flex";
  document.getElementById("orderRef").textContent = ref;

  const delivery = document.querySelector("input[name=delivery]:checked")?.value || "standard";
  const daysMap  = { standard: "3–5 business days", express: "Next business day", free: "5–7 business days" };
  document.getElementById("confirmDetail").innerHTML = `
    <p> Estimated delivery: <strong>${daysMap[delivery]}</strong></p>
    <p> Confirmation sent to: <strong>${email}</strong></p>
    <p> Delivering to: <strong>${city}, ${postcode}</strong></p>
  `;

  // Update progress bar
  document.querySelectorAll(".step").forEach((s, i) => {
    if (i <= 3) { s.classList.add("done"); s.classList.remove("active"); }
  });
  document.querySelectorAll(".step-line").forEach(l => l.classList.add("done"));
}

/* ---- Init ---- */
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("sh_cart") || "[]");
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll(".cart-badge, .cart-count").forEach(el => el.textContent = total);
}

/* Auto-fill from logged-in user */
function prefillFromUser() {
  const user = JSON.parse(localStorage.getItem("sh_currentUser") || "null");
  if (!user) return;
  if (document.getElementById("chkFirst")) document.getElementById("chkFirst").value = user.firstName || "";
  if (document.getElementById("chkLast"))  document.getElementById("chkLast").value  = user.lastName  || "";
  if (document.getElementById("chkEmail")) document.getElementById("chkEmail").value = user.email     || "";
}

document.addEventListener("DOMContentLoaded", () => {
  updateOrderSummary();
  updateCartBadge();
  prefillFromUser();
  // Live update on delivery change
  document.querySelectorAll("input[name=delivery]").forEach(r => {
    r.addEventListener("change", updateOrderSummary);
  });
});