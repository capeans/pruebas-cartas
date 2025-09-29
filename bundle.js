
(function(){
  const UZU = {}; const LS_FAV='uzu_favs';
  UZU.$=(s,r=document)=>r.querySelector(s); UZU.$all=(s,r=document)=>Array.from(r.querySelectorAll(s));
  UZU.setupMobileNav=()=>{const t=UZU.$('.menu-toggle'), n=UZU.$('#site-nav'); if(t&&n) t.addEventListener('click',()=>{const o=n.classList.toggle('open'); t.setAttribute('aria-expanded', String(o));});};
  UZU.navActive=(href)=>{UZU.$all('.nav a').forEach(a=>a.classList.toggle('active', a.getAttribute('href')===href));};
  UZU.toast=(m)=>{let t=UZU.$('.toast'); if(!t){t=document.createElement('div');t.className='toast';document.body.appendChild(t);} t.textContent=m; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1600);};
  UZU.year=()=>{const y=document.querySelector('#year'); if(y) y.textContent=new Date().getFullYear();};
  UZU.getParam=(k)=>new URLSearchParams(location.search).get(k);
  UZU.loadFavs=()=>{try{return new Set(JSON.parse(localStorage.getItem(LS_FAV)||'[]'));}catch{return new Set();}};
  UZU.saveFavs=(s)=>localStorage.setItem(LS_FAV, JSON.stringify([...s]));
  UZU.buildData=(imgs)=>{const cats=['Pokémon','One Piece','Digimon','Dragon Ball','Naruto','Magic'], langs=['ES','EN','JP','PT','IT'], rar=['C','U','R','SR','UR'], names=['Charizard','Pikachu','Luffy','Agumon','Goku','Naruto','Mewtwo','Ace','Vegeta','Sasuke','Bulbasaur','Zoro','MetalGreymon','Trunks','Kakashi']; const out=[]; for(let i=0;i<imgs.length;i++){const name=names[i%names.length]+' '+(100+i), category=cats[i%cats.length], language=langs[i%langs.length], rarity=rar[i%rar.length], price=Math.round((10+(i%12)*7+(rar.indexOf(rarity)*15))*100)/100, stock=i%5!==0, img=imgs[i], best=i%9===0, neww=i%7===0; out.push({id:i+1,name,category,language,rarity,price,stock,img,best,neww});} return out; };
  UZU.toBoxes=(cards)=>cards.slice(0,48).map((c,i)=>Object.assign({},c,{name:`${c.category} Box ${i+1}`, price:Math.round(c.price*5), rarity:'BOX', stock:(i%4!==0)}));
  UZU.paginate=(arr,page=1,per=12)=>({page,per,total:arr.length,pages:Math.max(1,Math.ceil(arr.length/per)),items:arr.slice((page-1)*per,(page-1)*per+per)});
  UZU.renderPager=(host,{page,pages},go)=>{ if(!host) return; if(pages<=1){host.innerHTML='';return;} let h=''; const mk=(p,l=(p))=>`<button data-go='${p}' class='${p===page?'on':''}'>${l}</button>`; h+=mk(Math.max(1,page-1),'‹'); for(let p=1;p<=pages;p++){h+=mk(p);} h+=mk(Math.min(pages,page+1),'›'); host.innerHTML=h; host.onclick=e=>{const b=e.target.closest('button[data-go]'); if(!b) return; go(+b.dataset.go); }; };
  window.UZU=UZU;
})();
