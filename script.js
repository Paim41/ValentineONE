/* ─────────────────────────────────────────────
   LOVE GALAXY — script.js
   ───────────────────────────────────────────── */
'use strict';

/* ══════════════════════════════════════════════
   ENVELOPE BG — rain on env-canvas
══════════════════════════════════════════════ */
(function envBg(){
  const cv  = document.getElementById('env-canvas');
  const ctx = cv.getContext('2d');
  let W, H;
  const drops = [];

  function resize(){
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for(let i = 0; i < 90; i++){
    drops.push({
      x  : Math.random() * window.innerWidth,
      y  : Math.random() * window.innerHeight,
      len: 8  + Math.random() * 14,
      spd: 1.5 + Math.random() * 2.5,
      a  : 0.12 + Math.random() * 0.3
    });
  }

  function tick(){
    const screen = document.getElementById('envelope-screen');
    if(!screen || screen.style.display === 'none') return;
    ctx.clearRect(0, 0, W, H);
    drops.forEach(d => {
      d.y += d.spd; d.x -= d.spd * 0.15;
      if(d.y > H + 20){ d.y = -d.len; d.x = Math.random() * W; }
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - d.len * 0.15, d.y + d.len);
      ctx.strokeStyle = `rgba(255,26,26,${d.a})`;
      ctx.lineWidth   = 0.8;
      ctx.stroke();
    });
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ══════════════════════════════════════════════
   ENVELOPE — OPEN
══════════════════════════════════════════════ */
const envelopeScreen = document.getElementById('envelope-screen');
const mainSite       = document.getElementById('main-site');
const envelopeWrap   = document.getElementById('envelope-wrap');

envelopeWrap.addEventListener('click', openEnvelope);
envelopeWrap.addEventListener('keydown', e => {
  if(e.key === 'Enter' || e.key === ' ') openEnvelope();
});

function openEnvelope(){
  if(envelopeWrap.classList.contains('opening')) return;
  envelopeWrap.classList.add('opening');

  setTimeout(() => {
    envelopeScreen.classList.add('fade-out');
    /* Show main site BEFORE opacity transition so layout is ready */
    mainSite.classList.remove('hidden');
    mainSite.classList.add('visible');

    setTimeout(() => {
      envelopeScreen.style.display = 'none';
      document.getElementById('controls').style.display = 'flex';
      initAll();
    }, 950);
  }, 750);
}

/* ══════════════════════════════════════════════
   GLOBALS
══════════════════════════════════════════════ */
const isMobile   = /Mobi|Android/i.test(navigator.userAgent);
const BASE_COUNT = isMobile ? 1600 : 4000;
let   loveMode   = false;
let   soundOn    = false;

const mouse = { x: 0, y: 0, nx: 0, ny: 0 };
const clock = { last: 0, elapsed: 0 };

/* ══════════════════════════════════════════════
   INIT ALL — called once envelope is done
══════════════════════════════════════════════ */
function initAll(){
  clock.last = performance.now();
  initCursor();
  initRain();
  initThree();
  initOrbitCards();   /* orbit cards MUST start invisible; JS places then reveals */
  initWords();
  initControls();
  initLightbox();
  initScrollReveal();
}

/* ══════════════════════════════════════════════
   CURSOR
══════════════════════════════════════════════ */
function initCursor(){
  const update = (x, y) => {
    mouse.x = x; mouse.y = y;
    mouse.nx = (x / window.innerWidth)  * 2 - 1;
    mouse.ny = -(y / window.innerHeight) * 2 + 1;
    document.documentElement.style.setProperty('--cx', x + 'px');
    document.documentElement.style.setProperty('--cy', y + 'px');
  };
  window.addEventListener('mousemove', e => update(e.clientX, e.clientY));
  window.addEventListener('touchmove', e => {
    update(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
}

/* ══════════════════════════════════════════════
   RIPPLE
══════════════════════════════════════════════ */
function spawnRipple(x, y, sz = 200){
  const rc = document.getElementById('ripple-container');
  const el = document.createElement('div');
  el.className = 'ripple';
  el.style.cssText = `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;`;
  rc.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

/* ══════════════════════════════════════════════
   RED RAIN — main canvas overlay
══════════════════════════════════════════════ */
function initRain(){
  const cv  = document.getElementById('rain-canvas');
  const ctx = cv.getContext('2d');
  let W, H;
  const COUNT = isMobile ? 80 : 160;
  const drops = [];

  function resize(){
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for(let i = 0; i < COUNT; i++){
    drops.push({
      x  : Math.random() * window.innerWidth,
      y  : Math.random() * window.innerHeight,
      len: 10 + Math.random() * 22,
      spd: 2   + Math.random() * 4,
      a  : 0.05 + Math.random() * 0.15,
      w  : 0.5  + Math.random() * 0.8
    });
  }

  const SX = -0.15; /* slant */

  function rainTick(){
    ctx.clearRect(0, 0, W, H);
    const spd = loveMode ? 1.6 : 1;
    drops.forEach(d => {
      d.y += d.spd * spd;
      d.x += d.spd * SX * spd;
      if(d.y > H + 30){ d.y = -d.len; d.x = Math.random() * W; }
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.len * SX, d.y + d.len);
      ctx.strokeStyle = `rgba(255,26,26,${d.a * (loveMode ? 1.6 : 1)})`;
      ctx.lineWidth   = d.w;
      ctx.lineCap     = 'round';
      ctx.stroke();
    });
    requestAnimationFrame(rainTick);
  }
  rainTick();
}

/* ══════════════════════════════════════════════
   THREE.JS — PARTICLE HEART + VORTEX
══════════════════════════════════════════════ */
function initThree(){
  const canvas   = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 28;

  function heartPos(n){
    const p = [];
    for(let i = 0; i < n; i++){
      const t  = (i / n) * Math.PI * 2;
      const nr = () => (Math.random() - .5) * .38;
      p.push(
        (16 * Math.pow(Math.sin(t), 3) + nr()) * .55,
        (13 * Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t) + nr()) * .55 + 8,
        (Math.random() - .5) * .6
      );
    }
    return p;
  }

  function vortexPos(n){
    const p = [], arms = 3;
    for(let i = 0; i < n; i++){
      const arm = i % arms, ratio = i / n;
      const angle = ratio * Math.PI * 12 + (arm / arms) * Math.PI * 2;
      const r  = ratio * 14 + Math.random() * 1.5;
      const sp = (1 - ratio) * .8;
      p.push(
        Math.cos(angle) * r + (Math.random() - .5) * sp,
        (Math.random() - .5) * (ratio * 2.5) - 3,
        Math.sin(angle) * r + (Math.random() - .5) * sp
      );
    }
    return p;
  }

  const hN  = Math.floor(BASE_COUNT * .45);
  const vN  = Math.floor(BASE_COUNT * .55);
  const tot = hN + vN;

  const positions = new Float32Array(tot * 3);
  const origins   = new Float32Array(tot * 3);
  const vels      = new Float32Array(tot * 3);
  const sizes     = new Float32Array(tot);
  const alphas    = new Float32Array(tot);

  const hP = heartPos(hN), vP = vortexPos(vN);
  for(let i = 0; i < hN; i++){
    const idx = i * 3;
    positions[idx]   = origins[idx]   = hP[idx];
    positions[idx+1] = origins[idx+1] = hP[idx+1];
    positions[idx+2] = origins[idx+2] = hP[idx+2];
    sizes[i]  = Math.random() * .12 + .06;
    alphas[i] = Math.random() * .5  + .5;
  }
  for(let i = 0; i < vN; i++){
    const pi = hN + i, idx = pi * 3, vi = i * 3;
    positions[idx]   = origins[idx]   = vP[vi];
    positions[idx+1] = origins[idx+1] = vP[vi+1];
    positions[idx+2] = origins[idx+2] = vP[vi+2];
    sizes[pi]  = Math.random() * .08 + .03;
    alphas[pi] = Math.random() * .6  + .2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aAlpha',   new THREE.BufferAttribute(alphas, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime:{value:0}, uPixR:{value:renderer.getPixelRatio()}, uLM:{value:0} },
    vertexShader:`
      attribute float aSize,aAlpha;
      uniform float uPixR,uLM;
      varying float vA;
      void main(){
        vA=aAlpha;
        vec4 mv=modelViewMatrix*vec4(position,1.);
        gl_PointSize=aSize*(1.+uLM*.5)*uPixR*(350./-mv.z);
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader:`
      varying float vA; uniform float uLM;
      void main(){
        vec2 uv=gl_PointCoord-.5; float d=length(uv);
        if(d>.5) discard;
        float core=1.-smoothstep(0.,.25,d);
        float glow=1.-smoothstep(.1,.5,d);
        float a=(core*.9+glow*.5)*vA*(1.+uLM*.4);
        vec3 col=mix(vec3(1.,.15,.15),vec3(1.,.04,.04),d*2.);
        gl_FragColor=vec4(col,clamp(a,0.,1.));
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });

  scene.add(new THREE.Points(geo, mat));

  /* Vortex rotation state */
  const vAngles = new Float32Array(vN);
  const vRadii  = new Float32Array(vN);
  for(let i = 0; i < vN; i++){
    const pi = hN + i, idx = pi * 3;
    const x = origins[idx], z = origins[idx+2];
    vRadii[i]  = Math.sqrt(x*x + z*z);
    vAngles[i] = Math.atan2(z, x);
  }

  /* Burst on click (hero area only) */
  let burstT = 0;
  window.addEventListener('click', e => {
    if(e.target.closest('.orbit-card,#controls,#lightbox,#below-fold,#btn-lovemode,#btn-sound')) return;
    spawnRipple(e.clientX, e.clientY);
    for(let i = 0; i < tot; i++){
      const idx = i * 3;
      vels[idx]   += (Math.random() - .5) * .9;
      vels[idx+1] += (Math.random() - .5) * .9;
      vels[idx+2] += (Math.random() - .5) * .9;
    }
    burstT = 1.6;
  });
  window.addEventListener('touchstart', e => {
    if(e.target.closest('.orbit-card,#controls,#lightbox,#below-fold')) return;
    spawnRipple(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  function sN(x){ return Math.sin(x*1.91) * Math.cos(x*2.73) * Math.sin(x*5.17); }

  function frame(ts){
    requestAnimationFrame(frame);
    const dt = Math.min((ts - clock.last) / 1000, .05);
    clock.elapsed += dt; clock.last = ts;
    const t = clock.elapsed, lm = loveMode ? 1 : 0, spd = 1 + lm * .4;
    mat.uniforms.uTime.value = t;
    mat.uniforms.uLM.value   = lm;
    const pos = geo.attributes.position.array;

    camera.position.x = mouse.nx * 2;
    camera.position.y = mouse.ny - 1;
    camera.lookAt(0, 2, 0);
    if(burstT > 0) burstT -= dt;

    /* heart */
    for(let i = 0; i < hN; i++){
      const idx = i * 3, ph = i * .01 + t * spd * .7;
      const ox = origins[idx], oy = origins[idx+1], oz = origins[idx+2];
      const pulse = 1 + Math.sin(t*spd*1.2)*.05 + Math.sin(t*spd*2.1+i*.002)*.015;
      let tx = ox*pulse + sN(ph)*.08;
      let ty = oy*pulse + sN(ph+100)*.08;
      let tz = oz       + sN(ph+200)*.06;
      const wx=mouse.nx*16, wy=mouse.ny*10;
      const dx=tx-wx, dy=ty-wy-8, d2=dx*dx+dy*dy, rd=4.5;
      if(d2 < rd*rd){ const d=Math.sqrt(d2), f=(rd-d)/rd*.2; vels[idx]+=dx/d*f; vels[idx+1]+=dy/d*f; }
      if(burstT > 0){ tx+=vels[idx]*burstT; ty+=vels[idx+1]*burstT; tz+=vels[idx+2]*burstT; }
      vels[idx]*=.92; vels[idx+1]*=.92; vels[idx+2]*=.92;
      pos[idx]   += (tx - pos[idx])   * .06;
      pos[idx+1] += (ty - pos[idx+1]) * .06;
      pos[idx+2] += (tz - pos[idx+2]) * .06;
    }

    /* vortex */
    for(let i = 0; i < vN; i++){
      const pi = hN+i, idx = pi*3, r = vRadii[i];
      vAngles[i] += (0.25 + (14 - Math.min(r,14)) * .04) * spd * dt;
      const oy = origins[idx+1], ph = i * .02 + t * .5;
      let tx = Math.cos(vAngles[i])*r + sN(ph)*.3;
      let ty = oy + Math.sin(t*spd*.3+i*.05)*.3 + sN(ph+50)*.2;
      let tz = Math.sin(vAngles[i])*r + sN(ph+100)*.3;
      if(burstT > 0){ tx+=vels[idx]*burstT; ty+=vels[idx+1]*burstT; tz+=vels[idx+2]*burstT; }
      vels[idx]*=.9; vels[idx+1]*=.9; vels[idx+2]*=.9;
      pos[idx]   += (tx - pos[idx])   * .1;
      pos[idx+1] += (ty - pos[idx+1]) * .1;
      pos[idx+2] += (tz - pos[idx+2]) * .1;
    }

    geo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mat.uniforms.uPixR.value = renderer.getPixelRatio();
  });
}

/* ══════════════════════════════════════════════
   ORBITING PHOTO CARDS
   FIX: every card starts with CSS  opacity:0 !important
   JS places them on the correct orbit position FIRST,
   then adds class .oc-ready (removes the !important override)
   and the orbit loop drives opacity each frame.
   Result: no card ever flashes at (0,0).
══════════════════════════════════════════════ */
function initOrbitCards(){
  const cards = Array.from(document.querySelectorAll('.orbit-card'));
  const N     = cards.length;

  /* Build inner markup */
  cards.forEach(card => {
    if(!card.querySelector('img')){
      const emp = document.createElement('div');
      emp.className = 'oc-empty';
      emp.innerHTML = `<div class="oc-empty-ring"></div>
                       <div class="oc-empty-label">${card.dataset.caption || ''}</div>`;
      card.appendChild(emp);
    }
    const tip = document.createElement('div');
    tip.className = 'oc-tooltip';
    tip.innerHTML = `<span class="oc-caption">${card.dataset.caption || ''}</span>
                     <span class="oc-date">${card.dataset.date || ''}</span>`;
    card.appendChild(tip);
  });

  /* Orbit parameters per card */
  const params = cards.map((_, i) => ({
    phaseOffset : (i / N) * Math.PI * 2,
    speedMul    : 0.78 + Math.random() * 0.38,
    wobbleAmp   : 14   + Math.random() * 22,
    wobbleFreq  : 0.32 + Math.random() * 0.28,
    wobblePhase : Math.random() * Math.PI * 2,
    tiltAmp     : 4    + Math.random() * 10,
    tiltFreq    : 0.25 + Math.random() * 0.22,
    tiltPhase   : Math.random() * Math.PI * 2,
    scaleBase   : 0.86 + Math.random() * 0.14,
    scaleAmp    : 0.06,
    dragging    : false,
    dragDX      : 0, dragDY: 0,
    cx          : 0, cy    : 0,   /* smoothed screen pos */
    ready       : false           /* becomes true after first frame placement */
  }));

  function getRadii(){
    const W = window.innerWidth, H = window.innerHeight;
    return {
      rx: W * (isMobile ? .38 : .30),
      ry: H * (isMobile ? .30 : .24)
    };
  }

  /* ── Place cards at their orbit positions synchronously BEFORE first paint ── */
  const { rx: rx0, ry: ry0 } = getRadii();
  const cx0 = window.innerWidth / 2, cy0 = window.innerHeight / 2;
  const CARD_W = 148, CARD_H = Math.round(148 * 4 / 3);

  params.forEach((p, i) => {
    const angle = p.phaseOffset; /* baseAngle = 0 at t=0 */
    p.cx = cx0 + Math.cos(angle) * rx0;
    p.cy = cy0 + Math.sin(angle) * ry0;
    cards[i].style.left = (p.cx - CARD_W / 2) + 'px';
    cards[i].style.top  = (p.cy - CARD_H / 2) + 'px';
  });

  /* Now reveal cards with a stagger — they're already in position */
  let baseAngle = 0;
  const nudge   = { x: 0, y: 0 };

  /* Run ONE orbit tick synchronously to get transforms set, THEN fade in */
  function placeCard(i){
    const p = params[i], card = cards[i];
    const t = clock.elapsed;
    const { rx, ry } = getRadii();
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    const angle  = baseAngle * p.speedMul + p.phaseOffset;
    const depthT = (Math.sin(angle) + 1) / 2;
    const scale  = p.scaleBase + p.scaleAmp * depthT;
    const tilt   = Math.sin(t * p.tiltFreq + p.tiltPhase) * p.tiltAmp;
    card.style.transform = `rotate(${tilt}deg) scale(${scale})`;
    card.style.zIndex    = String(Math.round(3 + depthT * 5));
  }

  cards.forEach((card, i) => {
    placeCard(i);
    /* small stagger so they don't all pop at once */
    setTimeout(() => {
      card.classList.add('oc-ready');
      /* start at 0, orbit loop will set correct value next frame */
      card.style.opacity = '0';
      /* one rAF later the loop will have set opacity correctly */
      requestAnimationFrame(() => {
        params[i].ready = true;
      });
    }, 200 + i * 100);
  });

  /* ── ORBIT ANIMATION LOOP ── */
  function orbitTick(){
    requestAnimationFrame(orbitTick);
    const t = clock.elapsed;
    baseAngle += (loveMode ? 0.22 : 0.13) / 60;

    nudge.x += (mouse.nx * 26  - nudge.x) * 0.04;
    nudge.y += (-mouse.ny * 16 - nudge.y) * 0.04;

    const { rx, ry } = getRadii();
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;

    cards.forEach((card, i) => {
      const p = params[i];
      if(!p.ready) return;   /* wait until card has been revealed */
      if(p.dragging) return;

      const angle  = baseAngle * p.speedMul + p.phaseOffset;
      const ex     = cx + Math.cos(angle) * rx;
      const ey     = cy + Math.sin(angle) * ry;
      const wx     = Math.sin(t * p.wobbleFreq + p.wobblePhase)       * p.wobbleAmp;
      const wy     = Math.cos(t * p.wobbleFreq + p.wobblePhase + 1.2) * p.wobbleAmp * .55;

      p.cx += (ex + wx + nudge.x - p.cx) * 0.055;
      p.cy += (ey + wy + nudge.y - p.cy) * 0.055;

      const depthT = (Math.sin(angle) + 1) / 2;
      const tilt   = Math.sin(t * p.tiltFreq + p.tiltPhase) * p.tiltAmp;
      const rotZ   = tilt + Math.sin(angle) * 3.5;
      const scale  = p.scaleBase + p.scaleAmp * depthT + (loveMode ? .04 : 0);

      card.style.zIndex   = String(Math.round(3 + depthT * 5));
      card.style.opacity  = String((0.50 + 0.50 * depthT).toFixed(2));
      const w = card.offsetWidth  || CARD_W;
      const h = card.offsetHeight || CARD_H;
      card.style.left      = (p.cx - w / 2) + 'px';
      card.style.top       = (p.cy - h / 2) + 'px';
      card.style.transform = `rotate(${rotZ}deg) scale(${scale})`;
    });
  }
  orbitTick();

  /* ── DRAG ── */
  cards.forEach((card, i) => {
    const p = params[i];
    let startX = 0, startY = 0, moved = false;

    const onDown = (ex, ey) => {
      p.dragging = true; moved = false;
      startX = ex; startY = ey;
      p.dragDX = ex - p.cx; p.dragDY = ey - p.cy;
      card.style.zIndex = '50';
    };
    const onMove = (ex, ey) => {
      if(!p.dragging) return;
      if(Math.abs(ex - startX) > 5 || Math.abs(ey - startY) > 5) moved = true;
      p.cx = ex - p.dragDX; p.cy = ey - p.dragDY;
      const w = card.offsetWidth || CARD_W, h = card.offsetHeight || CARD_H;
      card.style.left = (p.cx - w / 2) + 'px';
      card.style.top  = (p.cy - h / 2) + 'px';
    };
    const onUp = () => {
      if(!p.dragging) return;
      p.dragging = false;
      if(!moved) openLightbox(card);
    };

    card.addEventListener('mousedown',  e => { e.stopPropagation(); onDown(e.clientX, e.clientY); });
    window.addEventListener('mousemove', e => { if(p.dragging) onMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup',   () => onUp());

    card.addEventListener('touchstart', e => {
      e.stopPropagation();
      onDown(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchmove', e => {
      if(p.dragging) onMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    window.addEventListener('touchend', () => onUp());
  });

  /* Recentre on resize */
  window.addEventListener('resize', () => {
    const { rx, ry } = getRadii();
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    params.forEach((p, i) => {
      const angle = p.phaseOffset;
      p.cx = cx + Math.cos(angle) * rx;
      p.cy = cy + Math.sin(angle) * ry;
    });
  });
}

/* ══════════════════════════════════════════════
   LIGHTBOX
══════════════════════════════════════════════ */
function openLightbox(card){
  const lb    = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  lbImg.innerHTML = '';
  document.getElementById('lb-caption').textContent = card.dataset.caption || '';
  document.getElementById('lb-date').textContent    = card.dataset.date    || '';
  const img = card.querySelector('img');
  if(img){
    const el = document.createElement('img');
    el.src = img.src; el.alt = card.dataset.caption || '';
    lbImg.appendChild(el);
  } else {
    lbImg.innerHTML = `<div class="lb-empty">
      <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/></svg>
      <p>Photo coming soon</p></div>`;
  }
  lb.classList.remove('lb-hidden');
  lb.classList.add('lb-visible');
}

function initLightbox(){
  const close = () => {
    document.getElementById('lightbox').classList.replace('lb-visible', 'lb-hidden');
  };
  document.getElementById('lb-close').addEventListener('click', close);
  document.getElementById('lb-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
}

/* ══════════════════════════════════════════════
   FLOATING WORDS
══════════════════════════════════════════════ */
const WORDS = [
  'Infinite Love','Amor Eterno','Te Amo','My Love',
  '永遠の愛',"Je t'aime",'Amore Mio','사랑해',
  'Forever Yours','Mon Amour','Sempre','愛してる','قلبي'
];

function initWords(){
  spawnWord(); spawnWord(); spawnWord();
  setInterval(spawnWord, 2000);
}

function spawnWord(){
  const layer = document.getElementById('words-layer');
  const el    = document.createElement('div');
  el.className   = 'word';
  el.textContent = WORDS[Math.floor(Math.random() * WORDS.length)];
  const dur = 5 + Math.random() * 7, del = Math.random() * 1.5;
  el.style.cssText = `left:${8+Math.random()*82}%;top:${8+Math.random()*78}%;animation-duration:${dur}s;animation-delay:${del}s;font-size:${.65+Math.random()*.6}rem;`;
  layer.appendChild(el);
  setTimeout(() => el.remove(), (dur + del + .5) * 1000);
}

/* ══════════════════════════════════════════════
   CONTROLS — SOUND + LOVE MODE
══════════════════════════════════════════════ */
let audioCtx, gainNode;

function initControls(){
  document.getElementById('btn-sound').addEventListener('click', e => {
    e.stopPropagation();
    soundOn = !soundOn;
    document.getElementById('icon-mute').style.display  = soundOn ? 'none'  : 'block';
    document.getElementById('icon-sound').style.display = soundOn ? 'block' : 'none';
    document.getElementById('btn-sound').classList.toggle('active', soundOn);
    if(soundOn){
      if(!audioCtx){
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.connect(audioCtx.destination);
        [110, 165, 220, 330].forEach((f, i) => {
          const osc = audioCtx.createOscillator();
          const g   = audioCtx.createGain();
          osc.type = 'sine'; osc.frequency.value = f;
          g.gain.value = [.15,.08,.05,.03][i];
          osc.connect(g); g.connect(gainNode); osc.start();
        });
      }
      gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(.35, audioCtx.currentTime + 1.5);
    } else if(gainNode){
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
    }
  });

  document.getElementById('btn-lovemode').addEventListener('click', e => {
    e.stopPropagation();
    loveMode = !loveMode;
    document.getElementById('btn-lovemode').classList.toggle('active', loveMode);
    document.getElementById('love-overlay').classList.toggle('active', loveMode);
  });
}

/* ══════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════ */
function initScrollReveal(){
  const targets = document.querySelectorAll(
    '#letter-section, #letter-paper, .quote-divider, #site-footer'
  );
  targets.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(el => io.observe(el));
}

/* Pause when tab hidden */
document.addEventListener('visibilitychange', () => {
  if(!document.hidden) clock.last = performance.now();
});
