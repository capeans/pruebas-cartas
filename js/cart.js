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
    // For logged-out mode we need product data.
    // We'll attempt to load productos.json and map local cart to it.
    const local = getLocalCart();
    if (local.length === 0) return [];

    let productsData = [];
    try {
      const res = await fetch("data/productos.json");
      const data = await res.json();

      if (Array.isArray(data)) {
        productsData = data;
      } else {
        // merge all arrays inside object
        Object.values(data).forEach(v => {
          if (Array.isArray(v)) productsData = productsData.concat(v);
        });
      }
    } catch(e){}

    return local.map(item => {
      const p = productsData.find(prod => {
        // Try match by prod.id first
        if (prod.id !== undefined && prod.id === item.productId) return true;
        // fallback: if we generated temp IDs manually, we can't know here;
        // we'll just fallback by index or leave generic.
        return false;
      }) || {};

      const priceCents = p.precio
        ? Math.round(parseFloat(String(p.precio).replace(",", ".")) * 100)
        : (p.priceCents || 0);

      return {
        productId: item.productId,
        name: p.nombre || p.name || p.titulo || "Producto",
        imageUrl: p.img || p.image || p.imagen || "",
        priceCents,
        qty: item.qty,
        subtotalCents: priceCents * item.qty,
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
