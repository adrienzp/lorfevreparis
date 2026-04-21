/* ============================================================
   L'ORFÈVRE — main.js
   ============================================================ */

// ─────────────────────────────────────────
// 0. CHARGEMENT DONNÉES DEPUIS BURSTFLOW
// ─────────────────────────────────────────
const RESTAURANT_SLUG = 'lorfevreparis';
const BURSTFLOW_API   = 'https://burstflow.fr/api/public/restaurant/' + RESTAURANT_SLUG;
const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function formatHoraire(schedule) {
  if (!schedule?.open) return 'Fermé';
  const parts = [];
  if (schedule.lunch)  parts.push(schedule.lunch.start  + ' – ' + schedule.lunch.end);
  if (schedule.dinner) parts.push(schedule.dinner.start + ' – ' + schedule.dinner.end);
  return parts.length ? parts.join(' · ') : 'Ouvert';
}

async function loadRestaurantData() {
  try {
    const res  = await fetch(BURSTFLOW_API);
    if (!res.ok) return;
    const data = await res.json();
    if (data.nom)       document.querySelectorAll('[data-bf="nom"]').forEach(el => el.textContent = data.nom);
    if (data.telephone) document.querySelectorAll('[data-bf="telephone"]').forEach(el => { el.textContent = data.telephone; if (el.tagName === 'A') el.href = 'tel:' + data.telephone.replace(/\s/g,''); });
    if (data.adresse)   document.querySelectorAll('[data-bf="adresse"]').forEach(el => el.textContent = data.adresse);
    if (data.email)     document.querySelectorAll('[data-bf="email"]').forEach(el => { el.textContent = data.email; if (el.tagName === 'A') el.href = 'mailto:' + data.email; });
    if (data.horaires) {
      document.querySelectorAll('[data-bf="horaires"]').forEach(container => {
        container.innerHTML = '';
        [1,2,3,4,5,6,0].forEach(dayIndex => {
          const sched = data.horaires[String(dayIndex)];
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(201,168,76,0.1);font-size:12px;';
          row.innerHTML = `<span style="color:var(--texte-doux)">${JOURS[dayIndex]}</span><span style="color:${sched?.open === false ? 'var(--texte-doux)' : 'var(--texte)'}">${formatHoraire(sched)}</span>`;
          container.appendChild(row);
        });
      });
    }
  } catch(e) {}
}
document.addEventListener('DOMContentLoaded', loadRestaurantData);

// ─────────────────────────────────────────
// 0b. CHARGEMENT CARTE DEPUIS BURSTFLOW
// ─────────────────────────────────────────
async function loadCarteData() {
  try {
    const res = await fetch(BURSTFLOW_API + '/carte');
    if (!res.ok) return;
    const { carte } = await res.json();
    if (!carte || carte.length === 0) return;

    // Pour chaque catégorie retournée par l'API, on met à jour l'onglet correspondant
    carte.forEach(function(cat) {
      const slug = cat.nom.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-');
      const tab = document.getElementById(slug) || document.getElementById(cat.nom.toLowerCase());
      if (!tab) return;

      if (cat.articles.length === 0) return;

      // Remplace le contenu de l'onglet par les articles de l'API
      tab.innerHTML = cat.articles.map(function(a) {
        var allergenes = '';
        if (a.allergenes) {
          allergenes = '<div class="menu-item-allergenes">' +
            a.allergenes.split(',').map(function(al) {
              return '<div class="allergene-badge"><span>' + al.trim() + '</span></div>';
            }).join('') +
          '</div>';
        }
        return '<div class="menu-item reveal">' +
          '<div class="menu-item-header">' +
            '<span class="menu-item-name">' + a.nom + '</span>' +
            '<span class="menu-item-price">' + (a.prix ? a.prix + '\u20ac' : '') + '</span>' +
          '</div>' +
          (a.description ? '<div class="menu-item-desc">' + a.description + '</div>' : '') +
          allergenes +
        '</div>';
      }).join('');
    });
  } catch(e) {}
}
document.addEventListener('DOMContentLoaded', loadCarteData);

/* ============================================================
   Effets : curseur traînée dorée, typewriter, particules,
            transition page, son ambiance, bouton liquide
   ============================================================ */

// ─────────────────────────────────────────
// 1. CURSEUR AMÉLIORÉ + TRAÎNÉE DORÉE
// ─────────────────────────────────────────
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
const trail  = [];
const TRAIL_COUNT = 10;

