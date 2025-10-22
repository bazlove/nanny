// helpers
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const safe = fn => { try { fn && fn(); } catch (e) { console.error(`${fn.name||'init'} failed:`, e); } };

// запуск после готовности DOM — и каждая инициализация в try/catch
window.addEventListener('DOMContentLoaded', () => {
  safe(initHeroSlider);      // твой слайдер
  safe(initQuoteRotator);    // ротатор цитат (если вынесен в функцию)
  safe(initSlots);           // загрузка слотов (может падать — нам нельзя ломаться)
  safe(initAvailabilityBadge); // если есть отдельная функция для бейджа
});

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
      nav_services:'Услуги', nav_reviews:'Отзывы', nav_price:'Цена', nav_faq:'FAQ', nav_contact: "Контакты",
      city:'Нови-Сад',
      hero_title:'Надёжная няня в Нови-Саде — спокойно работайте из дома',
      hero_sub:'CPR/First Aid, фото-отчёт после визита, развивающие занятия, моторика по договорённости.',
      trust_safe:'🛡️ Безопасность', trust_report:'📷 Фото-отчёт', trust_no_screens:'🎲 Развитие без экранов', trust_short_slots:'🕒 Слоты 2–4 часа',
      btn_slots:'Проверить свободные слоты',
      hero_micro:'Опыт: воспитатель детсада и детский фитнес-тренер • 4.9★ по отзывам'
    },
    sr: {
      nav_services:'Usluge', nav_reviews:'Utisci', nav_price:'Cena', nav_faq:'FAQ', nav_contact: "Kontakt",
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

// ===== Hero: ротатор коротких цитат рядом с рейтингом =====
(function initQuoteRotator(){
  const el = document.getElementById('quoteRotator');
  if (!el) return;

  const quotes = [
    '«всегда вовремя, ребёнок спокоен»',
    '«без экранов, спокойная дисциплина»',
    '«всегда на связи, фото после визита»',
    '«мягко и бережно, но порядок есть»'
  ];

  // 1) Оборачиваем в контейнер фиксированной высоты и создаём второй слой
  const wrap = document.createElement('span');
  wrap.className = 'quote-wrap';
  el.parentNode.replaceChild(wrap, el);

  const a = el;                             // первый слой
  a.classList.add('quote','is-active');     // сразу активный
  wrap.appendChild(a);

  const b = a.cloneNode(true);              // второй слой
  b.removeAttribute('id');
  b.setAttribute('aria-hidden','true');
  b.classList.remove('is-active');
  wrap.appendChild(b);

  // 2) Кросс-фейд без изменения геометрии
  let i = 0, visible = a, hidden = b;
  setInterval(() => {
    i = (i + 1) % quotes.length;
    hidden.textContent = quotes[i];

    // плавная смена слоёв
    visible.classList.remove('is-active');
    hidden.classList.add('is-active');

    // меняем роли
    const tmp = visible; visible = hidden; hidden = tmp;
  }, 7000);
})();

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

// === SetBadge: меняем только текст и классы ===
window.setBadge = function setBadge(text, classes = []) {
  const badge = document.querySelector('#headerFreeBadge');
  const badgeText = badge ? badge.querySelector('.avail-text') : null;
  if (!badge || !badgeText) return;

  // сбрасываем только управляемые классы
  ['is-today','is-tomorrow','is-next','is-none','is-live']
    .forEach(c => badge.classList.remove(c));
  classes.forEach(c => badge.classList.add(c));

  badgeText.textContent = text;        // НЕ трогаем .dot → пульс сохраняется
  badge.style.display = 'inline-flex';
};

// === Вспомогалки для форматов времени ===
function safeStart(s) {
  if (s.startLabel) return s.startLabel;
  const d = s.startISO ? new Date(s.startISO) : new Date(s.startTs || 0);
  return isFinite(d) ? d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}) : '';
}
function safeEnd(s) {
  if (s.endLabel) return s.endLabel;
  const d = s.endISO ? new Date(s.endISO) : new Date(s.endTs || 0);
  return isFinite(d) ? d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}) : '';
}
function getStartTs(s) { return s.startTs ?? Date.parse(s.startISO || 0); }
function timeLabel(s)  { return `${safeStart(s)}–${safeEnd(s)}`; }

