document.addEventListener("DOMContentLoaded", () => {
  // --- Mobile Navigation Toggle ---
  const burger = document.querySelector(".burger");
  const navList = document.querySelector(".nav-list");
  const pageWrapper = document.getElementById("page-wrapper");

  const toggleNav = () => {
    navList.classList.toggle("active");
    burger.classList.toggle("active");
    burger.setAttribute("aria-expanded", navList.classList.contains("active"));
    if (navList.classList.contains("active")) {
      trapFocus(navList);
    } else {
      releaseFocus();
    }
  };

  if (burger && navList) {
    burger.addEventListener("click", toggleNav);

    document.addEventListener("click", (event) => {
      if (
        !navList.contains(event.target) &&
        !burger.contains(event.target) &&
        navList.classList.contains("active")
      ) {
        toggleNav();
      }
    });

    navList.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (navList.classList.contains("active")) {
          toggleNav();
        }
      });
    });
  }

  // --- Smooth Scrolling for Internal Links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  // --- Header Scroll Effect (Hide/Show) ---
  let lastScrollTop = 0;
  const header = document.querySelector(".header");
  if (header) {
    window.addEventListener("scroll", () => {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
        // Scrolling down
        header.classList.add("hidden");
      } else {
        // Scrolling up
        header.classList.remove("hidden");
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });
  }

  // --- Lazy Loading Images (Optional, for performance) ---
  const lazyImages = document.querySelectorAll('img.lazy');
  if ('IntersectionObserver' in window) {
    let lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          if (lazyImage.dataset.srcset) {
            lazyImage.srcset = lazyImage.dataset.srcset;
          }
          lazyImage.classList.remove('lazy');
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach((lazyImage) => {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Fallback for browsers that don't support Intersection Observer
    lazyImages.forEach((lazyImage) => {
      lazyImage.src = lazyImage.dataset.src;
      if (lazyImage.dataset.srcset) {
        lazyImage.srcset = lazyImage.dataset.srcset;
      }
      lazyImage.classList.remove('lazy');
    });
  }


  // --- Accessibility: Focus Trap ---
  function trapFocus(element) {
    const focusableEls = element.querySelectorAll(
      'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
    );
    const firstFocusableEl = focusableEls[0];
    const lastFocusableEl = focusableEls[focusableEls.length - 1];

    if (firstFocusableEl) {
      firstFocusableEl.focus();
    }

    element.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        if (e.shiftKey) {
          /* shift + tab */
          if (document.activeElement === firstFocusableEl) {
            lastFocusableEl.focus();
            e.preventDefault();
          }
        } /* tab */ else {
          if (document.activeElement === lastFocusableEl) {
            firstFocusableEl.focus();
            e.preventDefault();
          }
        }
      }
    });

    // Store previously focused element and then focus on the first focusable element
    document.addEventListener("focusin", focusTrapHandler);
  }

  function releaseFocus() {
    document.removeEventListener("focusin", focusTrapHandler);
  }

  let previouslyFocusedElement = null;
  function focusTrapHandler(event) {
    // Re-focus logic specific to modals or sections requiring focus trap
    // This is a placeholder, as the actual trapping logic is in `trapFocus`
  }


  // --- Contact Form Logic (Validation & Submission) ---
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");
  const notificationModal = document.getElementById("notificationModal");
  const closeNotificationModal = document.getElementById("closeNotificationModal");
  const closeNotificationBtn = document.getElementById("closeNotificationBtn");


  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      let isValid = true;
      formStatus.textContent = "";
      formStatus.className = "form-status"; // Reset class

      const inputs = contactForm.querySelectorAll(
        "input[required], textarea[required]"
      );

      inputs.forEach((input) => {
        const errorMessage = input.nextElementSibling;
        if (input.value.trim() === "") {
          input.classList.add("error");
          errorMessage.textContent = `${input.previousElementSibling.textContent.replace(
            ":",
            ""
          )} cannot be empty.`;
          isValid = false;
        } else if (
          input.type === "email" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)
        ) {
          input.classList.add("error");
          errorMessage.textContent = "Please enter a valid email address.";
          isValid = false;
        } else {
          input.classList.remove("error");
          errorMessage.textContent = "";
        }
      });

      if (isValid) {
        // Simulate form submission or send to backend
        console.log("Form submitted, attempting to send data...");

        // Example: Sending form data using fetch API
        // For a real application, replace this with your actual backend endpoint
        fetch("/contact", { // Assuming you have a /contact endpoint in your server.js
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            message: document.getElementById("message").value,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              // Handle HTTP errors
              return response.json().then(err => { throw new Error(err.message || 'Network response was not ok'); });
            }
            return response.json();
          })
          .then((data) => {
            console.log("Server response:", data);
            // Show success notification modal
            notificationModal.classList.add("active");
            trapFocus(notificationModal.querySelector('.modal-content')); // Trap focus in the modal
            contactForm.reset(); // Clear the form only on successful submission
            formStatus.textContent = ""; // Clear any previous status
            formStatus.classList.remove("success", "error");
          })
          .catch((error) => {
            console.error("Error during form submission:", error);
            formStatus.textContent = `Error sending message: ${error.message}. Please try again later.`;
            formStatus.classList.add("error");
            formStatus.style.display = "block"; // Ensure error message is visible
          });
      } else {
        formStatus.textContent = "Oops! Please fix the highlighted fields.";
        formStatus.classList.add("error");
        formStatus.style.display = "block";
      }
    });

    // Real-time validation on input
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        const errorMessage = input.nextElementSibling;
        if (input.value.trim() !== "") {
          input.classList.remove("error");
          errorMessage.textContent = "";
        }
      });
      input.addEventListener("blur", (event) => {
        // Re-validate on blur for immediate feedback
        const input = event.target;
        const errorMessage = input.nextElementSibling;
        if (input.value.trim() === "") {
            input.classList.add("error");
            errorMessage.textContent = `${input.previousElementSibling.textContent.replace(":", "")} cannot be empty.`;
        } else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
            input.classList.add("error");
            errorMessage.textContent = "Please enter a valid email address.";
        } else {
            input.classList.remove("error");
            errorMessage.textContent = "";
        }
      });
    });

    // Close notification modal
    if (closeNotificationModal) {
      closeNotificationModal.addEventListener("click", () => {
        console.log("Closing notification modal via X button");
        notificationModal.classList.remove("active");
        releaseFocus();
      });
    }

    if (closeNotificationBtn) {
      closeNotificationBtn.addEventListener("click", () => {
        console.log("Closing notification modal via 'Got it!' button");
        notificationModal.classList.remove("active");
        releaseFocus();
      });
    }


    // Close modal if clicked outside
    window.addEventListener("click", (event) => {
      if (event.target === notificationModal) {
        console.log("Closing notification modal via outside click");
        notificationModal.classList.remove("active");
        releaseFocus();
      }
    });

    // Close modal if escape key is pressed
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (notificationModal.classList.contains('active')) {
          notificationModal.classList.remove('active');
          releaseFocus();
        }
        if (mapModal.classList.contains('active')) {
          mapModal.classList.remove('active');
          releaseFocus();
        }
      }
    });
  }

  // --- Map Modal Logic ---
  const mapModal = document.getElementById("mapModal");
  const closeMapModal = document.getElementById("closeMapModal");
  const btnMapModal = document.querySelector(".btn-map-modal");
  const modalMapFrame = document.getElementById("modalMapFrame");

  if (btnMapModal && mapModal && closeMapModal && modalMapFrame) {
    btnMapModal.addEventListener("click", () => {
      const mapUrl = btnMapModal.dataset.mapUrl;
      modalMapFrame.src = mapUrl; // Set the iframe src
      mapModal.classList.add("active");
      trapFocus(mapModal.querySelector('.modal-content')); // Trap focus in the modal
    });

    closeMapModal.addEventListener("click", () => {
      mapModal.classList.remove("active");
      modalMapFrame.src = ""; // Clear the iframe src when closing
      releaseFocus();
    });

    window.addEventListener("click", (event) => {
      if (event.target === mapModal) {
        mapModal.classList.remove("active");
        modalMapFrame.src = "";
        releaseFocus();
      }
    });
  }
});