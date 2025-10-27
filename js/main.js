let modalOverlay;
function openModal(product){
  if(!modalOverlay){
    modalOverlay = document.querySelector(".modal-overlay");
  }
  if(!modalOverlay) return;

  modalOverlay.querySelector(".modal-img img").src = product.img;
  modalOverlay.querySelector(".modal-body h3").textContent = product.name;
  modalOverlay.querySelector(".modal-body .modal-desc").textContent = product.description || "";
  modalOverlay.querySelector(".modal-body .modal-cat").textContent = product.category || "";
  modalOverlay.querySelector(".modal-body .modal-rarity").textContent = product.rarity || "-";
  modalOverlay.querySelector(".modal-price").textContent = money(product.price);

  const stockEl = modalOverlay.querySelector(".modal-body .modal-stock");
  stockEl.textContent = product.stock > 0 ? product.stock + " ud." : "Sin stock";
  stockEl.className = "badge " + (product.stock > 0 ? "stock-ok" : "stock-no");

  const addBtn = modalOverlay.querySelector(".modal-add-btn");
  const qtyInput = modalOverlay.querySelector(".modal-qty");
  qtyInput.value = 1;
  addBtn.onclick = () => {
    const q = parseInt(qtyInput.value,10) || 1;
    addToCart(product.id,q);
  };

  modalOverlay.style.display = "flex";
}
function closeModal(){
  if(modalOverlay){
    modalOverlay.style.display = "none";
  }
}
document.addEventListener("click", e => {
  if(e.target.matches(".modal-close")) closeModal();
  if(e.target === modalOverlay) closeModal();
});

function createProductCard(product, {showAdd=true, clickableImage=true}={}){
  const card = document.createElement("div");
  card.className = "product-card";

  const imgWrap = document.createElement("div");
  imgWrap.className = "product-img";
  if (product.img){
    const im = document.createElement("img");
    im.src = product.img;
    imgWrap.appendChild(im);
  } else {
    imgWrap.textContent = "No image";
  }
  if(clickableImage){
    imgWrap.addEventListener("click", () => openModal(product));
  }
  card.appendChild(imgWrap);

  const body = document.createElement("div");
  body.className = "product-body";

  const tl = document.createElement("div");
  tl.className = "product-topline";

  const cat = document.createElement("span");
  cat.textContent = product.category || "";
  tl.appendChild(cat);

  const st = document.createElement("span");
  st.className = "badge " + (product.stock>0?"stock-ok":"stock-no");
  st.textContent = product.stock>0 ? "Stock: "+product.stock : "Sin stock";
  tl.appendChild(st);

  body.appendChild(tl);

  const nm = document.createElement("div");
  nm.className = "product-name";
  nm.textContent = product.name;
  body.appendChild(nm);

  const meta = document.createElement("div");
  meta.className = "product-meta";
  meta.innerHTML = `
    Rareza: ${product.rarity || "-"}<br>
    ${product.isNew ? "Nuevo · " : ""}${product.bestseller ? "Más vendido" : "" }
  `;
  body.appendChild(meta);

  const bl = document.createElement("div");
  bl.className = "product-bottomline";

  const price = document.createElement("div");
  price.className = "price";
  price.textContent = money(product.price);
  bl.appendChild(price);

  const actions = document.createElement("div");
  actions.className = "product-actions";

  if(showAdd){
    const qty = document.createElement("input");
    qty.className = "qty-input";
    qty.type = "number";
    qty.min = "1";
    qty.value = "1";

    const btn = document.createElement("button");
    btn.className = "btn-add";
    btn.textContent = "Añadir";
    btn.addEventListener("click", (ev)=>{
      ev.stopPropagation();
      const q = parseInt(qty.value,10) || 1;
      addToCart(product.id,q);
    });

    actions.appendChild(qty);
    actions.appendChild(btn);
  }

  bl.appendChild(actions);
  body.appendChild(bl);

  card.appendChild(body);
  return card;
}

