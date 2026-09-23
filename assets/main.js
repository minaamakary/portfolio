// ── Newsroom Carousel ──────────────────────────────────
const NR_TOTAL = 7;
const NR_DURATION = 5000;
let nrCurrent = 0;
let nrTimer = null;

function nrGo(dir) {
  nrJump((nrCurrent + dir + NR_TOTAL) % NR_TOTAL);
}

function nrJump(idx) {
  if (nrTimer) clearTimeout(nrTimer);
  document.querySelectorAll('.nr-slide').forEach((s,i) => s.classList.toggle('active', i === idx));
  document.querySelectorAll('.nr-dot').forEach((d,i) => d.classList.toggle('active', i === idx));
  nrCurrent = idx;
  // Reset and animate progress bar
  const bar = document.getElementById('nr-bar');
  if (bar) {
    bar.style.transition = 'none';
    bar.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      bar.style.transition = `width ${NR_DURATION}ms linear`;
      bar.style.width = '100%';
    }));
  }
  nrTimer = setTimeout(() => nrGo(1), NR_DURATION);
}

// Start on page load
document.addEventListener('DOMContentLoaded', () => {
  nrJump(0);
  const h1 = document.getElementById('hero-h1');
  if (h1) h1.classList.add('animated');
});

function hlLang(id, btn, lang) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = el.dataset[lang];
  el.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  const btns = btn.parentNode.querySelectorAll('.lang-btn');
  btns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
const HL_DURATION = 8000; // ms per slide before auto-advancing
let hlCurrent = 0;
let hlTotal = 0;
let hlTimer = null;
let hlProgTimer = null;

function hlInit() {
  const slides = document.querySelectorAll('.hl-slide');
  hlTotal = slides.length;
  if (hlTotal === 0) return;

  // Preload video elements only
  document.querySelectorAll('.hl-media').forEach(m => {
    if (m.tagName === 'VIDEO') {
      m.load();
      m.addEventListener('loadedmetadata', () => {
        if (m.duration && isFinite(m.duration)) {
          m.currentTime = m.duration * 0.35;
        }
      });
    }
  });

  hlSwitch(0);
}

function hlSwitch(idx) {
  if (hlTimer) clearInterval(hlTimer);
  if (hlProgTimer) clearInterval(hlProgTimer);

  const slides = document.querySelectorAll('.hl-slide');
  const tabs   = document.querySelectorAll('.hl-tab');
  const progs  = document.querySelectorAll('.hl-tab-progress');

  // Pause old video (skip if slide has an image)
  const oldVid = document.querySelector(`#hl-slide-${hlCurrent} .hl-media`);
  if (oldVid && oldVid.tagName === 'VIDEO') { oldVid.pause(); oldVid.currentTime = 0; }

  hlCurrent = idx;

  // Update slides
  slides.forEach((s, i) => s.classList.toggle('active', i === idx));
  tabs.forEach((t, i)   => t.classList.toggle('active', i === idx));

  // Reset all progress bars
  progs.forEach(p => { p.style.width = '0%'; p.style.transition = 'none'; });

  // Play active video (skip if slide has an image)
  const vid = document.querySelector(`#hl-slide-${idx} .hl-media`);
  if (vid && vid.tagName === 'VIDEO') vid.play().catch(() => {});

  // Animate active progress bar
  const activeBar = progs[idx];
  if (activeBar) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        activeBar.style.transition = `width ${HL_DURATION}ms linear`;
        activeBar.style.width = '100%';
      });
    });
  }

  // Auto-advance
  hlTimer = setTimeout(() => {
    hlSwitch((hlCurrent + 1) % hlTotal);
  }, HL_DURATION);
}

// ── Campaign section scroll ──────────────────────────────
function campScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 68;
  window.scrollTo({ top, behavior: 'smooth' });
}
// ── Page navigation ─────────────────────────────
// Each section is its own HTML file. Internal links fade the current
// page out (same .leaving animation as before), then load the next one.
const PAGE_FILES = {
  home: 'index.html', campaigns: 'campaigns.html', entertainment: 'entertainment.html',
  fnb: 'fnb.html', retail: 'retail.html', about: 'about.html'
};

function goTo(url) {
  const current = document.querySelector('.page.active');
  if (current) {
    current.classList.add('leaving');
    setTimeout(() => { location.href = url; }, 200);
  } else {
    location.href = url;
  }
}

