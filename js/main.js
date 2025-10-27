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
    Rarity: ${product.rarity || "-"}<br>
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
  const minEl = document.querySelector("#filter-min");
  const maxEl = document.querySelector("#filter-max");
  const stockEl = document.querySelector("#filter-stock");
  const newEl = document.querySelector("#filter-new");

  function apply(){
    const list = filterProducts({
      text: textEl?.value || "",
      category: catEl?.value || "",
      rarity: rarEl?.value || "",
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

  [textEl,catEl,rarEl,minEl,maxEl,stockEl,newEl].forEach(ctrl=>{
    if(!ctrl) return;
    ctrl.addEventListener("input", apply);
    ctrl.addEventListener("change", apply);
  });

  apply();
}

function initCartPage(){
  updateCartBadge();
  const cart = getCart();
  const container = document.querySelector(".cart-items");
  const totalEl = document.querySelector(".cart-total");
  container.innerHTML = "";

  cart.forEach(line=>{
    const p = PRODUCTS.find(x=>x.id===line.id);
    if(!p) return;
    const row = document.createElement("div");
    row.className="cart-row";

    const th = document.createElement("div");
    th.className="cart-thumb";
    if(p.img){
      const im=document.createElement("img");
      im.src=p.img;
      th.appendChild(im);
    } else {
      th.textContent="No img";
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
