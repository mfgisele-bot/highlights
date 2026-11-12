const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches && typeof jarallax === 'function') {
  jarallax(document.querySelectorAll('.mbr-parallax-background'));
}

const carousel = document.querySelector('.embla');
const viewport = carousel.querySelector('.embla__viewport');
const slides = [...carousel.querySelectorAll('.embla__slide')];

function move(direction) {
  const max = viewport.scrollWidth - viewport.clientWidth;
  const padding = parseFloat(getComputedStyle(viewport).scrollPaddingLeft) || 0;
  const left = viewport.getBoundingClientRect().left;
  const positions = slides.map(slide => {
    const offset = slide.getBoundingClientRect().left - left + viewport.scrollLeft - padding;
    return Math.max(0, Math.min(max, offset));
  });
  positions.push(max);
  const current = viewport.scrollLeft;
  const target = direction > 0
    ? positions.find(position => position > current + 2) ?? positions[0]
    : positions.findLast(position => position < current - 2) ?? max;
  viewport.scrollTo({ left: target, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
}

let auto = true;
function manualMove(direction) {
  auto = false;
  move(direction);
}
carousel.querySelector('.embla__button--prev').addEventListener('click', () => manualMove(-1));
carousel.querySelector('.embla__button--next').addEventListener('click', () => manualMove(1));
viewport.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  manualMove(event.key === 'ArrowRight' ? 1 : -1);
});

let drag;
viewport.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('a, button')) return;
  drag = { id: event.pointerId, x: event.clientX, left: viewport.scrollLeft };
  viewport.setPointerCapture(event.pointerId);
});
viewport.addEventListener('pointermove', event => {
  if (drag?.id !== event.pointerId || Math.abs(event.clientX - drag.x) < 5) return;
  auto = false;
  viewport.classList.add('is-dragging');
  viewport.scrollLeft = drag.left + drag.x - event.clientX;
});
viewport.addEventListener('lostpointercapture', () => {
  drag = undefined;
  viewport.classList.remove('is-dragging');
});
viewport.addEventListener('touchstart', () => { auto = false; }, { passive: true });

let inView = false;
new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: .25 }).observe(carousel);
setInterval(() => {
  if (auto && inView && !document.hidden && !reducedMotion.matches && !carousel.matches(':hover, :focus-within')) {
    move(1);
  }
}, 7000);
