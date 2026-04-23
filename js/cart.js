/* ============================================================
   STYLEHUB — CART.JS
   ============================================================ */

const PROMO_CODES = { "STYLE10": 10, "SAVE20": 20, "WELCOME15": 15 };
const DELIVERY_FEE = 3.99;
const FREE_DELIVERY_THRESHOLD = 50;

const catColor = { women:"#f9e4d4", men:"#d4e4f9", accessories:"#d4f9e4", sale:"#f9f4d4" };

let discount = 0;

function getCart() { return JSON.parse(localStorage.getItem("sh_cart") || "[]"); }
function saveCart(cart) { localStorage.setItem("sh_cart", JSON.stringify(cart)); }

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll(".cart-badge, .cart-count, #cartCount, #cartBadge").forEach(el => {
    if(el) el.textContent = total;
  });
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cartItems");
  const emptyEl   = document.getElementById("emptyCart");
  const summaryEl = document.getElementById("cartSummary");

  container.innerHTML = "";

  if (cart.length === 0) {
    emptyEl.style.display = "block";
    summaryEl.style.display = "none";
    return;
  }

  emptyEl.style.display = "none";
  summaryEl.style.display = "block";

  // Table header
  const head = document.createElement("div");
  head.className = "cart-table-head";
  head.innerHTML = `<span>Product</span><span>Price</span><span>Quantity</span><span>Subtotal</span><span></span>`;
  container.appendChild(head);

  cart.forEach((item, idx) => {
    const color = catColor[item.cat] || "#f0f0f0";
    const row = document.createElement("div");
    row.className = "cart-item";
    row.style.animationDelay = (idx * 0.05) + "s";
    row.innerHTML = `
      <div class="item-product">
        <div class="item-thumb" style="background:${color};"><img src="${item.img}" alt="${item.name}"></div>
        <div>
          <div class="item-name">${item.name}</div>
          <div class="item-cat">${capitalize(item.cat)}</div>
        </div>
      </div>
      <div class="item-price">£${item.price.toFixed(2)}</div>
      <div class="qty-control">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
      <div class="item-subtotal">£${(item.price * item.qty).toFixed(2)}</div>
      <button class="remove-btn" onclick="removeItem(${item.id})" title="Remove">🗑</button>
    `;
    container.appendChild(row);
  });

  updateSummary(cart);
}

function updateSummary(cart) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const discountAmt = subtotal * (discount / 100);
  const total = subtotal - discountAmt + delivery;

  document.getElementById("subtotal").textContent    = "£" + subtotal.toFixed(2);
  document.getElementById("deliveryFee").textContent = delivery === 0 ? "FREE 🎉" : "£" + delivery.toFixed(2);
  document.getElementById("totalPrice").textContent  = "£" + total.toFixed(2);

  const freeNote = document.getElementById("freeNote");
  if (delivery > 0) {
    const needed = FREE_DELIVERY_THRESHOLD - subtotal;
    freeNote.textContent = `Add £${needed.toFixed(2)} more for free delivery!`;
  } else {
    freeNote.textContent = "You qualify for free delivery! ";
  }
}

function changeQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeItem(id);
    return;
  }
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

function removeItem(id) {
  let cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
  updateCartBadge();
}

function applyPromo() {
  const code = document.getElementById("promoInput").value.trim().toUpperCase();
  const msg  = document.getElementById("promoMsg");
  if (PROMO_CODES[code]) {
    discount = PROMO_CODES[code];
    msg.className = "promo-msg";
    msg.textContent = `✓ "${code}" applied — ${discount}% off!`;
    updateSummary(getCart());
  } else {
    discount = 0;
    msg.className = "promo-msg err";
    msg.textContent = "Invalid promo code. Try STYLE10, SAVE20 or WELCOME15.";
  }
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ""; }

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartBadge();
});