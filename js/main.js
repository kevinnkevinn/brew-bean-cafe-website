document.addEventListener("DOMContentLoaded", () => {
  const mobileNavToggle = document.querySelector(".mobile-nav-toggle");
  const nav = document.querySelector(".nav-menu");
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.querySelector(".form-status");

  // Toggle mobile navigation
  mobileNavToggle.addEventListener("click", () => {
    nav.classList.toggle("nav-active");
    mobileNavToggle.classList.toggle("active");
  });

  // Close nav when click outside or on nav link
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !mobileNavToggle.contains(e.target)) {
      nav.classList.remove("nav-active");
      mobileNavToggle.classList.remove("active");
    }
  });

  // Smooth scroll for internal links
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Form validation helpers
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  }

  function showError(input, message) {
    const formControl = input.parentElement;
    const errorSpan = formControl.querySelector(".error-message");
    errorSpan.textContent = message;
    input.classList.add("error");
  }

  function clearError(input) {
    const formControl = input.parentElement;
    const errorSpan = formControl.querySelector(".error-message");
    errorSpan.textContent = "";
    input.classList.remove("error");
  }

  // Real-time validation
  ["name", "email", "message"].forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", () => {
      clearError(input);
    });
  });

  // Submit form
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "";
    formStatus.classList.remove("error", "success");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");

    let isValid = true;

    // Name validation
    if (nameInput.value.trim() === "") {
      showError(nameInput, "Name is required");
      isValid = false;
    } else {
      clearError(nameInput);
    }

    // Email validation
    if (emailInput.value.trim() === "") {
      showError(emailInput, "Email is required");
      isValid = false;
    } else if (!validateEmail(emailInput.value)) {
      showError(emailInput, "Email is not valid");
      isValid = false;
    } else {
      clearError(emailInput);
    }

    // Message validation
    if (messageInput.value.trim() === "") {
      showError(messageInput, "Message is required");
      isValid = false;
    } else {
      clearError(messageInput);
    }

    // If valid, the data will send to a server endpoint (mocked here)
    if (isValid) {
      const formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        message: messageInput.value.trim(),
      };

      fetch("/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          formStatus.textContent = "Message sent successfully! We will get back to you shortly.";
          formStatus.classList.add("success");
          contactForm.reset();
        })
        .catch((error) => {
          formStatus.textContent = "There was an error sending your message. Please try again later.";
          formStatus.classList.add("error");
        });
    }
  });

  // --- Header Scroll Effect ---
  const header = document.querySelector(".site-header");
  let lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => {
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
      // Scrolling down and past initial scroll
      header.classList.add("header-hidden");
    } else {
      // Scrolling up
      header.classList.remove("header-hidden");
    }
    lastScrollY = window.scrollY;
  });

  // Add a transition to the header for smooth hide/show
  header.style.transition = "transform 0.3s ease-in-out";
  // Define the hidden state for the header in CSS:
  // .site-header.header-hidden { transform: translateY(-100%); }

  // --- Lazy Loading for Images (Basic Intersection Observer) ---
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  if ("IntersectionObserver" in window) {
    let lazyLoadObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Element is in viewport, start loading
          // For static images, `loading="lazy"` handles it.
          // For more dynamic ones or background images, you'd add logic here.
          // e.g., if you had data-src: entry.target.src = entry.target.dataset.src;
          entry.target.classList.add("loaded"); // Add a class for potential subtle animation
          observer.unobserve(entry.target);
        }
      });
    });

    lazyImages.forEach((image) => {
      lazyLoadObserver.observe(image);
    });
  } else {
    // Fallback for browsers that don't support Intersection Observer
    lazyImages.forEach((image) => {
      image.src = image.dataset.src; // Assuming data-src is used as original source
    });
  }

  // --- Accessibility: Focus Trap for Mobile Menu ---
  function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])"
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Store active element before trapping focus
    document.body.dataset.previousActiveElement = document.activeElement;

    element.addEventListener("keydown", handleTrap);

    function handleTrap(e) {
      const isTabPressed = e.key === "Tab" || e.keyCode === 9;

      if (!isTabPressed) {
        return;
      }

      if (e.shiftKey) {
        // if shift key is pressed for shift + tab
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus(); // move focus to the last focusable element
          e.preventDefault();
        }
      } else {
        // if tab key is pressed
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus(); // move focus to the first focusable element
          e.preventDefault();
        }
      }
    }
    firstFocusable.focus(); // Set focus to the first element when menu opens
  }

  function releaseFocus() {
    const navList = document.querySelector(".nav-list");
    navList.removeEventListener("keydown", handleTrap); // Need to pass the same function reference
    if (document.body.dataset.previousActiveElement) {
      document.body.dataset.previousActiveElement.focus();
      delete document.body.dataset.previousActiveElement;
    }
  }

  // --- Advanced Page Transitions (using a simple fade) ---
  // This is a basic implementation. For more robust or complex transitions
  // like slides, you'd typically use a library like Barba.js or Swup.js.

  const allLinks = document.querySelectorAll(
    'a:not([href^="#"]):not([target="_blank"])'
  ); // Exclude internal links and external links
  const body = document.body;

  allLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.href;
      const currentUrl = window.location.href;

      // Only apply transition for internal links that are not the current page
      if (href.startsWith(window.location.origin) && href !== currentUrl) {
        e.preventDefault(); // Stop normal navigation
        body.classList.add("transition-fade", "out"); // Start fade out

        setTimeout(() => {
          window.location.href = href; // Navigate after fade out
        }, 400); // Match CSS transition duration
      }
    });
  });

  // On page load, remove the 'out' class if present (e.g., if user navigates back)
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      // For pages loaded from cache (e.g., back/forward button)
      body.classList.remove("transition-fade", "out");
    } else {
      // Initial page load animation (if you want an entry animation)
      // body.classList.add('transition-fade', 'in'); // Example for an entry animation
      // setTimeout(() => body.classList.remove('in'), 500);
    }
  });

  // To ensure the body gets the transition class on initial load for *all* pages
  // and correctly shows, you might want to add 'transition-fade' to the body in HTML directly.
  // The 'out' class is only for navigation *away* from a page.
});
