console.log("test");

// Lottie animations controller using lottie-web
const lottieAnimations = new Map(); // Store animation instances

// Auto-discover Lottie animations from data-src attributes
function discoverLottieElements() {
  const lottieElements = [];
  const isMobile = window.innerWidth < 991;

  // Find all elements with data-src attribute (Webflow Lottie elements)
  const elementsWithDataSrc = document.querySelectorAll('[data-src*=".json"]');

  elementsWithDataSrc.forEach((element) => {
    const dataSrc = element.getAttribute("data-src");
    const dataMobSrc = element.getAttribute("data-mob-src");
    const isInHeroLetters = element.closest(".hero_letters") !== null;

    if (dataSrc && dataSrc.includes(".json")) {
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
        path: animationPath,
      });
      console.log(`Found Lottie element with path: ${animationPath}`);
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
        renderer: "canvas",
        loop: true,
        autoplay: false,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
          clearCanvas: true,
          progressiveLoad: false,
          hideOnTransparent: true,
          viewBoxOnly: true,
        },
      });

      // Функція для правильного розміру canvas
      const resizeCanvas = () => {
        const canvas = container.querySelector("canvas");
        if (canvas) {
          const rect = container.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;
          
          // Встановити внутрішні розміри canvas
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          
          // Встановити CSS розміри
          canvas.style.width = rect.width + "px";
          canvas.style.height = rect.height + "px";
          canvas.style.display = "block";
          
          // Масштабувати контекст для високої щільності пікселів
          const ctx = canvas.getContext("2d");
          ctx.scale(dpr, dpr);
          
          // Перерендерити анімацію
          animation.resize();
          console.log(`Canvas resized: ${rect.width}x${rect.height}`);
        }
      };

      animation.addEventListener("DOMLoaded", () => {
        resizeCanvas();
        
        // ResizeObserver для автоматичного ресайзу
        if (window.ResizeObserver) {
          const resizeObserver = new ResizeObserver(() => {
            resizeCanvas();
          });
          resizeObserver.observe(container);
        }
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
        if (animation && !isMobile) {
          // Desktop: play all animations
          animation.play();
          console.log("Playing Lottie animation on desktop");
        } else if (animation && isMobile && isFirstLottieInHeroLetters) {
          // Mobile: only play first animation in hero_letters
          animation.play();
          console.log(
            "Playing first Lottie animation in hero_letters on mobile"
          );
        } else if (isMobile) {
          console.log(
            "Lottie animation disabled on mobile (not first in hero_letters)"
          );
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
      let splitText = new SplitText(lineAnim, { type: "lines", mask: "lines" });
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
