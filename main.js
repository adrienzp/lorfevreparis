// Curseur custom
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
if (cursor && ring) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    setTimeout(() => {
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
    }, 80);
  });
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1.8)';
      cursor.style.transform = 'translate(-50%,-50%) scale(0.5)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
}

// Nav scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') === currentPage) a.classList.add('active');
});

// Reveal on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Notification
function showNotif(title, text) {
  const notif = document.getElementById('notif');
  if (!notif) return;
  notif.querySelector('.notif-title').textContent = title;
  notif.querySelector('.notif-text').textContent = text;
  notif.classList.add('show');
  setTimeout(() => notif.classList.remove('show'), 4000);
}
