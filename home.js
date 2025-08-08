console.log("test");

// Lottie Intersection Observer - Play animations when in view
function initLottieScrollAnimations() {
  // Find all Lottie elements
  const lottieElements = document.querySelectorAll('.lottie, [data-animation-type="lottie"], .w-lottie');
  
  if (lottieElements.length === 0) {
    console.log('No Lottie elements found');
    return;
  }
  
  // Intersection Observer options
  const options = {
    root: null, // viewport
    rootMargin: '50px', // trigger 50px before entering viewport
    threshold: 0.1 // trigger when 10% of element is visible
  };
  
  // Callback function for intersection changes
  function handleIntersection(entries) {
    entries.forEach(entry => {
      const lottieElement = entry.target;
      const animation = lottieElement.getLottie ? lottieElement.getLottie() : null;
      
      if (entry.isIntersecting) {
        // Element is in view - play animation
        if (animation) {
          animation.setLoop(true);
          animation.play();
          console.log('Playing Lottie animation');
        } else {
          // Try alternative method for Webflow Lottie
          const playEvent = new Event('play');
          lottieElement.dispatchEvent(playEvent);
        }
      } else {
        // Element is out of view - pause animation (optional)
        if (animation) {
          animation.pause();
          console.log('Pausing Lottie animation');
        }
      }
    });
  }
  
  // Create intersection observer
  const observer = new IntersectionObserver(handleIntersection, options);
  
  // Observe each Lottie element
  lottieElements.forEach(element => {
    observer.observe(element);
    
    // Initially pause all animations
    setTimeout(() => {
      const animation = element.getLottie ? element.getLottie() : null;
      if (animation) {
        animation.pause();
      }
    }, 100);
  });
  
  console.log(`Observing ${lottieElements.length} Lottie elements`);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLottieScrollAnimations);
} else {
  initLottieScrollAnimations();
}

// Also try to initialize after a short delay to catch dynamically loaded Lotties
setTimeout(initLottieScrollAnimations, 1000);
