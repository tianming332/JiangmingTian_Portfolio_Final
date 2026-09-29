/* TJM motion system. Original implementation; no runtime/CDN dependencies. */
(function () {
  "use strict";
  if (window.TJMMotion) return;
  var preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover:hover) and (pointer:fine)");
  var revealObserver, mutationFrame, scrollFrame;
  var revealed = new WeakSet();
  var eased = "cubic-bezier(.16,1,.3,1)";
  function list(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function localized(hans, ja, en) {
    var language = document.body.dataset.language || "zh-hans";
    return language === "en" ? en : (language === "ja" ? ja : hans);
  }
  function animate(node, frames, options) {
    if (!preference.matches && node && node.animate) return node.animate(frames, options);
  }
  function label(node, hans, ja, en) {
    node.setAttribute("aria-label", localized(hans, ja, en));
    node.title = localized(hans, ja, en);
  }
  function setupReveal() {
    if (!preference.matches && "IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("tjm-in-view");
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin:"0px 0px -24px 0px", threshold:0 });
    }
    refresh();
    document.documentElement.classList.add("tjm-motion-ready");
    // Late content is enhanced without replaying existing content.
    var observer = new MutationObserver(function (records) {
      if (!records.some(function (record) { return record.addedNodes.length; })) return;
      cancelAnimationFrame(mutationFrame);
      mutationFrame = requestAnimationFrame(refresh);
    });
    var main = document.querySelector(".page-holder");
    if (main) observer.observe(main, { childList:true, subtree:true });
  }
  function refresh() {
    list(".filter-panel,.project-card-wrap,.project-return,.project-heading,.project-keyvisual,.project-overview>*," +
      ".compact-index-head,.compact-preview-card,.compact-chapter-head>*,.gallery-item,.project-next>a," +
      ".page-hero>*,.gallery-intro>*,.profile-columns>article,.detail-taxonomy").forEach(function (node, index) {
      if (revealed.has(node)) return;
      revealed.add(node);
      node.classList.add("tjm-reveal");
      node.style.setProperty("--tjm-delay", Math.min(index % 3, 2) * 65 + "ms");
      if (revealObserver) revealObserver.observe(node);
      else node.classList.add("tjm-in-view");
    });
    list(".project-card").forEach(function (card) {
      var media = card.querySelector(".project-media");
      if (media && !media.querySelector(".project-open-mark")) {
        var mark = document.createElement("span");
        mark.className = "project-open-mark"; mark.setAttribute("aria-hidden", "true"); mark.textContent = "↗";
        media.appendChild(mark);
      }
    });
    list(".project-media,.project-keyvisual,.gallery-item button,.compact-preview-card").forEach(function (surface) {
      if (surface.classList.contains("tjm-motion-surface")) return;
      surface.classList.add("tjm-motion-surface");
      var pending = 0, x = 0, y = 0;
      surface.addEventListener("pointermove", function (event) {
        if (preference.matches || !finePointer.matches) return;
        x = event.clientX; y = event.clientY;
        if (pending) return;
        pending = requestAnimationFrame(function () {
          pending = 0;
          var rect = surface.getBoundingClientRect();
          surface.style.setProperty("--tjm-pointer-x", x - rect.left + "px");
          surface.style.setProperty("--tjm-pointer-y", y - rect.top + "px");
        });
      }, { passive:true });
    });
    list(".gallery-item button[data-lightbox]").forEach(function (button) {
      if (button.querySelector(".tjm-view-hint")) return;
      var hint = document.createElement("span");
      hint.className = "tjm-view-hint"; hint.setAttribute("aria-hidden", "true"); hint.textContent = "+";
      button.appendChild(hint);
    });
  }
  function setupTitles() {
    function enter() {
      list(".page-hero h1,.gallery-intro h1,.project-heading h1,.about-profile-copy h1").forEach(function (heading) {
        // Never split or replace translated text nodes.
        heading.classList.remove("tjm-title-enter");
        if (!preference.matches) requestAnimationFrame(function () { heading.classList.add("tjm-title-enter"); });
      });
    }
    enter(); document.addEventListener("tjm:languagechange", enter); document.addEventListener("tjm:welcomeclosed", enter);
  }
  function setupFeedback() {
    document.addEventListener("click", function (event) {
      var button = event.target.closest(".filter-chip,.welcome-random,.welcome-confirm");
      if (!button) return;
      animate(button, [{ scale:".94" }, { scale:"1.025", offset:.6 }, { scale:"1" }], { duration:340, easing:eased });
    });
    document.addEventListener("tjm:filterchange", function () {
      animate(document.getElementById("resultCount"), [{ opacity:.35, transform:"translateY(5px)" }, { opacity:1, transform:"none" }], { duration:280, easing:eased });
      refresh();
    });
  }
  function setupReader() {
    var main = document.querySelector("main.page-holder");
    if (!main) return;
    if (!main.id) main.id = "main-content";
    main.setAttribute("tabindex", "-1");
    var skip = document.createElement("a"); skip.className = "tjm-skip"; skip.href = "#" + main.id;
    document.body.prepend(skip);
    skip.addEventListener("click", function (event) {
      if (!document.body.classList.contains("welcome-open")) return;
      var direct = document.querySelector('.welcome-sitebar a[href$="#all-works"]');
      if (direct) { event.preventDefault(); direct.click(); }
    });
    var back = document.createElement("button"); back.type = "button"; back.className = "tjm-back-top";
    back.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17"/></svg><span aria-hidden="true">↑</span>';
    document.body.appendChild(back);
    function labels() {
      label(back, "返回顶部", "ページの先頭へ", "Back to top");
      skip.textContent = localized("跳到内容", "コンテンツへ", "Skip to content");
    }
    labels(); document.addEventListener("tjm:languagechange", labels);
    back.addEventListener("click", function () {
      window.scrollTo({ top:0, behavior:preference.matches ? "instant" : "smooth" }); main.focus({ preventScroll:true });
    });
    function update() {
      scrollFrame = 0;
      var max = document.documentElement.scrollHeight - innerHeight;
      back.style.setProperty("--read-progress", Math.max(0, Math.min(1, max > 0 ? scrollY / max : 0)));
      back.classList.toggle("is-visible", scrollY > innerHeight * .6);
    }
    addEventListener("scroll", function () { if (!scrollFrame) scrollFrame = requestAnimationFrame(update); }, { passive:true });
    addEventListener("resize", update, { passive:true }); update();
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { entry.target.classList.toggle("tjm-section-current", entry.isIntersecting); });
      }, { rootMargin:"-20% 0px -55% 0px", threshold:0 });
      list("[data-project-section]").forEach(function (node) { observer.observe(node); });
    }
  }
  function setupLightbox() {
    var dialog = document.getElementById("lightbox"), image = document.getElementById("lightboxImage");
    if (!dialog || !image || typeof dialog.showModal !== "function") return;
    dialog.classList.add("tjm-lightbox"); dialog.setAttribute("aria-modal", "true");
    var items = [], index = 0, trigger;
    var toolbar = document.createElement("div"); toolbar.className = "tjm-lightbox-toolbar";
    toolbar.innerHTML = '<button type="button" data-viewer-action="previous">←</button><span class="tjm-lightbox-count" aria-live="polite"></span><button type="button" data-viewer-action="next">→</button><button type="button" data-viewer-action="zoom" aria-pressed="false">+</button>';
    var caption = document.createElement("p"); caption.className = "tjm-lightbox-caption";
    var failure = document.createElement("p"); failure.className = "tjm-image-error"; failure.hidden = true; failure.setAttribute("role", "status");
    dialog.append(caption, toolbar, failure);
    var count = toolbar.querySelector(".tjm-lightbox-count"), zoom = toolbar.querySelector('[data-viewer-action="zoom"]');
    function labels() {
      label(dialog, "作品图片查看器", "作品画像ビューア", "Project image viewer");
      label(toolbar.querySelector('[data-viewer-action="previous"]'), "上一张图片", "前の画像", "Previous image");
      label(toolbar.querySelector('[data-viewer-action="next"]'), "下一张图片", "次の画像", "Next image");
      label(zoom, "切换原图缩放", "画像の拡大を切り替え", "Toggle image zoom");
      failure.textContent = localized("图片暂时无法加载，请尝试下一张。", "画像を読み込めません。次の画像をお試しください。", "This image could not load. Try the next image.");
    }
    labels(); document.addEventListener("tjm:languagechange", labels);
    function toggleZoom() {
      var enlarged = dialog.classList.toggle("is-zoomed"); zoom.setAttribute("aria-pressed", String(enlarged)); zoom.textContent = enlarged ? "−" : "+"; dialog.scrollTop = 0; dialog.scrollLeft = 0;
    }
    function show(next) {
      if (!items.length) return;
      index = (next + items.length) % items.length;
      var item = items[index], preview = item.querySelector("img");
      dialog.classList.remove("is-zoomed"); zoom.setAttribute("aria-pressed", "false"); zoom.textContent = "+"; failure.hidden = true;
      image.src = item.dataset.lightbox || item.getAttribute("href"); image.alt = preview ? preview.alt : "";
      caption.textContent = image.alt; count.textContent = String(index + 1).padStart(2, "0") + " / " + String(items.length).padStart(2, "0"); dialog.scrollTop = 0; dialog.scrollLeft = 0;
      animate(image, [{ opacity:.25, transform:"translateY(8px) scale(.99)" }, { opacity:1, transform:"none" }], { duration:300, easing:eased });
    }
    // Capture prevents double-opening by legacy project-specific handlers.
    document.addEventListener("click", function (event) {
      var button = event.target.closest("[data-lightbox],a.yanshi-lightbox");
      if (!button || dialog.contains(button)) return;
      event.preventDefault(); event.stopImmediatePropagation(); items = list("[data-lightbox],a.yanshi-lightbox"); trigger = button;
      show(items.indexOf(button)); document.body.classList.add("tjm-modal-open"); dialog.showModal();
    }, true);
    toolbar.addEventListener("click", function (event) {
      var action = event.target.closest("[data-viewer-action]"); if (!action) return;
      if (action.dataset.viewerAction === "zoom") toggleZoom(); else show(index + (action.dataset.viewerAction === "next" ? 1 : -1));
    });
    image.addEventListener("click", toggleZoom);
    image.addEventListener("error", function () { if (dialog.open) failure.hidden = false; });
    image.addEventListener("load", function () { failure.hidden = true; });
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); show(index + (event.key === "ArrowRight" ? 1 : -1)); }
      if (event.key === "+" || event.key === "=" || event.key === "-") { event.preventDefault(); toggleZoom(); }
    });
    dialog.addEventListener("close", function () {
      document.body.classList.remove("tjm-modal-open"); dialog.classList.remove("is-zoomed");
      if (trigger && trigger.isConnected) trigger.focus({ preventScroll:true });
    });
  }
  function init() {
    setupReveal(); setupTitles(); setupFeedback(); setupReader(); setupLightbox();
    preference.addEventListener("change", function () {
      if (!preference.matches) return;
      if (revealObserver) { revealObserver.disconnect(); revealObserver = null; }
      list(".tjm-reveal").forEach(function (node) { node.classList.add("tjm-in-view"); });
      // Cancel only this layer's finite animations; never touch project videos/canvases.
      list(".tjm-reveal,.tjm-title-enter,.filter-chip,#lightboxImage").forEach(function (node) { node.getAnimations().forEach(function (animation) { animation.cancel(); }); });
    });
  }
  window.TJMMotion = { version:"2026-09-29", refresh:refresh };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true }); else init();
}());