function filterProducts({
  text="",
  category="",
  rarity="",
  language="",
  otherKind="",
  minPrice=0,
  maxPrice=99999,
  inStockOnly=false,
  isNewOnly=false,
  typesAllowed=["card","box","other"],
}){
  const t = text.trim().toLowerCase();
  return PRODUCTS.filter(p=>{
    if(!typesAllowed.includes(p.type)) return false;

    if(category && category!=="") {
      if(category==="Otros"){
        if(p.type!=="other" && p.category!=="Otros") return false;
      } else {
        if(p.category.toLowerCase() !== category.toLowerCase()) return false;
      }
    }

    if(language && language!==""){
      if((p.language||"").toLowerCase() !== language.toLowerCase()) return false;
    }

    if(otherKind && otherKind!=="" ){
      if((p.kind||"").toLowerCase() !== otherKind.toLowerCase()) return false;
    }

    if(rarity && rarity!==""){
      if((p.rarity||"").toLowerCase() !== rarity.toLowerCase()) return false;
    }

    if(t){
      const haystack = (p.name+" "+p.category+" "+(p.rarity||"")).toLowerCase();
      if(!haystack.includes(t)) return false;
    }

    if(p.price < minPrice || p.price > maxPrice) return false;

    if(inStockOnly && p.stock<=0) return false;

    if(isNewOnly && !p.isNew) return false;

    return true;
  });
}

function renderProductList(containerSelector, list){
  const wrap = document.querySelector(containerSelector);
  if(!wrap) return;
  wrap.innerHTML = "";
  list.forEach(p=>{
    wrap.appendChild(createProductCard(p));
  });
}

function initScollersHome(){
  const bestBoxes = PRODUCTS.filter(p=>p.type==="box" && p.bestseller);
  const bestCards = PRODUCTS.filter(p=>p.type==="card" && p.bestseller);
  const newStuff  = PRODUCTS.filter(p=>p.isNew);

  renderScroller("#scroller-best-boxes", bestBoxes);
  renderScroller("#scroller-best-cards", bestCards);
  renderScroller("#scroller-new", newStuff);
}

function renderScroller(selector, list){
  const el = document.querySelector(selector);
  if(!el) return;
  el.innerHTML = "";
  list.forEach(p=>{
    const card = createProductCard(p,{});
    card.addEventListener("click",()=>{
      if(p.type==="box"){
        window.location.href = "cajas.html#"+p.id;
      } else if(p.type==="card"){
        window.location.href = "cartas.html#"+p.id;
      } else {
        window.location.href = "otros.html#"+p.id;
      }
    });
    el.appendChild(card);
  });
}

function initFilterPage({typesAllowed, gridSelector}){
  const textEl = document.querySelector("#filter-text");
  const catEl = document.querySelector("#filter-cat");
  const rarEl = document.querySelector("#filter-rarity");
  const langEl = document.querySelector("#filter-lang");
  const kindEl = document.querySelector("#filter-kind");
  const minEl = document.querySelector("#filter-min");
  const maxEl = document.querySelector("#filter-max");
  const stockEl = document.querySelector("#filter-stock");
  const newEl = document.querySelector("#filter-new");

  function apply(){
    const list = filterProducts({
      text: textEl?.value || "",
      category: catEl?.value || "",
      rarity: rarEl?.value || "",
      language: langEl?.value || "",
      otherKind: kindEl?.value || "",
      minPrice: parseFloat(minEl?.value || "0"),
      maxPrice: parseFloat(maxEl?.value || "99999"),
      inStockOnly: stockEl?.checked || false,
      isNewOnly: newEl?.checked || false,
      typesAllowed
    });

    const wrap = document.querySelector(gridSelector);
    wrap.innerHTML = "";
    list.forEach(p=>{
      wrap.appendChild(createProductCard(p));
    });
  }

  [textEl,catEl,rarEl,langEl,kindEl,minEl,maxEl,stockEl,newEl].forEach(ctrl=>{
    if(!ctrl) return;
    ctrl.addEventListener("input", apply);
    ctrl.addEventListener("change", apply);
  });

  apply();
}


