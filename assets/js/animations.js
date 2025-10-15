(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateWithGsap = (selector, config) => {
    if (prefersReducedMotion) return;
    if (window.gsap && document.querySelector(selector)) {
      window.gsap.from(selector, config);
    }
  };

  animateWithGsap('.hero-content', { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.1 });
  animateWithGsap('.hero-illustration', { y: 60, opacity: 0, duration: 1.3, ease: 'power3.out', delay: 0.25 });
  animateWithGsap('.stats', { y: 30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.4 });

  const animatedElements = document.querySelectorAll('[data-animate]');
  const intersectionOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -80px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
        if (!prefersReducedMotion && window.gsap) {
          window.gsap.from(entry.target, { y: 30, opacity: 0, duration: 0.8, ease: 'power2.out' });
        }
      }
    });
  }, intersectionOptions);

  animatedElements.forEach((element) => revealObserver.observe(element));

  const counters = document.querySelectorAll('[data-counter]');
  const animateCounter = (element) => {
    const target = parseInt(element.dataset.counter, 10);
    const duration = 1800;
    const startTime = performance.now();

    const formatNumber = (value) => {
      if (target >= 1000) {
        return `${Math.round(value).toLocaleString('tr-TR')}`;
      }
      return Math.round(value).toString();
    };

    const step = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentValue = target * ease;
      element.textContent = formatNumber(currentValue);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = formatNumber(target);
      }
    };

    requestAnimationFrame(step);
  };

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => counterObserver.observe(counter));

  const heroIllustration = document.querySelector('.hero-illustration img');
  if (heroIllustration && !prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY * -0.08;
      heroIllustration.style.transform = `translateY(${offset}px)`;
    }, { passive: true });
  }
})();
