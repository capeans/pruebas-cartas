
// --- Modal (robust) ---
let modalOverlayRef = null;
function getModal(){
  if(!modalOverlayRef){
    modalOverlayRef = document.querySelector(".modal-overlay");
    if(modalOverlayRef){
      // single binding for closing
      modalOverlayRef.addEventListener("click", (e)=>{
        if(e.target === modalOverlayRef) closeModal();
      });
      const btn = modalOverlayRef.querySelector(".modal-close");
      if(btn) btn.addEventListener("click", closeModal);
    }
  }
  return modalOverlayRef;
}
function openModal(product){
  const overlay = getModal();
  if(!overlay) return;
  const modal = overlay.querySelector(".modal");
  if(modal) modal.addEventListener("click", (e)=> e.stopPropagation(), {once:true});

  overlay.querySelector(".modal-img img").src = product.img || "";
  overlay.querySelector(".modal-body h3").textContent = product.name || "";
  overlay.querySelector(".modal-body .modal-desc").textContent = product.description || "";
  overlay.querySelector(".modal-body .modal-cat").textContent = product.category || "";
  overlay.querySelector(".modal-body .modal-rarity").textContent = product.rarity || "-";
  overlay.querySelector(".modal-price").textContent = money(product.price || 0);

  const stockEl = overlay.querySelector(".modal-body .modal-stock");
  stockEl.textContent = product.stock > 0 ? product.stock + " ud." : "Sin stock";
  stockEl.className = "badge " + (product.stock > 0 ? "stock-ok" : "stock-no");

  const addBtn = overlay.querySelector(".modal-add-btn");
  const qtyInput = overlay.querySelector(".modal-qty");
  if(qtyInput) qtyInput.value = 1;
  if(addBtn){
    addBtn.onclick = () => {
      const q = parseInt(qtyInput?.value || "1",10) || 1;
      addToCart(product.id,q);
    };
  }
  overlay.style.display = "flex";
}
function closeModal(){
  const overlay = getModal();
  if(overlay) overlay.style.display = "none";
}

// --- Product card factory ---
function createProductCard(product, {showAdd=true, clickableImage=true}={}){
  const card = document.createElement("div");
  card.className = "product-card";

  const imgWrap = document.createElement("div");
  imgWrap.className = "product-img";
  const im = document.createElement("img");
  im.src = product.img || "";
  im.alt = product.name || "";
  imgWrap.appendChild(im);
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
  const st = document.createElement("span");
  st.className = "badge " + (product.stock>0?"stock-ok":"stock-no");
  st.textContent = product.stock>0 ? "Stock: "+product.stock : "Sin stock";
  tl.appendChild(cat); tl.appendChild(st);
  body.appendChild(tl);

  const nm = document.createElement("div");
  nm.className = "product-name";
  nm.textContent = product.name || "";
  body.appendChild(nm);

  const meta = document.createElement("div");
  meta.className = "product-meta";
  meta.innerHTML = `
    Rareza: ${product.rarity || "-"} · Idioma: ${product.language || "-"}
    <br>${product.isNew ? "Nuevo · " : ""}${product.bestseller ? "Más vendido" : "" }
  `;
  body.appendChild(meta);

  const bl = document.createElement("div");
  bl.className = "product-bottomline";
  const price = document.createElement("div"); price.className="price"; price.textContent = money(product.price||0);
  const actions = document.createElement("div"); actions.className = "product-actions";

  if(showAdd){
    const qty = document.createElement("input");
    qty.className = "qty-input"; qty.type="number"; qty.min="1"; qty.value="1";
    const btn = document.createElement("button");
    btn.className = "btn-add"; btn.textContent = "Añadir";
    btn.addEventListener("click",(ev)=>{
      ev.stopPropagation();
      const q = parseInt(qty.value,10) || 1;
      addToCart(product.id, q);
    });
    actions.appendChild(qty); actions.appendChild(btn);
  }
  bl.appendChild(price); bl.appendChild(actions);
  body.appendChild(bl);

  card.appendChild(body);
  return card;
}

