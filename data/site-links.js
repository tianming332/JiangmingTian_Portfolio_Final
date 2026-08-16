/*
 * 主站统一导航接口。
 * 年度作品集、AI 视频和画廊先进入主站内部页面；真正的外部站点链接
 * 只配置在对应的卡片数据中（collections.js / videos.js）。
 */
(function () {
  "use strict";
  window.TJM_SITES = Object.freeze({
    main: "index.html#all-works",
    annual: "collections.html",
    applied: "https://tianming332.github.io/Applied-Brand-Desig_wed/",
    videos: "video.html",
    gallery: "gallery.html"
  });
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-site-key]").forEach(function (link) {
      var target = window.TJM_SITES[link.dataset.siteKey];
      if (target) link.href = target;
    });
  });
}());
