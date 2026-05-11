const formatIsoDate = (date) => date.toISOString().slice(0, 10);

const getTomorrow = (date) => new Date(date.getTime() + 24 * 60 * 60 * 1000);

const parseJsonAttribute = (element, attributeName, fallback = []) => {
  try {
    const raw = element?.getAttribute(attributeName);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const setupNav = () => {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');

  if (!navToggle || !navLinks) {
    return;
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
};

const setupStickyBooking = () => {
  const stickyBooking = document.querySelector('[data-sticky-booking]');

  if (!stickyBooking) {
    return;
  }

  const syncStickyState = () => {
    stickyBooking.hidden = window.scrollY <= 600;
  };

  syncStickyState();
  window.addEventListener('scroll', syncStickyState, { passive: true });
};

const setupHero = () => {
  const hero = document.querySelector('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = parseJsonAttribute(hero, 'data-slides');
  const buttons = Array.from(hero.querySelectorAll('[data-slide-index]'));
  const segments = Array.from(hero.querySelectorAll('.progress-segment'));
  const scrollButton = hero.querySelector('[data-scroll-next-section]');
  let currentIndex = 0;

  const render = (index) => {
    currentIndex = index;
    hero.style.backgroundImage = `url(${slides[currentIndex]})`;

    buttons.forEach((button, buttonIndex) => {
      button.classList.toggle('active', buttonIndex === currentIndex);
    });

    segments.forEach((segment, segmentIndex) => {
      segment.classList.toggle('active', segmentIndex === currentIndex);
    });
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => render(index));
  });

  if (slides.length > 1) {
    window.setInterval(() => {
      render((currentIndex + 1) % slides.length);
    }, 4500);
  }

  if (scrollButton) {
    scrollButton.addEventListener('click', () => {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    });
  }

  render(0);
};

const setupBookingWidget = () => {
  const widget = document.querySelector('[data-booking-widget]');

  if (!widget) {
    return;
  }

  const today = new Date();
  const tomorrow = getTomorrow(today);
  const locationField = widget.querySelector('[data-booking-field="location"]');
  const datesField = widget.querySelector('[data-booking-field="dates"]');
  const roomsField = widget.querySelector('[data-booking-field="rooms"]');
  const locationDisplay = widget.querySelector('[data-location-display]');
  const locationInput = widget.querySelector('[data-location-input]');
  const datesDisplay = widget.querySelector('[data-dates-display]');
  const checkInInput = widget.querySelector('[data-check-in]');
  const checkOutInput = widget.querySelector('[data-check-out]');
  const roomsDisplay = widget.querySelector('[data-rooms-display]');
  const roomsInput = widget.querySelector('[data-rooms-hidden]');
  const roomsValue = widget.querySelector('[data-rooms-value]');
  const roomsEditor = widget.querySelector('[data-rooms-input]');
  const datesEditor = widget.querySelector('[data-dates-input]');

  const closeEditors = () => {
    locationInput.hidden = true;
    datesEditor.hidden = true;
    roomsEditor.hidden = true;
    locationDisplay.hidden = false;
    datesDisplay.hidden = false;
    roomsDisplay.hidden = false;
  };

  const updateDates = () => {
    datesDisplay.textContent = `${checkInInput.value} — ${checkOutInput.value}`;
  };

  const updateRooms = () => {
    const roomCount = Number(roomsInput.value);
    roomsValue.textContent = String(roomCount);
    roomsDisplay.textContent = `${roomCount} Room${roomCount > 1 ? 's' : ''}`;
  };

  checkInInput.value = formatIsoDate(today);
  checkOutInput.value = formatIsoDate(tomorrow);
  checkInInput.min = formatIsoDate(today);
  checkOutInput.min = formatIsoDate(tomorrow);
  updateDates();
  updateRooms();

  locationField.addEventListener('click', (event) => {
    if (event.target === locationInput) {
      return;
    }

    closeEditors();
    locationDisplay.hidden = true;
    locationInput.hidden = false;
    locationInput.focus();
  });

  datesField.addEventListener('click', (event) => {
    if (datesField.contains(event.target) && event.target.tagName !== 'INPUT') {
      closeEditors();
      datesDisplay.hidden = true;
      datesEditor.hidden = false;
      checkInInput.focus();
    }
  });

  roomsField.addEventListener('click', (event) => {
    if (event.target.closest('button')) {
      return;
    }

    closeEditors();
    roomsDisplay.hidden = true;
    roomsEditor.hidden = false;
  });

  locationInput.addEventListener('change', () => {
    locationDisplay.textContent = locationInput.options[locationInput.selectedIndex]?.text || '';
  });

  checkInInput.addEventListener('change', () => {
    const nextMinCheckout = formatIsoDate(getTomorrow(new Date(checkInInput.value)));
    checkOutInput.min = nextMinCheckout;
    if (checkOutInput.value < nextMinCheckout) {
      checkOutInput.value = nextMinCheckout;
    }
    updateDates();
  });

  checkOutInput.addEventListener('change', updateDates);

  widget.querySelector('[data-rooms-minus]')?.addEventListener('click', () => {
    roomsInput.value = String(Math.max(1, Number(roomsInput.value) - 1));
    updateRooms();
  });

  widget.querySelector('[data-rooms-plus]')?.addEventListener('click', () => {
    roomsInput.value = String(Math.min(10, Number(roomsInput.value) + 1));
    updateRooms();
  });

  document.addEventListener('click', (event) => {
    if (!widget.contains(event.target)) {
      closeEditors();
    }
  });
};

const setupLocationGallery = () => {
  const gallery = document.querySelector('[data-location-gallery]');
  const grid = document.querySelector('[data-location-grid]');

  if (!gallery || !grid) {
    return;
  }

  const sizePattern = ['small', 'tall', 'medium', 'medium', 'medium', 'medium', 'wide', 'medium'];
  const slides = parseJsonAttribute(gallery, 'data-slides');
  let currentSlide = 0;

  const render = (index) => {
    currentSlide = index;
    grid.innerHTML = slides[currentSlide]
      .map((hotel, hotelIndex) => `
        <div class="hotel-card ${sizePattern[hotelIndex % sizePattern.length]}">
          <div class="hotel-image" style="background-image: url('${hotel.image}')">
            <div class="hotel-info">
              <h3>${hotel.name}</h3>
              <p>${hotel.location}</p>
            </div>
          </div>
        </div>
      `)
      .join('');
  };

  gallery.querySelector('[data-location-prev]')?.addEventListener('click', () => {
    render((currentSlide - 1 + slides.length) % slides.length);
  });

  gallery.querySelector('[data-location-next]')?.addEventListener('click', () => {
    render((currentSlide + 1) % slides.length);
  });

  render(0);
};

const setupDineIn = () => {
  const grid = document.querySelector('[data-dine-grid]');
  const track = document.querySelector('[data-dine-track]');

  if (!grid || !track) {
    return;
  }

  const scrollByCard = (direction) => {
    const firstCard = track.querySelector('.dine-card');
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 320;
    grid.scrollBy({ left: direction * Math.round(cardWidth * 0.9), behavior: 'smooth' });
  };

  document.querySelector('[data-dine-prev]')?.addEventListener('click', () => scrollByCard(-1));
  document.querySelector('[data-dine-next]')?.addEventListener('click', () => scrollByCard(1));
};

const setupFooterReviews = () => {
  const footer = document.querySelector('[data-footer-reviews]');

  if (!footer) {
    return;
  }

  const reviews = parseJsonAttribute(footer, 'data-footer-reviews');
  const avatar = footer.querySelector('[data-review-avatar]');
  const name = footer.querySelector('[data-review-name]');
  const text = footer.querySelector('[data-review-text]');
  const dots = Array.from(footer.querySelectorAll('[data-review-dot]'));

  const render = (index) => {
    const review = reviews[index];
    if (!review) {
      return;
    }

    avatar.src = review.avatar;
    avatar.alt = review.name;
    name.textContent = review.name;
    text.textContent = review.review;

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => render(index));
  });

  render(0);
};

const setupContactForm = () => {
  const form = document.querySelector('[data-contact-form]');
  const status = document.querySelector('[data-contact-status]');

  if (!form || !status) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.hidden = false;
    status.textContent = 'Design-only Blade slice for now. Wire this form to a Laravel controller when backend work starts.';
  });
};

document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupStickyBooking();
  setupHero();
  setupBookingWidget();
  setupLocationGallery();
  setupDineIn();
  setupFooterReviews();
  setupContactForm();
});