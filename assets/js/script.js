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

const applyTheme = (theme) => {
  const isLight = theme === 'light';
  root.classList.toggle('theme-light', isLight);
  toggleImg.src = isLight ? 'assets/dark_mode_256dp.png' : 'assets/light_mode_256dp.png';
  toggleImg.alt = isLight ? 'Switch to dark' : 'Switch to light';
};

const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

toggleBtn.addEventListener('click', () => {
  const next = root.classList.contains('theme-light') ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem('theme', next);
});