// === НОВАЯ ВЕРСИЯ updateBadge c сохранением .dot для пульса ===
window.updateBadge = function updateBadge(slots) {
  // 0) нормализуем вход
  const list = Array.isArray(slots) ? slots : [];
  if (!list.length) {
    setBadge('Свободно: по запросу', ['is-none']); // пульс отключаем
    return;
  }

  const now         = Date.now();
  const todayYMD    = new Date().toISOString().slice(0,10);
  const tomorrowYMD = new Date(now + 86400000).toISOString().slice(0,10);

  // 1) Сегодня
  const todaySlot = list
    .filter(s => (s.date || (s.startISO||'').slice(0,10)) === todayYMD)
    .sort((a,b) => getStartTs(a) - getStartTs(b))[0];

  if (todaySlot){
    setBadge(`Свободно сегодня ${timeLabel(todaySlot)}`, ['is-today','is-live']);
    return;
  }

  // 2) Завтра
  const tomorrowSlot = list
    .filter(s => (s.date || (s.startISO||'').slice(0,10)) === tomorrowYMD)
    .sort((a,b) => getStartTs(a) - getStartTs(b))[0];

  if (tomorrowSlot){
    setBadge(`Свободно завтра ${timeLabel(tomorrowSlot)}`, ['is-tomorrow','is-live']);
    return;
  }

  // 3) Ближайший далее
  const next = list
    .filter(s => getStartTs(s) > now)
    .sort((a,b) => getStartTs(a) - getStartTs(b))[0];

  if (next){
    const d   = new Date(next.startISO || getStartTs(next));
    const day = d.toLocaleDateString('ru-RU', { weekday:'short', day:'2-digit', month:'2-digit' });
    setBadge(`Ближайший слот: ${day} | ${timeLabel(next)}`, ['is-next','is-live']);
    return;
  }

  // 4) Иначе — по запросу
  setBadge('Свободно: по запросу', ['is-none']);
};

/* ===== Slots: fetch + render + header badge (final) ===== */
(function initSlots(){
  const API_SLOTS_URL =
    'https://script.google.com/macros/s/AKfycbw1sCLUCTPlaiHMFNsqPfgjTH6iCHp391m1lwYRX0g5AO7_Zme1uySp8jgQm9bsaR8EnQ/exec';

  // 2) DOM-ссылки
  const wrap  = document.querySelector('#slotsList');
  const hasList = !!wrap;

  const badge = document.querySelector('#headerFreeBadge');
  const badgeText = badge ? badge.querySelector('.avail-text') : null;

  // 3) Безопасный setter для бейджа (не трогаем .dot и разметку)
  const setB = (typeof window.setBadge === 'function')
    ? window.setBadge
    : function(text, classes){
        if (!badge || !badgeText) return;
        // сброс только контролируемых классов, база остаётся
        ['is-today','is-tomorrow','is-next','is-none','is-live']
          .forEach(c => badge.classList.remove(c));
        (classes || []).forEach(c => badge.classList.add(c));
        badgeText.textContent = text;
        badge.style.display = 'inline-flex';
      };

  // 4) Забираем управление бейджем и ставим статус загрузки
  if (badge) {
    window.__SLOTS_BADGE__ = 'slots';             // флаг владения
    setB('Проверяю свободные слоты…', ['is-live']);
  }

  // 5) Запрашиваем слоты
  fetch(API_SLOTS_URL, { cache: 'no-store', mode: 'cors' })
    .then(r => r.json())
    .then(data => {
      const raw = Array.isArray(data?.slots) ? data.slots
                : Array.isArray(data) ? data : [];
      window.__freeSlots = raw;

      // Обновляем бейдж «умным» алгоритмом, если он есть в файле
      if (typeof window.updateBadge === 'function') {
        window.updateBadge(raw);
      } else {
        // простой фоллбек
        if (raw.length) {
          const first = raw[0];
          setB(`Ближайший слот ${first.startLabel}–${first.endLabel}`, ['is-next']);
        } else {
          setB('Свободно: по запросу', ['is-none']);
        }
      }

      // Рендер списка по дням — только если на странице есть контейнер
      if (!hasList) return;
      if (!raw.length) {
        wrap.innerHTML = '<p class="muted">Свободных слотов не найдено.</p>';
        return;
      }

      const days = (typeof window.groupByDate === 'function')
        ? window.groupByDate(raw)
        : fallbackGroupByDate(raw);

      const html = days.slice(0, 5)
        .map(d => (typeof window.cardHTML === 'function'
          ? window.cardHTML(d.date, d.items)
          : fallbackCardHTML(d.date, d.items)))
        .join('');

      wrap.innerHTML = html;
    })
    .catch(err => {
      console.warn('Slots API error:', err);
      if (hasList) {
        wrap.innerHTML = '<p class="error">Слоты временно недоступны. Напишите мне.</p>';
      }
      setB('Свободно: по запросу', ['is-none']); // не ломаем разметку бейджа
    });

  // --- компактные фоллбеки на случай отсутствия утилит в файле ---
  function fallbackGroupByDate(raw){
    const map = {};
    raw.forEach(s => { (map[s.date] = map[s.date] || []).push(s); });
    return Object.keys(map).sort().map(date => ({ date, items: map[date] }));
  }
  function fallbackCardHTML(date, items){
    const lis = items.map(s => `<li>${s.startLabel}–${s.endLabel}</li>`).join('');
    return `<section class="slot-day"><h4>${date}</h4><ul>${lis}</ul></section>`;
  }
})();

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

