/* ============================================================
   L'ORFÈVRE — main.js
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
// 5. SON D'AMBIANCE — MP3 Jazz
// ─────────────────────────────────────────
(function initAmbiance() {
  const btn = document.getElementById('sound-btn');
  if (!btn) return;

  const audio = new Audio('ambiance.mp3');
  audio.loop   = true;
  audio.volume = 0;

  let playing = false;
  let fadeInt = null;

  function fadeTo(target, duration) {
    clearInterval(fadeInt);
    const steps    = 40;
    const interval = duration / steps;
    const delta    = (target - audio.volume) / steps;
    fadeInt = setInterval(() => {
      audio.volume = Math.min(1, Math.max(0, audio.volume + delta));
      if ((delta > 0 && audio.volume >= target) ||
          (delta < 0 && audio.volume <= target)) {
        audio.volume = target;
        clearInterval(fadeInt);
        if (target === 0) audio.pause();
      }
    }, interval);
  }

  // Démarrer au premier clic sur la page (politique navigateur)
  let primed = false;
  function primeAudio() {
    if (primed) return;
    primed = true;
    // On charge sans jouer
    audio.load();
    document.removeEventListener('click', primeAudio);
    document.removeEventListener('scroll', primeAudio);
  }
  document.addEventListener('click',  primeAudio, { once: true });
  document.addEventListener('scroll', primeAudio, { once: true });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!playing) {
      audio.play().then(() => {
        fadeTo(0.28, 2500);
        playing = true;
        btn.classList.add('active');
        btn.innerHTML = '<span class="sound-icon">♪</span><span class="sound-label">On</span>';
      }).catch(() => {
        // Autoplay bloqué, on réessaie au prochain clic
        btn.innerHTML = '<span class="sound-icon">♩</span><span class="sound-label">Cliquer</span>';
      });
    } else {
      fadeTo(0, 1800);
      playing = false;
      btn.classList.remove('active');
      btn.innerHTML = '<span class="sound-icon">♩</span><span class="sound-label">Ambiance</span>';
    }
  });
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
