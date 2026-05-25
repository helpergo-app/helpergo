/**
 * HelperGo — Shared UI: sticky header shadow, mobile nav, scroll reveal
 */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 8) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function menuToggleLabel(open) {
    if (window.HelperGoI18n) {
      return window.HelperGoI18n.t(open ? "common.menu.close" : "common.menu.open");
    }
    return open ? "Fermer le menu" : "Ouvrir le menu";
  }

  if (navToggle && header) {
    navToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      header.classList.toggle("nav-open");
      var open = header.classList.contains("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", menuToggleLabel(open));
    });

    document.querySelectorAll(".nav-mobile a").forEach(function (link) {
      link.addEventListener("click", function () {
        header.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", menuToggleLabel(false));
      });
    });

    document.addEventListener("click", function (e) {
      if (!header.classList.contains("nav-open")) return;
      if (header.contains(e.target)) return;
      header.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", menuToggleLabel(false));
    });
  }

  /* IntersectionObserver: fade in sections */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("revealed");
    });
  }
})();