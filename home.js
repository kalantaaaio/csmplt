console.log("test");

// Lottie animations controller using lottie-web
const lottieAnimations = new Map(); // Store animation instances

// Auto-discover Lottie animations from data-src attributes
function discoverLottieElements() {
  const lottieElements = [];

  // Find all elements with data-src attribute (Webflow Lottie elements)
  const elementsWithDataSrc = document.querySelectorAll('[data-src*=".json"]');

  elementsWithDataSrc.forEach((element) => {
    const dataSrc = element.getAttribute("data-src");
    if (dataSrc && dataSrc.includes(".json")) {
      lottieElements.push({
        element: element,
        path: dataSrc,
      });
      console.log(`Found Lottie element with path: ${dataSrc}`);
    }
  });

  return lottieElements;
}

function initLottieScrollAnimations() {
  console.log("Initializing custom Lottie scroll animations...");

  // Check if lottie library is loaded
  if (typeof lottie === "undefined") {
    console.error("Lottie library not loaded yet, retrying in 1 second...");
    setTimeout(initLottieScrollAnimations, 1000);
    return;
  }

  console.log("Starting auto-discovery of Lottie animations...");

  // Auto-discover and initialize Lottie animations
  const discoveredLotties = discoverLottieElements();

  discoveredLotties.forEach((lottieData) => {
    const container = lottieData.element;

    // Clear container content but preserve attributes except Webflow-specific ones
    container.innerHTML = "";
    container.removeAttribute("data-animation-type");
    container.removeAttribute("data-autoplay");
    container.removeAttribute("data-loop");
    container.removeAttribute("data-direction");
    container.removeAttribute("data-bounding");

    console.log(
      "Cleared Webflow Lottie element, preparing for custom animation"
    );

    // Create Lottie animation
    try {
      const animation = lottie.loadAnimation({
        container: container,
        path: lottieData.path,
        renderer: "svg",
        loop: true,
        autoplay: false,
      });

      // Store animation reference
      lottieAnimations.set(container, animation);

      console.log(`Lottie animation loaded from data-src: ${lottieData.path}`);

      // Set up intersection observer for this element
      setupIntersectionObserver(container);
    } catch (error) {
      console.error(
        `Error loading Lottie animation from ${lottieData.path}:`,
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

document.addEventListener("DOMContentLoaded", () => {
  // Check if required libraries are loaded
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || typeof SplitText === "undefined") {
    console.error("Required libraries not loaded: gsap, ScrollTrigger, or SplitText");
    return;
  }
  
  const lineAnims = document.querySelectorAll(".line-anim");
  const scrubAnims = document.querySelectorAll(".scrub-anim");

  function initLineAnimation(lineAnim) {
    let splitText;
    let lines;
    let scrollTriggerInstance;

    function createAnimation() {
      // Clean up previous instances
      if (splitText) {
        splitText.revert();
      }
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
      }

      // Create new SplitText instance
      splitText = new SplitText(lineAnim, { type: "lines", mask: "lines" });
      lines = splitText.lines;
      
      // Set initial state
      gsap.set(lines, { y: "100%" });

      // Create the animation with ScrollTrigger
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: lineAnim,
        start: "top 90%",
        toggleActions: "play none none reverse",
        animation: gsap.to(lines, {
          y: "0%",
          duration: 1,
          ease: "power4.out",
          stagger: 0.1,
        }),
        onComplete: () => {
          // Only revert after animation completes and is not reversed
          if (splitText) {
            splitText.revert();
          }
        },
      });
    }

    // Initial creation
    createAnimation();

    // Return cleanup function
    return {
      refresh: createAnimation,
      destroy: () => {
        if (splitText) {
          splitText.revert();
        }
        if (scrollTriggerInstance) {
          scrollTriggerInstance.kill();
        }
      }
    };
  }

  const lineAnimInstances = new Map();

  lineAnims.forEach((lineAnim) => {
    const instance = initLineAnimation(lineAnim);
    lineAnimInstances.set(lineAnim, instance);
  });

  // Handle window resize and orientation change
  let resizeTimer;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Refresh all line animations
      lineAnimInstances.forEach((instance) => {
        instance.refresh();
      });
      
      // Refresh ScrollTrigger after recreating animations
      ScrollTrigger.refresh();
    }, 250);
  }

  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleResize);
  scrubAnims.forEach((scrubAnim) => {
    let splitText = new SplitText(scrubAnim, { type: "words" });
    let words = splitText.words;
    gsap.set(words, { opacity: 0.2 });
    gsap.to(words, {
      opacity: 1,
      duration: 0.2,
      ease: "power1.out",
      stagger: {
        each: 0.4,
      },
      scrollTrigger: {
        trigger: scrubAnim,
        start: "top 90%",
        end: "top center",
        scrub: true,
      },
    });
  });
});
