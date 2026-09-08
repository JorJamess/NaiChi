// ===== Birchdale dashboard — interactivity =====

// The in-game date is intentionally fixed: Birchdale's calendar is a fictional
// game world, so only the clock ticks in real time (see initClock). Named here
// instead of buried as a literal string so the intent is explicit.
const CONFIG = {
  gameDateLabel: 'May 20, 2024',
  gameSeason: 'Spring',
};

const STORAGE_KEYS = {
  theme: 'naichi:theme',
  activeNav: 'naichi:activeNav',
};

const DATA = {
  tasks: [
    { label: 'Reach a 5-star farm rating', current: 4, total: 5, color: '' },
    { label: 'Plant 100 wheat stalks', current: 68, total: 100, color: 'blue' },
    { label: 'Collect every build recipe', current: 210, total: 602, color: 'red' },
    { label: 'Catch every fish', current: 43, total: 80, color: '' },
  ],
  collections: [
    { icon: '🐟', label: 'Fish', current: 43, total: 80 },
    { icon: '🦋', label: 'Bugs', current: 38, total: 80 },
    { icon: '🌾', label: 'Recipes', current: 210, total: 602 },
    { icon: '🛠️', label: 'Tools', current: 12, total: 47 },
  ],
  goal: { text: 'Catch every fish', current: 43, total: 80 },
  neighbors: [
    { name: 'Elsa', icon: '🦌', bg: '#FFEC89' },
    { name: 'Astrid', icon: '🐰', bg: '#E7ECF7' },
    { name: 'Sixten', icon: '🦊', bg: '#F3D6CE' },
    { name: 'Nils', icon: '🐻', bg: '#D9E2F5' },
    { name: 'Greta', icon: '🐿️', bg: '#FCE7A6' },
    { name: 'Olle', icon: '🦔', bg: '#E7ECF7' },
    { name: 'Signe', icon: '🐤', bg: '#F3D6CE' },
    { name: 'Erik', icon: '🐑', bg: '#FCE7A6' },
  ],
  notes: [
    { theme: 'yellow', label: 'Ideas', items: ['Build a market stall by the farmhouse', 'Plant an apple orchard behind the barn'] },
    { theme: 'red', label: 'Upgrade the shed', text: 'Need to sell more wheat to expand the store' },
    { theme: 'blue', label: 'Dreaming of…', text: 'A cozy summer house by the lake with its own dock' },
  ],
};

document.addEventListener('DOMContentLoaded', () => {
  initToast();
  initTheme();
  renderTasks();
  renderCollections();
  renderNeighbors();
  renderNotes();
  initNotesSearch();
  initNav();
  initCalendar();
  initProgressBars();
  initButtons();
  initRipple();
  initClock();
  initReveal();
});

/* ---------- Small helpers ---------- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* storage unavailable */ }
}

/* ---------- Toast helper ---------- */
function initToast() {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.id = 'toast';
  document.body.appendChild(toast);
}

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---------- Dark mode ---------- */
function applyTheme(theme) {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    if (btn) {
      btn.textContent = '☀️';
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', 'Switch to light mode');
    }
  } else {
    root.removeAttribute('data-theme');
    if (btn) {
      btn.textContent = '🌙';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Switch to dark mode');
    }
  }
}

function initTheme() {
  const saved = safeGet(STORAGE_KEYS.theme);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    safeSet(STORAGE_KEYS.theme, next);
  });
}

/* ---------- Dynamic rendering (tasks / collections / neighbors / notes) ---------- */
function renderTasks() {
  const list = document.getElementById('tasksList');
  if (!list) return;
  list.innerHTML = DATA.tasks.map((t) => {
    const pct = Math.round((t.current / t.total) * 100);
    const colorClass = t.color ? ` ${t.color}` : '';
    return `
      <div class="task">
        <div class="task-top"><span>${escapeHtml(t.label)}</span><span class="count">${t.current} / ${t.total}</span></div>
        <div class="bar"><div class="bar-fill${colorClass}" style="width:${pct}%"></div></div>
      </div>`;
  }).join('');
}

function renderCollections() {
  const row = document.getElementById('collectRow');
  const goal = document.getElementById('goalBox');
  if (row) {
    row.innerHTML = DATA.collections.map((c) => `
      <div class="collect-item"><span class="ic">${c.icon}</span><span class="num">${c.current}/${c.total}</span><span class="lab">${escapeHtml(c.label)}</span></div>
    `).join('');
  }
  if (goal) {
    goal.innerHTML = `
      <span class="txt">Goal: ${escapeHtml(DATA.goal.text)}</span>
      <span class="sub">${DATA.goal.current} / ${DATA.goal.total}</span>
    `;
  }
}

function renderNeighbors() {
  const wrap = document.getElementById('neighborsList');
  if (!wrap) return;
  wrap.innerHTML = DATA.neighbors.map((n) => `
    <div class="neighbor"><div class="avatar" style="background:${n.bg}">${n.icon}</div><div class="name">${escapeHtml(n.name)}</div></div>
  `).join('');

  wrap.querySelectorAll('.neighbor').forEach((el) => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const name = el.querySelector('.name')?.textContent || 'Neighbor';
      showToast(`Visiting ${name}'s house`);
    });
  });
}

function renderNotes(filterText) {
  const wrap = document.getElementById('notesRow');
  const empty = document.getElementById('notesEmpty');
  if (!wrap) return;

  const q = (filterText || '').trim().toLowerCase();
  const filtered = DATA.notes.filter((n) => {
    if (!q) return true;
    const haystack = [n.label, n.text, ...(n.items || [])].join(' ').toLowerCase();
    return haystack.includes(q);
  });

  wrap.innerHTML = filtered.map((n) => {
    const body = n.items
      ? `<ul>${n.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`
      : `<p>${escapeHtml(n.text)}</p>`;
    return `<div class="note ${n.theme}"><p class="note-label">${escapeHtml(n.label)}</p>${body}</div>`;
  }).join('');

  if (empty) empty.hidden = filtered.length !== 0;
}

