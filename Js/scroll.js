// Scroll-linked section choreography, anime.js v4.
//
// Unlike a trigger-based reveal, the timelines here are bound to scroll
// position via onScroll({ sync }) - progress maps to how far the section has
// travelled through the viewport, so it scrubs backwards when you scroll up
// and tracks the wheel exactly rather than running at its own speed.
//
// Each section below the fold gets one timeline covering its whole passage:
//   0.00 - 0.35  elements rise up and fade in, staggered
//   0.35 - 1.00  held in place, fully readable
//
// The entrance is all there is: a section that has arrived stays at full
// opacity for the rest of its passage rather than fading back out on the way
// off screen.
import {
  animate,
  createTimeline,
  onScroll,
  stagger,
} from 'https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm';


const root = document.documentElement;

// index.html arms a timer that strips .anim-ready - which is what hides these
// elements - if this module never runs. That covers an unreachable CDN. The
// try/catch below covers the other half: loading fine but failing during setup.
// The timer is only cleared once every timeline is actually built, so there is
// no window in which content can end up permanently hidden.
const reveal = () => root.classList.remove('anim-ready');

const GROUPS = [
  ['.home', '.home-content > *'],
  ['.about', '.about-img, .about-content > *'],
  ['.services', '.heading, .services-box'],
  ['.portfolio', '.heading, .portfolio-box'],
  ['.testimonial-container', '.heading, .testimonial-wrapper'],
  ['.contact', '.heading, form > *'],
];

// Timeline positions, in ms. Only the ratios matter: the total duration is
// remapped onto the section's scroll range, so these are really percentages.
const ENTER_AT = 0;
const ENTER_FOR = 350;

const RISE = { opacity: [0, 1], translateY: ['4rem', '0rem'] };

// The section that is already on screen at load can't be revealed by scrolling
// into view: its `enter: top bottom` offset is negative, which clamps to 0 and
// pins the timeline at progress 0 - i.e. permanently hidden. So the first
// section plays its entrance on load instead, and nothing about it is
// scroll-linked.
function animateFirstSection(items) {
  animate(items, {
    ...RISE,
    duration: 700,
    // hero-intro.js holds the hero under an indigo curtain while its sweep
    // plays; wait that out so this entrance isn't spent behind it. The value
    // is 0 whenever the intro isn't running, which makes this a plain stagger.
    delay: (el, i) => (window.__heroIntroDelay || 0) + i * 60,
    ease: 'out(3)',
  });
}

function animateSection(section, items) {
  createTimeline({
    defaults: { ease: 'inOut(2)' },
    autoplay: onScroll({
      target: section,
      // Thresholds read "<container-edge> <target-edge>", NOT target-first.
      // Reversing these makes offsetStart > offsetEnd, which collapses
      // distance to 0 and pins the timeline at progress 0 - i.e. every
      // element stays invisible. These two describe the full passage:
      // container bottom meeting the section's top, through to container top
      // meeting the section's bottom.
      enter: 'bottom top',
      leave: 'top bottom',
      sync: true, // smoothed scrubbing rather than a hard 1:1 lock
    }),
  }).add(items, { ...RISE, duration: ENTER_FOR, delay: stagger(60) }, ENTER_AT);
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  clearTimeout(window.__animFallback);
  reveal();
} else {
  try {
    GROUPS.forEach(([sectionSelector, itemSelector], index) => {
      const section = document.querySelector(sectionSelector);
      if (!section) return;

      const items = Array.from(section.querySelectorAll(itemSelector));
      if (!items.length) return;

      if (index === 0) animateFirstSection(items);
      else animateSection(section, items);
    });

    clearTimeout(window.__animFallback);
  } catch (err) {
    // never leave the page hidden because an animation failed
    clearTimeout(window.__animFallback);
    reveal();
    console.error('[scroll.js] section choreography failed:', err);
  }
}
