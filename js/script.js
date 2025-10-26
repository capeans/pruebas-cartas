
let productos = []; // global

document.addEventListener('DOMContentLoaded', () => {
  fetch('data/productos.json')
    .then(res => res.json())
    .then(data => {
      const pagina = document.body.dataset.page;
      const esCajas = pagina === 'cajas';
      const esCartas = pagina === 'cartas';
      const esTodo = pagina === 'todo';

      const contenedor = document.getElementById(
        esCajas ? 'productos-cajas' :
        esCartas ? 'productos-cartas' :
        'productos-todo'
      );
      if(!contenedor){ return; }

      if(!contenedor){ return; }

      const filtroNombre = document.getElementById('filtro-nombre');
      const filtroCategoria = document.getElementById('filtro-categoria');
      const filtroPrecio = document.getElementById('filtro-precio');
      const precioValor = document.getElementById('precio-valor');
      const filtroIdioma = document.getElementById('filtro-idioma');

      productos = data.filter(p =>
        (esCajas && p.tipo === 'caja') ||
        (esCartas && p.tipo === 'carta') ||
        esTodo
      );
      const productosOriginales = [...productos];

      const params = new URLSearchParams(window.location.search);
      const categoriaInicial = params.get('categoria')?.toLowerCase();
      const qInicial = params.get('q') || params.get('query') || params.get('nombre');
      if (qInicial && filtroNombre) { filtroNombre.value = qInicial; }
      let productosMostrados = [...productosOriginales];
      if (categoriaInicial) {
        productosMostrados = productosOriginales.filter(p =>
          p.categoria.toLowerCase().replace(/ /g, "-") === categoriaInicial
        );
        if (filtroCategoria) filtroCategoria.value = categoriaInicial.replace(/-/g, " ");
      }

      const render = (lista) => {
        contenedor.innerHTML = lista.map(p => `
          <div class="producto">
            <img src="${p.imagen}" alt="${p.nombre}" onclick="abrirImagenGrande('${p.imagen}')" style="cursor:zoom-in;">
            <h3>${p.nombre}</h3>
            <p><strong>Categoría:</strong> ${p.categoria}</p>
            <p><strong>Idioma:</strong> ${p.idioma}</p>
            <p><strong>Precio:</strong> ${p.precio}€</p>
            <p><strong>Stock:</strong> ${p.stock}</p>
          </div>
        `).join('');
      };

      const aplicarFiltros = () => {
        let filtrados = [...productosOriginales];
        const q = filtroNombre?.value.toLowerCase() || "";
        const cat = filtroCategoria?.value.toLowerCase() || "";
        const idioma = filtroIdioma?.value.toLowerCase() || "";
        const max = parseFloat(filtroPrecio?.value) || 1000;

        if (q) filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(q) || slugify(p.categoria).includes(slugify(q)));
        if (cat) filtrados = filtrados.filter(p => slugify(p.categoria) === cat);
        if (idioma) filtrados = filtrados.filter(p => (p.idioma || "").toLowerCase().includes(idioma));
        filtrados = filtrados.filter(p => parseFloat(p.precio) <= max);

        render(filtrados);
      };

      aplicarFiltros();

      filtroNombre?.addEventListener('input', aplicarFiltros);
      filtroCategoria?.addEventListener('change', aplicarFiltros);
      filtroIdioma?.addEventListener('change', aplicarFiltros);
      filtroPrecio?.addEventListener('input', () => {
        precioValor.textContent = filtroPrecio.value;
        aplicarFiltros();
      });
    });
});

