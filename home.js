console.log("test");
console.log("old version2");

// Add CSS styles for mobile canvas elements
function addMobileCanvasStyles() {
  if (!document.getElementById("mobile-canvas-styles")) {
    const style = document.createElement("style");
    style.id = "mobile-canvas-styles";
    style.textContent = `
      @media screen and (max-width: 990px) {
        .lottie-div canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain;
          display: block;
        }
        
        .lottie-div {
          width: 100%;
          height: 100%;
          position: relative;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Lottie animations controller using lottie-web
const lottieAnimations = new Map(); // Store animation instances

// Auto-discover Lottie animations from data-src attributes
function discoverLottieElements() {
  const lottieElements = [];
  const isMobile = window.innerWidth < 991;

  // Find all elements with data-src attribute (Webflow Lottie elements)
  const elementsWithDataSrc = document.querySelectorAll('[data-src*=".json"]');

  elementsWithDataSrc.forEach((element) => {
    element.classList.add("lottie-div");
    const dataSrc = element.getAttribute("data-src");
    const dataMobSrc = element.getAttribute("data-mob-src");
    const isInHeroLetters = element.closest(".hero_letters") !== null;

    if (dataSrc && dataSrc.includes(".json")) {
      // Load all Lottie elements regardless of device
      // Use mobile version for hero_letters on mobile, otherwise use regular version
      let animationPath = dataSrc;
      if (
        isMobile &&
        isInHeroLetters &&
        dataMobSrc &&
        dataMobSrc.includes(".json")
      ) {
        animationPath = dataMobSrc;
        console.log(`Using mobile version for hero_letters: ${dataMobSrc}`);
      }

      lottieElements.push({
        element: element,
        path: dataSrc,
        path: animationPath,
      });
      console.log(`Found Lottie element with path: ${dataSrc}`);
      console.log(`Found Lottie element with path: ${animationPath}`);
    }
  });

  return lottieElements;
}

function initLottieScrollAnimations() {
  console.log("Initializing custom Lottie scroll animations...");

  // Add mobile canvas styles
  addMobileCanvasStyles();

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

    // Create Lottie animation with conditional renderer
    const isMobile = window.innerWidth < 991;
    const renderer = isMobile ? "canvas" : "svg";

    try {
      const animation = lottie.loadAnimation({
        container: container,
        path: lottieData.path,
        renderer: renderer,
        loop: true,
        autoplay: false,
      });

      // Apply mobile canvas styling if using canvas renderer
      if (renderer === "canvas") {
        // Use a timeout to ensure canvas is rendered
        setTimeout(() => {
          const canvasElement = container.querySelector("canvas");
          if (canvasElement) {
            canvasElement.style.width = "100%";
            canvasElement.style.height = "100%";
            canvasElement.style.objectFit = "contain";
          }
        }, 100);

        // Also listen for animation ready event
        animation.addEventListener("DOMLoaded", () => {
          const canvasElement = container.querySelector("canvas");
          if (canvasElement) {
            canvasElement.style.width = "100%";
            canvasElement.style.height = "100%";
            canvasElement.style.objectFit = "contain";
          }
        });
      }

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
      const isMobile = window.innerWidth < 991;
      const isInHeroLetters = entry.target.closest(".hero_letters") !== null;
      const isFirstLottieInHeroLetters =
        isInHeroLetters &&
        entry.target ===
          entry.target
            .closest(".hero_letters")
            .querySelector('[data-src*=".json"]');

      if (entry.isIntersecting) {
        // Play animation logic
        if (animation) {
          // Play all animations on both desktop and mobile
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
  //sads
  observer.observe(element);
}

// Initialize when DOM is ready

document.addEventListener("DOMContentLoaded", initLottieScrollAnimations);

document.addEventListener("DOMContentLoaded", () => {
  const lineAnims = document.querySelectorAll(".line-anim");
  const scrubAnims = document.querySelectorAll(".scrub-anim");

  // Wait for fonts to load before initializing line animations
  document.fonts.ready.then(() => {
    lineAnims.forEach((lineAnim) => {
      let splitText = new SplitText(lineAnim, {
        type: "lines, words",
        mask: "lines",
      });
      let lines = splitText.lines;
      gsap.set(lines, { y: "100%" });
      gsap.to(lines, {
        y: `0%`,
        duration: 1,
        ease: "power4.out",
        stagger: {
          each: 0.1,
          // onComplete: () => {
          //   splitText.revert();
          // },
        },
        scrollTrigger: {
          trigger: lineAnim,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });
  });
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
