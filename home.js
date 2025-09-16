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
const animationBusiness = createLottieWithObserver(
  "#lottie-business",
  "https://cdn.prod.website-files.com/682c57a19285ce16ab3a14a1/689071294b93cedd9656e4a2_b-pc.json", // desktop
  "https://cdn.prod.website-files.com/682c57a19285ce16ab3a14a1/688cfff8f9d598349b6d5634_b-mob.json" // mobile
);

const animationTechnical = createLottieWithObserver(
  "#lottie-technical",
  "https://cdn.prod.website-files.com/682c57a19285ce16ab3a14a1/6890712c5b9f9ce7f748f753_t-pc.json", // desktop
  "https://cdn.prod.website-files.com/682c57a19285ce16ab3a14a1/688cfffd10371ed96c3bb44e_t-mob.json" // mobile
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
