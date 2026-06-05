(function () {
  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var wordRevealSelectors = [
    "#myCarousel .carousel-caption h1",
    ".home-proof-intro h2",
    ".home-command-header h2",
    ".home-section-heading h2",
    ".home-capability-panel h2",
    ".marketing h2.fw-normal",
    ".featurette-heading",
  ].join(", ");

  function splitIntoWords(el) {
    if (el.dataset.wordsSplit === "true") return;

    var original = el.textContent.replace(/\s+/g, " ").trim();
    if (!original) return;

    el.setAttribute("aria-label", original);
    el.dataset.wordsSplit = "true";
    el.textContent = "";

    original.split(" ").forEach(function (word, index) {
      if (index > 0) {
        el.appendChild(document.createTextNode(" "));
      }

      var span = document.createElement("span");
      span.className = "text-word";
      span.setAttribute("aria-hidden", "true");
      span.style.setProperty("--word-index", index);
      span.textContent = word;
      el.appendChild(span);
    });
  }

  function initWordSplitting() {
    document.querySelectorAll(wordRevealSelectors).forEach(splitIntoWords);
  }

  function triggerHeroEntrance(caption) {
    if (!caption) return;
    caption.classList.remove("hero-animate-in");
    void caption.offsetWidth;
    caption.classList.add("hero-animate-in");
  }

  function resetCarouselCaptions(carousel) {
    carousel.querySelectorAll(".carousel-caption").forEach(function (caption) {
      caption.classList.remove("hero-animate-in");
    });
  }

  function initCarouselHero() {
    var carousel = document.getElementById("myCarousel");
    if (!carousel) return;

    carousel.addEventListener("slid.bs.carousel", function (event) {
      resetCarouselCaptions(carousel);
      var incoming =
        event.relatedTarget &&
        event.relatedTarget.querySelector(".carousel-caption");
      if (incoming) {
        window.requestAnimationFrame(function () {
          triggerHeroEntrance(incoming);
        });
      }
    });

    window.setTimeout(function () {
      resetCarouselCaptions(carousel);
      var active = carousel.querySelector(
        ".carousel-item.active .carousel-caption"
      );
      triggerHeroEntrance(active);
    }, 60);
  }

  function startMotion() {
    document.body.classList.add("motion-ready");
    initWordSplitting();
    initCarouselHero();

    if (window.AOS) {
      window.AOS.init({
        duration: 950,
        easing: "ease-out-cubic",
        offset: 90,
        delay: 0,
        once: false,
        mirror: false,
        anchorPlacement: "top-bottom",
      });

      window.setTimeout(function () {
        window.AOS.refreshHard();
      }, 250);
    }
  }

  if (prefersReducedMotion) {
    document.documentElement.classList.add("motion-reduced");
    return;
  }

  document.documentElement.classList.add("motion-enabled");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.requestAnimationFrame(startMotion);
    });
  } else {
    window.requestAnimationFrame(startMotion);
  }
})();
