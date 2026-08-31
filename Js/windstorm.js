/* ============================================================
   Windstorm

   Click the "Portfolio." logo and the hero's role wheel takes off, spinning
   for six seconds - and the wheel drags the rest of the hero with it:

     0s - 4s   the wind builds. Everything in front of the wheel trembles,
               gently at first and violently by the end.
     4s        it lets go. The hero's text, its buttons and the drifting
               shapes are torn off and blown across the page like leaves.
     4s - 7s   gone. The hero sits empty for the full three seconds.
     7s - 8s   the wind drops and everything settles back down from above.

   The wheel runs for six of those eight seconds, so it comes to rest about a
   second before the hero is repopulated. That is deliberate - it is the wheel
   letting go that ends the storm - but the two numbers are independent: SPIN_MS
   and STORM_MS below.

   The wind blows right to left, out of the wheel, because that is where the
   wheel is. Everything flies away from it.

   Three things make this safe to run over a page that is already animating:

     `composite: 'add'` on the wheel, the ring and the floating shapes. All
     three already have CSS animations owning their transform - professionRotate,
     professionCounter, floatCross. A plain animation would replace those, so
     the wheel would jump out of its cycle and the shapes would snap out of
     their drift. Composed additively, the storm rides on top and nothing loses
     its place. The hero's text has no such animation, so it is animated
     outright.

     A whole number of turns. The wheel's extra rotation is a multiple of 360,
     so it finishes exactly where its own animation says it should - which is
     what lets every effect here be dropped with `fill: none` and nothing move
     at the handover.

     The blow is biased up and to the left. A transformed element still counts
     toward scrollable overflow downward, so throwing the hero's content down
     the page would grow the document and flash a scrollbar mid-storm. Sideways
     is free: html already hides its horizontal overflow.

   The header is deliberately left out of it. Chrome that shakes and blows away
   reads as a broken page rather than a joke, and the nav has to stay usable.

   Nothing here is load-bearing. Reduced motion skips it, the logo navigates
   nowhere, and with no fill anywhere there is nothing to clean up.
   ============================================================ */
