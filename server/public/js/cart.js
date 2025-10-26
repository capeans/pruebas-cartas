function getLocalCart() {
  const raw = localStorage.getItem("cart");
  return raw ? JSON.parse(raw) : [];
}

function setLocalCart(cartItems) {
  localStorage.setItem("cart", JSON.stringify(cartItems));
}

function addToLocalCart(productId, qty = 1) {
  const cart = getLocalCart();
  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ productId, qty });
  }
  setLocalCart(cart);
}

function updateLocalQty(productId, qty) {
  const cart = getLocalCart().map(item => {
    if (item.productId === productId) {
      return { ...item, qty };
    }
    return item;
  }).filter(item => item.qty > 0);
  setLocalCart(cart);
}

function removeFromLocalCart(productId) {
  const cart = getLocalCart().filter(item => item.productId !== productId);
  setLocalCart(cart);
}

function clearLocalCart() {
  setLocalCart([]);
}

async function syncCartToServer() {
  if (!isLoggedIn()) return;
  const local = getLocalCart();
  await apiRequest("/cart/sync", {
    method: "POST",
    body: JSON.stringify({ items: local }),
  });
}

async function getCartDetail() {
  if (isLoggedIn()) {
    return apiRequest("/cart", { method: "GET" });
  } else {
    const local = getLocalCart();
    if (local.length === 0) return [];

    const ids = local.map(x => x.productId);
    const products = await apiRequest("/products?ids=" + ids.join(","));

    return local.map(item => {
      const p = products.find(prod => prod.id === item.productId);
      return {
        productId: item.productId,
        name: p ? p.name : "Producto",
        imageUrl: p ? p.imageUrl : "",
        priceCents: p ? p.priceCents : 0,
        qty: item.qty,
        subtotalCents: (p ? p.priceCents : 0) * item.qty,
      }
    });
  }
}

async function setCartQty(productId, qty) {
  updateLocalQty(productId, qty);

  if (isLoggedIn()) {
    await apiRequest("/cart/item", {
      method: "POST",
      body: JSON.stringify({ productId, qty })
    });
  }
}

async function removeCartItem(productId) {
  removeFromLocalCart(productId);

  if (isLoggedIn()) {
    await apiRequest("/cart/item", {
      method: "DELETE",
      body: JSON.stringify({ productId })
    });
  }
}