/* ===== FAQ (финальная версия) ===== */
(function () {
  const list = document.querySelector('.faq-list');
  if (!list) return;

  const HEADER_OFFSET = 80; // ваш фикс-хедер (px). при необходимости поправьте

  function openItem(item, withScroll) {
    const btn   = item.querySelector('.faq-q');
    const panel = item.querySelector('.faq-a');
    if (!btn || !panel) return;

    // закрыть остальные
    list.querySelectorAll('.faq-item.is-open').forEach(it => {
      if (it !== item) closeItem(it);
    });

    item.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');

    // ставим явную высоту = контент
    const inner = panel.firstElementChild;
    const target = inner ? inner.scrollHeight : panel.scrollHeight;
    panel.style.height = target + 'px';

    // скроллим так, чтобы шапка вопроса была под фикс-хедером
    if (withScroll) {
      const y = item.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET - 6;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  function closeItem(item) {
    const btn   = item.querySelector('.faq-q');
    const panel = item.querySelector('.faq-a');
    if (!btn || !panel) return;

    item.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    panel.style.height = '0px';
  }

  // пересчитать высоту открытых при ресайзе
  function recalcOpenHeights() {
    list.querySelectorAll('.faq-item.is-open .faq-a').forEach(panel => {
      const inner = panel.firstElementChild;
      const target = inner ? inner.scrollHeight : panel.scrollHeight;
      panel.style.height = target + 'px';
    });
  }
  window.addEventListener('resize', recalcOpenHeights);

  // обработчики по элементам
  list.querySelectorAll('.faq-item').forEach(item => {
    const btn   = item.querySelector('.faq-q');
    const copy  = item.querySelector('.faq-q__copy');

    // клик по вопросу
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      if (isOpen) closeItem(item);
      else openItem(item, true);

      // обновляем hash для deep-link
      if (btn.id) history.replaceState(null, '', '#' + btn.id);
    });

    // клавиатура (Space / Enter)
    btn.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
        e.preventDefault();
        btn.click();
      }
    });

    // копирование ссылки
    copy?.addEventListener('click', e => {
      e.stopPropagation();
      const hash = btn.id || item.id || '';
      const url  = location.origin + location.pathname + (hash ? '#' + hash : '');
      navigator.clipboard.writeText(url).then(() => {
        copy.classList.add('copied');
        setTimeout(() => copy.classList.remove('copied'), 1200);
      });
    });
  });

  // открыть по хэшу (если пришли по ссылке)
  function openFromHash() {
    const id = decodeURIComponent(location.hash.replace('#', ''));
    if (!id) return;
    const el = document.getElementById(id);
    const item = el ? el.closest('.faq-item') : null;
    if (item) openItem(item, true);
  }
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
})();

