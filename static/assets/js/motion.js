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
    ".simulation-hero h1",
    ".science-gallery-title",
    ".science-sidebar-header h2",
    ".science-stage-header h2",
  ].join(", ");

  var sectionSelectors = [
    "#myCarousel",
    ".home-proof-section",
    ".home-command-section",
    ".marketing",
    ".featurette",
    ".simulation-hero",
    ".simulation-catalog",
    ".simulation-workbench",
    ".science-gallery-hero",
    ".science-gallery-showcase",
    ".science-theater-shell",
  ].join(", ");

  var motionGroupSelectors = [
    "#myCarousel .carousel-caption",
    ".home-proof-grid",
    ".home-command-header",
    ".home-command-grid",
    ".home-capability-panel",
    ".featurette > [class*='col-']",
    ".simulation-hero .row > [class*='col-']",
    ".simulation-catalog .row > [class*='col-']",
    ".simulation-workbench .simulation-panel",
    ".science-gallery-hero .row > [class*='col-']",
    ".science-exhibit-strip-panel",
    ".science-stage-panel",
    ".science-gallery-card",
    ".science-metric-card",
    ".projects-grid > .col",
    ".contact-grid .card",
  ].join(", ");

  var mediaSelectors = [
    "#myCarousel .carousel-item img",
    ".featurette-image",
    ".science-stage-canvas-wrap",
    ".science-main-canvas-theater",
    ".science-mini-canvas",
    ".science-exhibit-strip-panel",
  ].join(", ");

  var motionSections = [];
  var ticking = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

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
      requestMotionFrame();
    });

    window.setTimeout(function () {
      resetCarouselCaptions(carousel);
      var active = carousel.querySelector(
        ".carousel-item.active .carousel-caption"
      );
      triggerHeroEntrance(active);
      requestMotionFrame();
    }, 80);
  }

  function initRevealTargets() {
    var revealTargets = Array.prototype.slice.call(
      document.querySelectorAll("[data-aos]")
    );

    if (!revealTargets.length) return;

    revealTargets.forEach(function (el, index) {
      el.classList.add("aos-init");

      var order = 0;
      if (el.parentElement) {
        var siblings = Array.prototype.filter.call(
          el.parentElement.children,
          function (child) {
            return child.matches && child.matches("[data-aos]");
          }
        );
        order = Math.max(siblings.indexOf(el), 0);
      } else {
        order = index;
      }

      el.style.setProperty("--reveal-order", order);
    });

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach(function (el) {
        el.classList.add("aos-animate");
      });
      return;
    }

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;

          if (entry.isIntersecting) {
            el.classList.add("aos-animate");
            return;
          }

          if (
            entry.boundingClientRect.top > window.innerHeight ||
            entry.boundingClientRect.bottom < 0
          ) {
            el.classList.remove("aos-animate");
          }
        });
      },
      {
        threshold: [0, 0.12, 0.22, 0.4, 0.65],
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  function assignMotionStructure() {
    document.querySelectorAll(sectionSelectors).forEach(function (section) {
      section.classList.add("motion-section");
    });

    document.querySelectorAll(motionGroupSelectors).forEach(function (group) {
      group.classList.add("motion-group");
    });

    document.querySelectorAll(mediaSelectors).forEach(function (media) {
      media.classList.add("motion-media");
    });

    motionSections = Array.prototype.slice.call(
      document.querySelectorAll(".motion-section")
    );
  }

  function updateMotionState() {
    ticking = false;

    var viewportHeight = window.innerHeight || 1;
    var scrollY =
      window.pageYOffset || document.documentElement.scrollTop || 0;
    var hero = document.getElementById("myCarousel");

    document.documentElement.style.setProperty(
      "--page-scroll",
      scrollY.toFixed(2)
    );
    document.body.classList.toggle("is-scrolled", scrollY > 18);

    motionSections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      var progress = clamp(
        (viewportHeight - rect.top) / (viewportHeight + rect.height),
        0,
        1
      );
      var focus = clamp(
        1 -
          Math.abs(rect.top + rect.height * 0.5 - viewportHeight * 0.52) /
            (viewportHeight * 0.75),
        0,
        1
      );

      section.style.setProperty("--section-progress", progress.toFixed(4));
      section.style.setProperty("--section-focus", focus.toFixed(4));

      section.classList.toggle(
        "is-active",
        rect.top < viewportHeight * 0.78 && rect.bottom > viewportHeight * 0.2
      );
      section.classList.toggle("is-past", rect.bottom < viewportHeight * 0.18);
    });

    if (hero) {
      var heroRect = hero.getBoundingClientRect();
      var heroProgress = clamp(
        (0 - heroRect.top) / Math.max(heroRect.height, 1),
        0,
        1
      );
      hero.style.setProperty(
        "--hero-scroll-progress",
        heroProgress.toFixed(4)
      );
    }
  }

  function requestMotionFrame() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateMotionState);
  }

  function initScrollMotion() {
    updateMotionState();

    window.addEventListener("scroll", requestMotionFrame, { passive: true });
    window.addEventListener("resize", requestMotionFrame);
    window.addEventListener("orientationchange", requestMotionFrame);
  }

  function startMotion() {
    document.body.classList.add("motion-ready");
    document.documentElement.classList.add("motion-enhanced");

    initWordSplitting();
    assignMotionStructure();
    initRevealTargets();
    initCarouselHero();
    initScrollMotion();
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
