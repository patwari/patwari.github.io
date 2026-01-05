const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  nav.classList.toggle('nav--open');
  navToggle.classList.toggle('nav-toggle--open');
});

const links = Array.from(document.querySelectorAll('.nav__link'));
const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);

const setActiveLink = (target) => {
  links.forEach((link) => link.classList.remove('is-active'));
  const active = links.find((link) => link.getAttribute('href') === '#' + target.id);
  if (active) active.classList.add('is-active');
};

const headerEl = document.querySelector('.header');
const headerHeight = () => (headerEl ? headerEl.offsetHeight : 0);

const handleScroll = () => {
  const scrollPos = window.scrollY + headerHeight() + 12;
  let current = sections[0];
  sections.forEach((section) => {
    if (section.offsetTop <= scrollPos) {
      current = section;
    }
  });
  if (current) setActiveLink(current);
};

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleScroll);
handleScroll();

const root = document.documentElement;
const toggleBtn = document.querySelector('.theme-toggle');
const toggleImg = toggleBtn.querySelector('.theme-toggle__icon');

// Particle system (desktop only)
const enableParticles = window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 700;
let particleState = { canvas: null, ctx: null, particles: [], animId: null, mode: null, resizeHandler: null };

const destroyParticles = () => {
  if (particleState.animId) cancelAnimationFrame(particleState.animId);
  if (particleState.resizeHandler) window.removeEventListener('resize', particleState.resizeHandler);
  if (particleState.canvas && particleState.canvas.parentNode) {
    particleState.canvas.parentNode.removeChild(particleState.canvas);
  }
  particleState = { canvas: null, ctx: null, particles: [], animId: null, mode: null, resizeHandler: null };
};

const createCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.className = 'particle-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);
  return { canvas, ctx, resize };
};

const buildDarkParticles = (canvas, colors) => {
  const particles = [];
  // stars
  for (let i = 0; i < 90; i++) {
    particles.push({
      type: 'star',
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.5 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
      color: Math.random() > 0.7 ? 'rgba(245,183,85,0.7)' : 'rgba(255,255,255,0.8)',
    });
  }
  // planets
  for (let i = 0; i < 3; i++) {
    const sideX = Math.random() < 0.5 ? Math.random() * (canvas.width * 0.25) : canvas.width * 0.75 + Math.random() * (canvas.width * 0.25);
    const sideY = Math.random() < 0.5 ? Math.random() * (canvas.height * 0.25) : canvas.height * 0.75 + Math.random() * (canvas.height * 0.25);
    particles.push({
      type: 'planet',
      x: sideX,
      y: sideY,
      r: 10 + Math.random() * 18,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  return particles;
};

const buildLightParticles = (canvas, colors) => {
  const particles = [];
  for (let i = 0; i < 18; i++) {
    particles.push({
      type: 'shape',
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 14 + Math.random() * 18,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      rotation: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.015,
      sides: Math.random() > 0.5 ? 4 : 6,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  return particles;
};

const startParticles = (mode) => {
  if (!enableParticles) return;
  destroyParticles();
  const { canvas, ctx, resize } = createCanvas();
  const colors =
    mode === 'light'
      ? ['rgba(60, 70, 160, 0.55)', 'rgba(220, 120, 40, 0.5)', 'rgba(40, 110, 190, 0.5)']
      : ['rgba(126,244,196,0.35)', 'rgba(245,183,85,0.35)', 'rgba(120,170,255,0.3)'];

  let particles = mode === 'light' ? buildLightParticles(canvas, colors) : buildDarkParticles(canvas, colors);
  let shootTimer = 0;
  const ripples = [];
  const rippleColor = mode === 'light' ? 'rgba(60,70,160,0.22)' : 'rgba(255,255,255,0.28)';

  window.addEventListener('click', (e) => {
    ripples.push({ x: e.clientX, y: e.clientY, r: 0, max: 180, speed: 4 });
  });

  const drawShape = (p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.beginPath();
    for (let i = 0; i < p.sides; i++) {
      const angle = (i / p.sides) * Math.PI * 2;
      const px = Math.cos(angle) * p.size;
      const py = Math.sin(angle) * p.size;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  };

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += rp.speed;
      const alpha = Math.max(0, 1 - rp.r / rp.max) * (mode === 'light' ? 0.6 : 0.9);
      ctx.beginPath();
      ctx.strokeStyle = rippleColor.replace(/0\.\d+\)$/, `${alpha})`);
      ctx.lineWidth = 2;
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.stroke();
      if (rp.r >= rp.max) ripples.splice(i, 1);
    }

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.type === 'shape') p.rotation += p.vr;
      // wrap
      const buffer = 40;
      if (p.x < -buffer) p.x = canvas.width + buffer;
      if (p.x > canvas.width + buffer) p.x = -buffer;
      if (p.y < -buffer) p.y = canvas.height + buffer;
      if (p.y > canvas.height + buffer) p.y = -buffer;

      if (p.type === 'star' || p.type === 'planet') {
        ctx.beginPath();
        let twinkle = 1;
        if (p.type === 'star' && Math.random() < 0.08) {
          twinkle = 1.6;
        }
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.r * twinkle, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'shape') {
        drawShape(p);
      } else if (p.type === 'shooting') {
        ctx.beginPath();
        const grad = ctx.createLinearGradient(p.x, p.y, p.x - p.vx * 25, p.y - p.vy * 25);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 20, p.y - p.vy * 20);
        ctx.stroke();
        p.life -= 1;
      }
    });

    if (mode === 'dark') {
      shootTimer -= 1;
      if (shootTimer <= 0) {
        particles.push({
          type: 'shooting',
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.4,
          vx: 1.2 + Math.random() * 1.2,
          vy: 0.2 + Math.random() * 0.5,
          life: 60,
          color: 'rgba(255,255,255,0.8)',
        });
        shootTimer = 120 + Math.random() * 160;
      }
    }

    // trim shooting trails
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].type === 'shooting' && particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }

    particleState.animId = requestAnimationFrame(tick);
  };

  particleState = { canvas, ctx, particles, animId: null, mode, resizeHandler: resize };
  tick();
};

const rebuildParticles = (mode) => {
  if (!enableParticles) return;
  startParticles(mode);
};

const applyTheme = (theme) => {
  const isLight = theme === 'light';
  root.classList.toggle('theme-light', isLight);
  toggleImg.src = isLight ? 'assets/dark_mode_256dp.png' : 'assets/light_mode_256dp.png';
  toggleImg.alt = isLight ? 'Switch to dark' : 'Switch to light';
  rebuildParticles(isLight ? 'light' : 'dark');
};

const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

toggleBtn.addEventListener('click', () => {
  const next = root.classList.contains('theme-light') ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('theme', next);
});

if (enableParticles) {
  rebuildParticles(root.classList.contains('theme-light') ? 'light' : 'dark');
}
