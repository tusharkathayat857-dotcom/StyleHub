/* ============================================================
   STYLEHUB — PRODUCTS.JS
   24 products, filter by category/price/search, sort, add to cart
   ============================================================ */

const PRODUCTS = [
  // WOMEN
  { id:1, name:"Floral Wrap Dress", cat:"women", price:65, img:"images/dress1.jpg", badge:"New", desc:"Light floral print, wrap silhouette, perfect for summer." },
  { id:2, name:"Linen Blazer", cat:"women", price:89, img:"images/blazer1.jpg", badge:"", desc:"Relaxed linen blazer in natural ecru." },
  { id:3, name:"Silk Midi Skirt", cat:"women", price:72, img:"images/skirt1.jpg", badge:"Trending", desc:"Fluid silk-blend midi skirt." },
  { id:4, name:"Cropped Knit Jumper", cat:"women", price:55, img:"images/jumper1.jpg", badge:"", desc:"Soft merino cropped jumper." },
  { id:5, name:"Wide-Leg Trousers", cat:"women", price:68, img:"images/trouser1.jpg", badge:"", desc:"Tailored wide-leg trousers." },
  { id:6, name:"Ruched Satin Blouse", cat:"women", price:49, img:"images/blouse1.jpg", badge:"Sale", desc:"Ruched satin blouse." },
  { id:7, name:"Denim Pinafore Dress", cat:"women", price:58, img:"images/dress2.jpg", badge:"", desc:"Classic denim pinafore." },
  { id:8, name:"Trench Coat", cat:"women", price:145, img:"images/coat1.jpg", badge:"", desc:"Double-breasted trench coat." },

  // MEN
  { id:9, name:"Oxford Button Shirt", cat:"men", price:48, img:"images/shirt1.jpg", badge:"Trending", desc:"Crisp cotton Oxford shirt." },
  { id:10, name:"Slim-Fit Chinos", cat:"men", price:62, img:"images/chinos.jpg", badge:"", desc:"Slim-fit chinos." },
  { id:11, name:"Merino Crew Jumper", cat:"men", price:75, img:"images/jumper2.jpg", badge:"", desc:"100% merino wool jumper." },
  { id:12, name:"Tailored Suit Jacket", cat:"men", price:175, img:"images/jacket.jpg", badge:"", desc:"Tailored suit jacket." },
  { id:13, name:"Linen Shorts", cat:"men", price:38, img:"images/shorts.jpg", badge:"Sale", desc:"Relaxed linen shorts." },
  { id:14, name:"Polo Shirt", cat:"men", price:42, img:"images/polo.jpg", badge:"New", desc:"Cotton polo shirt." },
  { id:15, name:"Cargo Trousers", cat:"men", price:65, img:"images/cargo.jpg", badge:"", desc:"Cargo trousers." },
  { id:16, name:"Quilted Gilet", cat:"men", price:88, img:"images/gilet.jpg", badge:"", desc:"Lightweight gilet." },

  // ACCESSORIES
  { id:17, name:"Leather Tote Bag", cat:"accessories", price:55, img:"images/bag.jpg", badge:"Sale", desc:"Leather tote bag." },
  { id:18, name:"Silk Scarf", cat:"accessories", price:35, img:"images/scarf.jpg", badge:"", desc:"Silk scarf." },
  { id:19, name:"Wide-Brim Sun Hat", cat:"accessories", price:42, img:"images/hat.jpg", badge:"New", desc:"Sun hat." },
  { id:20, name:"Leather Belt", cat:"accessories", price:28, img:"images/belt.jpg", badge:"", desc:"Leather belt." },
  { id:21, name:"Crossbody Bag", cat:"accessories", price:69, img:"images/bag2.jpg", badge:"", desc:"Crossbody bag." },
  { id:22, name:"Canvas Tote", cat:"accessories", price:22, img:"images/tote.jpg", badge:"", desc:"Canvas tote bag." },
  { id:23, name:"Cashmere Gloves", cat:"accessories", price:48, img:"images/gloves.jpg", badge:"", desc:"Cashmere gloves." },
  { id:24, name:"Patterned Socks Set", cat:"accessories", price:18, img:"images/socks.jpg", badge:"Sale", desc:"Socks set." }
];

/* SALE items by badge */
PRODUCTS.forEach(p => { if(p.badge === "Sale") p.cat = "sale"; });