/* ===== Slots: fetch + render per-day cards + header badge ===== */
(function initSlots(){
  const API_SLOTS_URL = 'https://script.google.com/macros/s/AKfycbw1sCLUCTPlaiHMFNsqPfgjTH6iCHp391m1lwYRX0g5AO7_Zme1uySp8jgQm9bsaR8EnQ/exec';
  const wrap  = document.querySelector('#slotsList');
  const badge = document.querySelector('#headerFreeBadge') || document.getElementById('availability-badge');
  const badgeText = badge?.querySelector('.avail-text') || badge?.querySelector('.txt') || badge;

  function setBadge(text, classes = []) {
    if (!badge || !badgeText) return;
    badge.classList.remove('is-today','is-tomorrow','is-next','is-none','is-live');
    classes.forEach(c => badge.classList.add(c));
    badgeText.textContent = text;
    badge.style.display = 'inline-flex';
  }

  if (!wrap) return;

  // ---- helpers -------------------------------------------------
  const pad2 = n => String(n).padStart(2,'0');
  const timeFromISO = iso => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  };
  const fmtDateRUshort = ymd => {
    // ymd: 'YYYY-MM-DD'
    if (!ymd) return '';
    const [y,m,d] = ymd.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m-1, d));
    // пример: "вт, 15.10"
    return dt.toLocaleDateString('ru-RU', { weekday:'short', day:'2-digit', month:'2-digit' });
  };

  const safeStart = s => s.startLabel || timeFromISO(s.startISO);
  const safeEnd   = s => s.endLabel   || timeFromISO(s.endISO);

  const groupByDate = (slots) => {
    const map = new Map();
    for (const s of slots) {
      const key = s.date || (s.startISO ? s.startISO.slice(0,10) : 'unknown');
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    // сортируем интервалы внутри дня по началу
    for (const arr of map.values()) {
      arr.sort((a,b) => (a.startTs ?? Date.parse(a.startISO||0)) - (b.startTs ?? Date.parse(b.startISO||0)));
    }
    // вернём как массив [{date, items:[]}] — удобно сортировать по дате
    const out = Array.from(map.entries()).map(([date, items]) => ({ date, items }));
    out.sort((a,b) => a.date.localeCompare(b.date));
    return out;
  };

  const makeTimesLine = (items) => items
    .map(s => `${safeStart(s)}–${safeEnd(s)}`)
    .join(', ');

  const cardHTML = (date, items) => {
    const dayLabel = (items[0] && items[0].dayLabel) ? items[0].dayLabel : fmtDateRUshort(date);
    const times    = makeTimesLine(items);
    const href     = '#contact'; // при желании подставьте сюда ссылку на форму
    return `
      <div class="slot-card">
        <div class="slot-date">${dayLabel}</div>
        <div class="slot-time">${times}</div>
        <a class="slot-cta" href="${href}">Запросить</a>
      </div>
    `;
  };

  // ---- load & render -------------------------------------------
  fetch(API_SLOTS_URL, { cache: 'no-store' })
    .then(r => r.json())
    .then(data => {
      const raw = Array.isArray(data?.slots) ? data.slots : (Array.isArray(data) ? data : []);

      window.__freeSlots = raw;

      updateBadge(raw);

      if (!raw.length) {
        wrap.innerHTML = '<p class="muted">Свободных слотов не найдено.</p>';
        return;
      }

      const days = groupByDate(raw);     // [{date, items:[...]}, ...]
      const topDays = days.slice(0, 5);  // показываем первые 5 дней (по возрастанию)

      wrap.innerHTML = topDays.map(d => cardHTML(d.date, d.items)).join('');
    })
    catch(err){
  console.warn('Slots API error:', err);
  wrap.innerHTML = '<p class="error">Слоты временно недоступны. Напишите мне.</p>';
  setBadge('Свободно: по запросу', ['is-none']);
    }
  );
})();

