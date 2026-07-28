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
  if (themeToggle) themeToggle.setAttribute('aria-pressed', String(dark));
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
    new Chart(ctx, { type: 'radar', data, options: { responsive: true, plugins: { legend: { display: false } } } });
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
