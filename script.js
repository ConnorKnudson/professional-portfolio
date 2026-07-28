const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const year = document.querySelector("[data-year]");
const themeToggle = document.getElementById('theme-toggle');

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

// Theme toggle (persist)
function setTheme(dark) {
  if (dark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  localStorage.setItem('site-dark', dark ? '1' : '0');
  if (!themeToggle) return;
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.textContent = dark ? 'Light mode' : 'Dark mode';
  themeToggle.dataset.icon = dark ? '☀' : '🌙';
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.classList.toggle('theme-dark', dark);
  themeToggle.classList.toggle('theme-light', !dark);
}
 
if (themeToggle) {
  const saved = localStorage.getItem('site-dark');
  setTheme(saved === '1');
  themeToggle.addEventListener('click', () => setTheme(!document.documentElement.classList.contains('dark')));
}

// Modal handling (project case studies)
function openModal(modal) {
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal(modal) {
  modal.setAttribute('aria-hidden', 'true');
}

document.addEventListener('click', (e) => {
  const target = e.target;
  // open
  const card = target.closest && target.closest('[data-modal-target]');
  if (card && card.dataset.modalTarget) {
    const modal = document.querySelector(card.dataset.modalTarget);
    if (modal) openModal(modal);
  }

  // close
  if (target.matches && (target.matches('[data-close]') || target.classList.contains('modal'))) {
    const modal = target.closest('.modal');
    if (modal) closeModal(modal);
  }
});

// Initialize Chart.js with sample data
function initChart() {
  try {
    const hero = document.querySelector('.hero');
    const dynamicText = document.querySelector('.dynamic-text');
    if (hero && dynamicText) {
      const words = ['analytics', 'automation', 'data systems', 'insights', 'AI-enabled workflows'];
      let cycle = 0;
      setInterval(() => {
        cycle = (cycle + 1) % words.length;
        dynamicText.animate(
          [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 420, easing: 'ease-out' }
        );
        dynamicText.textContent = words[cycle];
      }, 3200);
    }

    const ctx = document.getElementById('skillsChart');
    if (!ctx || !window.Chart) return;
    const data = {
      labels: ['SQL', 'Python', 'DAX', 'Power Query', 'DBML', 'Power FX'],
      datasets: [{
        label: 'Familiarity',
        data: [90, 88, 76, 82, 70, 68],
        backgroundColor: 'rgba(6,117,119,0.12)',
        borderColor: 'rgba(6,117,119,0.9)',
        borderWidth: 2,
        fill: true,
      }]
    };
    const chart = new Chart(ctx, {
      type: 'radar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        elements: {
          point: {
            radius: 8,
            hoverRadius: 10,
            hitRadius: 16,
            backgroundColor: 'rgba(6,117,119,0.95)',
            borderColor: '#fff',
            borderWidth: 2
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 100,
            ticks: {
              stepSize: 10,
              color: '#4a4a4a',
              backdropColor: 'rgba(255,255,255,0.85)'
            },
            grid: {
              color: 'rgba(15,20,20,0.12)'
            },
            angleLines: {
              color: 'rgba(15,20,20,0.16)'
            },
            pointLabels: {
              color: '#333',
              font: { size: 12, weight: '700' }
            }
          }
        },
        onHover(event, elements) {
          ctx.style.cursor = elements.length ? 'grab' : 'default';
        }
      }
    });

    ctx.style.touchAction = 'none';
    let activeDrag = null;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const getNearestPoint = (event) => {
      const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
      return points.length ? points[0] : null;
    };

    const pointerValue = (event, point) => {
      const rect = ctx.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const scale = chart.scales.r;
      const centerX = scale.xCenter ?? scale.centerX ?? (rect.width / 2);
      const centerY = scale.yCenter ?? scale.centerY ?? (rect.height / 2);
      const radius = scale.drawingArea ?? Math.min(scale.width ?? rect.width, scale.height ?? rect.height) / 2;
      const px = point.element.x - centerX;
      const py = point.element.y - centerY;
      const length = Math.sqrt(px * px + py * py) || 1;
      const ux = px / length;
      const uy = py / length;
      const dx = x - centerX;
      const dy = y - centerY;
      const projected = dx * ux + dy * uy;
      const value = Math.round((projected / radius) * scale.max);
      return clamp(value, scale.min, scale.max);
    };

    ctx.addEventListener('pointerdown', (event) => {
      const point = getNearestPoint(event);
      if (point) {
        activeDrag = point;
        ctx.setPointerCapture(event.pointerId);
        ctx.style.cursor = 'grabbing';
      }
    });

    const updateDrag = (event) => {
      if (!activeDrag) return;
      event.preventDefault();
      const newValue = pointerValue(event, activeDrag);
      const dataset = chart.data.datasets[activeDrag.datasetIndex];
      if (dataset.data[activeDrag.index] !== newValue) {
        dataset.data[activeDrag.index] = newValue;
        chart.update('none');
      }
    };

    ctx.addEventListener('pointermove', (event) => {
      if (activeDrag) {
        updateDrag(event);
        return;
      }
      const point = getNearestPoint(event);
      ctx.style.cursor = point ? 'grab' : 'default';
    });

    const endDrag = (event) => {
      if (!activeDrag) return;
      activeDrag = null;
      ctx.style.cursor = 'default';
    };

    ctx.addEventListener('pointerup', endDrag);
    ctx.addEventListener('pointerleave', endDrag);
    document.addEventListener('pointercancel', endDrag);
  } catch (err) { console.error('Chart init error', err); }
}

