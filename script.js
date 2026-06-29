/* =========================================================
   ADVENTURE WITH KILLAH — SITE SCRIPT
   ========================================================= */

const WHATSAPP_NUMBER = '265882000002';

/* ---------- scroll reveal (created at file scope so it can be
   reused for content injected later by site-data.js) ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

// Exposed globally so other scripts (e.g. site-data.js) can register
// newly-rendered elements for the same reveal animation.
window.observeReveal = (el) => revealObserver.observe(el);

// When arriving from another page via a link like "index.html#experiences",
// the browser jumps to the anchor instantly with no offset for the sticky
// header. Re-scroll smoothly once the page has settled so it lands cleanly.
if (window.location.hash) {
  window.addEventListener('load', () => {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- sticky header on scroll ---------- */
  const header = document.getElementById('siteHeader');
  // The transparent, light-text header look only makes sense layered over
  // the homepage's hero image. Pages without a .hero section (About,
  // Contact, Trips, Gallery, FAQ) should just always use the solid
  // "scrolled" style, since there's nothing for a transparent header to
  // sit on top of — otherwise the logo and hamburger blend into the
  // page's own light background until the user scrolls.
  const hasHero = !!document.querySelector('.hero');
  const onScroll = () => {
    if (!hasHero || window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile drawer ---------- */
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');

  drawerClose.addEventListener('click', () =>{
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    hamburger.classList.remove('is-active');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  });

  const openDrawer = () => {
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    hamburger.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    hamburger.classList.remove('is-active');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-expanded', 'false');
  };

  hamburger.addEventListener('click', () => {
    drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
  });

  overlay.addEventListener('click', closeDrawer);
  document.querySelectorAll('.mobile-drawer [data-nav]').forEach(a =>
    a.addEventListener('click', closeDrawer)
  );

  // Close the drawer with Escape, and automatically if the viewport is
  // resized back up to desktop width while it's open.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });
  window.addEventListener('resize', () => {
    const hamburgerHidden = window.getComputedStyle(hamburger).display === 'none';
    if (hamburgerHidden && drawer.classList.contains('is-open')) closeDrawer();
  });

  /* ---------- scroll reveal: observe everything present at load ---------- */
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const progressBar = document.getElementById('scrollProgress');

  if (progressBar) {
    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop;

      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const progress = (winScroll / height) * 100;

      progressBar.style.width = progress + '%';
    });
  }

  /* ---------- trail line draw (How it Works) ---------- */
  const howTrack = document.querySelector('.how-track');
  if (howTrack) {
    const lineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          howTrack.classList.add('is-visible');
          lineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    lineObserver.observe(howTrack);
  }

  /* ---------- count-up numbers ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(progress * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countObserver.observe(c));

  /* ---------- booking tabs ---------- */
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('is-active'));
      document.getElementById(`panel-${btn.dataset.tab}`).classList.add('is-active');
    });
  });

  /* ---------- toast ---------- */
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  };

  /* ---------- "reserve" buttons on trip cards (delegated — works for
     cards that are rendered later by site-data.js, not just ones
     present at page load) ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-reserve');
    if (!btn) return;
    const trip = btn.dataset.trip || 'a trip';
    const text = `Hi Adventure with Killah! I'd like to reserve a spot on: ${trip}. Please let me know availability and next steps.`;
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    showToast('Opening WhatsApp with your reservation request…');
  });

  /* ---------- button ripple (delegated for the same reason) ---------- */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = btn.getBoundingClientRect();
    ripple.style.left = e.clientX - rect.left + 'px';
    ripple.style.top = e.clientY - rect.top + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  /* ---------- custom booking form -> WhatsApp ---------- */
  const bookForm = document.getElementById('bookForm');
  if (bookForm) {
    bookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(bookForm);
      const name = (data.get('name') || '').trim();
      const phone = (data.get('phone') || '').trim();
      const type = data.get('type');
      const size = data.get('size');
      const date = data.get('date') || 'flexible / to be discussed';
      const days = data.get('days');
      const message = (data.get('message') || '').trim();

      const lines = [
        `Hi Adventure with Killah! I'd like to plan a custom trip.`,
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Trip type: ${type}`,
        `Group size: ${size}`,
        `Preferred date: ${date}`,
        `Number of days: ${days}`,
      ];
      if (message) lines.push(`Notes: ${message}`);

      const text = lines.join('\n');
      window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
      showToast('Request ready — opening WhatsApp…');
      bookForm.reset();
    });
  }

  /* ---------- gallery lightbox (delegated — works for items rendered
     later by site-data.js; image- and video-aware)
     Only Gallery has this markup — guard the whole block so its absence
     elsewhere can't throw and abort the rest of this script. ---------- */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxVideo = document.getElementById('lightboxVideo');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');

    document.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (!item) return;

      const mediaType = item.dataset.mediaType || 'image';
      const src = item.dataset.src || item.querySelector('img')?.src || '';
      lightboxCaption.textContent = item.dataset.caption || '';

      if (mediaType === 'video') {
        lightboxImg.style.display = 'none';
        lightboxVideo.style.display = 'block';
        lightboxVideo.src = src;
        lightboxVideo.play().catch(() => {});
      } else {
        lightboxVideo.pause();
        lightboxVideo.style.display = 'none';
        lightboxVideo.removeAttribute('src');
        lightboxImg.style.display = 'block';
        lightboxImg.src = src;
        lightboxImg.alt = item.querySelector('img')?.alt || '';
      }
      lightbox.classList.add('is-open');
    });

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightboxVideo.pause();
      lightboxVideo.removeAttribute('src');
    };
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ---------- active nav link highlight ----------
     Every nav item is now a whole-page link (Home, About, Trips, Gallery,
     FAQ, Contact), so this only needs to match the current filename —
     no more in-page scroll-spy needed. */
  const navLinks = document.querySelectorAll('[data-nav]');
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const linkFile = (link.getAttribute('href') || '').split('#')[0];
    if (linkFile === currentFile) link.classList.add('is-current');
  });

});