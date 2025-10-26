
// shop.js
async function loadProductosAndRender(pageType) {
  const gridEl = document.getElementById("product-grid");
  if (!gridEl) return;

  const res = await fetch("data/productos.json");
  const data = await res.json();

  let items = [];
  if (Array.isArray(data)) {
    items = data;
  } else {
    if (pageType === "cajas" && data.cajas) items = data.cajas;
    else if (pageType === "cartas" && data.cartas) items = data.cartas;
    else if (data.cajas && data.cartas) {
      items = [...data.cajas, ...data.cartas];
    } else {
      Object.values(data).forEach(v=>{
        if (Array.isArray(v)) items = items.concat(v);
      });
    }
  }

  gridEl.innerHTML = items.map((prod, idx) => {
    const tempId = prod.id ?? (pageType==="cartas" ? (1000+idx) : (1+idx));
    const img = prod.img || prod.image || prod.imagen || "";
    const name = prod.nombre || prod.name || prod.titulo || "Producto";
    const price =
      prod.precio !== undefined
        ? prod.precio
        : (prod.price !== undefined ? prod.price : "");

    return `
      <div class="producto-card">
        <img class="producto-img" src="${img}" alt="${name}" />
        <h3 class="producto-nombre">${name}</h3>
        <p class="producto-precio">${price} €</p>
        <button class="btn-add-cart" data-product-id="${tempId}">
          Añadir al carrito
        </button>
      </div>
    `;
  }).join("");

  attachCartButtons();
}

function attachCartButtons() {
  document.querySelectorAll(".btn-add-cart").forEach(btn => {
    btn.addEventListener("click", async () => {
      const productId = parseInt(btn.dataset.productId,10);
      if (!productId) {
        alert("Producto sin ID interno todavía");
        return;
      }
      addToLocalCart(productId,1);
      await syncCartToServer();
      await refreshCartCount();
      btn.textContent = "Añadido ✓";
      setTimeout(()=>{ btn.textContent="Añadir al carrito"; },1200);
    });
  });
}
