/* 固定线上接口；无论从本机还是 GitHub Pages 打开，都跳转到公开网页。 */
(function () {
  "use strict";
  window.TJM_SITES = Object.freeze({
    main: "https://tianming332.github.io/JiangmingTian_Portfolio_Final/#all-works",
    annual: "https://tianming332.github.io/TianJiangming-s-portfolio/",
    applied: "https://tianming332.github.io/Applied-Brand-Desig_wed/",
    videos: "https://tianming332.github.io/Tian_vidos/",
    gallery: "https://tianming332.github.io/JiangmingTian_Portfolio_Final/gallery.html"
  });
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-site-key]").forEach(function (link) {
      var target = window.TJM_SITES[link.dataset.siteKey];
      if (target) link.href = target;
    });
  });
}());