// --- Filtering ---
function filterProducts({
  text="", category="", rarity="", language="", otherKind="",
  minPrice=0, maxPrice=99999, inStockOnly=false, isNewOnly=false,
  typesAllowed=["card","box","other"],
}){
  const t = text.trim().toLowerCase();
  return PRODUCTS.filter(p=>{
    if(!typesAllowed.includes(p.type)) return false;

    if(category && category!==""){
      if(category==="Otros"){
        if(p.type!=="other" && p.category!=="Otros") return false;
      } else if((p.category||"").toLowerCase() !== category.toLowerCase()){
        return false;
      }
    }

    if(language && language!==""){
      if((p.language||"").toLowerCase() !== language.toLowerCase()) return false;
    }

    if(otherKind && otherKind!==""){
      if((p.kind||"").toLowerCase() !== otherKind.toLowerCase()) return false;
    }

    if(rarity && rarity!==""){
      if((p.rarity||"").toLowerCase() !== rarity.toLowerCase()) return false;
    }

    if(t){
      const hay = (p.name+" "+(p.category||"")+" "+(p.rarity||"")+" "+(p.language||"")).toLowerCase();
      if(!hay.includes(t)) return false;
    }

    if(p.price < minPrice || p.price > maxPrice) return false;
    if(inStockOnly && p.stock<=0) return false;
    if(isNewOnly && !p.isNew) return false;
    return true;
  });
}

function initFilterPage({typesAllowed, gridSelector}){
  const textEl = document.querySelector("#filter-text");
  const catEl  = document.querySelector("#filter-cat");
  const rarEl  = document.querySelector("#filter-rarity");
  const langEl = document.querySelector("#filter-lang");
  const kindEl = document.querySelector("#filter-kind");
  const minEl  = document.querySelector("#filter-min");
  const maxEl  = document.querySelector("#filter-max");
  const stockEl= document.querySelector("#filter-stock");
  const newEl  = document.querySelector("#filter-new");

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
    list.forEach(p=> wrap.appendChild(createProductCard(p)));
  }

  [textEl,catEl,rarEl,langEl,kindEl,minEl,maxEl,stockEl,newEl].forEach(ctrl=>{
    if(!ctrl) return;
    ctrl.addEventListener("input", apply);
    ctrl.addEventListener("change", apply);
  });

  apply();
}

// --- Cart page ---
function initCartPage(){
  updateCartBadge();
  const cart = getCart();
  const container = document.querySelector(".cart-items");
  const totalEl = document.querySelector(".cart-total");
  if(container) container.innerHTML = "";
  cart.forEach(line=>{
    const p = PRODUCTS.find(x=>x.id===line.id);
    if(!p) return;
    const row = document.createElement("div");
    row.className="cart-row";
    const th = document.createElement("div"); th.className="cart-thumb"; const im=document.createElement("img"); im.src=p.img||""; th.appendChild(im);
    const info = document.createElement("div");
    info.innerHTML = `<div style="font-weight:700">${p.name}</div><div style="color:var(--text-dim);font-size:.8rem">${p.category} · ${p.language||"-"}</div>`;
    const uprice = document.createElement("div"); uprice.textContent = money(p.price||0);
    const qwrap = document.createElement("div");
    const qinput = document.createElement("input"); qinput.type="number"; qinput.min="1"; qinput.value=line.qty; qinput.className="qty-input";
    qinput.addEventListener("change",()=>{
      const v=parseInt(qinput.value,10)||1; setQty(p.id,v); initCartPage();
    });
    qwrap.appendChild(qinput);
    const rmv = document.createElement("button"); rmv.textContent="X"; rmv.style.background="none"; rmv.style.border="0"; rmv.style.color="var(--danger)"; rmv.style.cursor="pointer"; rmv.style.fontWeight="700";
    rmv.addEventListener("click",()=>{ removeFromCart(p.id); initCartPage(); });
    row.appendChild(th); row.appendChild(info); row.appendChild(uprice); row.appendChild(qwrap); row.appendChild(rmv);
    container.appendChild(row);
  });
  if(totalEl) totalEl.textContent = money(cartTotal());
}

// --- Home scrollers ---
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
      if(p.type==="box"){ window.location.href="cajas.html#"+p.id; }
      else if(p.type==="card"){ window.location.href="cartas.html#"+p.id; }
      else { window.location.href="otros.html#"+p.id; }
    });
    el.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  const page = document.body.dataset.page;
  if(page === "home"){ initScollersHome(); }
  if(page === "cajas"){ initFilterPage({typesAllowed:["box"], gridSelector:"#products-grid"}); }
  if(page === "cartas"){ initFilterPage({typesAllowed:["card"], gridSelector:"#products-grid"}); }
  if(page === "todo"){ initFilterPage({typesAllowed:["card","box"], gridSelector:"#products-grid"}); }
  if(page === "otros"){ initFilterPage({typesAllowed:["other"], gridSelector:"#products-grid"}); }
  if(page === "carrito"){ initCartPage(); }
});