// SQL playground using sql.js
async function initSqlPlayground() {
  if (!window.initSqlJs) return;
  try {
    const SQL = await window.initSqlJs({ locateFile: file => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/sql-wasm.wasm' });
    const db = new SQL.Database();
    // sample table
    db.run("CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT, role TEXT); INSERT INTO employees (name, role) VALUES ('Alex', 'Analyst'), ('Jamie', 'Engineer'), ('Taylor', 'Manager');");

    const runBtn = document.getElementById('run-sql');
    const input = document.getElementById('sql-input');
    const output = document.getElementById('sql-output');

    function renderResults(res) {
      if (!res || res.length === 0) return 'No results.';
      const cols = res[0].columns;
      const values = res[0].values;
      let table = cols.join('\t') + '\n';
      values.forEach(row => { table += row.join('\t') + '\n'; });
      return table;
    }

    runBtn.addEventListener('click', () => {
      let sql = input.value;
      try {
        const res = db.exec(sql);
        output.textContent = renderResults(res);
      } catch (err) { output.textContent = 'Error: ' + err.message; }
    });
  } catch (err) { console.error('sql.js init error', err); }
}

// Python runner using Skulpt
function outf(text) {
  const out = document.getElementById('py-output');
  out.textContent += text;
}
function runSkulpt() {
  const prog = document.getElementById('py-input').value;
  const builtinRead = function(x) { if (Sk.builtinFiles === undefined || Sk.builtinFiles['files'][x] === undefined) throw 'File not found: ' + x; return Sk.builtinFiles['files'][x]; };
  document.getElementById('py-output').textContent = '';
  Sk.configure({ output:outf, read:builtinRead });
  (Sk.TurtleGraphics || Promise.resolve()).then(()=>{
    const myPromise = Sk.misceval.asyncToPromise(function() {
      return Sk.importMainWithBody('<stdin>', false, prog, true);
    });
    myPromise.then(()=>{}, (err)=>{ document.getElementById('py-output').textContent = err.toString(); });
  });
}

// Copy-to-clipboard helper for code blocks
function addCopyButtons() {
  document.querySelectorAll('.code-block').forEach(block => {
    const btn = document.createElement('button');
    btn.className = 'button secondary';
    btn.textContent = 'Copy';
    btn.style.float = 'right';
    btn.addEventListener('click', () => navigator.clipboard.writeText(block.textContent));
    block.parentNode.insertBefore(btn, block);
  });
}

// Init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initChart();
  initSqlPlayground();
  addCopyButtons();
  const runPy = document.getElementById('run-py');
  if (runPy) runPy.addEventListener('click', runSkulpt);

  // particles (subtle) — optional if library available
  if (window.tsParticles) {
    tsParticles.load('tsparticles', { particles: { number: { value: 0 } } }).catch(()=>{});
  }
});