// Active menu on scroll
(function(){
  const links = [...document.querySelectorAll('.header-nav a[href^="#"]')];
  const map = new Map();
  links.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, a);
  });
  if (!map.size) return;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      const link = map.get(e.target);
      if (!link) return;
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    });
  }, { rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))||64}px 0px -65% 0px`, threshold: 0.01 });

  map.forEach((_, sec) => io.observe(sec));
})();

/* ===== Reviews: лёгкая бесшовная «маркиза» (CSS-анимация) =============== */
(function initReviewsMarquee(){
  const marquees = document.querySelectorAll('.rv-marquee');
  if (!marquees.length) return;

  const mrm = matchMedia('(prefers-reduced-motion: reduce)');

  marquees.forEach(mq => {
    const track = mq.querySelector('.rv-track');
    if (!track || track.dataset.marqueeReady) return;

    /* не даём карточкам переноситься во 2-ю строку даже при конфликтных стилях */
    track.style.display   = 'flex';
    track.style.flexWrap  = 'nowrap';
    track.style.alignItems= 'stretch';

    /* --- дублируем ТОЛЬКО содержимое дорожки (а не вторую .rv-track) --- */
    const cloneChildrenOnce = () => {
      const frag = document.createDocumentFragment();
      Array.from(track.children).forEach(node => frag.appendChild(node.cloneNode(true)));
      track.appendChild(frag);
    };

    if (!track.dataset.cloned) {
      cloneChildrenOnce();            // получаем «оригинал + клон»
      track.dataset.cloned = '1';
    }

    /* гарантируем, что ширины хватит минимум на 2× viewport (без бесконечного while) */
    const needMinWidth = () => track.scrollWidth < mq.clientWidth * 2;
    let safety = 0;
    while (needMinWidth() && safety < 3) { // максимум три до-дублирования
      cloneChildrenOnce();
      safety++;
    }

    /* — Доступность — */
    const pause = () => track.style.animationPlayState = 'paused';
    const play  = () => track.style.animationPlayState = '';

    mq.addEventListener('mouseenter', pause);
    mq.addEventListener('mouseleave', play);
    mq.addEventListener('focusin',   pause);
    mq.addEventListener('focusout',  play);

    /* Уважение к prefers-reduced-motion */
    const applyReduced = () => { track.style.animation = mrm.matches ? 'none' : ''; };
    applyReduced();
    mrm.addEventListener?.('change', applyReduced);

    track.dataset.marqueeReady = '1';
  });
})();

// ====== CONTACT ======
(function contactInit(){
  const tg   = document.getElementById('ctaTg');
  const vb   = document.getElementById('ctaViber');
  const tel  = document.getElementById('ctaTel');

  // ——— ВПИШИ свой номер (без плюса), а также TG-юзернейм/линк ———
  const phoneDigits = '381XXXXXXXXX';         // пример: 381641234567
  if (tg)  tg.href  = 'https://t.me/yourusername';
  if (vb)  vb.href  = `viber://chat?number=%2B${phoneDigits}`;
  if (tel) tel.href = `tel:+${phoneDigits}`;

  // ——— форма ———
  const form = document.getElementById('contactForm');
  const note = document.getElementById('contactNotice');
  const name = document.getElementById('cname');
  const cont = document.getElementById('ccontact');
  const time = document.getElementById('ctime');
  const msg  = document.getElementById('cmsg');
  const eName= document.getElementById('err-name');
  const eCont= document.getElementById('err-contact');
  let t0 = Date.now();

  // Подсветка чекбокса
(function attachAgreeValidation(){
  const form      = document.getElementById('contactForm');
  if (!form) return;

  const agree     = form.querySelector('#cagree');     // чекбокс

  // снимаем ошибку при изменении состояния чекбокса
  agree?.addEventListener('change', () => {
    agree.classList.remove('is-error');
    // agreeWrap?.classList.remove('is-error');
  });

  form.addEventListener('submit', (e) => {
    // если чекбокс обязателен:
    if (!agree?.checked) {
      e.preventDefault();
      // подсвечиваем ИМЕННО чекбокс
      agree.classList.add('is-error');
      agree.focus();
      return;
    }
  });
})();

  
  // утилиты
  const setErr = (el, small, on) => {
    el.classList.toggle('invalid', on);
    el.setAttribute('aria-invalid', on ? 'true' : 'false');
    if (small) small.hidden = !on;
  };
  [name,cont].forEach(i => i.addEventListener('input', ()=> setErr(i, i===name?eName:eCont, !i.value.trim())));

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();

    // honeypot/time-trap
    if (form.website?.value) return;
    if (Date.now() - t0 < 1200) return;

    const badName = name.value.trim().length < 3;   // ← минимум 3 символа
    const badCont = !cont.value.trim();             // как было

// setErr оставляем: он ставит aria-invalid и .invalid (подсказки под полем u тебя скрываются модулем inFieldErrors)
setErr(name, eName, badName);
setErr(cont, eCont, badCont);

