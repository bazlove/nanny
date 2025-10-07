// Console banner
(function(){try{console.log('%cLanding (split files)','background:#16324a;color:#fff;padding:2px 8px;border-radius:6px')}catch(e){}})();

// Burger (mobile)
(function(){
  const b=document.querySelector('.burger'); const head=document.querySelector('.site-header'); const mnav=document.getElementById('mnav');
  if(!b||!head||!mnav) return;
  b.addEventListener('click',()=>{ const open=head.classList.toggle('open'); b.setAttribute('aria-expanded', open?'true':'false'); mnav.hidden=!open; });
})();

// i18n (RU/SR)
(function(){
  const I18N = {
    ru: {
      nav_services:'Услуги', nav_slots:'Свободные слоты', nav_price:'Стоимость', nav_faq:'Ответы', nav_contact:'Контакты',
      city:'Нови-Сад',
      hero_title:'Надёжная няня в Нови-Саде — спокойно работайте из дома',
      hero_sub:'CPR/First Aid, фото-отчёт после визита, развивающие занятия, моторика по договорённости.',
      trust_safe:'🛡️ Безопасность', trust_report:'📷 Фото-отчёт', trust_no_screens:'🎲 Развитие без экранов', trust_short_slots:'🕒 Слоты 2–4 часа',
      btn_slots:'Проверить свободные слоты',
      hero_micro:'Опыт: воспитатель детсада и детский фитнес-тренер • 4.9★ по отзывам'
    },
    sr: {
      nav_services:'Usluge', nav_slots:'Slobodni termini', nav_price:'Cena', nav_faq:'ČPP', nav_contact:'Kontakt',
      city:'Novi Sad',
      hero_title:'Pouzdana dadilja u Novom Sadu — radite od kuće bez stresa',
      hero_sub:'CPR/Prva pomoć, foto-izveštaj posle posete, razvojne aktivnosti, motorika po dogovoru.',
      trust_safe:'🛡️ Bezbednost', trust_report:'📷 Foto-izveštaj', trust_no_screens:'🎲 Razvoj bez ekrana', trust_short_slots:'🕒 Termini 2–4 sata',
      btn_slots:'Proverite slobodne termine',
      hero_micro:'Iskustvo: vaspitač u vrtiću i dečiji fitnes trener • 4.9★ po ocenama'
    }
  };
  function applyLang(lang){
    const d=I18N[lang]||I18N.ru;
    document.documentElement.setAttribute('lang', lang==='sr'?'sr':'ru');
    document.querySelectorAll('.i18n').forEach(el=>{
      const k=el.getAttribute('data-key'); if(k && d[k]!=null) el.textContent=d[k];
    });
    document.querySelectorAll('.lang-btn').forEach(b=>{
      const on=b.getAttribute('data-lang')===lang; b.classList.toggle('active',on); b.setAttribute('aria-pressed', on?'true':'false');
    });
    try{ localStorage.setItem('lang', lang);}catch(e){}
  }
  function init(){
    const q=new URLSearchParams(location.search); const qp=(q.get('lang')||'').toLowerCase();
    let stored; try{ stored=localStorage.getItem('lang'); }catch(e){}
    const lang=(qp==='sr'||qp==='ru')?qp:(stored || ((navigator.language||'ru').toLowerCase().indexOf('sr')===0?'sr':'ru'));
    applyLang(lang);
    document.addEventListener('click', e=>{ const btn=e.target.closest && e.target.closest('.lang-btn'); if(!btn) return; e.preventDefault(); applyLang(btn.getAttribute('data-lang')); });
    window.i18nSetLang=applyLang;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// Availability badge + mock slot
(function(){
  const badge=document.getElementById('availability-badge'); if(!badge) return;
  const CAL_SELECTOR='#slots-calendar'; const SLOT_SELECTOR='.slot--free';
  const pad=n=> (n<10?'0':'')+n;
  const fmt=(h,m)=> pad(h)+':'+pad(m);
  const todayISO=(d)=>{d=d||new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
  const addDaysISO=(iso,add)=>{const p=iso.split('-'); const dt=new Date(+p[0],+p[1]-1,+p[2]); dt.setDate(dt.getDate()+add); return todayISO(dt)};
  const toMin=hhmm=>{const a=String(hhmm).split(':'); return (+a[0])*60+(+a[1]||0)};
  function collectDaySlots(root, iso){
    const nodes=[...root.querySelectorAll(`${SLOT_SELECTOR}[data-date="${iso}"]`)];
    const out=[]; nodes.forEach(el=>{ const f=el.getAttribute('data-from'); const t=el.getAttribute('data-to'); if(!f||!t) return; out.push({fromMin:toMin(f), toMin:toMin(t)}); });
    return out;
  }
  function best(root){
    const now=new Date(), iso=todayISO(now), nowMin=now.getHours()*60+now.getMinutes();
    const today=collectDaySlots(root,iso).filter(s=>s.toMin>nowMin).sort((a,b)=>a.fromMin-b.fromMin);
    if(today.length){ const c=today.filter(s=>s.fromMin>=nowMin)[0]; return {type:'today', slot:c||today[0]}; }
    for(let d=1; d<=6; d++){ const isoN=addDaysISO(iso,d); const arr=collectDaySlots(root,isoN).sort((a,b)=>a.fromMin-b.fromMin); if(arr.length) return {type:(d===1?'tomorrow':'future'), days:d, slot:arr[0], iso:isoN}; }
    return {type:'none'};
  }
  const human=(type,days)=>{ if(type==='today') return 'сегодня'; if(type==='tomorrow') return 'завтра'; const dt=new Date(); dt.setDate(dt.getDate()+days); return dt.toLocaleDateString('ru-RU',{day:'2-digit',month:'short'}).replace('.',''); };
  function update(){
    const root=document.querySelector(CAL_SELECTOR); const dot='<span class="dot" aria-hidden="true"></span>';
    if(!root){ badge.className='avail-badge none'; badge.innerHTML=dot+' Календарь недоступен'; return; }
    const b=best(root);
    if(b.type==='today'){ const f=b.slot.fromMin, t=b.slot.toMin; badge.className='avail-badge ok'; badge.innerHTML=dot+' Свободно сегодня '+fmt(Math.floor(f/60),f%60)+'–'+fmt(Math.floor(t/60),t%60); return; }
    if(b.type==='tomorrow'||b.type==='future'){ const f2=b.slot.fromMin, t2=b.slot.toMin; badge.className='avail-badge next'; badge.innerHTML=dot+' Ближайшее: '+human(b.type,b.days)+' '+fmt(Math.floor(f2/60),f2%60)+'–'+fmt(Math.floor(t2/60),t2%60); return; }
    badge.className='avail-badge none'; badge.innerHTML=dot+' Нет свободных слотов на этой неделе';
  }
  // Mock one slot today (remove if not needed)
  (function mock(){
    const cal=document.getElementById('slots-calendar'); if(!cal) return;
    const iso=todayISO(new Date());
    if(!cal.querySelector(`[data-date="${iso}"]`)){
      cal.innerHTML = `<div class="slot--free" data-date="${iso}" data-from="16:00" data-to="19:00"></div>`;
    }
  })();
  window.addEventListener('DOMContentLoaded', update);
})();

// Calculator
(function(){
  const rateBase = 800; // дин/ч
  const EUR = 117;
  const hoursEl = document.getElementById('hours');
  const kidsEl  = document.getElementById('kids');
  const dayEl   = document.getElementById('day');
  const euroEl  = document.getElementById('euro');
  const errEl   = document.getElementById('hours-err');
  const totalEl = document.getElementById('total');
  const badgesEl= document.getElementById('applied-badges');
  const rateEl  = document.getElementById('rate');
  const cta     = document.getElementById('cta');
  const shareInline = document.getElementById('share-inline');
  const shareRight  = document.getElementById('share-right');

  rateEl.textContent = rateBase;

  const exEls = [...document.querySelectorAll('.ex')];
  const chips = [...document.querySelectorAll('.chip')];

  function sanitizeHours(v){
    const n = parseInt(v, 10);
    if (!n || n < 2) return 2;
    return n;
  }
  function validateHours(){
    const val = parseInt(hoursEl.value,10);
    errEl.style.display = (!val || val < 2) ? 'block' : 'none';
  }
  function coefChildren(mode){
    if(mode==='1') return 0;
    if(mode==='2') return .25;
    if(mode==='2baby') return .50;
    return 0;
  }
  function coefWeekend(day){
    return (day==='weekend'||day==='holiday') ? .25 : 0;
  }
  function extrasSum(){
    return exEls.reduce((s,el)=> el.checked ? s + parseInt(el.value,10) : s, 0);
  }

  // count-up animation
  let last = 0; let animId;
  function renderTotal(val){
    const to = Math.round(val);
    cancelAnimationFrame(animId);
    const start = last, diff = to - start;
    const t0 = performance.now(), dur = 160;
    function step(t){
      const k = Math.min(1, (t - t0)/dur);
      const now = Math.round(start + diff * k);
      totalEl.textContent = euroEl.checked ? `≈ € ${now}` : `${now} дин`;
      if(k<1){ animId = requestAnimationFrame(step); } else { last = to; }
    }
    animId = requestAnimationFrame(step);
  }

  function updateBadges(children, day){
    badgesEl.innerHTML='';
    if(coefChildren(children)===.25) badgesEl.innerHTML+=`<span class="badge">+25% два ребёнка</span>`;
    if(coefChildren(children)===.50) badgesEl.innerHTML+=`<span class="badge">+50% малыш &lt;2</span>`;
    if(coefWeekend(day)===.25)       badgesEl.innerHTML+=`<span class="badge">+25% выходной</span>`;
    if(euroEl.checked)               badgesEl.innerHTML+=`<span class="badge eu">€</span>`;
  }

  function compute(){
    const h = sanitizeHours(hoursEl.value);
    if(parseInt(hoursEl.value,10)!==h) { hoursEl.value = h; }
    validateHours();
    const k = kidsEl.value;
    const d = dayEl.value;

    const coef = 1 + coefChildren(k) + coefWeekend(d);
    const base = rateBase * h * coef;
    const total = base + extrasSum();
    const out = euroEl.checked ? (total / EUR) : total;
    updateBadges(k,d);
    renderTotal(out);
    return total;
  }

  function share(){
    const p = new URLSearchParams({
      h: hoursEl.value,
      kids: kidsEl.value,
      day: dayEl.value,
      ex1: document.getElementById('ex1').checked ? 1:0,
      ex2: document.getElementById('ex2').checked ? 1:0,
      ex3: document.getElementById('ex3').checked ? 1:0,
      eur: euroEl.checked ? 1:0
    });
    const url = `${location.origin}${location.pathname}?${p.toString()}#calc`;
    navigator.clipboard.writeText(url).then(()=>{
      const a = document.createElement('div');
      a.textContent='Ссылка скопирована';
      a.style.position='fixed'; a.style.bottom='18px'; a.style.left='50%'; a.style.transform='translateX(-50%)';
      a.style.background='#111'; a.style.color='#fff'; a.style.padding='8px 12px'; a.style.borderRadius='10px'; a.style.zIndex='200';
      document.body.appendChild(a); setTimeout(()=>a.remove(), 1100);
    });
  }

  [hoursEl, kidsEl, dayEl, euroEl, ...exEls].forEach(el=>{
    el.addEventListener('input', compute);
    el.addEventListener('change', compute);
  });

  chips.forEach(ch=>{
    ch.addEventListener('click', ()=>{
      const h = ch.getAttribute('data-h');
      const kd= ch.getAttribute('data-k');
      const d = ch.getAttribute('data-day');
      if(h) hoursEl.value = h;
      if(kd) kidsEl.value = kd==='2'?'2':'1';
      if(d) dayEl.value  = d;
      compute();
    });
  });

  document.getElementById('share-inline').addEventListener('click', e=>{e.preventDefault(); share();});
  document.getElementById('share-right').addEventListener('click', e=>{e.preventDefault(); share();});

  document.getElementById('cta').addEventListener('click', (e)=>{
    e.preventDefault();
    document.querySelector('#contact').scrollIntoView({behavior:'smooth'});
  });

  // Init from URL
  (function initFromURL(){
    const q = new URLSearchParams(location.search);
    if(q.has('h')) document.getElementById('hours').value = q.get('h');
    if(q.has('kids')) document.getElementById('kids').value = q.get('kids');
    if(q.has('day')) document.getElementById('day').value = q.get('day');
    ['ex1','ex2','ex3'].forEach(id=>{ if(q.get(id)==='1') document.getElementById(id).checked=true; });
    if(q.get('eur')==='1') document.getElementById('euro').checked = true;
  })();

  compute();
})();

// FAQ accordion + copy link
(function(){
  document.querySelectorAll('.faq .item .q').forEach(q=>{
    q.addEventListener('click', (e)=>{
      if(e.target.closest('.link-btn')) return;
      q.parentElement.classList.toggle('open');
    });
  });
  document.querySelectorAll('.faq .link-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      const sel = btn.getAttribute('data-copy');
      const block = document.querySelector(sel);
      if(!block) return;
      const id = block.id || 'faq';
      const url = `${location.origin}${location.pathname}#${id}`;
      navigator.clipboard.writeText(url).then(()=>{
        const tip = document.createElement('div');
        tip.textContent='Скопировано';
        tip.style.position='fixed'; tip.style.bottom='18px'; tip.style.left='50%'; tip.style.transform='translateX(-50%)';
        tip.style.background='#111'; tip.style.color='#fff'; tip.style.padding='8px 12px'; tip.style.borderRadius='10px'; tip.style.zIndex='200';
        document.body.appendChild(tip); setTimeout(()=>tip.remove(), 1100);
      });
    });
  });
})();

// Cookie banner + GA4 loader
(function() {
  const LS_KEY='consent_analytics';
  const banner=document.getElementById('cookie-banner');
  const btnAccept=document.getElementById('cookie-accept');
  const btnDecline=document.getElementById('cookie-decline');
  const linkSettings=document.getElementById('cookie-settings');
  const GA_ID=window.__GA_MEASUREMENT_ID__;

  function mountGA(){
    if(!GA_ID || /X{6,}/.test(GA_ID)) return;
    const s=document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function consent(state){
    if(typeof gtag==='function'){
      gtag('consent','update', { analytics_storage: state ? 'granted' : 'denied' });
    }
    try{ localStorage.setItem(LS_KEY, state?'granted':'denied'); }catch(e){}
    if(state) mountGA();
  }

  function showBanner(v=true){ banner.hidden = !v; }

  function init(){
    let saved=null; try{ saved=localStorage.getItem(LS_KEY); }catch(e){}
    if(saved==='granted'){ consent(true); }
    else if(saved==='denied'){ consent(false); }
    else { showBanner(true); }
    if(btnAccept) btnAccept.addEventListener('click', ()=>{ consent(true); showBanner(false); });
    if(btnDecline) btnDecline.addEventListener('click', ()=>{ consent(false); showBanner(false); });
    if(linkSettings) linkSettings.addEventListener('click', (e)=>{ e.preventDefault(); showBanner(true); });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

// Footer year
document.getElementById('y').textContent=new Date().getFullYear();