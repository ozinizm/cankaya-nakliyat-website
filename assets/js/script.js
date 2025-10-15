(() => {
  const body = document.body;
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('show');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('show');
        navToggle.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
      });
    });
  }

  const handlePageNavigation = (event) => {
    const link = event.currentTarget;
    const href = link.getAttribute('href');
    const isAnchor = href && href.startsWith('#');

    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    if (isAnchor) {
      const target = document.querySelector(href);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
      return;
    }

    event.preventDefault();
    body.classList.add('page-transition-exit');
    setTimeout(() => {
      window.location.href = href;
    }, prefersReducedMotion ? 0 : 280);
  };

  const routerLinks = document.querySelectorAll('a[data-router="true"], .primary-nav a, .mobile-nav a');
  routerLinks.forEach((link) => {
    link.addEventListener('click', handlePageNavigation);
  });

  window.addEventListener('pageshow', () => {
    body.classList.remove('page-transition-exit');
  });

  const yearTarget = document.querySelector('[data-current-year]');
  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }

  const toast = document.querySelector('[data-toast]');

  const showToast = () => {
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  };

  const setFieldState = (field) => {
    if (!field) return true;
    const value = field.value.trim();
    if ((field.hasAttribute('required') && !value) || !field.checkValidity()) {
      field.classList.add('invalid');
      return false;
    }
    field.classList.remove('invalid');
    return true;
  };

  const enhancedForms = document.querySelectorAll('form[data-enhanced="true"]');
  enhancedForms.forEach((form) => {
    const successMessage = form.querySelector('.success-message');
    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');

    requiredFields.forEach((field) => {
      field.addEventListener('input', () => setFieldState(field));
      field.addEventListener('blur', () => setFieldState(field));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let isValid = true;
      requiredFields.forEach((field) => {
        if (!setFieldState(field) && isValid) {
          field.focus();
          isValid = false;
        }
      });

      if (!isValid) return;

      form.reset();
      requiredFields.forEach((field) => field.classList.remove('invalid'));

      if (successMessage) {
        successMessage.style.display = 'block';
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 5000);
      }

      showToast();
    });
  });

  const multiStepForms = document.querySelectorAll('[data-multistep]');
  multiStepForms.forEach((form) => {
    const steps = Array.from(form.querySelectorAll('[data-step]'));
    const progressBar = form.querySelector('[data-progress]');
    const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
    let currentStepIndex = 0;

    requiredFields.forEach((field) => {
      field.addEventListener('input', () => setFieldState(field));
      field.addEventListener('blur', () => setFieldState(field));
    });

    const updateProgress = () => {
      if (!progressBar) return;
      const progress = ((currentStepIndex + 1) / steps.length) * 100;
      progressBar.style.width = `${progress}%`;
    };

    const showStep = (index) => {
      steps.forEach((step, stepIndex) => {
        step.classList.toggle('active', stepIndex === index);
      });
      currentStepIndex = index;
      updateProgress();
    };

    const validateStep = (index) => {
      const step = steps[index];
      const fields = step.querySelectorAll('input, textarea, select');
      let isValid = true;
      fields.forEach((field) => {
        if (field.hasAttribute('required') && !setFieldState(field)) {
          if (isValid) {
            field.focus();
          }
          isValid = false;
        }
      });
      return isValid;
    };

    form.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]');
      if (!action) return;
      event.preventDefault();
      const direction = action.getAttribute('data-action');

      if (direction === 'next' && validateStep(currentStepIndex)) {
        if (currentStepIndex < steps.length - 1) {
          showStep(currentStepIndex + 1);
        }
      }

      if (direction === 'prev' && currentStepIndex > 0) {
        showStep(currentStepIndex - 1);
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!validateStep(currentStepIndex)) return;

      form.reset();
      showStep(0);
      requiredFields.forEach((field) => field.classList.remove('invalid'));
      showToast();
    });

    updateProgress();
  });

  const slider = document.querySelector('[data-slider]');
  if (slider) {
    const track = slider.querySelector('[data-slider-track]');
    const slides = Array.from(track.children);
    const nextBtn = slider.querySelector('[data-slider-next]');
    const prevBtn = slider.querySelector('[data-slider-prev]');
    const dots = Array.from(slider.querySelectorAll('.progress-dot'));
    let activeIndex = 0;

    const updateSlider = () => {
      const offset = activeIndex * -100;
      track.style.transform = `translateX(${offset}%)`;
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
      });
    };

    const goToSlide = (index) => {
      if (index < 0) {
        activeIndex = slides.length - 1;
      } else if (index >= slides.length) {
        activeIndex = 0;
      } else {
        activeIndex = index;
      }
      updateSlider();
    };

    nextBtn?.addEventListener('click', () => goToSlide(activeIndex + 1));
    prevBtn?.addEventListener('click', () => goToSlide(activeIndex - 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => goToSlide(index)));

    let sliderInterval = null;
    const startAutoplay = () => {
      if (prefersReducedMotion) return;
      sliderInterval = setInterval(() => {
        goToSlide(activeIndex + 1);
      }, 6500);
    };

    const stopAutoplay = () => {
      if (sliderInterval) {
        clearInterval(sliderInterval);
        sliderInterval = null;
      }
    };

    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('focusin', stopAutoplay);
    slider.addEventListener('focusout', startAutoplay);

    startAutoplay();
    updateSlider();
  }

  const mapSvg = document.querySelector('[data-turkey-map]');
  if (mapSvg) {
    const provinceLayer = mapSvg.querySelector('[data-provinces]');
    const tooltip = document.querySelector('[data-map-tooltip]');
    const mapWrapper = tooltip?.closest('.map-wrapper') || mapSvg.parentElement;

    const provinceRegions = {
      Marmara: ['Balıkesir', 'Bilecik', 'Bursa', 'Çanakkale', 'Edirne', 'İstanbul', 'Kırklareli', 'Kocaeli', 'Sakarya', 'Tekirdağ', 'Yalova'],
      Ege: ['Afyonkarahisar', 'Aydın', 'Denizli', 'İzmir', 'Kütahya', 'Manisa', 'Muğla', 'Uşak'],
      Akdeniz: ['Adana', 'Antalya', 'Burdur', 'Hatay', 'Isparta', 'Kahramanmaraş', 'Mersin', 'Osmaniye'],
      'İç Anadolu': ['Aksaray', 'Ankara', 'Çankırı', 'Eskişehir', 'Karaman', 'Kayseri', 'Kırıkkale', 'Kırşehir', 'Konya', 'Nevşehir', 'Niğde', 'Sivas', 'Yozgat'],
      Karadeniz: ['Amasya', 'Artvin', 'Bartın', 'Bayburt', 'Bolu', 'Çorum', 'Düzce', 'Giresun', 'Gümüşhane', 'Karabük', 'Kastamonu', 'Ordu', 'Rize', 'Samsun', 'Sinop', 'Tokat', 'Trabzon', 'Zonguldak'],
      'Doğu Anadolu': ['Ağrı', 'Ardahan', 'Bingöl', 'Bitlis', 'Elazığ', 'Erzincan', 'Erzurum', 'Hakkari', 'Iğdır', 'Kars', 'Malatya', 'Muş', 'Tunceli', 'Van'],
      'Güneydoğu Anadolu': ['Adıyaman', 'Batman', 'Diyarbakır', 'Gaziantep', 'Kilis', 'Mardin', 'Siirt', 'Şanlıurfa', 'Şırnak']
    };

    const layout = {
      Marmara: { startX: 150, startY: 120, columns: 4, gapX: 28, gapY: 24 },
      Ege: { startX: 160, startY: 190, columns: 4, gapX: 30, gapY: 28 },
      Akdeniz: { startX: 250, startY: 230, columns: 4, gapX: 30, gapY: 28 },
      'İç Anadolu': { startX: 250, startY: 150, columns: 5, gapX: 28, gapY: 26 },
      Karadeniz: { startX: 250, startY: 90, columns: 6, gapX: 26, gapY: 22 },
      'Doğu Anadolu': { startX: 380, startY: 150, columns: 4, gapX: 28, gapY: 26 },
      'Güneydoğu Anadolu': { startX: 400, startY: 220, columns: 3, gapX: 28, gapY: 26 }
    };

    const regionKeys = Object.keys(provinceRegions);

    const createProvince = (name, regionIndex, itemIndex) => {
      const region = regionKeys[regionIndex];
      const config = layout[region];
      const column = itemIndex % config.columns;
      const row = Math.floor(itemIndex / config.columns);
      const cx = config.startX + column * config.gapX + (region === 'Karadeniz' ? row * 1.8 : 0);
      const cy = config.startY + row * config.gapY + (region === 'Karadeniz' ? Math.sin(column) * 3 : 0);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx.toFixed(1));
      circle.setAttribute('cy', cy.toFixed(1));
      circle.setAttribute('r', '5.6');
      circle.setAttribute('tabindex', '0');
      circle.classList.add('province-point');
      circle.dataset.name = name;
      circle.dataset.region = region;
      return circle;
    };

    let regionIndex = 0;
    Object.entries(provinceRegions).forEach(([, names]) => {
      names.forEach((name, index) => {
        const circle = createProvince(name, regionIndex, index);
        provinceLayer.appendChild(circle);
      });
      regionIndex += 1;
    });

    const handleTooltip = (event, circle) => {
      if (!tooltip || !mapWrapper) return;
      tooltip.textContent = `${circle.dataset.name}`;
      const rect = mapWrapper.getBoundingClientRect();
      const cx = parseFloat(circle.getAttribute('cx'));
      const cy = parseFloat(circle.getAttribute('cy'));
      const clientX = event instanceof KeyboardEvent ? rect.left + cx : event.clientX;
      const clientY = event instanceof KeyboardEvent ? rect.top + cy : event.clientY;
      tooltip.style.left = `${clientX - rect.left}px`;
      tooltip.style.top = `${clientY - rect.top}px`;
      tooltip.classList.add('show');
      circle.classList.add('active');
    };

    const hideTooltip = (circle) => {
      if (!tooltip) return;
      tooltip.classList.remove('show');
      circle.classList.remove('active');
    };

    provinceLayer.querySelectorAll('circle').forEach((circle) => {
      circle.addEventListener('mouseenter', (event) => handleTooltip(event, circle));
      circle.addEventListener('mousemove', (event) => handleTooltip(event, circle));
      circle.addEventListener('mouseleave', () => hideTooltip(circle));
      circle.addEventListener('focus', (event) => handleTooltip(event, circle));
      circle.addEventListener('blur', () => hideTooltip(circle));
      circle.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleTooltip(event, circle);
        }
      });
    });
  }
})();
