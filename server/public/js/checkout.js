async function loadCheckoutCart() {
  const cart = await getCartDetail();
  const listEl = document.getElementById("checkout-items");
  const totalEl = document.getElementById("checkout-total");

  listEl.innerHTML = "";
  let totalCents = 0;
  cart.forEach(item => {
    totalCents += item.subtotalCents;
    const li = document.createElement("li");
    li.className = "checkout-item";
    li.innerHTML = `
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <img src="${item.imageUrl}" alt="${item.name}"
             style="width:60px;height:60px;border-radius:6px;object-fit:cover;" />
        <div>
          <div style="font-weight:600;">${item.name}</div>
          <div style="font-size:14px;color:#666;">Cantidad: ${item.qty}</div>
        </div>
      </div>
      <div style="font-weight:600;">
        ${(item.subtotalCents / 100).toFixed(2)} €
      </div>
    `;
    listEl.appendChild(li);
  });

  totalEl.textContent = (totalCents / 100).toFixed(2) + " €";
}

async function payNow() {
  const shipName = document.getElementById("shipName").value.trim();
  const shipAddress = document.getElementById("shipAddress").value.trim();
  const shipCity = document.getElementById("shipCity").value.trim();
  const shipZip = document.getElementById("shipZip").value.trim();
  const shipPhone = document.getElementById("shipPhone").value.trim();

  const body = {
    shipName,
    shipAddress,
    shipCity,
    shipZip,
    shipPhone
  };

  try {
    const resp = await apiRequest("/checkout/start", {
      method: "POST",
      body: JSON.stringify(body),
    });

    window.location.href = resp.url;
  } catch (err) {
    const errBox = document.getElementById("checkout-error");
    errBox.textContent = err.message || "Error en el pago";
  }
}
