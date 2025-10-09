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

// Calculator

(function(){
  const EUR_RATE=117, BASE=800, WEEKEND=1.25, TWO=1.25, INFANT=1.5, OPT=300, MIN=2, HOURS_MAX=10;
  const $=id=>document.getElementById(id);
  const money=v=>{ try{return v.toLocaleString('ru-RS')}catch(_){return String(v)} };

  function normalizeHours(commit){
    const h=$('hours'), err=$('hoursErr');
    let v=parseInt(h?.value, 10);
    
    const emptyOrNaN = !Number.isFinite(v) || (h?.value==='');
    if (emptyOrNaN) v = MIN;

    // диапазон 2..10
    v = Math.max(MIN, Math.min(HOURS_MAX, v));

    if (commit && h) { h.value = String(v); }

    // подсветка ошибки и текст показываем только если < MIN
    if (h)   { h.classList.toggle('error', v < MIN); }
    if (err) { err.style.display = (v < MIN) ? 'block' : 'none'; }

    return v;
  }

  function hourlyRate(){
    let r=BASE;
    const day=$('dayType')?.value, kids=$('kids')?.value;
    if(day==='weekend') r*=WEEKEND;
    if(kids==='2_infant') r*=INFANT; else if(kids==='2') r*=TWO;
    return Math.round(r/10)*10;
  }

  let last=0;
  const render = (sum) => {
  const eur = $('eurToggle')?.checked;
  let s = `Итог: ${money(sum)} дин`;
  if (eur) {
    const eurVal = Math.round(sum / EUR_RATE);
    s += ` <span class="eur">(≈ €${eurVal})</span>`;
  }
  const el = $('result');
  if (el) el.innerHTML = s;
  };
  const animate=(to)=>{
    const from=last; if(from===to){ render(to); return; }
    const start=performance.now(), dur=180, diff=to-from;
    const step=(t)=>{ const p=Math.min(1,(t-start)/dur); render(Math.round(from+diff*p)); if(p<1) requestAnimationFrame(step); else last=to; };
    requestAnimationFrame(step);
  };

  function recalc(commit = true){
    const h = normalizeHours(commit);
    const rate=hourlyRate();
    const add=( $('optA')?.checked?OPT:0 )+( $('optB')?.checked?OPT:0 )+( $('optC')?.checked?OPT:0 );
    const total=rate*h+add; animate(total);

    const br=$('breakdown'); if(br) br.textContent=`Ставка: ${rate} дин/ч × ${h} ч${add?` | доп. занятия: +${add} дин`:''}`;

    const badges=$('badges');
    if(badges){
      const b=[];
      const kids=$('kids')?.value, day=$('dayType')?.value;
      if(kids==='2') b.push('+25% двое детей');
      if(kids==='2_infant') b.push('+50% малыш <2 лет');
      if(day==='weekend') b.push('+25% выходной день');
      if($('eurToggle')?.checked) b.push('€');
      badges.innerHTML=b.map(t=>`<span class="badge">${t}</span>`).join('');
    }

    const q=new URLSearchParams({
      h:$('hours')?.value||'',
      k:$('kids')?.value||'',
      d:$('dayType')?.value||'',
      a:$('optA')?.checked?1:0,
      b:$('optB')?.checked?1:0,
      c:$('optC')?.checked?1:0,
      eur:$('eurToggle')?.checked?1:0
    });
    try{ history.replaceState(null,'', location.pathname+'?'+q.toString()); }catch(_){}
  }

  function bind(){
  const hoursEl = $('hours');
  if (hoursEl) {
    hoursEl.addEventListener('input', () => {
      normalizeHours(false);  // ← НЕ коммитим во время набора
      recalc(false);          // ← пересчёт без подстановки в инпут
    });
    ['change','blur'].forEach(ev =>
      hoursEl.addEventListener(ev, () => {
        normalizeHours(true); // ← коммитим на выходе из поля
        recalc(true);
      })
    );
  }

  ['kids','dayType','optA','optB','optC','eurToggle'].forEach(id=>{
    const el=$(id); if(!el) return;
    ['input','change'].forEach(e=> el.addEventListener(e,recalc));
  });

  const setH=n=>{ const h=$('hours'); if(h){ h.value=String(n); h.focus(); recalc(true); }};
  [['p2h',2],['p3h',3],['p4h',4],['p5h',5]].forEach(([id,val])=>{
    const b=$(id); if(b) b.addEventListener('click',()=>setH(val));
  });
  $('pWeekday')?.addEventListener('click', ()=>{ const d=$('dayType'); if(d){ d.value='weekday'; recalc(); }});
  $('pWeekend')?.addEventListener('click',()=>{ const d=$('dayType'); if(d){ d.value='weekend'; recalc(); }});
  $('pKids2')?.addEventListener('click',()=>{ const k=$('kids'); if(k){ k.value='2'; recalc(); }});

    // делегирование на случай будущих изменений
    document.addEventListener('click',(ev)=>{
      const chip=ev.target.closest?.('.tag'); if(!chip) return;
      const txt=(chip.textContent||'').toLowerCase();
      if(txt.includes('2 ч')) return setH(2);
      if(txt.includes('3 ч')) return setH(3);
      if(txt.includes('4 ч')) return setH(4);
      if(txt.includes('выходн')){ const d=$('dayType'); if(d){ d.value='weekend'; recalc(); } return; }
      if(txt.includes('два ребёнка')||txt.includes('два ребенка')){ const k=$('kids'); if(k){ k.value='2'; recalc(); } return; }
    }, true);

    // share
    const share=$('shareLink');
    if(share) share.addEventListener('click', async (e)=>{
      e.preventDefault();
      try{ await navigator.clipboard.writeText(location.href);
           share.classList.add('copied'); setTimeout(()=>share.classList.remove('copied'),1200);
      }catch(_){}
    });
  }

  function fromQuery(){ try{
    const q=new URLSearchParams(location.search);
    if(q.has('h')) $('hours').value=q.get('h');
    if(q.has('k')) $('kids').value=q.get('k');
    if(q.has('d')) $('dayType').value=q.get('d');
    [['a','optA'],['b','optB'],['c','optC'],['eur','eurToggle']].forEach(([k,id])=>{
      if(q.has(k)){ const el=$(id); if(el) el.checked=(q.get(k)==='1'); }
    });
  }catch(_){} }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{ bind(); fromQuery(); recalc(); });
  else { bind(); fromQuery(); recalc(); }
})();

