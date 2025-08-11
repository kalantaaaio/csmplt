// kaif-tooltips
document.addEventListener("DOMContentLoaded", () => {
  class Kaif {
    constructor(containerSelector) {
      this.container = document.querySelector(containerSelector);
      if (!this.container) return;

      this.modals = this.container.querySelectorAll("dialog");
      this.buttons = this.container.querySelectorAll(".kaif-cirlce");
      this.balls = [...this.buttons];
      this.ballData = [];
      this.friction = 0.998;
      this.wallBounce = 0.85;
      this.minSpeed = 0.5; // Зменшено з 1.0 до 0.5 (в 2 рази повільніше)
      this.maxSpeed = 3.0; // Зменшено з 8.0 до 4.0 (в 2 рази повільніше)
      // Перевірка підтримки hover
      this.hasHover = window.matchMedia("(hover: hover)").matches;
      // Додаємо стан для анімації
      this.isAnimating = false;
      this.animationId = null;
      this.isVisible = true;
      this.wasAnimatingBeforeHide = false;
      this.observer = null;
      
      // Адаптивна частота кадрів для економії ресурсів
      this.frameCounter = 0;
      this.targetFPS = this.getOptimalFPS();
      this.init();
    }
    init() {
      this.updateContainerSize();
      window.addEventListener("resize", this.updateContainerSize.bind(this));
      this.balls.forEach((ball) => this.setupBall(ball));
      this.buttons.forEach((btn) => {
        // Завжди додаємо обробник кліку
        btn.addEventListener("click", () => this.handleClick(btn));
        // Додаємо обробники hover тільки якщо пристрій підтримує hover
        if (this.hasHover) {
          btn.addEventListener("mouseenter", () => this.handleHover(btn));
          btn.addEventListener("mouseleave", () => this.handleHoverLeave(btn));
        }
      });
      document.addEventListener("click", (e) => this.closeOnOutsideClick(e));
      document.addEventListener("keydown", (e) => this.closeOnEscape(e));
      
      // Додаємо Intersection Observer для відстеження видимості
      this.setupIntersectionObserver();
      
      // Додаємо відстеження видимості сторінки
      this.setupVisibilityListener();
    }
    updateContainerSize() {
      this.containerRect = this.container.getBoundingClientRect();
      this.vw = this.containerRect.width;
      this.vh = this.containerRect.height;
    }
    setupBall(ball) {
      const radius = ball.offsetWidth / 2;
      const x = Math.random() * (this.vw - radius * 2) + radius;
      const y = Math.random() * (this.vh - radius * 2) + radius;
      gsap.set(ball, { xPercent: -50, yPercent: -50, x, y });
      const data = {
        el: ball,
        radius,
        get x() {
          return gsap.getProperty(ball, "x");
        },
        get y() {
          return gsap.getProperty(ball, "y");
        },
        vx: (Math.random() - 0.5) * 2, // Зменшено з 6 до 3 (в 2 рази повільніше)
        vy: (Math.random() - 0.5) * 2, // Зменшено з 6 до 3 (в 2 рази повільніше)
        isDragging: false,
        isHovered: false, // Додано для відстеження hover стану
        savedVx: 0, // Збережена швидкість під час hover
        savedVy: 0, // Збережена швидкість під час hover
        lastX: 0,
        lastY: 0,
        dragFrameCount: 0,
      };
      const drag = new Draggable(ball, {
        bounds: this.container,
        zIndexBoost: false, // Вимикаємо автоматичне підвищення z-index
        onPress: () => {
          data.isDragging = true;
          data.lastX = data.x;
          data.lastY = data.y;
          data.dragFrameCount = 0;
          gsap.killTweensOf(ball);
          // Встановлюємо фіксований z-index
          ball.style.zIndex = 90;
        },
        onDrag: () => {
          data.dragFrameCount++;
          if (data.dragFrameCount % 3 === 0) {
            data.lastX = data.x;
            data.lastY = data.y;
          }
        },
        onDragEnd: () => {
          const deltaX = data.x - data.lastX;
          const deltaY = data.y - data.lastY;

          data.vx = deltaX * 0.3; // Зменшено з 0.8 до 0.4 (в 2 рази повільніше)
          data.vy = deltaY * 0.3; // Зменшено з 0.8 до 0.4 (в 2 рази повільніше)

          const speed = Math.sqrt(data.vx ** 2 + data.vy ** 2);
          if (speed < this.minSpeed) {
            const angle = Math.random() * Math.PI * 2;
            data.vx = Math.cos(angle) * this.minSpeed;
            data.vy = Math.sin(angle) * this.minSpeed;
          }
          if (speed > this.maxSpeed) {
            data.vx = (data.vx / speed) * this.maxSpeed;
            data.vy = (data.vy / speed) * this.maxSpeed;
          }

          data.isDragging = false;
          ball.style.zIndex = 90;
        },
      });
      ball._ballData = data;
      this.ballData.push(data);
    }
    maintainMovement(ball) {
      const currentSpeed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
      if (currentSpeed < this.minSpeed) {
        const angle =
          Math.atan2(ball.vy, ball.vx) + (Math.random() - 0.5) * 0.5;
        ball.vx = Math.cos(angle) * this.minSpeed;
        ball.vy = Math.sin(angle) * this.minSpeed;
      }
      if (currentSpeed > this.maxSpeed) {
        ball.vx = (ball.vx / currentSpeed) * this.maxSpeed;
        ball.vy = (ball.vy / currentSpeed) * this.maxSpeed;
      }
    }
    handleCollisions() {
      for (let i = 0; i < this.ballData.length; i++) {
        const ball1 = this.ballData[i];
        for (let j = i + 1; j < this.ballData.length; j++) {
          const ball2 = this.ballData[j];
          const dx = ball2.x - ball1.x;
          const dy = ball2.y - ball1.y;
          const dist = Math.sqrt(dx ** 2 + dy ** 2);
          const minDist = ball1.radius + ball2.radius;

          if (dist < minDist && dist > 0) {
            const angle = Math.atan2(dy, dx);
            const overlap = minDist - dist;
            const sepX = Math.cos(angle) * overlap * 0.5;
            const sepY = Math.sin(angle) * overlap * 0.5;
            if (!ball1.isDragging && !ball1.isHovered)
              // Додано перевірку на isHovered
              gsap.set(ball1.el, { x: ball1.x - sepX, y: ball1.y - sepY });
            if (!ball2.isDragging && !ball2.isHovered)
              // Додано перевірку на isHovered
              gsap.set(ball2.el, { x: ball2.x + sepX, y: ball2.y + sepY });
            const normalX = dx / dist;
            const normalY = dy / dist;
            const relVX = ball2.vx - ball1.vx;
            const relVY = ball2.vy - ball1.vy;
            const velAlongNormal = relVX * normalX + relVY * normalY;

            if (velAlongNormal > 0) continue;

            const restitution = 0.9;
            const impulse = (2 * velAlongNormal * restitution) / 2;
            const impulseX = impulse * normalX;
            const impulseY = impulse * normalY;
            if (!ball1.isDragging && !ball1.isHovered) {
              // Додано перевірку на isHovered
              ball1.vx += impulseX;
              ball1.vy += impulseY;
            }
            if (!ball2.isDragging && !ball2.isHovered) {
              // Додано перевірку на isHovered
              ball2.vx -= impulseX;
              ball2.vy -= impulseY;
            }
          }
        }
      }
    }
    update() {
      this.frameCounter++;
      
      // Пропускаємо кадри для економії ресурсів на повільних пристроях
      if (this.frameCounter % this.targetFPS !== 0) {
        if (this.isAnimating) {
          this.animationId = requestAnimationFrame(this.update.bind(this));
        }
        return;
      }
      
      this.ballData.forEach((ball) => {
        if (!ball.isDragging && !ball.isHovered) {
          // Додано перевірку на isHovered
          ball.vx *= this.friction;
          ball.vy *= this.friction;
          this.maintainMovement(ball);
          let newX = ball.x + ball.vx;
          let newY = ball.y + ball.vy;
          if (newX - ball.radius <= 0) {
            newX = ball.radius;
            ball.vx = Math.abs(ball.vx) * this.wallBounce;
          } else if (newX + ball.radius >= this.vw) {
            newX = this.vw - ball.radius;
            ball.vx = -Math.abs(ball.vx) * this.wallBounce;
          }
          if (newY - ball.radius <= 0) {
            newY = ball.radius;
            ball.vy = Math.abs(ball.vy) * this.wallBounce;
          } else if (newY + ball.radius >= this.vh) {
            newY = this.vh - ball.radius;
            ball.vy = -Math.abs(ball.vy) * this.wallBounce;
          }
          gsap.set(ball.el, { x: newX, y: newY });
        }
      });
      this.handleCollisions();
      // Продовжуємо анімацію тільки якщо контейнер видимий
      if (this.isAnimating) {
        this.animationId = requestAnimationFrame(this.update.bind(this));
      }
    }
    restartBallMovement(ballEl) {
      const data = ballEl._ballData;
      if (data) {
        data.isDragging = false;
        const angle = Math.random() * Math.PI * 2;
        data.vx = Math.cos(angle) * (this.minSpeed + Math.random() * 1); // Зменшено з Math.random() * 2 до Math.random() * 1
        data.vy = Math.sin(angle) * (this.minSpeed + Math.random() * 1); // Зменшено з Math.random() * 2 до Math.random() * 1
      }
    }
    positionModal(modal, refEl) {
      modal.style.position = "absolute";
      modal.style.margin = "0";
      FloatingUIDOM.computePosition(refEl, modal, {
        placement: "bottom",
        middleware: [
          FloatingUIDOM.offset(10),
          FloatingUIDOM.flip({ fallbackPlacements: ["top", "right", "left"] }),
          FloatingUIDOM.shift({ padding: 8 }),
        ],
      })
        .then(({ x, y }) => {
          modal.style.left = `${x}px`;
          modal.style.top = `${y}px`;
        })
        .catch(console.error);
    }
    handleHover(btn) {
      // Зупиняємо рух кульки
      const data = btn._ballData;
      if (data) {
        data.isHovered = true;
        // Зберігаємо поточну швидкість
        data.savedVx = data.vx;
        data.savedVy = data.vy;
        // Зупиняємо рух
        data.vx = 0;
        data.vy = 0;
      }
      // Затримка для hover (опціонально)
      clearTimeout(btn._hoverTimeout);
      btn._hoverTimeout = setTimeout(() => {
        this.openModal(btn);
      }, 150); // 150ms затримка
    }
    handleHoverLeave(btn) {
      // Відновлюємо рух кульки
      const data = btn._ballData;
      if (data && data.isHovered) {
        data.isHovered = false;
        // Відновлюємо збережену швидкість або генеруємо нову
        if (data.savedVx !== undefined && data.savedVy !== undefined) {
          data.vx = data.savedVx;
          data.vy = data.savedVy;
        } else {
          // Якщо збереженої швидкості немає, генеруємо нову
          const angle = Math.random() * Math.PI * 2;
          data.vx = Math.cos(angle) * this.minSpeed;
          data.vy = Math.sin(angle) * this.minSpeed;
        }
      }
      // Скасовуємо відкриття якщо миша покинула елемент
      clearTimeout(btn._hoverTimeout);
      // Додаємо затримку перед закриттям
      const buttonTarget = btn.dataset.openModal;
      const modal = document.getElementById(buttonTarget);
      if (modal && modal.open) {
        clearTimeout(btn._closeTimeout);
        btn._closeTimeout = setTimeout(() => {
          // Перевіряємо чи миша не над модалкою
          if (!modal.matches(":hover") && !btn.matches(":hover")) {
            modal.close();
          }
        }, 300); // 300ms затримка перед закриттям
      }
    }
    handleClick(btn) {
      this.openModal(btn);
    }
    openModal(btn) {
      const buttonTarget = btn.dataset.openModal;
      const alreadyOpen = Array.from(this.modals).some(
        (modal) => modal.getAttribute("id") === buttonTarget && modal.open
      );
      if (alreadyOpen) return;
      this.buttons.forEach((b) => b.classList.remove("is--active-cirlce"));
      btn.classList.add("is--active-cirlce");
      btn.style.zIndex = 90;
      this.modals.forEach((modal) => {
        if (modal.open) modal.close();
        if (modal.getAttribute("id") === buttonTarget) {
          const updatePosition = () => {
            if (modal.open) this.positionModal(modal, btn);
          };
          modal.style.opacity = "0";
          modal.show();
          // Додаємо обробники hover для модалки (якщо підтримується hover)
          if (this.hasHover) {
            modal.addEventListener("mouseenter", () => {
              clearTimeout(btn._closeTimeout);
            });
            modal.addEventListener("mouseleave", () => {
              clearTimeout(btn._closeTimeout);
              btn._closeTimeout = setTimeout(() => {
                if (!modal.matches(":hover") && !btn.matches(":hover")) {
                  modal.close();
                }
              }, 300);
            });
          }
          // 💡 Знімаємо фокус з модалки
          requestAnimationFrame(() => {
            if (document.activeElement === modal) {
              modal.blur();
            }
          });
          this.positionModal(modal, btn);
          setTimeout(() => {
            modal.style.opacity = "1";
            modal.style.transition = "opacity 0.2s";
          }, 10);
          window.addEventListener("resize", updatePosition);
          window.addEventListener("scroll", updatePosition, true);
          const handleClose = () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
            modal.removeEventListener("close", handleClose);
            btn.classList.remove("is--active-cirlce");
            setTimeout(() => this.restartBallMovement(btn), 100);
          };
          modal.addEventListener("close", handleClose);
        }
      });
    }
    
    setupIntersectionObserver() {
      // Створюємо Intersection Observer з порогом 10% видимості
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.target === this.container) {
            if (entry.isIntersecting) {
              this.startAnimation();
            } else {
              this.stopAnimation();
            }
          }
        });
      }, {
        threshold: 0.1, // Запускати коли 10% елемента видно
        rootMargin: '50px' // Додатковий буферний простір
      });
      
      this.observer.observe(this.container);
    }
    
    startAnimation() {
      if (!this.isAnimating && this.isVisible) {
        this.isAnimating = true;
        this.update();
      }
    }
    
    stopAnimation() {
      this.isAnimating = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
    
    setupVisibilityListener() {
      // Відстеження зміни видимості документа (таб/вікно)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // Сторінка прихована - зупиняємо анімацію
          this.wasAnimatingBeforeHide = this.isAnimating;
          this.isVisible = false;
          this.stopAnimation();
        } else {
          // Сторінка знову видима - відновлюємо анімацію якщо потрібно
          this.isVisible = true;
          if (this.wasAnimatingBeforeHide) {
            this.startAnimation();
          }
        }
      });
    }
    
    getOptimalFPS() {
      // Адаптивна частота кадрів залежно від можливостей пристрою
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // На мобільних пристроях зменшуємо частоту кадрів
      if (isMobile) {
        return 2; // Кожен 2-й кадр (30fps замість 60fps)
      }
      
      // Перевіряємо доступність API для визначення потужності
      if ('hardwareConcurrency' in navigator && navigator.hardwareConcurrency < 4) {
        return 2; // На слабких пристроях теж зменшуємо
      }
      
      return 1; // На потужних пристроях - всі кадри
    }
    
    destroy() {
      // Метод для очищення ресурсів
      this.stopAnimation();
      if (this.observer) {
        this.observer.disconnect();
      }
    }
    
    closeOnOutsideClick(e) {
      this.modals.forEach((modal) => {
        if (
          modal.open &&
          !modal.contains(e.target) &&
          ![...this.buttons].some(
            (btn) =>
              btn.dataset.openModal === modal.getAttribute("id") &&
              btn.contains(e.target)
          )
        ) {
          modal.close();
        }
      });
    }
    closeOnEscape(e) {
      if (e.key === "Escape") {
        this.modals.forEach((modal) => modal.open && modal.close());
      }
    }
  }
  new Kaif(".cases_kaif-left");
  new Kaif(".cases_kaif-right");
  new Kaif(".cases_kaif-full");
});