// Kept so onclick="show('campaigns')" on non-link elements still works
function show(id) {
  if (PAGE_FILES[id]) goTo(PAGE_FILES[id]);
  return false;
}

document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.button !== 0) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname) || url.hash) return;
  const here = location.pathname.replace(/\/$/, '/index.html');
  const there = url.pathname.replace(/\/$/, '/index.html');
  e.preventDefault();
  if (there === here) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  goTo(url.href);
});

// Coming back with the Back button can restore the faded-out page from cache
window.addEventListener('pageshow', e => {
  if (e.persisted) document.querySelectorAll('.page.leaving').forEach(p => p.classList.remove('leaving'));
});

// Campaigns highlight carousel starts once the page is ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('page-campaigns')) setTimeout(hlInit, 100);
});

// Clickable non-link elements (role="button"/"link") respond to Enter and Space
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target.closest('[role="button"][tabindex], [role="link"][tabindex]');
  if (!el || el !== e.target) return;
  e.preventDefault();
  el.click();
});

// ── Mobile menu ─────────────────────────────────
function toggleMenu() {
  const burger = document.getElementById('gnav-burger');
  const menu   = document.getElementById('gnav-mobile-menu');
  burger.classList.toggle('open');
  menu.classList.toggle('open');
}

// ── Carousel (Undiz + Chaiwala mixed media) ────────────────
const carousels = {};

function carouselInit(id, total) {
  carousels[id] = { idx: 0, total };
}

function carouselGo(id, dir) {
  const c = carousels[id];
  if (!c) return;

  // Pause any video on the current slide before leaving
  pauseCarouselVideo(id, c.idx);

  c.idx = (c.idx + dir + c.total) % c.total;

  const track = document.getElementById(id + '-track');
  if (track) track.style.transform = `translateX(-${c.idx * 100}%)`;

  // Update dots
  const dots = document.querySelectorAll(`#${id}-dots .carousel-dot`);
  dots.forEach((d, i) => d.classList.toggle('active', i === c.idx));

  // Update counter if present
  const counter = document.getElementById(id + '-counter');
  if (counter) counter.textContent = `${c.idx + 1} / ${c.total}`;

  // Update vox counter
  if (id === 'vox') {
    const vc = document.getElementById('vox-counter');
    if (vc) vc.textContent = `${c.idx + 1} / ${c.total}`;
  }

  // Auto-play video on new slide if it's a video slide
  playCarouselVideo(id, c.idx);
}

function pauseCarouselVideo(id, idx) {
  const v = document.getElementById(id + '-v' + (idx + 1));
  if (v) { v.pause(); v.currentTime = 0; }
  const btn = document.getElementById(id + '-v' + (idx + 1) + '-btn');
  if (btn) btn.classList.remove('hidden');
}

function playCarouselVideo(id, idx) {
  const v = document.getElementById(id + '-v' + (idx + 1));
  if (v) {
    v.play().catch(() => {});
    const btn = document.getElementById(id + '-v' + (idx + 1) + '-btn');
    if (btn) btn.classList.add('hidden');
  }
}

function carouselPrev(id) { carouselGo(id, -1); }
function carouselNext(id) { carouselGo(id,  1); }

carouselInit('undiz', 2);
carouselInit('vox', 6);