// ===== FAQ
(function initFAQ() {
  const header = document.querySelector('.site-header');
  const headerOffset = () => (header?.offsetHeight || 0) + 12; // небольшой люфт

  const items = [...document.querySelectorAll('.faq-item')];
  if (!items.length) return;

  // Вспомогательная: задать max-height в зависимости от состояния
  const setMax = (pane, open) => {
    if (!pane) return;
    if (open) {
      // сначала убираем max-height, чтобы корректно измерить новую высоту
      pane.style.maxHeight = 'none';
      const h = pane.scrollHeight;
      pane.style.maxHeight = h + 'px';
    } else {
      pane.style.maxHeight = '0px';
    }
  };

  items.forEach((li) => {
    const q = li.querySelector('.faq-q');
    const a = li.querySelector('.faq-a');
    const copy = li.querySelector('.faq-q__copy');

    // старт: всё закрыто
    setMax(a, false);

    // клик по вопросу
    q?.addEventListener('click', () => {
      const willOpen = !li.classList.contains('open');

      // (опционально) закрываем остальные
      items.forEach((other) => {
        if (other !== li && other.classList.contains('open')) {
          other.classList.remove('open');
          const oa = other.querySelector('.faq-a');
          setMax(oa, false);
        }
      });

      li.classList.toggle('open', willOpen);
      setMax(a, willOpen);

      // плавный скролл так, чтобы шапка вопроса оказалась под фикс-хедером
      if (willOpen) {
        const y = q.getBoundingClientRect().top + window.scrollY - headerOffset();
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });

    // «скрепка»: копирование прямой ссылки
    copy?.addEventListener('click', (e) => {
      e.preventDefault();
      const url = location.origin + location.pathname + '#' + q.id;
      navigator.clipboard?.writeText(url);
      copy.classList.add('copied');
      setTimeout(() => copy.classList.remove('copied'), 1500);
    });

    // на ресайз пересчитываем высоту открытых панелей
    window.addEventListener('resize', () => {
      if (li.classList.contains('open')) setMax(a, true);
    });
  });

  // если пришли по якорю — раскрываем нужный пункт и корректно прокручиваем
  if (location.hash) {
    const q = document.querySelector(location.hash);
    const li = q?.closest('.faq-item');
    const a = li?.querySelector('.faq-a');
    if (li && q && a) {
      li.classList.add('open');
      setMax(a, true);
      const y = q.getBoundingClientRect().top + window.scrollY - headerOffset();
      window.scrollTo({ top: y, behavior: 'instant' in window ? 'instant' : 'auto' });
    }
  }
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

const yEl = document.getElementById('y');
if (yEl) yEl.textContent = new Date().getFullYear();


