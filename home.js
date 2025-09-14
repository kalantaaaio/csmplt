const lottieAnimations = new Map();

function discoverLottieElements() {
  const lottieElements = [];
  const elementsWithDataSrc = document.querySelectorAll('[data-src*=".json"]');

  elementsWithDataSrc.forEach((element) => {
    element.classList.add("lottie-div");
    const dataSrc = element.getAttribute("data-src");

    if (dataSrc && dataSrc.includes(".json")) {
      lottieElements.push({
        element: element,
        path: dataSrc,
      });
      console.log(`Found Webflow Lottie element with path: ${dataSrc}`);
    }
  });

  return lottieElements;
}

async function initLottieScrollAnimations() {
  console.log("Initializing universal Lottie animations...");

  if (typeof lottie === "undefined") {
    console.error("Lottie library not loaded yet");
    return;
  }

  const discoveredLotties = discoverLottieElements();

  for (const lottieData of discoveredLotties) {
    const container = lottieData.element;

    container.innerHTML = "";
    container.removeAttribute("data-animation-type");
    container.removeAttribute("data-autoplay");
    container.removeAttribute("data-loop");
    container.removeAttribute("data-direction");
    container.removeAttribute("data-bounding");

    try {
      const animation = await new Promise((resolve, reject) => {
        const anim = lottie.loadAnimation({
          container: container,
          path: lottieData.path,
          renderer: "svg",
          loop: true,
          autoplay: false,
        });

        anim.addEventListener("DOMLoaded", () => resolve(anim));
        anim.addEventListener("error", reject);
      });

      lottieAnimations.set(container, animation);
      console.log(`Lottie animation loaded: ${lottieData.path}`);

      setupIntersectionObserver(container);
    } catch (error) {
      console.error(`Error loading Lottie animation: ${error}`);
    }
  }
}

function setupIntersectionObserver(element) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const animation = lottieAnimations.get(entry.target);

        if (animation) {
          if (entry.isIntersecting) {
            animation.play();
            console.log("Playing Lottie animation");
          } else {
            animation.pause();
            console.log("Pausing Lottie animation");
          }
        }
      });
    },
    {
      root: null,
      rootMargin: "50px",
      threshold: 0.1,
    }
  );

  observer.observe(element);
}

document.addEventListener("DOMContentLoaded", initLottieScrollAnimations);

document.addEventListener("DOMContentLoaded", () => {});
const lineAnims = document.querySelectorAll(".line-anim");
const scrubAnims = document.querySelectorAll(".scrub-anim");

// Wait for fonts to load before initializing line animations
window.onload = function () {
  setTimeout(() => {
    lineAnims.forEach((lineAnim) => {
      SplitText.create(lineAnim, {
        type: "lines",
        mask: "lines",
        linesClass: "line",
        autoSplit: true,
        onSplit(self) {
          gsap.set(self.lines, { y: "100%" });
          return gsap.to(self.lines, {
            y: "0%",
            duration: 1,
            ease: "power4.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: lineAnim,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          });
        },
      });
    });
  }, 500);
};

document.fonts.ready.then(() => {
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
