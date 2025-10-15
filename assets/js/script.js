const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');

if (navToggle && mobileNav) {
  navToggle.addEventListener('click', () => {
    mobileNav.classList.toggle('show');
    navToggle.setAttribute('aria-expanded', mobileNav.classList.contains('show'));
  });
}

document.querySelectorAll('.services-grid .card').forEach((card) => {
  card.addEventListener('click', () => {
    card.classList.toggle('active');
  });
});

const mapTooltip = document.querySelector('.map-tooltip');
const mapRegion = document.querySelector('.map-highlight');

if (mapTooltip && mapRegion) {
  mapRegion.addEventListener('mousemove', (event) => {
    const { offsetX, offsetY, target } = event;
    const bounds = target.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    mapTooltip.style.left = `${x + 15}px`;
    mapTooltip.style.top = `${y + 15}px`;
  });

  mapRegion.addEventListener('mouseenter', () => {
    mapTooltip.classList.add('show');
  });

  mapRegion.addEventListener('mouseleave', () => {
    mapTooltip.classList.remove('show');
  });
}

const handleFormSubmit = (form) => {
  const successMessage = form.querySelector('.success-message');
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const isValid = Array.from(form.elements).every((field) => {
      if (field.hasAttribute('required')) {
        if (!field.value.trim()) {
          field.classList.add('invalid');
          field.focus();
          return false;
        }
        field.classList.remove('invalid');
      }
      return true;
    });

    if (!isValid) {
      return;
    }

    if (successMessage) {
      successMessage.style.display = 'block';
    }

    form.reset();

    setTimeout(() => {
      if (successMessage) {
        successMessage.style.display = 'none';
      }
    }, 4500);
  });
};

document.querySelectorAll('form[data-enhanced="true"]').forEach((form) => {
  handleFormSubmit(form);
});

document.querySelectorAll('input[required], textarea[required], select[required]').forEach((field) => {
  field.addEventListener('blur', () => {
    if (!field.value.trim()) {
      field.classList.add('invalid');
    } else {
      field.classList.remove('invalid');
    }
  });
});

const yearTarget = document.querySelector('[data-current-year]');
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}
