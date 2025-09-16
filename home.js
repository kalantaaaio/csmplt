// Функція для створення анімації з автоматичним observer та responsive path
// Функція для створення анімації з автоматичним observer та responsive path
function createLottieWithObserver(containerId, desktopPath, mobilePath) {
  // Перевіряємо чи існує контейнер
  const container = document.querySelector(containerId);
  if (!container) {
    console.warn(`Container ${containerId} not found on this page`);
    return null;
  }

  // Визначаємо який path використовувати
  function getAnimationPath() {
    return window.innerWidth < 480 ? mobilePath : desktopPath;
  }

  let animation = lottie.loadAnimation({
    container: container,
    path: getAnimationPath(),
    renderer: "svg",
    autoplay: false,
  });

  // Intersection Observer для цієї анімації
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animation.play();
      } else {
        animation.pause();
      }
    });
  });

  // Функція для перезавантаження анімації при зміні розміру екрану
  function handleResize() {
    const container = document.querySelector(containerId);
    if (!container) return; // Додаткова перевірка при resize

    const newPath = getAnimationPath();
    const currentPath = animation.path;

    if (newPath !== currentPath) {
      const wasPlaying = !animation.isPaused;

      // Видаляємо стару анімацію
      animation.destroy();

      // Створюємо нову з правильним path
      animation = lottie.loadAnimation({
        container: container,
        path: newPath,
        renderer: "svg",
        autoplay: false,
      });

      // Відновлюємо стан відтворення
      animation.addEventListener("DOMLoaded", () => {
        observer.observe(container);
        if (wasPlaying) {
          animation.play();
        }
      });
    }
  }

  // Запускаємо observer після завантаження
  animation.addEventListener("DOMLoaded", () => {
    observer.observe(container);
  });

  // Слухаємо зміни розміру екрану
  window.addEventListener("resize", handleResize);

  return animation;
}

// Створюємо анімації з desktop і mobile версіями (тільки якщо контейнери існують)
const animationTestimonials = createLottieWithObserver(
  "#drone-image",
  "https://cdn.prod.website-files.com/681db2b316b1e2e6be057a6a/6839d9bf204a37e9e9670247_025front-compress.json", // desktop
  "https://cdn.prod.website-files.com/681db2b316b1e2e6be057a6a/mobile-drone-animation.json" // mobile
);

const animationHero = createLottieWithObserver(
  "#hero-animation",
  "path/to/hero-animation-desktop.json", // desktop
  "path/to/hero-animation-mobile.json" // mobile
);

const animationFeatures = createLottieWithObserver(
  "#features-animation",
  "path/to/features-animation-desktop.json", // desktop
  "path/to/features-animation-mobile.json" // mobile
);

document.addEventListener("DOMContentLoaded", () => {});
const lineAnims = document.querySelectorAll(".line-anim");
const scrubAnims = document.querySelectorAll(".scrub-anim");

// Wait for fonts to load before initializing line animations
window.onload = function () {
  // Wait for both DOM and fonts to be ready
  document.fonts.ready.then(() => {
    lineAnims.forEach((lineAnim) => {
      SplitText.create(lineAnim, {
        type: "lines,words",
        mask: "lines",
        linesClass: "line",
        wordsClass: "word",
        autoSplit: true,
        reduceWhiteSpace: false,
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
  });
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