if (badName || badCont) {
  (badName ? name : cont).focus();
  return;
}

    // можно доб./изменить endpoint Google Apps Script
    const fd = new FormData(form);
    try{
      const res = await fetch('https://script.google.com/macros/s/YOUR_DEPLOY_ID/exec', { method:'POST', body:fd });
      if (!res.ok) throw 0;
      note.textContent = 'Спасибо! Я отвечу в ближайшее время.';
      form.reset(); t0 = Date.now();
      window.gtag?.('event','contact_form_submit',{success:true});
    }catch{
      note.textContent = 'Не получилось отправить. Напишите мне в Telegram.';
      window.gtag?.('event','contact_form_submit',{success:false});
    }
  });
})();

(function(){
  // Ключ в localStorage: версия меняется, если поменяешь политику
  const KEY = 'cookieConsent.v1';

  const banner  = document.getElementById('cookie-banner');
  const accept  = document.getElementById('cookie-accept');
  const decline = document.getElementById('cookie-decline');
  const manage  = document.getElementById('cookie-manage');

  // защитные функции — не упадут, если gtag нет
  function gaConsent(state){
    // Рекомендуемый способ GA4 объявить/обновить согласие
    window.gtag?.('consent', 'update', { analytics_storage: state });
  }

  function show(){ banner.hidden = false; }
  function hide(){ banner.hidden = true; }

  function save(state){
    localStorage.setItem(KEY, state);
    gaConsent(state === 'granted' ? 'granted' : 'denied');
  }

  // Показ при первом визите
  const saved = localStorage.getItem(KEY);
  if (!saved){ show(); } else { gaConsent(saved === 'granted' ? 'granted' : 'denied'); }

  accept?.addEventListener('click', () => { save('granted'); hide(); });
  decline?.addEventListener('click', () => { save('denied');  hide(); });
  // Любая кнопка/ссылка "Настройки cookie"
  manage?.addEventListener('click', () => show());
})();

/* === PHONE MASK (+381 XX XXX XX XX) & AUTOFILL NEAREST SLOT ============= */
(function contactEnhance(){
  const phoneInput = document.getElementById('ccontact');
  const timeInput  = document.getElementById('ctime');

  /* ---------- 1) Маска телефона (Сербия) ---------- */
  function formatSerbiaPhone(raw){
    // оставляем только цифры
    let d = String(raw).replace(/\D+/g, '');
    // если ввели 00... → считаем как международный
    if (d.startsWith('00')) d = d.slice(2);
    // если ввели 8... (часто так копируют), не трогаем — пользователь мог писать не номер
    // маску включаем только когда явно идём в сторону +381
    if (!d.startsWith('381')) {
      // если просто печатают цифры (начинает с 3/38), дадим возможность дойти до 381
      if (d.length < 3) return '+' + d;
      // иначе не навязываем маску
      return raw;
    }
    // убираем сам код страны
    d = d.slice(3);
    const p1 = d.slice(0,2);
    const p2 = d.slice(2,5);
    const p3 = d.slice(5,7);
    const p4 = d.slice(7,9);

    let out = '+381';
    if (p1) out += ' ' + p1;
    if (p2) out += ' ' + p2;
    if (p3) out += ' ' + p3;
    if (p4) out += ' ' + p4;
    return out;
  }

  function maybeMaskPhone(e){
    if (!phoneInput) return;
    const v = phoneInput.value.trim();
    // Маску применяем, когда пользователь печатает цифры/плюс (а не, например, @username)
    if (/^[+\d][\d\s()-]*$/.test(v)) {
      const caretEnd = phoneInput.selectionEnd;
      phoneInput.value = formatSerbiaPhone(v);
      // упрощённо: ставим курсор в конец (хватает для большинства кейсов)
      phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
    }
  }

  phoneInput?.addEventListener('input', maybeMaskPhone);
  phoneInput?.addEventListener('blur',  maybeMaskPhone);

  /* ---------- 2) Автозаполнение «Желаемой даты/времени» ближайшим слотом ---------- */
  function formatDayRU(date){
    // пн, 14.10
    return date.toLocaleDateString('ru-RU', { weekday:'short', day:'2-digit', month:'2-digit' });
  }
  function getNearestSlotFromGlobal(){
    // если на странице уже есть модуль слотов и он положил слоты глобально
    const arr = Array.isArray(window.__freeSlots) ? window.__freeSlots : null;
    if (!arr || !arr.length) return null;
    const now = Date.now();
    const getTs = s => s.startTs ?? Date.parse(s.startISO || 0);
    const sorted = arr
      .filter(s => getTs(s) > now)
      .sort((a,b)=> getTs(a) - getTs(b));
    const s = sorted[0];
    if (!s) return null;

    const labelDay  = s.dayLabel || formatDayRU(new Date(getTs(s)));
    const startText = s.startLabel || (s.startISO ? new Date(s.startISO).toTimeString().slice(0,5) : '');
    const endText   = s.endLabel   || (s.endISO   ? new Date(s.endISO).toTimeString().slice(0,5)   : '');
    return `${labelDay} · ${startText}–${endText}`;
  }

  function getNearestSlotFromBadge(){
    const b = document.querySelector('#headerFreeBadge');
    if (!b) return null;
    const t = b.textContent.toLowerCase().trim();
    // варианты:
    // «Свободно сегодня 09:00–16:00»
    // «Свободно завтра 09:00–16:00»
    // «Ближайший слот: вт, 14.10 • 09:00–16:00»
    const timeRange = (t.match(/\b(\d{2}:\d{2}–\d{2}:\d{2})\b/)||[])[1];

    if (t.includes('сегодня') && timeRange){
      const d = new Date();
      return `${formatDayRU(d)} · ${timeRange}`;
    }
    if (t.includes('завтра') && timeRange){
      const d = new Date(Date.now() + 86400000);
      return `${formatDayRU(d)} · ${timeRange}`;
    }
    // «вт, 14.10 • 09:00–16:00»
    const day = (t.match(/([а-я]{2},?\s*\d{1,2}\.\d{1,2})/)||[])[1];
    if (day && timeRange){
      // приводим «вт, 14.10» → «вт, 14.10»
      return `${day.replace(/\s+/g,' ')} · ${timeRange}`;
    }
    return null;
  }

  function autofillPreferredTime(){
    if (!timeInput || timeInput.value.trim()) return; // уже заполнено вручную
    let label = getNearestSlotFromGlobal();
    if (!label) label = getNearestSlotFromBadge();
    if (label) timeInput.value = label;
  }

  // пробуем сразу и после макро-тика (на случай, если модуль слотов подложит данные асинхронно)
  autofillPreferredTime();
  setTimeout(autofillPreferredTime, 600);
})();

