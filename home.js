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
    //setTimeout(initLottieScrollAnimations, 1000);
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

document.addEventListener("DOMContentLoaded", initLottieScrollAnimations);

document.addEventListener("DOMContentLoaded", () => {
  const lineAnims = document.querySelectorAll(".line-anim");
  const scrubAnims = document.querySelectorAll(".scrub-anim");
  
  // Wait for layout to settle before initializing line animations
  setTimeout(() => {
    lineAnims.forEach((lineAnim) => {
      let splitText, lines, animation;
      let resizeTimeout;
      
      function initLineAnim() {
        // Clean up previous animation and split
        if (animation) {
          animation.kill();
        }
        if (splitText) {
          splitText.revert();
        }
        
        // Force a reflow to ensure accurate measurements
        lineAnim.offsetHeight;
        
        splitText = new SplitText(lineAnim, { type: "lines", mask: "lines" });
        lines = splitText.lines;
        gsap.set(lines, { y: "100%" });
        
        animation = gsap.to(lines, {
          y: `0%`,
          duration: 1,
          ease: "power4.out",
          stagger: {
            each: 0.1,
            onComplete: () => {
              splitText.revert();
            },
          },
          scrollTrigger: {
            trigger: lineAnim,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
        
        return animation;
      }
      
      // Initialize the animation
      initLineAnim();
      
      // Handle resize events with debouncing
      if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(() => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            // Re-initialize only if the element width changed significantly
            initLineAnim();
          }, 150);
        });
        
        resizeObserver.observe(lineAnim);
      } else {
        // Fallback for browsers without ResizeObserver
        let lastWidth = lineAnim.offsetWidth;
        const handleResize = () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            const currentWidth = lineAnim.offsetWidth;
            if (Math.abs(currentWidth - lastWidth) > 10) {
              lastWidth = currentWidth;
              initLineAnim();
            }
          }, 150);
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);
      }
    });
  }, 100);
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
