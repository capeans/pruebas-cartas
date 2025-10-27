const CART_KEY = "uzutcg_cart_v1";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
}

function setQty(productId, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = qty;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart(cart);
}

function cartTotal() {
  const cart = getCart();
  return cart.reduce((acc, line) => {
    const p = PRODUCTS.find(x => x.id === line.id);
    if (!p) return acc;
    return acc + p.price * line.qty;
  }, 0);
}

function updateCartBadge() {
  const badgeEls = document.querySelectorAll(".cart-count-badge");
  const cart = getCart();
  const count = cart.reduce((acc, l) => acc + l.qty, 0);
  badgeEls.forEach(el => {
    el.textContent = count;
  });
}

function money(n){
  return n.toFixed(2) + " €";
}
