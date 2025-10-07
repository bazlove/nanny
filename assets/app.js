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
(() => {
  const el = (sel) => document.querySelector(sel);
  const sumRsd = el('#sumRsd');
  const baseLine = el('#baseLine');
  const breakdown = el('#breakdown');
  const badgesBox = el('#appliedBadges');
  const euroBadge = el('#euroBadge');

  const hoursInput = el('#calchours');
  const kidsSel = el('#calckids');
  const dowSel = el('#calcdow');
  const add1 = el('#add1'), add2 = el('#add2'), add3 = el('#add3');
  const showEuro = el('#showEuro');
  const shareBtn = el('#shareBtn');
  const hint = el('#hoursHint');

  // Константы
  const BASE = 800;         // дин/час
  const EUR = 117;          // курс дин/€
  const MIN_H = 2;

  const state = {
    hours: 3,
    kids: '1',             // '1' | '2' | '2baby'
    dow: 'weekday',        // 'weekday' | 'weekend'
    addons: { a1:false, a2:false, a3:false },
    euro: false
  };

  // helpers
  const clampHours = (v) => !v || v < MIN_H ? MIN_H : Math.floor(v);
  const fmt = (n) => new Intl.NumberFormat('ru-RS').format(n);

  function compute() {
    const h = clampHours(state.hours);
    hoursInput.value = h;
    // базовая ставка всегда от 800 дин/ч
    let perHour = BASE;
    const badges = [];

    // коэффициенты
    if (state.kids === '2') {
      // +25% за двух детей
      perHour = Math.round(perHour * 1.25);
      badges.push('+25% двое детей');
    }
    if (state.kids === '2baby') {
      // +50% если один <2 лет
      perHour = Math.round(perHour * 1.50);
      badges.push('+50% малыш <2');
    }
    if (state.dow === 'weekend') {
      perHour = Math.round(perHour * 1.25);
      badges.push('+25% выходной');
    }

    // доп занятия (фикс 300 дин за единицу)
    let addonsSum = 0;
    if (state.addons.a1) addonsSum += 300;
    if (state.addons.a2) addonsSum += 300;
    if (state.addons.a3) addonsSum += 300;

    const total = perHour * h + addonsSum;

    // отрисовка
    baseLine.textContent = `${perHour} дин/ч × ${h} ч`;
    badgesBox.innerHTML = badges.map(t => `<span class="badge">${t}</span>`).join('');

    if (state.euro) {
      euroBadge.hidden = false;
      const eur = (total / EUR);
      sumRsd.textContent = fmt(total) + ` (~€${eur.toFixed(1)})`;
    } else {
      euroBadge.hidden = true;
      sumRsd.textContent = fmt(total);
    }
  }

  // Валидация/автоподстановка
  function handleHoursInput() {
    const raw = parseInt(hoursInput.value, 10);
    if (!raw || raw < MIN_H) {
      hoursInput.classList.add('input-error');
      hint.style.color = '#ff7a7a';
    } else {
      hoursInput.classList.remove('input-error');
      hint.style.color = '';
    }
    state.hours = clampHours(raw);
    compute();
  }
  function handleHoursBlur() {
    // на блюре всегда исправляем до минимума
    state.hours = clampHours(parseInt(hoursInput.value,10));
    hoursInput.value = state.hours;
    hoursInput.classList.remove('input-error');
    hint.style.color = '';
    compute();
  }

  // События
  hoursInput.addEventListener('input', handleHoursInput);
  hoursInput.addEventListener('blur', handleHoursBlur);
  kidsSel.addEventListener('change', () => { state.kids = kidsSel.value; compute(); });
  dowSel.addEventListener('change', () => { state.dow = dowSel.value; compute(); });

  [add1,add2,add3].forEach((c,idx)=>{
    c.addEventListener('change', ()=>{
      state.addons[`a${idx+1}`] = c.checked;
      compute();
    });
  });

  showEuro.addEventListener('change', ()=>{
    state.euro = showEuro.checked;
    compute();
  });

  // Пресеты
  document.querySelectorAll('.calc__presets .chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      // сброс активных
      document.querySelectorAll('.calc__presets .chip').forEach(c=>c.classList.remove('active'));

      const h = chip.dataset.hours;
      const d = chip.dataset.dow;
      const k = chip.dataset.kids;

      if (h){ state.hours = clampHours(parseInt(h,10)); hoursInput.value = state.hours; }
      if (d){ state.dow = d; dowSel.value = d; }
      if (k){ state.kids = k; kidsSel.value = k; }

      chip.classList.add('active');
      compute();
    });
  });

  // Поделиться
  shareBtn.addEventListener('click', async ()=>{
    const u = new URL(location.href);
    u.searchParams.set('h', state.hours);
    u.searchParams.set('k', state.kids);
    u.searchParams.set('d', state.dow);
    if (state.addons.a1) u.searchParams.set('a1','1');
    if (state.addons.a2) u.searchParams.set('a2','1');
    if (state.addons.a3) u.searchParams.set('a3','1');
    try {
      await navigator.clipboard.writeText(u.toString());
      shareBtn.textContent = 'Ссылка скопирована';
      setTimeout(()=>shareBtn.textContent='🔗 Поделиться',1500);
    } catch {
      alert(u.toString());
    }
  });

  // Инициализация из URL (чтобы ссылка «поделиться» восстанавливала состояние)
  (function initFromQuery(){
    const q = new URLSearchParams(location.search);
    if (q.get('h')) { state.hours = clampHours(parseInt(q.get('h'),10)); hoursInput.value = state.hours; }
    if (q.get('k')) { state.kids = q.get('k'); kidsSel.value = state.kids; }
    if (q.get('d')) { state.dow = q.get('d'); dowSel.value = state.dow; }
    state.addons.a1 = q.get('a1')==='1'; add1.checked = state.addons.a1;
    state.addons.a2 = q.get('a2')==='1'; add2.checked = state.addons.a2;
    state.addons.a3 = q.get('a3')==='1'; add3.checked = state.addons.a3;

    // дефолты
    if (!hoursInput.value) { state.hours = 3; hoursInput.value = 3; }
    compute();
  })();
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