(function () {
  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function startMotion() {
    document.body.classList.add("motion-ready");

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
