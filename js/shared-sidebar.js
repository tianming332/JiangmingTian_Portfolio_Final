(function () {
  "use strict";

  var sourceScript = document.currentScript;
  var siteRoot = sourceScript && sourceScript.src
    ? new URL("../", sourceScript.src)
    : new URL("./", location.href);
  var styleId = "tjm-shared-sidebar-style";

  function siteHref(path) {
    return new URL(path, siteRoot).href;
  }

  function isOutsideMainSite() {
    return location.href.indexOf(siteRoot.href) !== 0;
  }

  function activeSection() {
    var explicit = document.body && document.body.getAttribute("data-sidebar-active");
    if (explicit) return explicit;

    var path = location.pathname.toLowerCase();
    if (/workflow\.html$/.test(path)) return "workflow";
    if (/video\.html$/.test(path)) return "videos";
    if (/collections\.html$/.test(path)) return "annual";
    if (/gallery\.html$/.test(path)) return "gallery";
    if (/text\.html$/.test(path)) return "about";
    if (/(?:commercialprojects|applied)\.html$/.test(path)) return "applied";
    return "all-works";
  }

  function linkClass(key, active) {
    return "sidebar-link" + (key === active ? " active" : "");
  }

  function installStyle() {
    if (document.getElementById(styleId)) return;
    var link = document.createElement("link");
    link.id = styleId;
    link.rel = "stylesheet";
    link.href = siteHref("css/shared-sidebar.css");
    document.head.appendChild(link);
  }

  function render(root) {
    root = root || document;
    var inner = root.querySelector(".sidebar .sidebar-inner");
    if (!inner || inner.getAttribute("data-shared-sidebar") === "ready") return false;

    var active = activeSection();
    var mainReturn = isOutsideMainSite();
    var allWorks = siteHref(mainReturn ? "index.html?from=project#all-works" : "index.html#all-works");
    var returnAttrs = mainReturn ? " data-main-return" : "";

    inner.innerHTML =
      '<a class="brand px-4 pt-5 pb-4" href="' + allWorks + '" data-preserve-preferences' + returnAttrs + '>' +
        '<span class="brand-logo">TJM</span><strong>天将明</strong><small>視覺設計 × AI 應用</small>' +
      '</a>' +
      '<nav class="sidebar-menu-holder flex-grow-1 px-4" aria-label="主导航">' +
        '<p class="nav-group">作品 <span>WORK</span></p>' +
        '<a class="' + linkClass("all-works", active) + '" href="' + allWorks + '" data-preserve-preferences' + returnAttrs + '>所有作品 <small>ALL WORKS</small></a>' +
        '<a class="' + linkClass("applied", active) + '" data-site-key="applied" href="' + siteHref("CommercialProjects.html") + '" data-preserve-preferences>商業項目 <small>COMMERCIAL PROJECTS</small></a>' +
        '<p class="nav-group mt-4">集合 <span>COLLECTIONS</span></p>' +
        '<a class="' + linkClass("annual", active) + '" data-site-key="annual" href="' + siteHref("collections.html") + '" data-preserve-preferences>年度作品集 <small>PORTFOLIOS</small></a>' +
        '<a class="' + linkClass("gallery", active) + '" data-gallery-nav href="' + siteHref("gallery.html") + '" data-preserve-preferences>画廊 <small>GALLERY</small></a>' +
        '<a class="' + linkClass("videos", active) + '" data-site-key="videos" href="' + siteHref("video.html") + '" data-preserve-preferences><span data-i18n data-i18n-hans="AI视频" data-i18n-ja="AI视频" data-i18n-en="AI Video">AI视频</span> <small>VIDEO ARCHIVE</small></a>' +
        '<a class="' + linkClass("workflow", active) + '" data-site-key="workflow" href="' + siteHref("workflow.html") + '" data-preserve-preferences><span data-i18n data-i18n-hans="工作流优化" data-i18n-ja="工作流優化" data-i18n-en="Workflow Optimization">工作流优化</span> <small>WORKFLOW</small></a>' +
        '<p class="nav-group mt-4">信息 <span>INFO</span></p>' +
        '<a class="' + linkClass("about", active) + '" href="' + siteHref("text.html") + '" data-preserve-preferences>關於我 <small>ABOUT</small></a>' +
      '</nav>' +
      '<div class="px-4 py-4 sidebar-note">VISUAL COMMUNICATION<br>ARTIFICIAL INTELLIGENCE</div>';

    inner.setAttribute("data-shared-sidebar", "ready");
    installStyle();
    document.dispatchEvent(new CustomEvent("tjm:sidebar-rendered", { detail: { active: active } }));
    return true;
  }

  window.TJMSharedSidebar = {
    render: render,
    siteRoot: siteRoot.href,
    version: "2026-09-09"
  };

  installStyle();
  if (!render() && document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { render(); }, { once: true });
  }
}());
