/**
 * BAJRANG BHAJIYA AND GATHIYA — main.js
 * Vanilla JS: nav, scroll-reveal, menu tabs, gallery lightbox,
 * testimonial carousel, WhatsApp sticky, FAQ accordion, contact form
 */

'use strict';

/* ============================================================
   1. STICKY NAVBAR — shrink + backdrop-blur on scroll
   ============================================================ */
(function initStickyNav() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let ticking = false;

  function updateNav() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });
})();


/* ============================================================
   2. HAMBURGER MENU (mobile)
   ============================================================ */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  function closeMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('mobile-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on nav link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ============================================================
   3. SMOOTH SCROLL for anchor links
   ============================================================ */
(function initSmoothScroll() {
  const navHeight = () => parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-height') || '70'
  );

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight() - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   4. SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
(function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // Skip animations for users who prefer reduced motion
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   5. MENU CATEGORY TAB FILTER
   ============================================================ */
(function initMenuTabs() {
  const tabs  = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.menu-card');
  if (!tabs.length || !cards.length) return;

  function showCategory(category) {
    let visibleIndex = 0;
    cards.forEach(card => {
      const match = card.dataset.category === category;
      card.style.display = match ? '' : 'none';
      if (match) {
        // Re-trigger reveal animation
        card.classList.remove('visible');
        card.style.transitionDelay = `${visibleIndex * 0.07}s`;
        setTimeout(() => card.classList.add('visible'), 20);
        visibleIndex++;
      }
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update ARIA + classes
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const category = tab.dataset.category;
      showCategory(category);
    });
  });

  // Init: show first category (bhajiya) on load
  showCategory('bhajiya');
})();


/* ============================================================
   6. GALLERY LIGHTBOX
   ============================================================ */
(function initLightbox() {
  const gallery   = document.getElementById('gallery-grid');
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbClose   = document.getElementById('lightbox-close');
  const lbPrev    = document.getElementById('lightbox-prev');
  const lbNext    = document.getElementById('lightbox-next');
  if (!gallery || !lightbox) return;

  const items   = Array.from(gallery.querySelectorAll('.gallery-item'));
  const images  = items.map(item => ({
    src: item.querySelector('img').src,
    alt: item.querySelector('img').alt,
    caption: item.querySelector('figcaption')?.textContent || ''
  }));
  let current = 0;

  function openLightbox(index) {
    current = index;
    lbImg.src     = images[current].src;
    lbImg.alt     = images[current].alt;
    lbCaption.textContent = images[current].caption;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lightbox.setAttribute('aria-hidden', 'true');
    // Return focus to trigger element
    items[current]?.querySelector('img')?.focus();
  }

  function navigate(dir) {
    current = (current + dir + images.length) % images.length;
    lbImg.src     = images[current].src;
    lbImg.alt     = images[current].alt;
    lbCaption.textContent = images[current].caption;
    // Replay zoom animation
    lbImg.style.animation = 'none';
    lbImg.offsetHeight; // reflow
    lbImg.style.animation = '';
  }

  // Open on click or Enter
  items.forEach((item, i) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `View ${images[i].caption}`);
    item.addEventListener('click', () => openLightbox(i));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => navigate(-1));
  lbNext.addEventListener('click', () => navigate(1));

  // Click outside image to close
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   navigate(-1);
    if (e.key === 'ArrowRight')  navigate(1);
  });
})();


/* ============================================================
   7. TESTIMONIAL CAROUSEL (auto-play + manual dots/arrows)
   ============================================================ */
