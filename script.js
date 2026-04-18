/* ==========================================================
   Hassan & Associates — Interactions
   ========================================================== */

(function () {
  'use strict';

  // ===== Year =====
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Sticky header shadow on scroll =====
  const header = document.getElementById('header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== Mobile nav =====
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navClose = document.getElementById('navClose');

  const openNav = () => {
    nav.classList.add('open');
    document.body.classList.add('nav-open');
  };
  const closeNav = () => {
    nav.classList.remove('open');
    document.body.classList.remove('nav-open');
  };

  if (navToggle) navToggle.addEventListener('click', openNav);
  if (navClose) navClose.addEventListener('click', closeNav);

  // Close nav when clicking a link or backdrop
  document.querySelectorAll('.nav__link, .nav__cta-mobile').forEach(a => {
    a.addEventListener('click', closeNav);
  });
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('nav-open')) {
      // If clicked outside nav and not on toggle, close
      if (!nav.contains(e.target) && e.target !== navToggle && !navToggle.contains(e.target)) {
        closeNav();
      }
    }
  });

  // ===== Active nav highlight on scroll =====
  const sections = ['home', 'services', 'about', 'team', 'faq', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const navLinks = document.querySelectorAll('.nav__link');

  const setActiveLink = () => {
    const scrollPos = window.scrollY + 120;
    let current = sections[0]?.id;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };
  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  // ===== Counter animation for stats =====
  const counters = document.querySelectorAll('.stat__num');
  let countersAnimated = false;

  const animateCounters = () => {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach(el => {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = Math.round(target * eased);
        el.textContent = value.toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };

  // ===== Intersection Observer for reveals & counters =====
  const revealTargets = document.querySelectorAll(
    '.service, .team-card, .testimonial, .area-card, .about__content, .about__media, .faq-item, .stat, .contact__info, .contact__map, .form, .appointment__info'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach(el => io.observe(el));

    // Stat counter
    const statSection = document.querySelector('.stats');
    if (statSection) {
      const statIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounters();
            statIO.disconnect();
          }
        });
      }, { threshold: 0.3 });
      statIO.observe(statSection);
    }
  } else {
    revealTargets.forEach(el => el.classList.add('visible'));
    animateCounters();
  }

  // ===== Form validation =====
  const form = document.getElementById('inquiryForm');
  const success = document.getElementById('formSuccess');

  const setError = (field, message) => {
    const group = field.closest('.form__group');
    if (!group) return;
    const errEl = document.querySelector(`.form__error[data-for="${field.id}"]`);
    if (message) {
      group.classList.add('has-error');
      if (errEl) errEl.textContent = message;
    } else {
      group.classList.remove('has-error');
      if (errEl) errEl.textContent = '';
    }
  };

  const validateField = (field) => {
    const value = (field.value || '').trim();

    if (field.hasAttribute('required') && !value && field.type !== 'checkbox') {
      setError(field, 'This field is required.');
      return false;
    }

    if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
      setError(field, 'Please accept to continue.');
      return false;
    }

    if (field.type === 'email' && value) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(value)) {
        setError(field, 'Enter a valid email address.');
        return false;
      }
    }

    if (field.type === 'tel' && value) {
      const re = /^[\d\s+\-()]{7,20}$/;
      if (!re.test(value)) {
        setError(field, 'Enter a valid phone number.');
        return false;
      }
    }

    setError(field, '');
    return true;
  };

  if (form) {
    // Live clearing of error on input
    form.querySelectorAll('input, select, textarea').forEach(el => {
      el.addEventListener('input', () => {
        if (el.closest('.form__group')?.classList.contains('has-error')) {
          validateField(el);
        }
      });
      el.addEventListener('change', () => validateField(el));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fields = form.querySelectorAll('input, select, textarea');
      let ok = true;
      fields.forEach(field => {
        if (!validateField(field)) ok = false;
      });

      if (!ok) {
        const firstError = form.querySelector('.form__group.has-error');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Submit to Formspree (forwards email to upodesta@gmail.com)
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
      }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          form.reset();
          if (success) {
            success.hidden = false;
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => { success.hidden = true; }, 8000);
          }
        } else {
          const data = await response.json().catch(() => ({}));
          const msg = (data.errors && data.errors.map(err => err.message).join(', ')) ||
                      'Sorry, there was a problem sending your message. Please email us directly at upodesta@gmail.com';
          alert(msg);
        }
      } catch (err) {
        alert('Network error. Please check your connection and try again, or email us directly at upodesta@gmail.com');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }
      }
    });
  }

  // ===== Click-to-call tracking (simple analytics hook) =====
  document.querySelectorAll('.click-to-call').forEach(link => {
    link.addEventListener('click', () => {
      // Hook for analytics (GA, Meta Pixel) in production
      if (window.dataLayer) {
        window.dataLayer.push({ event: 'click_to_call', phone: link.getAttribute('href') });
      }
    });
  });

})();
