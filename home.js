console.log("test");

// Lottie animations controller using lottie-web
const lottieAnimations = new Map(); // Store animation instances

// Configuration for your Lottie animations
const lottieConfig = [
  {
    selector: ".hero_letters",
    path: "https://cdn.prod.website-files.com/682c57a19285ce16ab3a14a1/689344522ec99b24ba6a571b_csmplt.json",
  },

  {
    selector: ".clients_tabs-pane.is--1",
    path: "https://cdn.prod.website-files.com/682c57a19285ce16ab3a14a1/689071294b93cedd9656e4a2_b-pc.json",
  },
  {
    selector: ".clients_tabs-pane.is--2",
    path: "https://cdn.prod.website-files.com/682c57a19285ce16ab3a14a1/6890712c5b9f9ce7f748f753_t-pc.json",
  },
];

function initLottieScrollAnimations() {
  console.log("Initializing custom Lottie scroll animations...");

  // Check if lottie library is loaded
  if (typeof lottie === "undefined") {
    console.error("Lottie library not loaded yet, retrying in 1 second...");
    setTimeout(initLottieScrollAnimations, 1000);
    return;
  }

  // Remove existing Webflow Lottie elements to avoid conflicts
  const webflowLotties = document.querySelectorAll(
    '[data-animation-type="lottie"], .w-lottie, [data-w-id*="lottie"]'
  );
  webflowLotties.forEach((element) => {
    // Clear the element content but keep the container
    element.innerHTML = "";
    element.removeAttribute("data-animation-type");
    element.removeAttribute("data-autoplay");
    console.log("Cleared Webflow Lottie element");
  });

  // Initialize custom Lottie animations
  lottieConfig.forEach((config, index) => {
    const container = document.querySelector(config.selector);
    if (!container) {
      console.warn(`Container not found for selector: ${config.selector}`);
      return;
    }

    // Clear container
    container.innerHTML = "";

    // Create Lottie animation
    try {
      const animation = lottie.loadAnimation({
        container: container,
        path: config.path,
        renderer: "svg",
        loop: true,
        autoplay: false,
      });

      // Store animation reference
      lottieAnimations.set(container, animation);

      console.log(`Lottie animation loaded for: ${config.selector}`);

      // Set up intersection observer for this element
      setupIntersectionObserver(container);
    } catch (error) {
      console.error(
        `Error loading Lottie animation for ${config.selector}:`,
        error
      );
    }
  });
}

function setupIntersectionObserver(element) {
  const observerOptions = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const animation = lottieAnimations.get(entry.target);

      if (entry.isIntersecting) {
        // Element entered viewport - play animation
        if (animation) {
          animation.play();
          console.log("Playing Lottie animation");
        }
      } else {
        // Element left viewport - pause animation
        if (animation) {
          animation.pause();
          console.log("Pausing Lottie animation");
        }
      }
    });
  }, observerOptions);

  observer.observe(element);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLottieScrollAnimations);
} else {
  initLottieScrollAnimations();
}

// Also try after window load and with delays to ensure lottie library is loaded
window.addEventListener("load", () => {
  setTimeout(initLottieScrollAnimations, 500);
});

setTimeout(initLottieScrollAnimations, 2000);
