console.log("test");

// Lottie Scroll Animation Controller
function initLottieScrollAnimations() {
  console.log('Initializing Lottie scroll animations...');
  
  // Wait a bit for Webflow to load Lottie elements
  setTimeout(() => {
    // Try multiple selectors for Webflow Lottie elements
    const lottieElements = document.querySelectorAll('[data-w-id], .w-lottie, [data-animation-type="lottie"], .lottie, [data-autoplay]');
    console.log(`Found ${lottieElements.length} potential Lottie elements`);
    
    // Remove autoplay attributes from all found elements
    lottieElements.forEach(element => {
      if (element.hasAttribute('data-autoplay')) {
        element.removeAttribute('data-autoplay');
        console.log('Removed data-autoplay attribute');
      }
      // Also remove any autoplay from child elements
      const autoplayChildren = element.querySelectorAll('[data-autoplay]');
      autoplayChildren.forEach(child => {
        child.removeAttribute('data-autoplay');
        console.log('Removed data-autoplay from child');
      });
    });
    
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
  // Forcefully remove autoplay attribute
  element.removeAttribute('data-autoplay');
  
  // Method 1: Try Webflow's built-in method
  if (element.getLottie) {
    const animation = element.getLottie();
    if (animation) {
      animation.pause();
      animation.stop();
      console.log('Stopped Lottie via getLottie()');
      return;
    }
  }
  
  // Method 2: Try to find and stop all Lottie instances
  const allLottieElements = element.querySelectorAll('*');
  allLottieElements.forEach(child => {
    if (child.getLottie) {
      const anim = child.getLottie();
      if (anim) {
        anim.pause();
        anim.stop();
        console.log('Stopped child Lottie animation');
      }
    }
    // Remove autoplay from children too
    child.removeAttribute('data-autoplay');
  });
  
  // Method 3: Hide element temporarily to stop animation
  const originalDisplay = element.style.display;
  element.style.display = 'none';
  setTimeout(() => {
    element.style.display = originalDisplay;
  }, 50);
  
  console.log('Attempted to stop Lottie animation');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initLottieScrollAnimations);

// Also try after window load (for safety)
window.addEventListener('load', () => {
  setTimeout(initLottieScrollAnimations, 500);
});

// Retry initialization if needed
setTimeout(initLottieScrollAnimations, 3000);
