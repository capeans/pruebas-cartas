
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

        if (q) filtrados = filtrados.filter(p => p.nombre.toLowerCase().includes(q));
        if (cat) filtrados = filtrados.filter(p => p.categoria.toLowerCase().includes(cat));
        if (idioma) filtrados = filtrados.filter(p => (p.idioma || "").toLowerCase().includes(idioma));
        filtrados = filtrados.filter(p => parseFloat(p.precio) <= max);

        render(filtrados);
      };

      render(productosMostrados);

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
  const page = document.body.getAttribute('data-page') || '';
  if (!['cartas','cajas'].includes(page)) return;

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

  let productos = [];
  let favoritos = JSON.parse(localStorage.getItem('fav_uzutcg')||'[]');

  function inFav(id){ return favoritos.includes(id); }
  function toggleFav(id){
    if(inFav(id)) favoritos = favoritos.filter(x=>x!==id);
    else favoritos.push(id);
    localStorage.setItem('fav_uzutcg', JSON.stringify(favoritos));
    render();
  }

  function badgeStock(p){
    return p.stock && p.stock>0 ? '<span class="badge">Stock</span>' : '';
  }

  function card(p, idx){
    const tags = [
      p.categoria ? `<span class="tag">${p.categoria}</span>`:'' ,
      p.idioma ? `<span class="tag">Idioma: ${p.idioma}</span>`:'' ,
      p.rareza ? `<span class="tag">R: ${p.rareza}</span>`:''
    ].join('');
    return `
    <article class="card">
      <div style="position:relative">
        ${badgeStock(p)}
        <img class="card-img" src="${p.imagen}" alt="${p.nombre}" onerror="this.src='img/otros/1.jpg'"/>
      </div>
      <div class="card-body">
        <div class="card-title">${p.nombre}</div>
        <div class="tags">${tags}</div>
        <div>ID: ${p.id ?? idx+1}</div>
        <div class="price">${Number(p.precio).toFixed(2)} €</div>
        <div class="card-actions">
          <button class="btn-outline" data-big="${p.imagen}">Ver grande</button>
          <button class="btn-heart" data-fav="${p.id ?? idx+1}">
            <span class="heart ${inFav(p.id ?? idx+1) ? 'on':''}">❤</span> Favorito
          </button>
        </div>
      </div>
    </article>`;
  }

  function render(){
    let arr = [...productos];
    // búsqueda
    const q = (nombre.value||'').toLowerCase();
    if(q) arr = arr.filter(p=> (p.nombre||'').toLowerCase().includes(q));
    // filters
    if(categoria.value) arr = arr.filter(p=> (p.categoria||'') === categoria.value);
    if(idioma.value) arr = arr.filter(p=> (p.idioma||'') === idioma.value);
    if(rareza.value) arr = arr.filter(p=> (p.rareza||'') === rareza.value);
    const max = Number(precio.value||1000);
    arr = arr.filter(p=> Number(p.precio)<=max);
    if(soloStock.checked) arr = arr.filter(p=> Number(p.stock)>0);
    if(soloFav.checked) arr = arr.filter((_,i)=> inFav((_.id ?? i+1)));

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
      btn.addEventListener('click', e=> toggleFav(e.currentTarget.dataset.fav));
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
  [nombre,categoria,idioma,rareza,precio,soloStock,soloFav,ordenar].forEach(el=>{
    el && el.addEventListener('input', ()=> {
      if(el===precio) precioValor.textContent = precio.value;
      render();
    });
  });
  btnBuscar.addEventListener('click', e=>{ e.preventDefault(); render(); });
  btnLimpiar.addEventListener('click', e=>{
    e.preventDefault();
    nombre.value=''; categoria.value=''; idioma.value=''; rareza.value='';
    precio.value=150; precioValor.textContent='150'; soloStock.checked=false; soloFav.checked=false;
    ordenar.value='name-asc'; render();
  });

  // cargar datos
  fetch('data/productos.json')
   .then(r=>r.json())
   .then(data=>{
      const tipo = page==='cajas' ? 'caja' : 'carta';
      productos = data.filter(p=> p.tipo===tipo);
      // poblar selects
      const uniq = (arr)=> [...new Set(arr.filter(Boolean))];
      uniq(productos.map(p=>p.categoria)).sort().forEach(v=>{
        const o=document.createElement('option'); o.value=v; o.textContent=v; categoria.appendChild(o);
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

      render();
   });
})();