function initCartPage(){
  updateCartBadge();
  const cartRaw = getCart();

  // stable order: do NOT sort, just render in stored order
  const cart = cartRaw.slice(); // shallow copy

  const container = document.querySelector(".cart-items");
  const totalEl = document.querySelector(".cart-total");
  if(container) container.innerHTML = "";

  let runningTotal = 0;

  cart.forEach((line, idx)=>{
    const p = PRODUCTS.find(x=>x.id===line.id);
    if(!p) return;
    const row = document.createElement("div");
    row.className="cart-row";

    // thumb
    const th = document.createElement("div");
    th.className="cart-thumb";
    const im=document.createElement("img");
    im.src=p.img||"";
    th.appendChild(im);
    row.appendChild(th);

    // info
    const info = document.createElement("div");
    info.style.minWidth="0";
    info.innerHTML = `
      <div style="font-weight:700;color:var(--text-main);font-size:.85rem;line-height:1.3;">${p.name}</div>
      <div style="color:var(--text-dim);font-size:.7rem;line-height:1.3;">
        ${p.category || ""} · ${p.language || "-"}
      </div>
    `;
    row.appendChild(info);

    // unit price
    const uprice = document.createElement("div");
    uprice.style.fontSize=".8rem";
    uprice.style.fontWeight="600";
    uprice.textContent = money(p.price||0);
    row.appendChild(uprice);

    // qty editor
    const qwrap = document.createElement("div");
    const qinput = document.createElement("input");
    qinput.type="number";
    qinput.min="1";
    qinput.value=line.qty;
    qinput.className="qty-input";
    qinput.addEventListener("change",()=>{
      const v=parseInt(qinput.value,10)||1;
      setQty(p.id,v); // updates localStorage
      initCartPage(); // rerender
    });
    qwrap.appendChild(qinput);
    row.appendChild(qwrap);

    // remove btn
    const rmv = document.createElement("button");
    rmv.textContent="✕";
    rmv.style.background="none";
    rmv.style.border="0";
    rmv.style.color="var(--danger)";
    rmv.style.cursor="pointer";
    rmv.style.fontWeight="700";
    rmv.addEventListener("click",()=>{
      removeFromCart(p.id);
      initCartPage();
    });
    row.appendChild(rmv);

    if(container) container.appendChild(row);

    runningTotal += (p.price||0) * line.qty;
  });

  if(totalEl) totalEl.textContent = money(runningTotal);
}

    row.appendChild(th);

    const info = document.createElement("div");
    info.innerHTML = `
      <div style="font-weight:600;color:var(--text-main);font-size:.8rem">${p.name}</div>
      <div style="color:var(--text-dim);font-size:.7rem">${p.category} · ${p.rarity||"-"}</div>
    `;
    row.appendChild(info);

    const uprice = document.createElement("div");
    uprice.textContent = money(p.price);
    uprice.style.fontSize=".8rem";
    row.appendChild(uprice);

    const qwrap = document.createElement("div");
    const qinput = document.createElement("input");
    qinput.type="number";
    qinput.min="1";
    qinput.value=line.qty;
    qinput.className="qty-input";
    qinput.addEventListener("change",()=>{
      const v=parseInt(qinput.value,10)||1;
      setQty(p.id,v);
      initCartPage();
    });
    qwrap.appendChild(qinput);
    row.appendChild(qwrap);

    const rmv = document.createElement("button");
    rmv.textContent="X";
    rmv.style.background="none";
    rmv.style.border="0";
    rmv.style.color="var(--danger)";
    rmv.style.cursor="pointer";
    rmv.style.fontWeight="600";
    rmv.addEventListener("click",()=>{
      removeFromCart(p.id);
      initCartPage();
    });
    row.appendChild(rmv);

    container.appendChild(row);
  });

  totalEl.textContent = money(cartTotal());
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  const page = document.body.dataset.page;

  if(page === "home"){
    initScollersHome();
  }
  if(page === "cajas"){
    initFilterPage({typesAllowed:["box"], gridSelector:"#products-grid"});
  }
  if(page === "cartas"){
    initFilterPage({typesAllowed:["card"], gridSelector:"#products-grid"});
  }
  if(page === "todo"){
    initFilterPage({typesAllowed:["card","box"], gridSelector:"#products-grid"});
  }
  if(page === "otros"){
    initFilterPage({typesAllowed:["other"], gridSelector:"#products-grid"});
  }
  if(page === "carrito"){
    initCartPage();
  }
});