(function initCarousel() {
  const track   = document.getElementById('testimonial-track');
  const dotsWrap = document.getElementById('carousel-dots');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  if (!track || !dotsWrap) return;

  const cards   = Array.from(track.querySelectorAll('.testimonial-card'));
  const total   = cards.length;
  let current   = 0;
  let autoTimer = null;
  let cardWidth = 0;
  let gap       = 24; // 1.5rem default

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to review ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.querySelectorAll('.carousel-dot'));

  function calcWidth() {
    if (!cards[0]) return;
    const style = getComputedStyle(track);
    gap = parseFloat(style.gap) || 24;
    cardWidth = cards[0].offsetWidth + gap;
  }

  function goTo(index) {
    current = (index + total) % total;
    calcWidth();
    track.style.transform = `translateX(-${current * cardWidth}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    autoTimer = setInterval(next, 4500);
  }
  function stopAuto() {
    clearInterval(autoTimer);
  }

  prevBtn?.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
  nextBtn?.addEventListener('click', () => { stopAuto(); next(); startAuto(); });

  // Pause on hover / focus
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);
  track.addEventListener('focusin',  stopAuto);
  track.addEventListener('focusout', startAuto);

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { stopAuto(); diff > 0 ? next() : prev(); startAuto(); }
  }, { passive: true });

  // Recalculate on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(current), 150);
  }, { passive: true });

  // Init
  calcWidth();
  startAuto();
})();


/* ============================================================
   8. FAQ ACCORDION
   ============================================================ */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach(otherItem => {
        const otherBtn    = otherItem.querySelector('.faq-question');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherBtn && otherAnswer && otherItem !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.hidden = true;
        }
      });

      // Toggle this one
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.hidden = isOpen;
    });
  });
})();


/* ============================================================
   9. CONTACT FORM (client-side validation, mailto fallback)
   ============================================================ */
(function initContactForm() {
  const form       = document.getElementById('contact-form');
  const nameInput  = document.getElementById('contact-name');
  const phoneInput = document.getElementById('contact-phone');
  const msgInput   = document.getElementById('contact-message');
  const nameErr    = document.getElementById('name-error');
  const phoneErr   = document.getElementById('phone-error');
  const successMsg = document.getElementById('form-success');
  if (!form) return;

  function showError(el, msg) { if (el) el.textContent = msg; }
  function clearError(el)     { if (el) el.textContent = ''; }

  function validatePhone(val) {
    return /^[\d\s\+\-\(\)]{7,15}$/.test(val.trim());
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    clearError(nameErr);
    clearError(phoneErr);

    const name  = nameInput?.value.trim()  || '';
    const phone = phoneInput?.value.trim() || '';
    const msg   = msgInput?.value.trim()   || '';

    if (!name) {
      showError(nameErr, 'Please enter your name.');
      nameInput?.focus();
      valid = false;
    }

    if (!phone) {
      showError(phoneErr, 'Please enter your phone number.');
      if (valid) phoneInput?.focus();
      valid = false;
    } else if (!validatePhone(phone)) {
      showError(phoneErr, 'Please enter a valid phone number.');
      if (valid) phoneInput?.focus();
      valid = false;
    }

    if (!valid) return;

    // Fallback: open mailto (replace with form endpoint later)
    const subject = encodeURIComponent(`Enquiry from ${name} – Bajrang Bhajiya Website`);
    const body    = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\n\nMessage:\n${msg}`);
    window.location.href = `mailto:info@bajrangbhajiya.in?subject=${subject}&body=${body}`;

    form.reset();
    if (successMsg) { successMsg.hidden = false; }
    setTimeout(() => { if (successMsg) successMsg.hidden = true; }, 5000);
  });

  // Live validation on blur
  nameInput?.addEventListener('blur', () => {
    if (!nameInput.value.trim()) showError(nameErr, 'Please enter your name.');
    else clearError(nameErr);
  });
  phoneInput?.addEventListener('blur', () => {
    const val = phoneInput.value.trim();
    if (!val) showError(phoneErr, 'Please enter your phone number.');
    else if (!validatePhone(val)) showError(phoneErr, 'Please enter a valid phone number.');
    else clearError(phoneErr);
  });
})();


/* ============================================================
   10. WHATSAPP FLOATING BUTTON — hide/show on scroll
   ============================================================ */
(function initWhatsAppFloat() {
  const btn = document.getElementById('whatsapp-float');
  if (!btn) return;

  let lastScroll = 0;
  let ticking    = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const current = window.scrollY;
        // Hide if scrolling down fast, show otherwise
        if (current > lastScroll + 60) {
          btn.style.transform = 'translateY(100px)';
          btn.style.opacity   = '0';
        } else {
          btn.style.transform = '';
          btn.style.opacity   = '';
        }
        lastScroll = current;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ============================================================
   11. ACTIVE NAV LINK — highlight section in viewport
   ============================================================ */
(function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.style.color = isActive ? 'var(--clr-saffron)' : '';
          link.style.background = isActive ? 'rgba(244,160,32,.1)' : '';
        });
      }
    });
  }, {
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
})();
