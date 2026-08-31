// menu icon navbar
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () =>{
   menuIcon.classList.toggle('bx-x');
   navbar.classList.toggle('active');
};

// scroll sections active link
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () =>{
   sections.forEach(sec =>{
       let top = window.scrollY;
       let offset = sec.offsetTop - 150;
       let height = sec.offsetHeight;
       let id = sec.getAttribute('id');

       if(top >= offset && top < offset + height){
           navLinks.forEach(links =>{
               links.classList.remove('active');
               document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
           });
       };
   });
   
   
// stick navbar
   let header = document.querySelector('.header');   
   header.classList.toggle('sticky', window.scrollY > 100);

   
// remove menu icon navbar when click navbar link(scroll)
menuIcon.classList.remove('bx-x');
navbar.classList.remove('active');
};

  // Dark light mode
//   let darkModeIcon = document.querySelector('#darkMode-icon');

//   darkModeIcon.onclick = () =>{
//     darkModeIcon.classList.toggle('bx-sun');
//     document.body.classList.toggle('dark-mode');
//   }

// scroll Reveal
ScrollReveal({ 
    // reset: true ,
    distance: '80px',
    duration: 2000,
    delay: 200
});

// `.heading` and not `.heading-content h2`: the <h2> is a sibling of
// .heading-content, not a child, so the old selector matched nothing and the
// page's main title never animated at all.
ScrollReveal().reveal('.heading, .subheading', { origin: 'top' });
// The roadmap is not handed to ScrollReveal: it runs its own reveal, keyed to
// the road drawing itself, and two things writing transform on the same stops
// would fight.
ScrollReveal().reveal('.heading-content p', { origin: 'bottom' });

// The dials arrive one after another rather than as a block. The ids they used
// to be selected by are gone; they are .skill-card now, and interval picks up
// the stagger for free.
ScrollReveal().reveal('.skill-card', { origin: 'bottom', interval: 120 });



/* --- education roadmap -----------------------------------------------------

   Two jobs, both about not hardcoding numbers that the SVG already knows:

     1. Each stop is placed by asking the <path> where it is at a given
        fraction of its length. Hand-tuned percentages would be wrong the
        moment the curve is reshaped, and wrong in a way that is hard to spot.

     2. The draw-on animation needs the path's real length for its dash. The
        usual fudge is to guess a number larger than the path; measuring gives
        an exact start and end instead.
--------------------------------------------------------------------------- */
(function roadmap(){
  const road  = document.querySelector('.road');
  const path  = document.getElementById('roadPath');
  const stops = road?.querySelectorAll('.stop');
  if(!road || !path || !stops?.length) return;

  // Where along the road each stop sits, 0 = start, 1 = end. One per half-wave,
  // landing on the crest or trough at the middle of each of the six segments.
  const AT = [0.083, 0.25, 0.417, 0.583, 0.75, 0.917];

  // the viewBox this path was drawn in; the container holds the same ratio,
  // so user units convert straight to percentages of the box
  const VB_W = 1000, VB_H = 440;

  function place(){
    const len = path.getTotalLength();
    road.style.setProperty('--road-len', len.toFixed(1));

    stops.forEach((stop, i) => {
      const p = path.getPointAtLength(len * (AT[i] !== undefined ? AT[i] : (i + 1) / (stops.length + 1)));
      stop.style.setProperty('--x', (p.x / VB_W * 100).toFixed(2) + '%');
      stop.style.setProperty('--y', (p.y / VB_H * 100).toFixed(2) + '%');
      // stagger, so the stops land one after another as the road draws past
      stop.style.setProperty('--in', (0.35 + i * 0.28).toFixed(2) + 's');
    });
  }

  place();
  window.addEventListener('resize', place, { passive: true });

  if(!window.IntersectionObserver){
    road.classList.add('is-seen');
    return;
  }

  new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      road.classList.add('is-seen');
      obs.disconnect();          // plays once
    });
  }, { threshold: .25 }).observe(road);
})();

/* --- skill dials -----------------------------------------------------------

   Each card carries its own target as data-pct, and that single number drives
   both the arc and the counted figure. The previous version kept them apart -
   an array in here for the number, a hardcoded stroke-dashoffset in the
   stylesheet for the arc - and the two had already drifted out of agreement.

   The old counter also ran on setInterval and tried to stop with a bare
   `clearInterval()`, which takes an id and silently does nothing without one.
   Five intervals therefore kept firing every ~25ms for as long as the page was
   open, long after the numbers had settled. This counts on rAF instead, which
   stops on its own and pauses when the tab is in the background.
--------------------------------------------------------------------------- */
(function skillDials(){
  const COUNT_MS = 1800;   // matched to the ring transition in intro.css
  const cards = document.querySelectorAll('.skill-card');
  if(!cards.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fill(card){
    const pct = Number(card.dataset.pct) || 0;
    const out = card.querySelector('.skill-number');

    card.style.setProperty('--pct', pct);
    card.classList.add('is-filled');   // releases the CSS transition on the arc

    if(reduce){
      if(out) out.textContent = pct + '%';
      return;
    }

    const start = performance.now();
    (function step(now){
      const t = Math.min((now - start) / COUNT_MS, 1);
      // ease-out, so the number decelerates onto its final value in step with
      // the arc rather than ticking up at a constant rate and arriving early
      const eased = 1 - Math.pow(1 - t, 3);
      if(out) out.textContent = Math.round(pct * eased) + '%';
      if(t < 1) requestAnimationFrame(step);
    })(start);
  }

  if(!window.IntersectionObserver){
    cards.forEach(fill);
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      fill(entry.target);
      obs.unobserve(entry.target);   // once each; nothing left watching after
    });
  }, { threshold: .35 });

  cards.forEach(card => io.observe(card));
})();



// dark mode with local storage

let darkMode = localStorage.getItem("darkMode");
const darkModeToggle = document.querySelector("#darkMode-icon");


const enableDarkMode = () =>{
  document.body.classList.add("dark-mode");
  localStorage.setItem("darkMode", "enabled");
};

const disableDarkMode = () =>{
  document.body.classList.remove("dark-mode");
  localStorage.setItem("darkMode", null);
}

if(darkMode == "enabled"){
  enableDarkMode();
}

darkModeToggle.addEventListener("click", () =>{
  darkMode = localStorage.getItem("darkMode");
  if(darkMode != "enabled") {
    enableDarkMode();
    console.log(darkMode);
  }
  else
  {
    disableDarkMode();
    console.log(darkMode);
  }
});