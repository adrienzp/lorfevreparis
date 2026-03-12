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
// 5. SON D'AMBIANCE
// ─────────────────────────────────────────
(function initAmbiance() {
  const btn = document.getElementById('sound-btn');
  if (!btn) return;
  let audioCtx = null, playing = false, masterGain = null, noiseSource = null;

  function buildSound(ctx) {
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.16, ctx.currentTime+3);
    masterGain.connect(ctx.destination);
    // Bruit rose (murmures)
    const bufSize = ctx.sampleRate*4;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i=0;i<bufSize;i++) {
      const w=Math.random()*2-1;
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
      b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
      b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
      d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.04; b6=w*0.115926;
    }
    noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buf; noiseSource.loop = true;
    const filt = ctx.createBiquadFilter();
    filt.type='lowpass'; filt.frequency.value=750;
    noiseSource.connect(filt); filt.connect(masterGain);
    noiseSource.start();
    // Tintements
    function chime() {
      if (!playing) return;
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type='sine'; o.frequency.value=1100+Math.random()*700;
      g.gain.setValueAtTime(0,ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.035,ctx.currentTime+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+2);
      o.connect(g); g.connect(masterGain);
      o.start(); o.stop(ctx.currentTime+2);
      setTimeout(chime, 3500+Math.random()*9000);
    }
    setTimeout(chime, 2500);
  }

  btn.addEventListener('click', () => {
    if (!playing) {
      if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
      if (audioCtx.state==='suspended') audioCtx.resume();
      buildSound(audioCtx);
      playing = true;
      btn.classList.add('active');
      btn.innerHTML = '<span class="sound-icon">♪</span><span class="sound-label">On</span>';
    } else {
      if (masterGain) masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime+1.5);
      setTimeout(() => { try { noiseSource.stop(); } catch(e){} }, 1500);
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