// === Клик по "Запросить" в карточке слота → заполнить форму и проскроллить к ней
(function attachSlotPrefill(){
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.slot-cta');
    if (!btn) return;

    const card = btn.closest('.slot-card');
    if (!card) return;

    // Текст из карточки
    const dateTxt = (card.querySelector('.slot-date')?.textContent || '').trim();
    const timeTxt = (card.querySelector('.slot-time')?.textContent || '').trim();
    if (!dateTxt && !timeTxt) return;

    // Строка для поля
    const wishValue = [dateTxt, timeTxt].filter(Boolean).join(' • ');

    // Находим поле «Желаемая дата/время»
    const wishInput =
      document.querySelector('#ctime') ||                                             // ← ваш id
      document.querySelector('#contact input[name="preferred_time"]') ||              // ← ваше name
      document.querySelector('#contact input[name="wish"]') ||
      document.querySelector('#contact input#wish') ||
      document.querySelector('#contact input#contact-wish') ||
      document.querySelector('#contact input#wishTime') ||
      Array.from(document.querySelectorAll('#contact input[type="text"]'))
        .find(i => (i.placeholder || '').toLowerCase().startsWith('напр'));

    if (wishInput) {
      ev.preventDefault();                      // теперь можно — слушатель не passive
      wishInput.value = wishValue;
      wishInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Плавный скролл к форме + фокус
    const formBlock = document.getElementById('contact');
    if (formBlock) {
      formBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => wishInput?.focus(), 350);
    }
  }); // ← без { passive:true }
})();

// === In-field error helper ===