function abrirImagenGrande(src) {
  const producto = productos.find(p => p.imagen === src);
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.85)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = 1000;
  overlay.style.padding = "2em";
  overlay.innerHTML = `
    <div style="display: flex; gap: 2em; align-items: flex-start; max-width: 90vw; background: white; border-radius: 12px; padding: 2em;">
      <img src="${src}" style="width: 400px; height: 400px; object-fit: contain; border-radius: 12px; background: #f4f4f4;">
      <div style="color: #111; max-width: 400px;">
        <h2>${producto.nombre}</h2>
        <p><strong>Categoría:</strong> ${producto.categoria}</p>
        <p><strong>Idioma:</strong> ${producto.idioma}</p>
        <p><strong>Precio:</strong> ${producto.precio}€</p>
        <p><strong>Stock:</strong> ${producto.stock > 0 ? 'Disponible' : 'Agotado'}</p>
        <hr>
        <p>${producto.descripcion || 'Sin descripción disponible.'}</p>
      </div>
    </div>
  `;
  overlay.addEventListener("click", () => document.body.removeChild(overlay));
  document.body.appendChild(overlay);
}

  // Carruseles con scroll circular
  document.querySelectorAll(".carousel-container").forEach(container => {
    const track = container.querySelector(".carousel-track");
    const left = container.querySelector(".carousel-btn.left");
    const right = container.querySelector(".carousel-btn.right");

    if (!track || !left || !right) return;

    left.addEventListener("click", () => {
      if (track.scrollLeft <= 0) {
        track.scrollLeft = track.scrollWidth;
      } else {
        track.scrollBy({ left: -300, behavior: "smooth" });
      }
    });

    right.addEventListener("click", () => {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 5) {
        track.scrollLeft = 0;
      } else {
        track.scrollBy({ left: 300, behavior: "smooth" });
      }
    });
  });



// ===== Catálogo con sidebar (cartas y cajas) =====
(function(){
  
  function slugify(s){
    return (s||'').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9\s-]/g,'')
      .trim()
      .replace(/[\s_]+/g,'-');
  }
const page = document.body.getAttribute('data-page') || '';
  if (!['cartas','cajas','todo'].includes(page)) return;

  const $ = sel => document.querySelector(sel);
  const grid = $('#grid-productos');
  const countEl = $('#count');
  const ordenar = $('#ordenar');
  const nombre = $('#filtro-nombre');
  const categoria = $('#filtro-categoria');
  const idioma = $('#filtro-idioma');
  const rareza = $('#filtro-rareza');
  const precio = $('#filtro-precio');
  const precioValor = $('#precio-valor');
  const soloStock = $('#solo-stock');
  const soloFav = $('#solo-favoritos');
  const btnLimpiar = $('#btn-limpiar');
  const btnBuscar = $('#btn-buscar');
  const btnFav = document.querySelector('#btn-favoritos');
  
  // URL params -> set initial controls
  const params = new URLSearchParams(window.location.search);
  const categoriaInicial = (params.get('categoria') || '').toLowerCase();
  const qInicial = params.get('q') || params.get('query') || params.get('nombre');
  if (qInicial && nombre) nombre.value = qInicial;
  if (categoriaInicial && categoria) categoria.value = categoriaInicial; // select uses slug values