// ── Lightbox ─────────────────────────────────────────
function lbOpen(eye, title, caption, tags, mediaSrc, mediaType) {
  const overlay = document.getElementById('lb-overlay');
  const media   = document.getElementById('lb-media');
  if (mediaType === 'video') {
    media.innerHTML = `<video src="${mediaSrc}" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;display:block"></video>`;
  } else {
    media.innerHTML = `<img loading="lazy" src="${mediaSrc}" alt="${title}" style="width:100%;height:100%;object-fit:cover;display:block"/>`;
  }
  document.getElementById('lb-eye').textContent     = eye || '';
  document.getElementById('lb-title').textContent   = title || '';
  document.getElementById('lb-caption').textContent = caption || '';
  document.getElementById('lb-tags').textContent    = tags || '';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function lbClose(e) {
  if (e && e.type === 'click') {
    const box = document.getElementById('lb-box');
    if (box && box.contains(e.target) && !e.target.classList.contains('lb-close')) return;
  }
  const overlay = document.getElementById('lb-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  const vid = overlay.querySelector('video');
  if (vid) vid.pause();
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') lbClose();
});

// ── Auto-wire hover captions + lightbox to all scards ──
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.scard').forEach(card => {
    // Skip cards with no real image/video
    const vis  = card.querySelector('.scard-vis');
    const img  = card.querySelector('.scard-vis img');
    const vid  = card.querySelector('.scard-vis video');
    const eye  = card.querySelector('.scard-eye')?.textContent  || '';
    const title= card.querySelector('.scard-title')?.textContent|| '';
    const desc = card.querySelector('.scard-desc')?.textContent || '';
    const date = card.querySelector('.scard-date')?.textContent || '';

    if (!vis || (!img && !vid)) return;

    const src      = img ? img.getAttribute('src') : vid?.getAttribute('src');
    const mType    = vid ? 'video' : 'image';

    // 1. Inject hover caption overlay
    if (desc && src) {
      const cap = document.createElement('div');
      cap.className = 'scard-hover-cap';
      cap.innerHTML = `
        <div class="scard-hover-cap-tag">${eye}</div>
        <div class="scard-hover-cap-text">${desc}</div>`;
      vis.appendChild(cap);
    }

    // 2. Wire lightbox on click - but only if card isn't a nav link
    // and only if it has real content
    if (src && title && !card.classList.contains('no-lb')) {
      // Preserve existing onclick for nav cards (home shelf)
      const existingOnclick = card.getAttribute('onclick');
      if (!existingOnclick || existingOnclick.includes('show(')) {
        // Don't override navigation cards - only add lightbox to non-nav cards
        if (!existingOnclick) {
          card.style.cursor = 'pointer';
          card.addEventListener('click', (e) => {
            e.preventDefault();
            lbOpen(eye, title, desc, date, src, mType);
          });
        }
      }
    }
  });
});

// ── Unified video card player ────────────────────────────────────────
(function initAllVideos() {
  const isTouch = window.matchMedia('(hover: none)').matches;

  document.querySelectorAll('video').forEach(video => {
    // Skip auto-managed videos (highlight carousel, lightbox)
    if (video.closest('.hl-slide') || video.closest('#lb-media')) return;

    const wrapper = video.parentElement;
    const playBtn = wrapper.querySelector('.vcard-play');
    const muteBtn = wrapper.querySelector('.mute-btn');

    if (!playBtn) return; // not an interactive card

    let playing = false;
    // Seek to a good thumbnail frame whenever metadata loads. The lazy
    // loader below calls load() again, which resets the video to frame 0.
    video.addEventListener('loadedmetadata', () => {
      if (!playing && video.duration && isFinite(video.duration)) {
        const customSeek = video.getAttribute('data-seek');
        video.currentTime = customSeek ? parseFloat(customSeek) : video.duration * 0.4;
      }
    });
    video.load();

    function startPlay() {
      if (isTouch) {
        // Mobile tap: play with sound by default
        video.muted = false;
        if (muteBtn) muteBtn.textContent = '🔊';
      } else {
        // Desktop hover: silent preview
        video.muted = true;
        if (muteBtn) muteBtn.textContent = '🔇';
      }
      // Only seek to start if data is already buffered —
      // seeking before load on iOS silently breaks play()
      if (video.readyState >= 2) video.currentTime = 0;
      video.play().then(() => {
        playing = true;
        playBtn.classList.add('hidden');
      }).catch(() => {
        // Play failed - reset everything so the user can try again
        playing = false;
        video.muted = true;
        if (muteBtn) muteBtn.textContent = '🔇';
        playBtn.classList.remove('hidden');
      });
    }

    function stopPlay() {
      video.pause();
      playing = false;
      video.muted = true;
      if (muteBtn) muteBtn.textContent = '🔇';
      playBtn.classList.remove('hidden');
      playBtn.textContent = '▶';
      const customSeek = video.getAttribute('data-seek');
      if (customSeek) {
        video.currentTime = parseFloat(customSeek);
      } else if (video.duration && isFinite(video.duration)) {
        video.currentTime = video.duration * 0.4;
      }
    }

    // Mute toggle (for videos with a sound button)
    if (muteBtn) {
      muteBtn.addEventListener('click', e => {
        e.stopPropagation();
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? '🔇' : '🔊';
        if (!video.muted && !playing) {
          startPlay();
        }
      });
    }

    if (isTouch) {
      // iOS Safari requires cursor:pointer to register taps on non-anchor elements
      wrapper.style.cursor = 'pointer';
      wrapper.addEventListener('click', e => {
        if (muteBtn && (e.target === muteBtn || muteBtn.contains(e.target))) return;
        e.stopPropagation();
        playing ? stopPlay() : startPlay();
      });
    } else {
      // Desktop: hover to play muted, mouse-leave to pause
      wrapper.style.cursor = 'pointer';
      wrapper.addEventListener('mouseenter', startPlay);
      wrapper.addEventListener('mouseleave', stopPlay);
    }
  });
})();

