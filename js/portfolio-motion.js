(function () {
  "use strict";
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function unique(nodes) {
    return Array.prototype.filter.call(nodes, function (node, index, list) { return list.indexOf(node) === index; });
  }

  function setupReveal() {
    var selectors = [
      ".filter-panel", ".project-card-wrap", ".works-section footer",
      ".project-return", ".project-heading", ".project-keyvisual",
      ".project-overview > *", ".compact-index-head", ".compact-preview-card",
      ".compact-chapter-head > *", ".gallery-item", ".project-next > a", ".project-article > footer"
    ];
    var nodes = unique(document.querySelectorAll(selectors.join(",")));
    nodes.forEach(function (node, index) {
      node.classList.add("tjm-reveal");
      if (node.matches(".project-keyvisual,.gallery-item,.project-card-wrap,.compact-preview-card")) node.setAttribute("data-tjm-reveal", "scale");
      else if (node.matches(".project-return,.compact-chapter-head > :first-child")) node.setAttribute("data-tjm-reveal", "line");
      node.style.setProperty("--tjm-delay", String(Math.min(index % 6, 5) * 55) + "ms");
    });

    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach(function (node) { node.classList.add("tjm-in-view"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("tjm-in-view");
        observer.unobserve(entry.target);
      });
    }, { rootMargin:"0px 0px -8% 0px", threshold:.08 });
    nodes.forEach(function (node) { observer.observe(node); });
  }

  function setupPointerLight() {
    if (reduced || !window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    document.querySelectorAll(".project-media,.project-keyvisual,.gallery-item button,.compact-preview-card").forEach(function (surface) {
      surface.classList.add("tjm-motion-surface");
      surface.addEventListener("pointermove", function (event) {
        var rect = surface.getBoundingClientRect();
        surface.style.setProperty("--tjm-pointer-x", (event.clientX - rect.left) + "px");
        surface.style.setProperty("--tjm-pointer-y", (event.clientY - rect.top) + "px");
      }, { passive:true });
    });
  }

  function setupCurrentSections() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-project-section]"));
    if (!sections.length || !("IntersectionObserver" in window)) return;
    var currentObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("tjm-section-current", entry.isIntersecting);
      });
    }, { rootMargin:"-24% 0px -60% 0px", threshold:0 });
    sections.forEach(function (section) { currentObserver.observe(section); });
  }

  function init() {
    setupReveal();
    setupPointerLight();
    setupCurrentSections();
    requestAnimationFrame(function () { document.documentElement.classList.add("tjm-motion-ready"); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();
}());