for (let i = 0; i < TRAIL_COUNT; i++) {
  const dot = document.createElement('div');
  dot.style.cssText = `position:fixed;width:${4-i*0.3}px;height:${4-i*0.3}px;background:var(--or);border-radius:50%;pointer-events:none;z-index:9990;transform:translate(-50%,-50%);opacity:${((TRAIL_COUNT-i)/TRAIL_COUNT)*0.45};`;
  document.body.appendChild(dot);
  trail.push({ el: dot, x: 0, y: 0 });
}

let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  if (cursor) { cursor.style.left = mouseX+'px'; cursor.style.top = mouseY+'px'; }
  setTimeout(() => {
    if (ring) { ring.style.left = mouseX+'px'; ring.style.top = mouseY+'px'; }
  }, 80);
});

(function animateTrail() {
  trail[0].x += (mouseX - trail[0].x) * 0.45;
  trail[0].y += (mouseY - trail[0].y) * 0.45;
  for (let i = 1; i < TRAIL_COUNT; i++) {
    trail[i].x += (trail[i-1].x - trail[i].x) * 0.4;
    trail[i].y += (trail[i-1].y - trail[i].y) * 0.4;
    trail[i].el.style.left = trail[i].x + 'px';
    trail[i].el.style.top  = trail[i].y + 'px';
  }
  requestAnimationFrame(animateTrail);
})();

if (cursor && ring) {
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform   = 'translate(-50%,-50%) scale(2.2)';
      ring.style.borderColor = 'rgba(201,168,76,0.9)';
      ring.style.background  = 'rgba(201,168,76,0.08)';
      cursor.style.transform = 'translate(-50%,-50%) scale(0)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform   = 'translate(-50%,-50%) scale(1)';
      ring.style.borderColor = 'rgba(201,168,76,0.5)';
      ring.style.background  = 'transparent';
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
}

// ─────────────────────────────────────────
// 2. PARTICULES DORÉES FLOTTANTES
// ─────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  window.addEventListener('resize', () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });
  const particles = Array.from({length:55}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    r: Math.random()*1.4+0.3,
    vx: (Math.random()-0.5)*0.25,
    vy: -Math.random()*0.35-0.08,
    alpha: Math.random()*0.45+0.08,
    pulse: Math.random()*Math.PI*2
  }));
  (function draw() {
    ctx.clearRect(0,0,W,H);
    particles.forEach(p => {
      p.pulse += 0.012; p.x += p.vx; p.y += p.vy;
      if (p.y < -5) { p.y = H+5; p.x = Math.random()*W; }
      if (p.x < -5) p.x = W+5; if (p.x > W+5) p.x = -5;
      const a = p.alpha*(0.6+0.4*Math.sin(p.pulse));
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(201,168,76,${a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
})();

// ─────────────────────────────────────────
// 3. TYPEWRITER
// ─────────────────────────────────────────
(function initTypewriter() {
  const els = document.querySelectorAll('[data-typewriter]');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.typed) {
        entry.target.dataset.typed = 'true';
        const el = entry.target;
        const text = el.textContent;
        const speed = parseInt(el.dataset.speed||42);
        const delay = parseInt(el.dataset.delay||0);
        el.textContent = '';
        let i = 0;
        setTimeout(() => {
          const iv = setInterval(() => {
            el.textContent += text[i]; i++;
            if (i >= text.length) clearInterval(iv);
          }, speed);
        }, delay);
      }
    });
  }, {threshold: 0.6});
  els.forEach(el => obs.observe(el));
})();

// ─────────────────────────────────────────
// 4. TRANSITION ENTRE PAGES
// ─────────────────────────────────────────
(function initPageTransition() {
  const overlay = document.getElementById('page-transition');
  if (!overlay) return;
  // Fade out à l'arrivée
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('pt-leaving');
    });
  });
  setTimeout(() => { overlay.style.pointerEvents = 'none'; }, 900);
  // Fade in au départ
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || href.startsWith('tel') || !href.endsWith('.html')) return;
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = this.getAttribute('href');
      overlay.style.pointerEvents = 'all';
      overlay.classList.remove('pt-leaving');
      overlay.classList.add('pt-entering');
      setTimeout(() => { window.location.href = target; }, 680);
    });
  });
})();