// ── Lazy-load videos when they scroll into view ──────────────────
(function() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: just set preload=metadata on all videos
    document.querySelectorAll('video[preload="none"]').forEach(v => {
      v.preload = 'metadata'; v.load();
    });
    return;
  }
  const vo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const v = entry.target;
      if (entry.isIntersecting && v.preload !== 'auto') {
        v.preload = 'auto';
        v.load();
        vo.unobserve(v);
      }
    });
  }, { rootMargin: '600px' });

  document.querySelectorAll('video[preload="none"]').forEach(v => vo.observe(v));
})();

// ── Horizontal galleries (Campaigns: Opening Night, Drone Shows) ─────
document.querySelectorAll('.hgal').forEach(gal => {
  const track = gal.querySelector('.hgal-track');
  const nav   = gal.querySelector('.hgal-nav');
  const prev  = gal.querySelector('.hgal-btn[data-dir="-1"]');
  const next  = gal.querySelector('.hgal-btn[data-dir="1"]');
  if (!track || !nav) return;

  const step = () => {
    const item = track.querySelector('.hgal-item');
    return item ? item.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 20) : track.clientWidth;
  };
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    nav.hidden = max <= 1;              // everything fits: no buttons needed
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  };

  [prev, next].forEach(btn => btn.addEventListener('click', () => {
    track.scrollBy({ left: step() * Number(btn.dataset.dir), behavior: 'smooth' });
  }));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});

// ── Word-by-word reveal (Drone Shows text, pull quotes) ─────────────
// Text stays readable without JS; words are only wrapped when we can animate them.
(function () {
  const els = document.querySelectorAll('.reveal-words, .pq-q');
  if (!els.length) return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  els.forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w, i) => `<span class="rw" style="--i:${i}">${w}</span>`).join(' ');
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);   // animate once
      }
    });
  }, { threshold: 0.6 });
  els.forEach(el => io.observe(el));
})();

// ── Gallery cards that open in the lightbox (Irish Village) ─────────
document.querySelectorAll('.hgal-item[data-lb]').forEach(item => {
  const media = item.querySelector('.hgal-media img, .hgal-media video');
  if (!media) return;
  const eye   = item.querySelector('.hgal-eye')?.textContent || '';
  const title = item.querySelector('.hgal-cap')?.textContent || '';
  const type  = media.tagName === 'VIDEO' ? 'video' : 'image';

  item.style.cursor = 'pointer';
  item.setAttribute('role', 'button');
  item.setAttribute('tabindex', '0');
  item.setAttribute('aria-label', `Open ${title}`);
  // On touch screens the video wrapper handles taps itself (play/pause) and stops the click here
  item.addEventListener('click', () => lbOpen(eye, title, '', '', media.getAttribute('src'), type));
});

// ── Scroll reveal: each top-level block fades up once as it scrolls in ──
(function () {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const blocks = document.querySelectorAll('.page .wrap > *, .home-rows > *');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });   // any part in view: works for blocks of any height
  blocks.forEach(el => {
    if (el.matches('script, .camp-section-anchor') || !el.getBoundingClientRect().height) return;
    el.classList.add('reveal');
    io.observe(el);
  });
})();

