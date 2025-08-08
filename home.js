console.log("test");

// Lottie Scroll Animation Controller
function initLottieScrollAnimations() {
  console.log('Initializing Lottie scroll animations...');
  
  // Wait a bit for Webflow to load Lottie elements
  setTimeout(() => {
    // Try multiple selectors for Webflow Lottie elements
    const lottieElements = document.querySelectorAll('[data-w-id], .w-lottie, [data-animation-type="lottie"], .lottie');
    console.log(`Found ${lottieElements.length} potential Lottie elements`);
    
    if (lottieElements.length === 0) {
      console.log('No Lottie elements found, retrying in 2 seconds...');
      setTimeout(initLottieScrollAnimations, 2000);
      return;
    }
    
    // Intersection Observer options
    const observerOptions = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    };
    
    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        
        if (entry.isIntersecting) {
          // Element entered viewport - start animation
          console.log('Lottie entered viewport, starting animation');
          startLottieAnimation(element);
        } else {
          // Element left viewport - stop animation
          console.log('Lottie left viewport, stopping animation');
          stopLottieAnimation(element);
        }
      });
    }, observerOptions);
    
    // Observe all potential Lottie elements
    lottieElements.forEach(element => {
      observer.observe(element);
      // Initially stop all animations
      stopLottieAnimation(element);
    });
    
  }, 1000); // Wait 1 second for Webflow to initialize
}

function startLottieAnimation(element) {
  // Method 1: Try Webflow's built-in method
  if (element.getLottie) {
    const animation = element.getLottie();
    if (animation) {
      animation.loop = true;
      animation.play();
      console.log('Started Lottie via getLottie()');
      return;
    }
  }
  
  // Method 2: Try triggering Webflow interaction
  if (element.click) {
    element.style.visibility = 'visible';
    element.style.opacity = '1';
  }
  
  // Method 3: Dispatch custom events
  const playEvent = new CustomEvent('lottie-play');
  element.dispatchEvent(playEvent);
  
  // Method 4: Try to find and manipulate nested animation
  const animationContainer = element.querySelector('[data-animation-type="lottie"]') || element;
  if (animationContainer && animationContainer.getLottie) {
    const anim = animationContainer.getLottie();
    if (anim) {
      anim.loop = true;
      anim.play();
      console.log('Started nested Lottie animation');
    }
  }
}

function stopLottieAnimation(element) {
  // Method 1: Try Webflow's built-in method
  if (element.getLottie) {
    const animation = element.getLottie();
    if (animation) {
      animation.pause();
      console.log('Stopped Lottie via getLottie()');
      return;
    }
  }
  
  // Method 2: Dispatch custom events
  const stopEvent = new CustomEvent('lottie-stop');
  element.dispatchEvent(stopEvent);
  
  // Method 3: Try to find and manipulate nested animation
  const animationContainer = element.querySelector('[data-animation-type="lottie"]') || element;
  if (animationContainer && animationContainer.getLottie) {
    const anim = animationContainer.getLottie();
    if (anim) {
      anim.pause();
      console.log('Stopped nested Lottie animation');
    }
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initLottieScrollAnimations);

// Also try after window load (for safety)
window.addEventListener('load', () => {
  setTimeout(initLottieScrollAnimations, 500);
});

// Retry initialization if needed
setTimeout(initLottieScrollAnimations, 3000);