(function inFieldErrors() {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  // какие поля валидируем таким способом
  const fields = [
    { sel: '#cname',    err: '#err-name',    msg: 'Укажите ваше имя', minLen: 3 },
    { sel: '#ccontact', err: '#err-contact', msg: 'Укажите ваш телефон или @username' }
  ];

  const setInFieldError = (fld, msg) => {
    const wrap = fld.closest('.fld');
    if (!wrap) return;
    if (!fld.dataset.oldPh) fld.dataset.oldPh = fld.placeholder || '';
    wrap.classList.add('infield-err');
    fld.value = '';
    fld.placeholder = msg;
    fld.setAttribute('aria-invalid', 'true');
  };

  const clearInFieldError = (fld) => {
    const wrap = fld.closest('.fld');
    if (!wrap) return;
    wrap.classList.remove('infield-err');
    fld.placeholder = fld.dataset.oldPh || '';
    fld.removeAttribute('aria-invalid');
  };

  // при отправке — если поле пустое/слишком короткое, показываем «ошибку в поле»
  form.addEventListener('submit', (e) => {
    let bad = false;
    fields.forEach((f) => {
      const input = form.querySelector(f.sel);
      const hint  = form.querySelector(f.err);
      if (!input) return;

      const v = input.value.trim();
      const tooShort = f.minLen ? v.length < f.minLen : false;

      if (!v || tooShort) {
        e.preventDefault();
        setInFieldError(input, f.msg);
        if (hint) hint.hidden = true;
        if (!bad) input.focus();
        bad = true;
      }
    });
  });

  // при вводе/блюре — сброс/повтор ошибки
  fields.forEach((f) => {
    const input = form.querySelector(f.sel);
    const hint  = form.querySelector(f.err);
    if (!input) return;

    input.addEventListener('input', () => {
      clearInFieldError(input);
      if (hint) hint.hidden = true;
    });

    input.addEventListener('blur', () => {
      const v = input.value.trim();
      const tooShort = f.minLen ? v.length < f.minLen : false;
      if (!v || tooShort) {
        setInFieldError(input, f.msg);
        if (hint) hint.hidden = true;
      }
    });
  });
})();

/* === HERO slider ===================================================== */
(function initHeroSlider(){
  function boot(){
    const root = document.querySelector('.hero-slider');
    if (!root) return;

    const track  = root.querySelector('.hs-track');
    const slides = [...root.querySelectorAll('.hs-slide')];
    const prev   = root.querySelector('.hs-nav.prev');
    const next   = root.querySelector('.hs-nav.next');
    const dots   = [...root.querySelectorAll('.hs-dot')];
    const mrm    = matchMedia('(prefers-reduced-motion: reduce)');

    let i = 0, timer = null, startX = 0, dx = 0;

    function go(n){
      i = (n + slides.length) % slides.length;
      track.style.transform = `translate3d(${-i*100}%,0,0)`;
      slides.forEach((s,idx)=> s.classList.toggle('is-active', idx===i));
      dots.forEach((d,idx)=>{
        d.classList.toggle('is-active', idx===i);
        d.setAttribute('aria-selected', idx===i ? 'true' : 'false');
      });
    }
    function play(){ if(!mrm.matches){ stop(); timer=setInterval(()=>go(i+1),5000);} }
    function stop(){ if(timer){ clearInterval(timer); timer=null; } }

    prev?.addEventListener('click', ()=>{ go(i-1); play(); });
    next?.addEventListener('click', ()=>{ go(i+1); play(); });
    dots.forEach((d,idx)=> d.addEventListener('click', ()=>{ go(idx); play(); }));

    ['mouseenter','focusin'].forEach(ev => root.addEventListener(ev, stop));
    ['mouseleave','focusout'].forEach(ev => root.addEventListener(ev, play));

    root.addEventListener('pointerdown', e => { startX=e.clientX; dx=0; root.setPointerCapture(e.pointerId); stop(); });
    root.addEventListener('pointermove',  e => { if(!startX) return; dx=e.clientX-startX; });
    root.addEventListener('pointerup',    () => { if(Math.abs(dx)>40) go(i + (dx<0?1:-1)); startX=0; dx=0; play(); });

    root.tabIndex = 0; // фокусируемый регион карусели
    root.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(i-1); play(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(i+1); play(); }
    });

    go(0); play();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

// Фильтр "Все / Базовые / Дополнительные"
(() => {
  const root = document.querySelector('#services');
  if (!root) return;

  const chips = root.querySelectorAll('.svc-chip');
  const cards = root.querySelectorAll('.svc-card');

  chips.forEach(ch => ch.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('is-active'));
    ch.classList.add('is-active');

    const f = ch.dataset.filter;
    cards.forEach(card => {
      const tier = card.dataset.tier; // "base" | "extra"
      card.style.display =
        f === 'all' ? '' :
        (f === tier ? '' : 'none');
    });
  }));
})();






