let maxPrice = 200;
let selectedCats = [];
let searchTerm = "";
let sortMode = "default";

/* ---- Cart from localStorage ---- */
function getCart() {
  return JSON.parse(localStorage.getItem("sh_cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("sh_cart", JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll(".cart-badge, .cart-count").forEach(el => el.textContent = total);
}
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  saveCart(cart);
  showToast(`"${product.name}" added to cart!`);
}

/* ---- Toast notification ---- */
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.cssText = "position:fixed;bottom:2rem;right:2rem;background:#1a1208;color:white;padding:0.9rem 1.5rem;border-radius:100px;font-size:0.88rem;font-weight:600;z-index:9999;opacity:0;transition:opacity 0.3s;box-shadow:0 8px 24px rgba(0,0,0,0.2);";
    document.body.appendChild(t);
  }
  t.textContent = "✓ " + msg;
  t.style.opacity = "1";
  setTimeout(() => { t.style.opacity = "0"; }, 2500);
}

/* ---- Render ---- */
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const noRes = document.getElementById("noResults");
  const countEl = document.getElementById("resultCount");

  let filtered = PRODUCTS.filter(p => {
    const matchCat = selectedCats.length === 0 || selectedCats.includes(p.cat);
    const matchPrice = p.price <= maxPrice;
    const matchSearch = p.name.toLowerCase().includes(searchTerm) ||
                        p.desc.toLowerCase().includes(searchTerm);
    return matchCat && matchPrice && matchSearch;
  });

  // Sort
  if (sortMode === "price-low")  filtered.sort((a,b) => a.price - b.price);
  if (sortMode === "price-high") filtered.sort((a,b) => b.price - a.price);
  if (sortMode === "name-az")    filtered.sort((a,b) => a.name.localeCompare(b.name));

  grid.innerHTML = "";
  countEl.textContent = `Showing ${filtered.length} of ${PRODUCTS.length} items`;

  if (filtered.length === 0) {
    noRes.style.display = "block";
  } else {
    noRes.style.display = "none";
    filtered.forEach((p, idx) => {
      const bg = catColor(p.cat);
      const badgeHtml = p.badge ? `<span class="prod-badge ${p.badge==="Sale"?"sale":p.badge==="New"?"":"new"}">${p.badge}</span>` : "";
      const card = document.createElement("div");
      card.className = "product-card";
      card.style.animationDelay = (idx * 0.04) + "s";
      card.innerHTML = `
        <div class="prod-img" style="background:${bg};">
          <img src="${p.img}" alt="${p.name}" class="prod-img-real">
          ${badgeHtml}
        </div>
        <div class="prod-info">
          <h4>${p.name}</h4>
          <p class="prod-cat">${capitalize(p.cat)} · ${p.desc.split(".")[0]}</p>
          <div class="prod-footer">
            <span class="prod-price">£${p.price.toFixed(2)}</span>
            <button class="add-btn" onclick="addToCart(${p.id})">+ Add</button>
          </div>
        </div>`;
      grid.appendChild(card);
    });
  }
}

function catColor(cat) {
  const map = { women:"#f9e4d4", men:"#d4e4f9", accessories:"#d4f9e4", sale:"#f9f4d4" };
  return map[cat] || "#f0f0f0";
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ---- Filter controls ---- */
function applyFilters() {
  selectedCats = Array.from(document.querySelectorAll(".filter-check input:checked")).map(c => c.value);
  sortMode = document.getElementById("sortSelect").value;
  renderProducts();
}
function updatePrice(el) {
  maxPrice = parseInt(el.value);
  document.getElementById("priceVal").textContent = "£" + maxPrice;
  renderProducts();
}
function clearFilters() {
  selectedCats = [];
  maxPrice = 200;
  searchTerm = "";
  sortMode = "default";
  document.querySelectorAll(".filter-check input").forEach(c => c.checked = false);
  document.getElementById("priceRange").value = 200;
  document.getElementById("priceVal").textContent = "£200";
  document.getElementById("searchInput").value = "";
  document.getElementById("sortSelect").value = "default";
  renderProducts();
}

/* ---- Search ---- */
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderProducts();
  document.getElementById("searchInput").addEventListener("input", e => {
    searchTerm = e.target.value.toLowerCase().trim();
    renderProducts();
  });
});