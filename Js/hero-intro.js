/* ============================================================
   First-load hero intro, in two beats:

     1. sweep   the hero starts fully indigo; a curtain carrying the same
                wedge notch as .overlay sweeps right to uncover the white.
     2. settle  the curtain dissolves into the real .overlay beneath it and
                is removed.

   The geometry is measured off the live .overlay box rather than hardcoded,
   so the sweep finishes exactly on the real wedge whatever breakpoint is
   active and whatever the media queries have done to it.

   Beat 2 is a fade rather than a cut because the curtain is the full height
   of the hero while .overlay is only 768px tall. On a window taller than
   that, the strips above and below the wedge are indigo during the sweep and
   white afterwards, and the fade is what resolves that difference softly.

   Nothing here is load-bearing. Every bail-out removes the layer, the CSS
   keeps it hidden unless .anim-ready says scripting is live, and a timeout
   clears it even if the animation machinery goes silent.
   ============================================================ */
(function heroIntro(){
  const SWEEP_MS  = 1200;   // curtain crosses the hero
  const SETTLE_MS = 350;    // curtain dissolves into the real wedge

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const small  = window.matchMedia('(max-width: 768px)');

  const willRun = !reduce.matches && !small.matches &&
                  typeof Element !== 'undefined' && !!Element.prototype.animate;

  function start(){
    const layer   = document.querySelector('.hero-intro');
    const fill    = layer && layer.querySelector('.hero-intro-fill');
    const overlay = document.querySelector('.home .profession-container .overlay');

    let dropped = false;
    const drop = () => {
      if(dropped) return;
      dropped = true;
      if(layer) layer.remove();
    };

    if(!willRun || !layer || !fill || !overlay) return drop();

    const lr = layer.getBoundingClientRect();
    const ov = overlay.getBoundingClientRect();
    if(lr.width < 1 || lr.height < 1 || ov.width < 1) return drop();

    // last resort: if a promise never settles, the hero still comes back
    const guard = setTimeout(drop, SWEEP_MS + SETTLE_MS + 2000);
    const finish = () => { clearTimeout(guard); drop(); };

    const NW = ov.width, NH = ov.height;
    const notchX = ov.left - lr.left;              // where the notch ends up
    const apexY  = (ov.top - lr.top) + NH / 2;

    // hero-sized plus one notch width, so it still reaches the right edge
    // while starting a notch-width off to the left
    const FW = lr.width + NW, FH = lr.height;
    fill.style.width  = FW + 'px';
    fill.style.height = FH + 'px';

    // the whole rectangle minus a triangular bite out of its left edge - the
    // same bite .overlay's transparent left border cuts
    fill.style.clipPath = 'polygon(' + [
      '0px 0px',
      FW + 'px 0px',
      FW + 'px ' + FH + 'px',
      '0px ' + FH + 'px',
      '0px ' + (apexY + NH / 2) + 'px',
      (NW / 2) + 'px ' + apexY + 'px',
      '0px ' + (apexY - NH / 2) + 'px'
    ].join(',') + ')';

    const fillFrom = -NW;       // notch off-screen left, so the hero is all indigo
    const fillTo   = notchX;    // notch resting on the real wedge

    const after = (anim, ms, next) => {
      if(anim && anim.finished) anim.finished.then(next, finish);
      else setTimeout(next, ms);
    };

    const sweep = fill.animate(
      [{ transform: 'translateX(' + fillFrom + 'px)' },
       { transform: 'translateX(' + fillTo   + 'px)' }],
      { duration: SWEEP_MS, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });

    after(sweep, SWEEP_MS, () => {
      const fade = fill.animate([{ opacity: 1 }, { opacity: 0 }],
        { duration: SETTLE_MS, easing: 'linear', fill: 'forwards' });
      after(fade, SETTLE_MS, finish);
    });
  }

  function boot(){
    try { start(); }
    catch(err){
      const layer = document.querySelector('.hero-intro');
      if(layer) layer.remove();
      console.error('[hero-intro] intro failed:', err);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
