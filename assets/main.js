const copyButton = document.querySelector('.copy-button');
const tocToggle = document.querySelector('.toc-toggle');
const toc = document.querySelector('.toc');

const setTocState = (collapsed) => {
  document.body.classList.toggle('toc-collapsed', collapsed);
  tocToggle?.setAttribute('aria-expanded', String(!collapsed));
  if (tocToggle) {
    tocToggle.title = collapsed ? 'פתיחת תפריט התוכן' : 'צמצום תפריט התוכן';
  }
  try { localStorage.setItem('excel-toc-collapsed', String(collapsed)); } catch {}
};

let savedTocState = false;
try { savedTocState = localStorage.getItem('excel-toc-collapsed') === 'true'; } catch {}
setTocState(savedTocState || window.matchMedia('(max-width: 880px)').matches);

tocToggle?.addEventListener('click', () => {
  setTocState(!document.body.classList.contains('toc-collapsed'));
});

copyButton?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(copyButton.dataset.copy);
    copyButton.textContent = 'הועתק';
    window.setTimeout(() => { copyButton.textContent = 'העתקה'; }, 1600);
  } catch {
    copyButton.textContent = 'לא ניתן להעתיק';
  }
});

const links = [...document.querySelectorAll('.toc a')];
const sections = links
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

  if (!visible) return;
  links.forEach((link) => {
    const selected = link.getAttribute('href') === `#${visible.target.id}`;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}, { rootMargin: '-15% 0px -70% 0px' });

sections.forEach((section) => observer.observe(section));

toc?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !document.body.classList.contains('toc-collapsed')) {
    setTocState(true);
    tocToggle?.focus();
  }
});