(function windstorm(){
  const SPIN_MS  = 6000;   // how long the wheel runs
  const STORM_MS = 8000;   // how long the hero is at the wind's mercy
  const TURNS    = 11;     // whole turns, so the wheel lands back in step

  // fractions of STORM_MS, so the beats stay put if the total is retimed
  const GUST_AT   = 4000 / STORM_MS;   // the wind lets go
  const GONE_AT   = 4900 / STORM_MS;   // everything is off the page by here
  const RETURN_AT = 7000 / STORM_MS;   // three seconds later, it starts back
  const SHAKES    = 26;                // jitter samples across the build-up

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const logo   = document.querySelector('.header .logo');
  const wheel  = document.querySelector('.home .profession-box');
  if(!logo || !wheel) return;

  const ring = wheel.querySelector('.circle');
  const supported = typeof Element !== 'undefined' && !!Element.prototype.animate;

  let blowing = false;

  const rand = function(n){ return (Math.random() * 2 - 1) * n; };

  /* How far round the element's own `transform` has already turned it.
     Read from the computed matrix, which covers the CSS animation's rotate and
     nothing else - the separate `translate` property floatSway drives is not
     part of it. */
  function spun(el){
    const m = getComputedStyle(el).transform;
    if(!m || m === 'none') return 0;
    const p = m.replace(/matrix\(|\)/g, '').split(',').map(Number);
    if(p.length < 4) return 0;
    return Math.atan2(p[1], p[0]) * 180 / Math.PI;
  }

  /* One step of the flight, written so the translation always means the same
     direction on screen.

     This is the whole reason `theta` exists. An additive animation appends to
     the transform list already on the element, and floatCross's list ends in a
     rotate of up to 140deg - so a plain `translate(-400px, 0)` is measured in
     the shape's own turned frame, and a shape far enough round is blown to the
     right, back into the wheel. Undoing the rotation, translating, then
     putting it back leaves the movement in screen space and the shape's own
     spin untouched. */
  function step(dx, dy, rot, sc, theta){
    const back = theta ? 'rotate(' + (-theta).toFixed(2) + 'deg) ' : '';
    const fwd  = theta ? 'rotate(' + theta.toFixed(2) + 'deg) ' : '';
    return back +
           'translate(' + dx.toFixed(0) + 'px,' + dy.toFixed(0) + 'px) ' +
           fwd +
           'rotate(' + rot.toFixed(0) + 'deg) scale(' + sc + ')';
  }

  logo.addEventListener('click', function(ev){
    ev.preventDefault();          // the bare href="#" would jump to the top
    if(!supported || reduce.matches || blowing) return;
    storm();
  });

  /* Everything the wind gets hold of. The text and buttons are plain elements;
     the floating shapes are already animating, so they are marked to be
     composed on top of rather than replaced. */
  function victims(){
    const list = [];
    document.querySelectorAll(
      '.home-content h3, .home-content h1, .home-content .tagline,' +
      '.home-content .social-media a, .home-content .btn'
    ).forEach(function(el){ list.push({ el: el, add: false }); });

    document.querySelectorAll('.home .floaters span').forEach(function(el){
      list.push({ el: el, add: true });
    });
    return list;
  }

  function gustFrames(theta){
    const frames = [];

    // 0 -> 4s: trembling, amplitude climbing on a curve so it is barely there
    // at first and rattling by the end
    for(let k = 0; k <= SHAKES; k++){
      const t = k / SHAKES;
      const amp = t * t * 9;
      frames.push({
        offset: +(t * GUST_AT).toFixed(4),
        transform: k === 0
          ? step(0, 0, 0, 1, theta)
          : step(rand(amp), rand(amp * .55), rand(amp * .4), 1, theta)
      });
    }

    // 4s: torn off and carried away, left and mostly upward
    const dx  = -(260 + Math.random() * 780);
    const dy  = -(Math.random() * 300) + 70;
    const rot = rand(700);

    frames.push({
      offset: +((GUST_AT + GONE_AT) / 2).toFixed(4),
      transform: step(dx * .55, dy * .5, rot * .5, .86, theta),
      easing: 'cubic-bezier(.3,0,.5,1)'
    });
    frames.push({
      offset: +GONE_AT.toFixed(4),
      transform: step(dx, dy, rot, .72, theta),
      easing: 'linear'
    });

    /* Held out there. Without this the flight would simply be stretched over
       the whole gap and everything would drift home in slow motion; the hero
       is supposed to stand empty for the three seconds. A little onward drift
       rather than a freeze, so it reads as still being carried. */
    /* Carried on out and shrunk away to nothing.

       Scaling to zero rather than fading is deliberate: scale is part of the
       transform this is already composing, so it works the same whether the
       animation replaces the element's transform or is added to one - which
       an opacity keyframe would not. Added opacity composes by addition, and
       the floating shapes sit at .16 in light mode and .3 in dark, so there is
       no single value that hides them both. */
    frames.push({
      offset: +((GONE_AT + RETURN_AT) / 2).toFixed(4),
      transform: step(dx * 1.25, dy * 1.2, rot * 1.3, 0, theta),
      easing: 'cubic-bezier(.4,0,.7,1)'
    });

    /* And now the important part: it does NOT fly home the way it came.
       Retracing the flight backwards reads as a rewind - the tape running in
       reverse - rather than as anything the wind did.

       Instead, while it is scaled to nothing and cannot be seen, it is moved
       to a point high above where it belongs. From there it simply settles
       down into place, the way something dropped by a gust actually lands.
       The jump itself is invisible; only the landing is ever on screen. */
    frames.push({
      offset: +RETURN_AT.toFixed(4),
      transform: step(dx * .06, -300, -18, 0, theta)
    });
    frames.push({
      offset: 0.90,
      transform: step(dx * .02, -96, -7, .88, theta),
      easing: 'cubic-bezier(.33,0,.35,1)'
    });

    // a touch past home and back, so it lands rather than glides in
    frames.push({ offset: 0.96, transform: step(0, 13, 2, 1.02, theta) });
    frames.push({ offset: 1,    transform: step(0, 0, 0, 1, theta) });

    return frames;
  }

  function storm(){
    blowing = true;

    const full = 360 * TURNS;

    // wind up, hold at speed, then run down to a stop
    const spin = function(sign){
      return [
        { transform: 'rotate(0deg)',                          offset: 0,
          easing: 'cubic-bezier(.5,0,.75,.4)' },
        { transform: 'rotate(' + (sign * full * .10) + 'deg)', offset: .22,
          easing: 'linear' },
        { transform: 'rotate(' + (sign * full * .72) + 'deg)', offset: .72,
          easing: 'cubic-bezier(.25,.5,.2,1)' },
        { transform: 'rotate(' + (sign * (full + 10)) + 'deg)', offset: .95,
          easing: 'cubic-bezier(.34,1.1,.64,1)' },
        { transform: 'rotate(' + (sign * full) + 'deg)',       offset: 1 }
      ];
    };

    try{
      wheel.animate(spin(1),  { duration: SPIN_MS, composite: 'add' });
      if(ring) ring.animate(spin(-1), { duration: SPIN_MS, composite: 'add' });

      victims().forEach(function(v){
        // only the additive ones are riding on someone else's rotation
        v.el.animate(gustFrames(v.add ? spun(v.el) : 0), {
          duration: STORM_MS,
          composite: v.add ? 'add' : 'replace'
        });
      });
    }catch(err){
      blowing = false;
      return;
    }

    setTimeout(function(){ blowing = false; }, STORM_MS + 120);
  }
})();