// ── Count-up numbers (DSF stats): 0 → value once, keeping the original format ──
(function () {
  const nums = document.querySelectorAll('.dsf-stat-num');
  if (!nums.length || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const run = el => {
    const node = [...el.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent));
    if (!node) return;
    const original = node.textContent;                       // e.g. "1,300" or "92.6"
    const target = parseFloat(original.replace(/,/g, ''));
    const decimals = (original.split('.')[1] || '').length;
    const commas = original.includes(',');
    const fmt = v => {
      const s = v.toFixed(decimals);
      return commas ? Number(s).toLocaleString('en-US', { minimumFractionDigits: decimals }) : s;
    };
    const dur = 1400, t0 = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
      node.textContent = p < 1 ? fmt(target * eased) : original;   // always land on the exact original text
      if (p < 1) requestAnimationFrame(tick);
    };
    node.textContent = fmt(0);
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.6 });
  nums.forEach(n => io.observe(n));
})();

// ═══════════ Apple-style scroll animations ═══════════
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Pinned sections manage their own motion: take them out of the generic fade-up
  document.querySelectorAll('.ps, .lights, .scrub').forEach(el => { el.classList.remove('reveal'); el.classList.add('in'); });

  // Everything scroll-driven runs from one rAF-throttled handler
  const jobs = [];
  let queued = false;
  const tick = () => { queued = false; jobs.forEach(fn => fn()); };
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(tick); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);

  // ── 1. Retail: pinned post + scrolling copy lines ──────────────────
  document.querySelectorAll('.ps').forEach(ps => {
    const lines = [...ps.querySelectorAll('.ps-line')];
    const frames = [...ps.querySelectorAll('.ps-frame')];
    let current = -1;
    const set = i => {
      if (i === current) return;
      current = i;
      lines.forEach((l, n) => l.classList.toggle('active', n === i));
      frames.forEach((f, n) => {
        f.classList.toggle('active', n === i);
        const v = f.querySelector('video');
        if (v) { if (n === i) v.play().catch(() => {}); else v.pause(); }
      });
    };
    jobs.push(() => {
      const anchor = innerHeight * (innerWidth <= 760 ? 0.68 : 0.5);
      let best = 0, bestD = Infinity;
      lines.forEach((l, n) => {
        const r = l.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - anchor);
        if (d < bestD) { bestD = d; best = n; }
      });
      set(best);
    });
    set(0);
  });

  // ── 2. Cosmotel: headlines light up in turn while the panel is pinned ──
  document.querySelectorAll('.lights').forEach(sec => {
    const lines = [...sec.querySelectorAll('.lights-line')];
    const bg = sec.querySelector('.lights-bg');
    jobs.push(() => {
      const r = sec.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - innerHeight * 0.8), 0, 1);
      const lit = reduce ? lines.length : Math.min(lines.length, Math.floor(p * (lines.length + 0.6)) + 1);
      lines.forEach((l, n) => l.classList.toggle('lit', n < lit));
      if (bg && !reduce) bg.style.setProperty('--z', (1.05 + p * 0.14).toFixed(3));
    });
  });

  // ── 3. F&B gradient headline: sweep once when it enters ──────────
  const gio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); gio.unobserve(e.target); }
  }), { threshold: 0.6 });
  document.querySelectorAll('.grad-title').forEach(t => reduce ? t.classList.add('in-view') : gio.observe(t));

  // ── 4. Staggered galleries: the generic reveal adds .in; cards follow in sequence ──
  document.querySelectorAll('.hgal').forEach(g => {
    if (reduce) return;
    g.classList.remove('reveal');
    g.classList.add('stagger');
    g.querySelectorAll('.hgal-item').forEach((it, i) => it.style.setProperty('--i', Math.min(i, 6)));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { g.classList.add('in'); io.disconnect(); }
    }), { rootMargin: '0px 0px -10% 0px' });
    io.observe(g);
  });

  // ── 5. Drones: scroll position picks the frame (Apple's image-sequence scrub) ──
  document.querySelectorAll('.scrub').forEach(sec => {
    const canvas = sec.querySelector('canvas'), ctx = canvas.getContext('2d');
    const clips = JSON.parse(sec.dataset.clips);       // [{dir, count, share, ...}]
    const steps = [...sec.querySelectorAll('.scrub-step')];
    const cap = sec.querySelector('.scrub-cap'), bar = sec.querySelector('.scrub-bar span');
    const play = sec.querySelector('.scrub-play');
    const imgs = clips.map(c => Array.from({ length: c.count }, () => null));
    let loaded = false, lastKey = '', active = 0;

    const load = () => {
      if (loaded) return; loaded = true;
      clips.forEach((c, ci) => { for (let i = 0; i < c.count; i++) {
        const im = new Image(); im.decoding = 'async';
        im.src = `${c.dir}/f${String(i + 1).padStart(3, '0')}.webp`;
        im.onload = () => { if (lastKey === '') request(); };
        imgs[ci][i] = im;
      } });
    };
    // keep a reference so the observer can't be garbage-collected before it fires
    sec._preload = new IntersectionObserver(es => { if (es[0].isIntersecting) { load(); request(); } }, { rootMargin: '1200px 0px' });
    sec._preload.observe(sec);

    const draw = im => {
      const w = canvas.clientWidth * devicePixelRatio, h = canvas.clientHeight * devicePixelRatio;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      const s = Math.max(w / im.naturalWidth, h / im.naturalHeight);
      const dw = im.naturalWidth * s, dh = im.naturalHeight * s;
      ctx.drawImage(im, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    jobs.push(() => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < -innerHeight || r.top > innerHeight * 2) return;   // far off-screen: nothing to do
      load();                                                           // near: make sure frames are coming (no-op once started)
      const p = clamp(-r.top / (r.height - innerHeight), 0, 1);
      // split the scroll between the clips by their share
      let acc = 0, ci = 0, local = 0;
      for (let i = 0; i < clips.length; i++) {
        if (p <= acc + clips[i].share || i === clips.length - 1) { ci = i; local = clamp((p - acc) / clips[i].share, 0, 1); break; }
        acc += clips[i].share;
      }
      // caption, steps, bar and the "watch" target follow the scroll even before frames arrive
      if (active !== ci) {
        active = ci;
        steps.forEach((s, n) => s.classList.toggle('active', n === ci));
        cap.textContent = clips[ci].caption;
      }
      bar.style.width = (p * 100).toFixed(1) + '%';
      const fi = Math.round(local * (clips[ci].count - 1));
      let im = imgs[ci][fi];
      if (!im || !im.complete || !im.naturalWidth) {            // nearest frame that has arrived
        im = imgs[ci].find(x => x && x.complete && x.naturalWidth);
        if (!im) return;
      }
      const key = ci + ':' + fi;
      if (key !== lastKey) { draw(im); lastKey = key; }
    });

    play.addEventListener('click', () => {
      const c = clips[active];
      lbOpen(c.eye, c.title, '', c.meta, c.video, 'video');
    });
  });

  request();
})();

