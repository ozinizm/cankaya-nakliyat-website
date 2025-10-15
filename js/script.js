/* =========================================================
   Çankaya Nakliyat - Global JavaScript
   Açıklama: Navigasyon, tema, animasyon ve etkileşimler
   ========================================================= */

const THEME_STORAGE_KEY = 'cankaya-nakliyat-theme';

function applyTheme(theme) {
  const root = document.documentElement;
  const sanitizedTheme = theme === 'light' ? 'light' : 'dark';
  root.setAttribute('data-theme', sanitizedTheme);
  localStorage.setItem(THEME_STORAGE_KEY, sanitizedTheme);
  const themeToggleIcon = document.querySelector('#themeToggle .icon');
  if (themeToggleIcon) {
    themeToggleIcon.textContent = sanitizedTheme === 'light' ? '🌙' : '☀️';
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function initTheme() {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(storedTheme || (prefersLight ? 'light' : 'dark'));
}

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 12) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  const currentPage = document.body.dataset.page;
  if (currentPage && navLinks) {
    navLinks.querySelectorAll('a[data-page]').forEach((link) => {
      if (link.dataset.page === currentPage) {
        link.classList.add('active');
      }
    });
  }
}

function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('fade-out');
      setTimeout(() => preloader.remove(), 600);
    }, 600);
  });
}

function initParallax() {
  const elements = document.querySelectorAll('[data-parallax]');
  if (!elements.length) return;

  const handleParallax = () => {
    const scrollY = window.scrollY;
    elements.forEach((el) => {
      const factor = parseFloat(el.dataset.parallax || '0.25');
      const translateY = scrollY * factor;
      el.style.transform = `translate3d(0, ${translateY}px, 0)`;
    });
  };

  handleParallax();
  window.addEventListener('scroll', handleParallax, { passive: true });
}

function initGSAPAnimations() {
  if (typeof gsap === 'undefined') {
    const onGSAPReady = (event) => {
      if (event.detail && event.detail.success) {
        initGSAPAnimations();
      } else {
        document.querySelectorAll('.reveal').forEach((el) => {
          el.style.opacity = 1;
          el.style.transform = 'none';
        });
      }
    };

    document.addEventListener('gsap:loaded', onGSAPReady, { once: true });
    return;
  }

  gsap.set('.reveal', { opacity: 0, y: 40 });

  gsap
    .timeline()
    .from('.navbar', { y: -60, opacity: 0, duration: 0.8, ease: 'power3.out' })
    .from('.hero-copy h1', { y: 60, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.2')
    .from('.hero-copy p', { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6')
    .from('.cta-group', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
    .from('.hero-visual', { x: 60, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.6');

  gsap.to('.hero-visual', { x: '+=12', y: '-=8', duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.2 });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.15,
          });
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function initRevealFallback() {
  const runFallback = () => {
    if (typeof gsap !== 'undefined') return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'none';
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  };

  if (typeof gsap !== 'undefined') return;

  document.addEventListener('gsap:loaded', (event) => {
    if (!event.detail || !event.detail.success) {
      runFallback();
    }
  }, { once: true });

  setTimeout(runFallback, 3200);
}

function initChatbot() {
  const toggleButton = document.querySelector('.chatbot-toggle');
  const closeButton = document.querySelector('.chatbot-close');
  const chatbotWindow = document.querySelector('.chatbot-window');
  const messageList = document.querySelector('.chatbot-messages');
  const inputField = document.querySelector('#chatbotInput');
  const sendButton = document.querySelector('#chatbotSend');

  if (!toggleButton || !chatbotWindow || !messageList) return;

  const botReplies = [
    'Merhaba! Size nasıl yardımcı olabilirim?',
    'Taşımacılık ihtiyaçlarınız için ücretsiz keşif planlayabiliriz.',
    'Eşya güvenliğiniz için uzman ekibimizle yanınızdayız.',
    'Şehir içi ve şehirlerarası tüm lojistik çözümlerimiz mevcut.',
  ];

  const addMessage = (text, sender = 'bot') => {
    if (!messageList) return;
    const bubble = document.createElement('div');
    bubble.className = `message ${sender}`;
    bubble.textContent = text;
    messageList.appendChild(bubble);
    messageList.scrollTop = messageList.scrollHeight;
  };

  toggleButton.addEventListener('click', () => {
    chatbotWindow.classList.toggle('active');
    if (chatbotWindow.classList.contains('active') && !messageList.dataset.initialized) {
      addMessage('Merhaba! Çankaya Nakliyat\'a hoş geldiniz.');
      messageList.dataset.initialized = 'true';
    }
  });

  closeButton?.addEventListener('click', () => {
    chatbotWindow.classList.remove('active');
  });

  const handleSend = () => {
    const text = inputField.value.trim();
    if (!text) return;
    addMessage(text, 'user');
    inputField.value = '';
    setTimeout(() => {
      const reply = botReplies[Math.floor(Math.random() * botReplies.length)];
      addMessage(reply, 'bot');
    }, 600);
  };

  sendButton?.addEventListener('click', handleSend);

  inputField?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSend();
    }
  });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  const feedback = document.querySelector('.form-feedback');
  const submitBtn = form?.querySelector('.submit-btn');

  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.original = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Gönderiliyor...</span>';
    }

    setTimeout(() => {
      form.reset();
      if (feedback) {
        feedback.textContent = 'Teşekkürler! Mesajınız başarıyla bize ulaştı.';
      }
      if (submitBtn) {
        submitBtn.innerHTML = '<span>Mesaj Gönderildi ✔</span>';
        submitBtn.classList.add('sent');
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Mesajı Gönder</span>';
          submitBtn.classList.remove('sent');
        }, 2500);
      }
    }, 1200);
  });
}

function initUtilities() {
  const smoothLinks = document.querySelectorAll('a[href^="#"]');
  smoothLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  document.querySelectorAll('.current-year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

(function initApp() {
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavbar();
    initPreloader();
    initParallax();
    initGSAPAnimations();
    initRevealFallback();
    initChatbot();
    initContactForm();
    initUtilities();

    const themeToggleButton = document.getElementById('themeToggle');
    themeToggleButton?.addEventListener('click', toggleTheme);
  });
})();