const btnStock = document.querySelector('#btn-stock');

  let productos = [];
  let favoritos = JSON.parse(localStorage.getItem('fav_uzutcg')||'[]');

  function favId(p, idx){ return p.id ?? p.imagen ?? (p.nombre || ('idx-'+(idx+1))); }
  function inFav(id){ return favoritos.includes(id); }
  function toggleFav(id){
    if(inFav(id)) favoritos = favoritos.filter(x=>x!==id);
    else favoritos.push(id);
    localStorage.setItem('fav_uzutcg', JSON.stringify(favoritos));
    render();
  }

  function badgeStock(p){
    if(Number(p.stock) > 0){
      return '<span class="badge stock-ok">En stock</span>';
    } else {
      return '<span class="badge stock-off">Sin stock</span>';
    }
  }

  function card(p, idx){
    const tags = [
      p.categoria ? `<span class="tag">${p.categoria}</span>`:'' ,
      p.idioma ? `<span class="tag">Idioma: ${p.idioma}</span>`:'' ,
      p.rareza ? `<span class="tag">R: ${p.rareza}</span>`:''
    ].join('');
    return `
    <article class="card">
      <div class="card-img-wrap">
        ${badgeStock(p)}
        ${inFav(favId(p, idx)) ? `<span class="fav-badge">★ Favorito</span>` : ``}
        <img class="card-img" src="${p.imagen}" alt="${p.nombre}" onerror="this.src='img/otros/1.jpg'"/>
      </div>
      <div class="card-body">
        <div class="card-title">${p.nombre}</div>
        <div class="tags">
          ${p.categoria ? `<span class="tag">${p.categoria}</span>`:''}
          ${p.idioma ? `<span class="tag">Idioma: ${p.idioma}</span>`:''}
          ${p.rareza ? `<span class="tag">R: ${p.rareza}</span>`:''}
          ${typeof p.stock !== 'undefined' ? `<span class="stock-pill ${Number(p.stock)>0?'ok':'off'}"><span class="stock-dot ${Number(p.stock)>0?'ok':'off'}"></span> Stock: ${p.stock||0}</span>`:''}
        </div>
        <div class="price">${Number(p.precio).toFixed(2)} €</div>
        <div class="card-actions">
          <button class="btn-outline" data-big="${p.imagen}">Ver grande</button>
          <button class="btn-add-cart" data-product-id="${p.id ?? (idx+1)}">Añadir al carrito</button>
          <button class="btn-heart ${inFav(favId(p, idx)) ? 'active':''}" data-fav="${favId(p, idx)}">
            <span class="heart">❤</span> ${inFav(favId(p, idx)) ? 'Quitar' : 'Favorito'}
          </button>
        </div>
      </div>
    </article>`;
  }

  function render(){
    let arr = [...productos];
    // búsqueda
    const q = (nombre.value||'').toLowerCase();
    if(q) arr = arr.filter(p=> (p.nombre||'').toLowerCase().includes(q) || slugify(p.categoria).includes(slugify(q)));
    // filters
    if(categoria.value) arr = arr.filter(p=> slugify(p.categoria) === categoria.value);
    if(idioma.value) arr = arr.filter(p=> (p.idioma||'') === idioma.value);
    if(rareza.value) arr = arr.filter(p=> (p.rareza||'') === rareza.value);
    const max = Number(precio.value||1000);
    arr = arr.filter(p=> Number(p.precio)<=max);
    if(soloStock.checked) arr = arr.filter(p=> Number(p.stock)>0);
    if(soloFav.checked) arr = arr.filter((p,i)=> inFav(favId(p,i)));

    // ordenar
    const ord = ordenar.value;
    const by = {
      'name-asc':  (a,b)=> (a.nombre||'').localeCompare(b.nombre||''),
      'name-desc': (a,b)=> (b.nombre||'').localeCompare(a.nombre||''),
      'price-asc': (a,b)=> Number(a.precio)-Number(b.precio),
      'price-desc':(a,b)=> Number(b.precio)-Number(a.precio),
      'stock-desc':(a,b)=> Number(b.stock||0)-Number(a.stock||0),
    }[ord];
    if(by) arr.sort(by);

    countEl.textContent = arr.length;
    grid.innerHTML = arr.map(card).join('');

    // attach actions
    grid.querySelectorAll('[data-big]').forEach(btn=>{
      btn.addEventListener('click', e=> abrirGrande(e.currentTarget.dataset.big));
    });
    grid.querySelectorAll('[data-fav]').forEach(btn=>{
      btn.addEventListener('click', e=> {
        const id = e.currentTarget.dataset.fav;
        toggleFav(id);
      });
    });
  }

  function abrirGrande(src){
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;z-index:9999';
    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '90vw';
    img.style.maxHeight = '90vh';
    img.style.borderRadius = '12px';
    overlay.appendChild(img);
    overlay.addEventListener('click', ()=> overlay.remove());
    document.body.appendChild(overlay);
  }

  // eventos
  [precio].forEach(el=>{
    el && el.addEventListener('input', ()=> {
      precioValor.textContent = precio.value;
    });
  });
  // Ordenar puede actuar en vivo
  ordenar && ordenar.addEventListener('change', ()=> render());
  // Enter en el campo de nombre = Buscar
  nombre && nombre.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); render(); }});
  // Click Buscar aplica filtros
  if(btnBuscar){ btnBuscar.addEventListener('click', e=>{ e.preventDefault(); render(); }); }
  btnLimpiar.addEventListener('click', e=>{
    e.preventDefault();
    nombre.value=''; categoria.value=''; idioma.value=''; rareza.value='';
    precio.value=150; precioValor.textContent='150'; soloStock.checked=false; soloFav.checked=false;
    ordenar.value='name-asc'; render();
  });

  
  // Toggle buttons -> control hidden checkboxes + render
  if (btnFav) {
    btnFav.addEventListener('click', (e)=>{
      const active = !(soloFav?.checked);
      if (soloFav) soloFav.checked = active;
      btnFav.setAttribute('aria-pressed', String(active));
      btnFav.textContent = active ? 'Ocultar favoritos' : 'Ver favoritos';
      render();
    });
  }
  if (btnStock) {
    btnStock.addEventListener('click', ()=>{
      // Toggle between 'con' and 'sin'
      const mode = btnStock.getAttribute('data-mode') === 'con' ? 'sin' : 'con';
      btnStock.setAttribute('data-mode', mode);
      btnStock.textContent = mode === 'con' ? 'Ver con stock' : 'Ver sin stock';
      if (soloStock) soloStock.checked = (mode === 'con'); // when 'con' => show only in-stock
      render();
    });
  }

  // Auto render on field changes (no Buscar button needed)
  [nombre, categoria, idioma, rareza, precio, soloStock, soloFav].forEach(el=>{
    el && el.addEventListener('input', ()=> {
      if (el===precio) { const pv=document.querySelector('#precio-valor'); if (pv) pv.textContent = precio.value; }
      render();
    });
  });

  // cargar datos
  fetch('data/productos.json')
   .then(r=>r.json())
   .then(data=>{
      const tipo = page==='cajas' ? 'caja' : (page==='cartas' ? 'carta' : null);
      productos = tipo ? data.filter(p=> p.tipo===tipo) : data.slice();
      // poblar selects
      const uniq = (arr)=> [...new Set(arr.filter(Boolean))];
      uniq(productos.map(p=>p.categoria)).sort().forEach(v=>{ const o=document.createElement('option'); o.value=slugify(v); o.textContent=v; categoria.appendChild(o);
      });
      uniq(productos.map(p=>p.idioma)).sort().forEach(v=>{
        const o=document.createElement('option'); o.value=v; o.textContent=v; idioma.appendChild(o);
      });
      if(page==='cartas'){
        // Si no existe rareza en datos, ocultar el control
        const tieneRareza = productos.some(p=>p.rareza);
        if(!tieneRareza){ rareza.parentElement.style.display='none'; }
      } else {
        rareza.parentElement.style.display='none';
      }
      // rango de precio dinámico
      const maxPrecio = Math.max(150, ...productos.map(p=>Number(p.precio)||0));
      precio.max = Math.ceil(maxPrecio);
      precio.value = Math.min(150, precio.max);
      precioValor.textContent = precio.value;
      // URL params -> set initial controls before first render
      try {
        const params = new URLSearchParams(window.location.search);
        const categoriaInicial = (params.get('categoria') || '').toLowerCase();
        const qInicial = params.get('q') || params.get('query') || params.get('nombre');
        if (qInicial && nombre) nombre.value = qInicial;
        if (categoriaInicial && categoria) categoria.value = categoriaInicial; // select uses slug values
      } catch(e){}
      render();
});
})();


/* === Ecommerce cart hooks === */
function hookAddToCartButtons(){
  document.querySelectorAll(".btn-add-cart").forEach(btn => {
    btn.addEventListener("click", async () => {
      const productId = parseInt(btn.dataset.productId, 10);
      if (!productId) {
        alert("Este producto no tiene ID interno todavía.");
        return;
      }
      if (typeof addToLocalCart === "function") {
        addToLocalCart(productId, 1);
      }
      if (typeof syncCartToServer === "function") {
        await syncCartToServer();
      }
      if (typeof refreshCartCount === "function") {
        await refreshCartCount();
      }
      btn.textContent = "Añadido ✓";
      setTimeout(()=>{ btn.textContent = "Añadir al carrito"; },1200);
    });
  });
}
document.addEventListener("DOMContentLoaded", ()=>{
  if (typeof hookAddToCartButtons === "function") {
    hookAddToCartButtons();
  }
});
