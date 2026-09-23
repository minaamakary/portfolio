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

function fnbSwitch(el, img, eye, title) {
  document.querySelectorAll('.feat-list .feat-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  const imgEl = document.getElementById('fnb-feat-img');
  if (imgEl) {
    imgEl.style.opacity = '0';
    setTimeout(() => {
      imgEl.src = img;
      imgEl.style.opacity = '1';
    }, 150);
  }
  const eyeEl = document.getElementById('fnb-feat-eye');
  const titleEl = document.getElementById('fnb-feat-title');
  if (eyeEl) eyeEl.textContent = eye;
  if (titleEl) titleEl.textContent = title;
}

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

// ── Mobile menu ─────────────────────────────────
function toggleMenu() {
  const burger = document.getElementById('gnav-burger');
  const menu   = document.getElementById('gnav-mobile-menu');
  burger.classList.toggle('open');
  menu.classList.toggle('open');
}

function mobileShow(id) {
  show(id);  // kept for compatibility; the mobile menu now uses plain links
  // Close menu after navigation
  document.getElementById('gnav-burger').classList.remove('open');
  document.getElementById('gnav-mobile-menu').classList.remove('open');
  return false;
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

  // Sync thumbnails if chai or multi
  if (id === 'chai') {
    document.querySelectorAll('.chai-thumb').forEach((t, i) => t.classList.toggle('active', i === c.idx));
  }
  if (id === 'multi') {
    document.querySelectorAll('#multi-thumbs .chai-thumb').forEach((t, i) => t.classList.toggle('active', i === c.idx));
  }
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

// Jump directly to a slide (used by Chaiwala thumbs)
function chaiJump(idx) {
  const c = carousels['chai'];
  if (!c) return;
  pauseCarouselVideo('chai', c.idx);
  c.idx = idx;
  const track = document.getElementById('chai-track');
  if (track) track.style.transform = `translateX(-${idx * 100}%)`;
  const dots = document.querySelectorAll('#chai-dots .carousel-dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  const counter = document.getElementById('chai-counter');
  if (counter) counter.textContent = `${idx + 1} / ${c.total}`;
  // Update thumb active state
  document.querySelectorAll('.chai-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
  playCarouselVideo('chai', idx);
}

carouselInit('undiz', 2);
carouselInit('chai', 7);
carouselInit('multi', 6);
carouselInit('vox', 6);

// Jump for multi-brand carousel
function multiJump(idx) {
  const c = carousels['multi'];
  if (!c) return;
  c.idx = idx;
  const track = document.getElementById('multi-track');
  if (track) track.style.transform = `translateX(-${idx * 100}%)`;
  const dots = document.querySelectorAll('#multi-dots .carousel-dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  const counter = document.getElementById('multi-counter');
  if (counter) counter.textContent = `${idx + 1} / ${c.total}`;
  document.querySelectorAll('#multi-thumbs .chai-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
}

// preload carousel videos so thumbnails show
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#chai-track video').forEach(v => {
    v.load();
    v.addEventListener('loadedmetadata', () => {
      if (v.duration && isFinite(v.duration)) v.currentTime = v.duration * 0.4;
    });
  });
});
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

function makeStars(id, n) {
  const el = document.getElementById(id);
  if (!el) return;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top  = Math.random() * 100 + '%';
    s.style.setProperty('--d',  (2 + Math.random() * 3) + 's');
    s.style.setProperty('--dl', (Math.random() * 4) + 's');
    s.style.setProperty('--op', (0.3 + Math.random() * 0.7).toFixed(2));
    el.appendChild(s);
  }
}
makeStars('h-stars', 70);
makeStars('h-s1', 20);
makeStars('e-hero', 60);
makeStars('e1', 20);
makeStars('e3', 20);
makeStars('e5', 20);

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
    let seeked   = false;

    // Seek to a good thumbnail frame once metadata loads
    video.addEventListener('loadedmetadata', () => {
      if (!seeked && video.duration && isFinite(video.duration)) {
        const customSeek = video.getAttribute('data-seek');
        video.currentTime = customSeek ? parseFloat(customSeek) : video.duration * 0.4;
        seeked = true;
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