function initNotesSearch() {
  const input = document.getElementById('notesSearch');
  if (!input) return;
  input.addEventListener('input', () => renderNotes(input.value));
}

/* ---------- Sidebar navigation: filters the dashboard cards ---------- */
function applyNavFilter(key) {
  document.querySelectorAll('[data-section]').forEach((card) => {
    const show = key === 'home' || card.dataset.section === key;
    card.hidden = !show;
    if (show) card.classList.add('in'); // skip the scroll-reveal wait when a section is switched to
  });
}

function setActiveNav(key) {
  document.querySelectorAll('.navlink').forEach((link) => {
    const isActive = link.dataset.nav === key;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  applyNavFilter(key);
}

function initNav() {
  const links = document.querySelectorAll('.navlink');
  const validKeys = new Set(Array.from(links).map((l) => l.dataset.nav));
  const saved = safeGet(STORAGE_KEYS.activeNav);
  setActiveNav(validKeys.has(saved) ? saved : 'home');

  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const key = link.dataset.nav;
      setActiveNav(key);
      safeSet(STORAGE_KEYS.activeNav, key);
      showToast(`Showing ${link.textContent.trim()}`);
    });
  });
}

/* ---------- Mini calendar (real month grid) ---------- */
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

let calState = { year: 2024, month: 4, todayDate: 20 }; // month is 0-indexed (4 = May), matches CONFIG.gameDateLabel

function initCalendar() {
  const head = document.querySelector('.mini-cal-head');
  const grid = document.querySelector('.mini-cal-grid');
  if (!head || !grid) return;

  head.innerHTML = `
    <button type="button" data-dir="-1" aria-label="Previous month">‹</button>
    <span class="cal-label"></span>
    <button type="button" data-dir="1" aria-label="Next month">›</button>
  `;

  head.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = parseInt(btn.dataset.dir, 10);
      calState.month += dir;
      if (calState.month < 0) { calState.month = 11; calState.year--; }
      if (calState.month > 11) { calState.month = 0; calState.year++; }
      renderCalendar();
    });
  });

  renderCalendar();
}

function renderCalendar() {
  const label = document.querySelector('.cal-label');
  const grid = document.querySelector('.mini-cal-grid');
  if (!label || !grid) return;

  const { year, month } = calState;
  label.textContent = `${MONTH_NAMES[month]} ${year}`;

  // Clear previous day cells (keep the 7 weekday labels)
  grid.querySelectorAll('.day').forEach(el => el.remove());

  const firstOfMonth = new Date(year, month, 1);
  // JS getDay(): 0=Sun..6=Sat -> convert to Monday-first index (0=Mon..6=Sun)
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstWeekday - 1; i >= 0; i--) {
    cells.push({ n: daysInPrevMonth - i, muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ n: d, muted: false });
  }
  while (cells.length % 7 !== 0 || cells.length < 35) {
    cells.push({ n: cells.length - (firstWeekday + daysInMonth) + 1, muted: true });
  }

  const isCurrentShownMonth = (year === 2024 && month === 4);

  cells.forEach(cell => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'day' + (cell.muted ? ' muted' : '');
    if (!cell.muted && isCurrentShownMonth && cell.n === calState.todayDate) {
      btn.classList.add('today');
    }
    btn.textContent = cell.n;
    if (!cell.muted) {
      btn.addEventListener('click', () => {
        if (isCurrentShownMonth) {
          calState.todayDate = cell.n;
          renderCalendar();
        }
        showToast(`${MONTH_NAMES[month]} ${cell.n}, ${year} selected`);
      });
    }
    grid.appendChild(btn);
  });
}

/* ---------- Animate task progress bars on load ---------- */
function initProgressBars() {
  document.querySelectorAll('.bar-fill').forEach(bar => {
    const target = bar.style.width || '0%';
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      setTimeout(() => { bar.style.width = target; }, 150);
    });
  });
}

/* ---------- Buttons: map & invite (neighbor clicks are bound in renderNeighbors) ---------- */
function initButtons() {
  const mapBtn = document.querySelector('.map-btn');
  if (mapBtn) {
    mapBtn.addEventListener('click', () => showToast('🌿 Opening the Birchdale map…'));
  }

  const inviteBtn = document.querySelector('.invite-btn');
  if (inviteBtn) {
    inviteBtn.addEventListener('click', () => showToast('🌱 Invitation sent to a new neighbor!'));
  }

  document.querySelectorAll('.see-all').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Showing all items in this list');
    });
  });
}

/* ---------- Ripple effect on buttons ---------- */
function initRipple() {
  document.querySelectorAll('.map-btn, .invite-btn, .mini-cal-head button').forEach(btn => {
    btn.style.position = btn.style.position || 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.4;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* ---------- Live clock in hero ---------- */
function initClock() {
  const timeEl = document.querySelector('.hero-datebox');
  if (!timeEl) return;

  function update() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    // Keep the fictional in-game date, only the clock is "live"
    timeEl.innerHTML = `<span>${CONFIG.gameDateLabel}</span><br>${CONFIG.gameSeason} · ${hh}:${mm}`;
  }
  update();
  setInterval(update, 1000 * 30);
}

/* ---------- Scroll-triggered reveal for .reveal cards ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((el) => {
    if (!el.hidden) observer.observe(el);
  });
}