// --- Simple demo auth & checkout ---
function getUser(){
  try { return JSON.parse(localStorage.getItem("uzutcg_user")) || null; } catch { return null; }
}
function setUser(u){
  localStorage.setItem("uzutcg_user", JSON.stringify(u));
}
function logout(){ localStorage.removeItem("uzutcg_user"); }

function ensureCheckoutUI(){
  if(document.body.dataset.page !== "carrito") return;
  const wrap = document.querySelector(".cart-summary");
  if(!wrap) return;

  const user = getUser();
  let authNode = document.querySelector(".auth-box");
  if(!authNode){
    authNode = document.createElement("div");
    authNode.className = "auth-box";
    authNode.style.borderTop = "1px solid var(--border-soft)";
    authNode.style.paddingTop = "12px";
    authNode.style.display = "grid";
    authNode.style.gap = "8px";
    wrap.insertBefore(authNode, wrap.firstChild);
  }

  if(!user){
    authNode.innerHTML = `
      <div style="font-size:.85rem;color:var(--text-main);font-weight:600;">Inicia sesión para pagar</div>
      <div style="display:grid;gap:8px;">
        <input id="login-email" type="text" placeholder="tu@email.com" class="qty-input" style="width:100%;">
        <input id="login-name" type="text" placeholder="Tu nombre" class="qty-input" style="width:100%;">
        <button class="btn-add" id="btn-login" style="width:fit-content;">Iniciar sesión (demo)</button>
      </div>
    `;
    authNode.querySelector("#btn-login").addEventListener("click", ()=>{
      const email = authNode.querySelector("#login-email").value.trim();
      const name = authNode.querySelector("#login-name").value.trim();
      if(!email || !name){ alert("Rellena email y nombre"); return; }
      setUser({email,name});
      ensureCheckoutUI();
    });
  } else {
    authNode.innerHTML = `
      <div style="font-size:.85rem;color:var(--text-dim);">Sesión iniciada como <span style="color:var(--text-main);font-weight:600;">${user.name}</span> (${user.email})</div>
      <div><button class="btn-add" id="btn-logout" style="background:#e2e8f0;color:#000;">Cerrar sesión</button></div>
    `;
    authNode.querySelector("#btn-logout").addEventListener("click", ()=>{ logout(); ensureCheckoutUI(); });
  }

  // payment box
  let pay = document.querySelector(".pay-box");
  if(!pay){
    pay = document.createElement("div");
    pay.className="pay-box";
    pay.style.borderTop="1px solid var(--border-soft)";
    pay.style.paddingTop="12px";
    pay.style.display="grid";
    pay.style.gap="8px";
    wrap.appendChild(pay);
  }
  pay.innerHTML = `
    <div style="font-size:.85rem;color:var(--text-main);font-weight:600;">Método de pago</div>
    <select id="pay-method" class="qty-input" style="width:100%;">
      <option value="card">Tarjeta (demo)</option>
      <option value="paypal">PayPal (demo)</option>
    </select>
    <button class="btn-add" id="btn-pay" style="width:fit-content;">Pagar ahora</button>
    <div style="font-size:.7rem;color:var(--text-dim);">* Demo sin cobro real. Para cobros reales integraremos Stripe/PayPal.</div>
  `;
  pay.querySelector("#btn-pay").addEventListener("click", ()=>{
    const user = getUser();
    if(!user){ alert("Inicia sesión primero"); return; }
    const total = cartTotal();
    if(total<=0){ alert("Tu carrito está vacío"); return; }
    const orderId = "UZU-" + Math.random().toString(36).slice(2,8).toUpperCase();
    alert(`Pedido ${orderId} creado (demo). Total: ` + money(total));
    // clear cart
    saveCart([]);
    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", ensureCheckoutUI);