// ── Featured panels (Fenty, Hisense): photo settles, title rises, text lights up in turn ──
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;   // panel stays exactly as written
  document.querySelectorAll('.dsf-fenty').forEach(panel => {
    const body  = panel.querySelector('.dsf-fenty-body');
    const title = panel.querySelector('.dsf-fenty-title');
    const img   = panel.querySelector('.dsf-fenty-visual img');
    const pills = panel.querySelector('.dsf-fenty-highlights');
    if (!body) return;
    panel.classList.add('panel-anim');
    if (title && !title.children.length) {
      title.innerHTML = title.textContent.trim().split(/\s+/)
        .map((w, i) => `<span class="rw" style="--i:${i}">${w}</span>`).join(' ');
    }
    // everything between the title and the pills lights up in reading order;
    // paragraphs brighten, other blocks (e.g. the Hisense caption box) rise in
    const seq = [...body.children].filter(el =>
      !el.matches('.dsf-fenty-tag, .dsf-fenty-title, .dsf-fenty-highlights'));
    seq.forEach(el => { if (!el.matches('.dsf-fenty-desc')) el.classList.add('panel-rise'); });
    if (pills) pills.querySelectorAll('.dsf-fenty-hl').forEach((p, i) => p.style.setProperty('--i', i));

    let queued = false;
    const update = () => {
      queued = false;
      const vh = innerHeight, r = panel.getBoundingClientRect();
      if (r.top < vh * 0.8) panel.classList.add('go');                 // tag + title, once
      seq.forEach(el => el.classList.toggle('lit', el.getBoundingClientRect().top < vh * 0.6));
      const last = seq[seq.length - 1];
      if (pills && (!last || last.classList.contains('lit')) && pills.getBoundingClientRect().top < vh * 0.92) pills.classList.add('in');
      if (img) img.style.setProperty('--fz', (1.12 - 0.12 * Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)))).toFixed(4));
    };
    const req = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    addEventListener('scroll', req, { passive: true });
    addEventListener('resize', req);
    req();
  });
})();
