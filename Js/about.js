/* ============================================================
   About section: three effects on the photo.

     wipe      a diagonal reveal as the image enters, at the same angle and
               direction as the hero's wedge sweep
     parallax  the photo drifts slower than the text as the section passes
     tilt      a few degrees towards the pointer while it's over the image

   Each writes a different CSS property, on purpose, so none of them clobbers
   another:

     .about-img       perspective static, in the stylesheet
                      filter      shadow, offset via --sh-x / --sh-y
     .about-img img   translate   parallax
                      transform   tilt
                      clip-path   wipe

   The shadow is cast from the wrapper rather than the image so that it traces
   the image's rendered result - tilted and clipped - instead of being trimmed
   away by that same clip-path.

   translate/rotate/scale are applied before `transform`, so the parallax and
   the tilt compose rather than overwrite one another.

   Reads are batched into one rAF pass and only run while the section is on
   screen, and the listener is addEventListener rather than window.onscroll -
   script.js assigns to that property and would clobber, or be clobbered.
   ============================================================ */
(function aboutImage(){
  const PARALLAX = 70;    // px of drift, half either side of centre
  const SKEW     = 22;    // % horizontal offset between the wipe's top and bottom
  const TILT     = 12;    // max degrees
  const WIPE_VH  = 0.75;  // fraction of the viewport the wipe takes to finish

  // rem. REST is where the shadow sits with the pointer away; SHIFT is how far
  // it travels either side of that as the picture tilts under the light.
  const SHADOW_REST  = 1.4;
  const SHADOW_SHIFT = 2.6;

  const section = document.querySelector('.about');
  const wrap    = section && section.querySelector('.about-img');
  const img     = wrap && wrap.querySelector('img');
  if(!section || !wrap || !img) return;

  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;

  /* --- scroll-driven: wipe + parallax ---------------------- */

  let ticking = false;
  let onScreen = false;

  function frame(){
    ticking = false;

    const vh = window.innerHeight;
    const r  = section.getBoundingClientRect();

    // Parallax: -1 while the section is still below the fold, +1 once it has
    // passed above. Negating it means the photo drifts downwards as the page
    // scrolls up - i.e. it lags the text, which is what reads as depth.
    const centred = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
    img.style.translate = '0 ' + (-centred * PARALLAX).toFixed(1) + 'px';

    // Wipe: driven by the image's own box, not the section's, so it finishes
    // about when the photo is properly in view rather than when the (much
    // taller) section is.
    const ir = img.getBoundingClientRect();
    const p = clamp((vh - ir.top) / (vh * WIPE_VH), 0, 1);

    // The leading edge runs from -SKEW to 100+SKEW so the diagonal is fully
    // off both ends at the extremes; the top edge leads the bottom, matching
    // the hero wedge's upper face.
    const e = -SKEW + p * (100 + 2 * SKEW);
    img.style.clipPath =
      'polygon(0% 0%, ' + (e + SKEW).toFixed(1) + '% 0%, ' +
      (e - SKEW).toFixed(1) + '% 100%, 0% 100%)';
  }

  function request(){
    if(!ticking && onScreen){
      ticking = true;
      requestAnimationFrame(frame);
    }
  }

  // only do the work while the section is actually in play
  if(window.IntersectionObserver){
    new IntersectionObserver(entries => {
      onScreen = entries[0].isIntersecting;
      if(onScreen) request();
    }, { rootMargin: '150px' }).observe(section);
  } else {
    onScreen = true;
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  frame();   // set the starting state before the first scroll

  /* --- pointer-driven: tilt -------------------------------- */

  // no hover to reward on a touch screen, and the layout stacks there anyway
  if(!window.matchMedia('(hover: hover)').matches) return;

  wrap.addEventListener('pointermove', e => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;   // -0.5 .. 0.5
    const y = (e.clientY - r.top)  / r.height - .5;
    // y drives rotateX inverted: pointer above centre should tip the top away
    img.style.transform =
      'rotateX(' + (-y * TILT * 2).toFixed(2) + 'deg) ' +
      'rotateY(' + ( x * TILT * 2).toFixed(2) + 'deg)';

    // The shadow's own shape comes free - it is cast from the tilted image -
    // but a shadow that only ever sat straight below would read as the light
    // turning with the picture. Offsetting it against the tilt is what keeps
    // the lamp still and the picture moving: lean the right edge away and the
    // shadow slides left, tip the top back and it lengthens downwards.
    wrap.style.setProperty('--sh-x', (-x * SHADOW_SHIFT).toFixed(2) + 'rem');
    wrap.style.setProperty('--sh-y', (SHADOW_REST - y * SHADOW_SHIFT).toFixed(2) + 'rem');
  }, { passive: true });

  wrap.addEventListener('pointerleave', () => {
    img.style.transform = 'rotateX(0deg) rotateY(0deg)';
    // back to the stylesheet's resting values, eased by the same transition
    wrap.style.removeProperty('--sh-x');
    wrap.style.removeProperty('--sh-y');
  });
})();