// ─────────────────────────────────────────
// 5. SON D'AMBIANCE
// ─────────────────────────────────────────
(function initAmbiance() {
  function setup() {
    var btn   = document.getElementById('sound-btn');
    var audio = document.getElementById('ambiance-audio');
    if (!btn || !audio) return;

    var playing = false;

    function startMusic() {
      audio.volume = 0;
      audio.play().catch(function() {});
      var vol = 0;
      var iv = setInterval(function() {
        vol = Math.min(0.28, vol + 0.01);
        audio.volume = vol;
        if (vol >= 0.28) clearInterval(iv);
      }, 80);
      playing = true;
      btn.classList.add('active');
      btn.innerHTML = '<span class="sound-icon">♪</span><span class="sound-label">On</span>';
      sessionStorage.setItem('ambiancePlaying', 'true');
    }

    function stopMusic() {
      var iv2 = setInterval(function() {
        audio.volume = Math.max(0, audio.volume - 0.01);
        if (audio.volume <= 0) { clearInterval(iv2); audio.pause(); }
      }, 80);
      playing = false;
      btn.classList.remove('active');
      btn.innerHTML = '<span class="sound-icon">♪</span><span class="sound-label">Ambiance</span>';
      sessionStorage.setItem('ambiancePlaying', 'false');
    }

    btn.addEventListener('click', function() {
      if (!playing) { startMusic(); } else { stopMusic(); }
    });

    // Reprendre automatiquement si actif sur la page précédente
    if (sessionStorage.getItem('ambiancePlaying') === 'true') {
      startMusic();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();

// ─────────────────────────────────────────
// 6. NAV + REVEAL
// ─────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') === currentPage) a.classList.add('active');
});
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, {threshold:0.1});
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ─────────────────────────────────────────
// 7. NOTIFICATION
// ─────────────────────────────────────────
function showNotif(title, text) {
  const notif = document.getElementById('notif');
  if (!notif) return;
  notif.querySelector('.notif-title').textContent = title;
  notif.querySelector('.notif-text').textContent  = text;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 4000);
}

// ─────────────────────────────────────────
// 8. POPUP ÉVÉNEMENT (depuis BurstFlow)
// ─────────────────────────────────────────
(function initEventPopup() {
  var POPUP_KEY = 'bf_popup_seen';
  if (sessionStorage.getItem(POPUP_KEY)) return;

  fetch('https://burstflow.fr/api/public/restaurant/lorfevreparis')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var popup = (data.events || []).find(function(e) { return e.show_popup; });
      if (!popup) return;

      sessionStorage.setItem(POPUP_KEY, '1');

      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9000;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px);';

      var date = '';
      if (popup.starts_at) {
        var d = new Date(popup.starts_at);
        date = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      }

      overlay.innerHTML =
        '<div style="background:#12100e;border:1px solid rgba(201,168,76,0.25);max-width:480px;width:100%;padding:48px 40px;position:relative;text-align:center;">' +
          (popup.image_url ? '<img src="' + popup.image_url + '" style="width:100%;height:180px;object-fit:cover;margin-bottom:28px;">' : '') +
          '<p style="font-size:9px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;margin:0 0 16px;">✦ Événement</p>' +
          '<h2 style="font-family:\'Cormorant Garamond\',serif;font-size:28px;color:#fff;font-weight:400;margin:0 0 12px;">' + popup.title + '</h2>' +
          (date ? '<p style="font-size:12px;color:#c9a84c;margin:0 0 16px;">' + date + '</p>' : '') +
          (popup.description ? '<p style="font-size:12px;color:#aaa;line-height:1.8;margin:0 0 28px;">' + popup.description + '</p>' : '') +
          '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">' +
            (popup.registration_url
              ? '<a href="' + popup.registration_url + '" target="_blank" style="background:#c9a84c;color:#000;padding:12px 28px;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">S\'inscrire</a>'
              : '<a href="reservation.html" style="background:#c9a84c;color:#000;padding:12px 28px;text-decoration:none;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Réserver</a>') +
            '<button onclick="this.closest(\'[data-bf-overlay]\').remove()" style="background:none;border:1px solid rgba(201,168,76,0.3);color:#c9a84c;padding:12px 28px;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;">Plus tard</button>' +
          '</div>' +
          '<button onclick="this.closest(\'[data-bf-overlay]\').remove()" style="position:absolute;top:12px;right:12px;background:none;border:none;color:#666;font-size:18px;cursor:pointer;line-height:1;">✕</button>' +
        '</div>';

      overlay.setAttribute('data-bf-overlay', '1');
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

      setTimeout(function() { document.body.appendChild(overlay); }, 1500);
    })
    .catch(function() {});
})();

// Remove typewriter caret after typing done
(function fixTypewriterCaret() {
  document.querySelectorAll('[data-typewriter]').forEach(el => {
    const obs2 = new MutationObserver(() => {});
    // On surveille quand le texte est complet
  });
  // Patch typeWrite pour ajouter tw-done
  const origElems = document.querySelectorAll('[data-typewriter]');
  origElems.forEach(el => {
    const text = el.textContent;
    const speed = parseInt(el.dataset.speed||42);
    const delay = parseInt(el.dataset.delay||0);
    const totalTime = delay + text.length * speed + 600;
    setTimeout(() => el.classList.add('tw-done'), totalTime + 200);
  });
})();
