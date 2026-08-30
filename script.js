// ===== Birchdale dashboard — interactivity =====

document.addEventListener('DOMContentLoaded', () => {
  initToast();
  initNav();
  initCalendar();
  initProgressBars();
  initButtons();
  initRipple();
  initClock();
});

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

/* ---------- Sidebar navigation ---------- */
function initNav() {
  const links = document.querySelectorAll('.navlink');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const label = link.textContent.trim();
      showToast(`Showing ${label}`);
    });
  });
}

/* ---------- Mini calendar (real month grid) ---------- */
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

let calState = { year: 2024, month: 4, todayDate: 20 }; // month is 0-indexed (4 = May)

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

/* ---------- Buttons: map & invite ---------- */
function initButtons() {
  const mapBtn = document.querySelector('.map-btn');
  if (mapBtn) {
    mapBtn.addEventListener('click', () => showToast('🌿 Opening the Birchdale map…'));
  }

  const inviteBtn = document.querySelector('.invite-btn');
  if (inviteBtn) {
    inviteBtn.addEventListener('click', () => showToast('🌱 Invitation sent to a new neighbor!'));
  }

  document.querySelectorAll('.neighbor').forEach(n => {
    n.style.cursor = 'pointer';
    n.addEventListener('click', () => {
      const name = n.querySelector('.name')?.textContent || 'Neighbor';
      showToast(`Visiting ${name}'s house`);
    });
  });

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
    timeEl.innerHTML = `<span>May 20, 2024</span><br>Spring · ${hh}:${mm}`;
  }
  update();
  setInterval(update, 1000 * 30);
}
