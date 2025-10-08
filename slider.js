// slider.js - lightweight hero background slider
// Features: auto-advance, pause on hover, prev/next, indicators, keyboard support

document.addEventListener("DOMContentLoaded", function () {
  const slider = document.getElementById("hero-slider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".slide"));
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const indicatorsContainer = document.getElementById("slider-indicators");
  const intervalMs = 5000;
  let current = 0;
  let timer = null;
  let isPaused = false;

  function goTo(index) {
    index = (index + slides.length) % slides.length;
    slides.forEach((s, i) => {
      const hidden = i !== index;
      s.setAttribute("aria-hidden", hidden ? "true" : "false");
      s.style.opacity = hidden ? "0" : "1";
      s.style.visibility = hidden ? "hidden" : "visible";
    });
    updateIndicators(index);
    current = index;
  }

  function next() {
    goTo(current + 1);
  }
  function prev() {
    goTo(current - 1);
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(() => {
      if (!isPaused) next();
    }, intervalMs);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function buildIndicators() {
    indicatorsContainer.innerHTML = "";
    slides.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.className = "indicator-btn";
      btn.setAttribute("aria-label", `Go to slide ${i + 1}`);
      btn.setAttribute("role", "tab");
      btn.dataset.index = i;
      btn.addEventListener("click", () => {
        goTo(i);
        startTimer();
      });
      indicatorsContainer.appendChild(btn);
    });
  }

  function updateIndicators(activeIndex) {
    const btns = Array.from(indicatorsContainer.children);
    btns.forEach((b, i) => b.classList.toggle("active", i === activeIndex));
  }

  // Pause on hover/focus for accessibility
  slider.addEventListener("mouseenter", () => {
    isPaused = true;
  });
  slider.addEventListener("mouseleave", () => {
    isPaused = false;
  });
  slider.addEventListener("focusin", () => {
    isPaused = true;
  });
  slider.addEventListener("focusout", () => {
    isPaused = false;
  });

  // Controls
  prevBtn &&
    prevBtn.addEventListener("click", () => {
      prev();
      startTimer();
    });
  nextBtn &&
    nextBtn.addEventListener("click", () => {
      next();
      startTimer();
    });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prev();
      startTimer();
    }
    if (e.key === "ArrowRight") {
      next();
      startTimer();
    }
  });

  // Initialize
  buildIndicators();
  goTo(0);
  startTimer();

  // make slides visible transition-friendly
  slides.forEach((s) => {
    s.style.transition = "opacity 1s ease-in-out, visibility 1s";
    s.style.position = "absolute";
    s.style.top = "0";
    s.style.left = "0";
    s.style.width = "100%";
    s.style.height = "100%";
  });
});
