
(function(){
  const U = {};
  const CART_KEY='uzu_cart_v1';
  U.$=(s,r=document)=>r.querySelector(s);
  U.$all=(s,r=document)=>Array.from(r.querySelectorAll(s));
  U.navActive=(href)=>{ U.$all('.nav a').forEach(a=>a.classList.toggle('active', a.getAttribute('href')===href)); };
  U.year=()=>{ const y=U.$('#year'); if(y) y.textContent=(new Date()).getFullYear(); };
  U.fetchJSON= async (url)=> (await fetch(url)).json();
  U.toast=(m)=>{ let t=U.$('.toast'); if(!t){ t=document.body.appendChild(Object.assign(document.createElement('div'),{className:'toast'})); } t.textContent=m; t.style.cssText='position:fixed;bottom:16px;right:16px;background:#111827;color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.2);'; setTimeout(()=>{t.remove()},1400); };
  // Cart
  U.cartLoad=()=>{ try{ return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); }catch{ return []; } };
  U.cartSave=(items)=>{ localStorage.setItem(CART_KEY, JSON.stringify(items)); U.updateCartCount(); };
  U.updateCartCount=()=>{ const items=U.cartLoad(); const n = items.reduce((a,x)=>a+x.qty,0); const b=U.$('#cart-count'); if(!b) return; if(n>0){ b.style.display='inline-block'; b.textContent=String(n);} else {b.style.display='none';}};
  U.addToCart=(item)=>{ const cart=U.cartLoad(); const i=cart.findIndex(x=>x.id===item.id && x.type===item.type); if(i>=0){ cart[i].qty+=item.qty; } else { cart.push(item); } U.cartSave(cart); U.toast('Añadido al carrito'); };
  U.removeFromCart=(idx)=>{ const cart=U.cartLoad(); cart.splice(idx,1); U.cartSave(cart); };
  U.changeQty=(idx,delta)=>{ const cart=U.cartLoad(); cart[idx].qty=Math.max(1, cart[idx].qty+delta); U.cartSave(cart); };
  U.cardHTML=(p, type='card')=>{
    const tag = p.rarity==='BOX' ? 'BOX' : 'R: '+p.rarity;
    const img = p.img.replace(/\.webp$/, '.svg');
    return "<article class='card' data-id='"+p.id+"' data-type='"+type+"'>"
      +"<div style='position:relative'>"
      +"<img class='thumb' src='"+img+"' alt='"+p.name+"' loading='lazy' decoding='async'>"
      +"<div class='stock "+(p.stock?'':'out')+"'>"+(p.stock?'Stock':'Sin stock')+"</div>"
      +"</div>"
      +"<div class='wrap'><h3>"+p.name+"</h3>"
      +"<div class='badges'><span class='badge'>"+p.category+"</span><span class='badge'>"+tag+"</span><span class='badge'>"+p.language+"</span></div>"
      +"<div class='price'>"+p.price.toFixed(2)+" €</div></div>"
      +"<div class='actions'><button class='btn' data-zoom>Ver grande</button><button class='btn btn-primary' data-add>Agregar</button></div>"
      +"</article>";
  };
  U.initZoom=()=>{
    document.addEventListener('click', (e)=>{
      const zoom=e.target.closest('[data-zoom]') || (e.target.matches('.thumb') && e.target);
      if(!zoom) return;
      const card = e.target.closest('.card');
      const src = card.querySelector('.thumb').getAttribute('src');
      let dlg = U.$('#zoom-modal');
      if(!dlg){ dlg = document.createElement('dialog'); dlg.id='zoom-modal'; dlg.innerHTML = "<button class='btn' style='position:absolute;top:10px;right:10px'>Cerrar</button><img style='max-width:90vw;max-height:80vh;border-radius:12px'>"; document.body.appendChild(dlg); }
      dlg.querySelector('img').src=src; dlg.querySelector('button').onclick=()=>dlg.close(); dlg.showModal();
    });
  };
  U.applyFilters=(list, o)=>{
    let L=list.slice();
    if(o.name) L=L.filter(x=>x.name.toLowerCase().includes(o.name.toLowerCase()));
    if(o.cat) L=L.filter(x=>x.category===o.cat);
    if(o.lang) L=L.filter(x=>x.language===o.lang);
    if(o.rare) L=L.filter(x=>x.rarity===o.rare);
    if(typeof o.max==='number') L=L.filter(x=>x.price<=o.max);
    if(o.inStock) L=L.filter(x=>x.stock);
    return L;
  };
  U.paginate=(arr,page=1,per=12)=>({page, per, total:arr.length, pages:Math.max(1,Math.ceil(arr.length/per)), items:arr.slice((page-1)*per,(page-1)*per+per)});
  U.renderPager=(host,pg,on)=>{
    if(!host) return; if(pg.pages<=1){ host.innerHTML=''; return; }
    let h=''; const mk=(p,l)=>"<button data-go='"+p+"' class='"+(p===pg.page?'on':'')+"'>"+(l||p)+"</button>";
    h+=mk(Math.max(1,pg.page-1),'‹'); for(let p=1;p<=pg.pages;p++) h+=mk(p); h+=mk(Math.min(pg.pages,pg.page+1),'›');
    host.innerHTML=h; host.onclick=(e)=>{ const b=e.target.closest('button[data-go]'); if(!b) return; on(+b.dataset.go); };
  };
  window.UZU = U;
  addEventListener('DOMContentLoaded', ()=>{ U.updateCartCount(); U.initZoom(); });
})();
