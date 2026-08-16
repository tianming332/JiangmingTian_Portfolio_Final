(function () {
  "use strict";

  var stage = document.getElementById("galleryStage");
  var filters = document.querySelector(".gallery-filter-list");
  var scaleText = document.getElementById("galleryScale");
  var viewer = document.getElementById("galleryViewer");
  var viewerImage = document.getElementById("viewerImage");
  var viewerCaption = document.getElementById("viewerCaption");
  var viewerCanvas = document.getElementById("viewerCanvas");
  var closeViewer = document.getElementById("viewerClose");
  var scale = 1;
  var activeTag = "all";
  var dragging = null;
  var tagNames = window.GALLERY_TAGS || {};
  var hansMap = { "觸":"触", "視":"视", "圖":"图", "與":"与", "網":"网", "絡":"络", "邊":"边", "裡":"里", "個":"个", "檔":"档", "轉":"转", "譯":"译", "為":"为", "幾":"几", "線":"线", "並":"并", "關":"关", "節":"节", "點":"点", "記":"记", "錄":"录", "讓":"让", "進":"进", "將":"将", "寫":"写", "畫":"画", "攝":"摄", "體":"体", "動":"动", "資":"资", "訊":"讯", "設":"设", "計":"计", "構":"构", "見":"见", "實":"实", "驗":"验", "顏":"颜", "達":"达", "靜":"静", "從":"从", "開":"开", "過":"过", "種":"种", "廣":"广", "場":"场", "對":"对", "應":"应", "來":"来", "無":"无", "夢":"梦", "隕":"陨", "礦":"矿", "態":"态", "還":"还", "號":"号", "標":"标", "籤":"签", "載":"载", "齊":"齐", "這":"这", "張":"张", "選":"选", "擇":"择", "優":"优", "滿":"满", "續":"续" };

  function toHans(value) {
    return String(value == null ? "" : value).split("").map(function (char) { return hansMap[char] || char; }).join("");
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char];
    });
  }
  function list(value) { return Array.isArray(value) ? value : []; }
  function tagName(tag) { return toHans(tagNames[tag] || tag); }
  function fallbackItems() {
    return (window.WORKS || []).filter(function (item) { return item && item.cover; }).map(function (item, index) {
      return { id: item.id, src: item.cover, title: item.title || "未命名影像", titleEn: item.titleEn || "", tags: list(item.tags), description: item.summary || "作品集中的一段視覺記錄。", no: "G-" + String(index + 1).padStart(3, "0") };
    });
  }
  var items = (window.GALLERY_ITEMS || fallbackItems()).map(function (item, index) {
    return Object.assign({}, item, { title: toHans(item.title), description: toHans(item.description), no: item.no || "G-" + String(index + 1).padStart(3, "0"), tags: list(item.tags) });
  });
  var tagList = Array.from(new Set(items.reduce(function (all, item) { return all.concat(item.tags); }, [])));

  function refreshTagList() {
    tagList = Array.from(new Set(items.reduce(function (all, item) { return all.concat(item.tags); }, [])));
  }
  function imageExists(src) {
    return new Promise(function (resolve) {
      var image = new Image();
      image.onload = function () { resolve(true); };
      image.onerror = function () { resolve(false); };
      image.src = src + "?gallery-probe=" + Date.now();
    });
  }
  function highestKnownNumber() {
    return items.reduce(function (highest, item) {
      var match = String(item.id || item.no || "").match(/(\d{1,3})$/);
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
  }
  async function discoverSequentialImages() {
    var number = highestKnownNumber() + 1;
    var misses = 0;
    var added = false;
    while (number <= 999 && misses < 8) {
      var padded = String(number).padStart(3, "0");
      var src = "uploads/gallery/g-" + padded + ".webp";
      if (await imageExists(src)) {
        items.push({
          id: "g-" + padded,
          src: src,
          title: "画廊影像 " + padded,
          titleEn: "GALLERY IMAGE " + padded,
          tags: ["visual"],
          description: "按固定编号自动载入的画廊影像。",
          no: "G-" + padded
        });
        misses = 0;
        added = true;
      } else {
        misses += 1;
      }
      number += 1;
    }
    if (added) {
      refreshTagList();
      render();
    }
  }

  function currentItems() {
    return activeTag === "all" ? items : items.filter(function (item) { return item.tags.indexOf(activeTag) !== -1; });
  }
  function positionFor(index, total) {
    var lanes = 3;
    var row = Math.floor(index / lanes);
    var rowCount = Math.ceil(total / lanes);
    var lane = index % lanes;
    var progress = rowCount <= 1 ? .5 : row / (rowCount - 1);
    return {
      x: 8 + progress * 84 + Math.sin((index + 2) * 1.91) * 4,
      y: 26 + lane * 24 + Math.sin((index + 1) * 1.17) * 6,
      r: -9 + ((index * 17) % 19),
      z: index,
      size: 122 + ((index * 29) % 64),
      scatterX: ((index % 5) - 2) * 8,
      scatterY: ((Math.floor(index / 5) % 4) - 1.5) * 8,
      scatterR: ((index % 7) - 3) * 4
    };
  }
  function setScale(value) {
    scale = Math.max(.52, Math.min(1.45, value));
    stage.style.setProperty("--gallery-scale", scale.toFixed(2));
    scaleText.textContent = Math.round(scale * 100) + "%";
  }
  function renderFilters() {
    filters.innerHTML = ['<button data-gallery-tag="all">全部 <small>ALL</small></button>'].concat(tagList.map(function (tag) {
      return '<button data-gallery-tag="' + esc(tag) + '">' + esc(tagName(tag)) + '</button>';
    })).join("");
    filters.querySelectorAll("[data-gallery-tag]").forEach(function (button) {
      button.classList.toggle("active", button.dataset.galleryTag === activeTag);
      button.addEventListener("click", function () { activeTag = button.dataset.galleryTag; render(); });
    });
  }
  function openViewer(item) {
    viewerImage.src = item.src;
    viewerImage.alt = item.title;
    viewerImage.dataset.translate = "0";
    viewerImage.style.transform = "translateX(0px)";
    viewerCaption.textContent = item.no + " / " + item.title + (item.titleEn ? " · " + item.titleEn : "") + (item.description ? " — " + item.description : "");
    viewer.classList.add("open"); viewer.setAttribute("aria-hidden", "false"); document.body.classList.add("gallery-viewer-open");
  }
  function close() { viewer.classList.remove("open"); viewer.setAttribute("aria-hidden", "true"); document.body.classList.remove("gallery-viewer-open"); }
  function render() {
    var visible = currentItems();
    stage.innerHTML = visible.map(function (item, index) {
      var point = positionFor(index, visible.length);
      return '<button class="gallery-image-card" type="button" data-gallery-id="' + esc(item.id) + '" style="--x:' + point.x + '%;--y:' + point.y + '%;--r:' + point.r + 'deg;--w:' + point.size + 'px;--scatter-x:' + point.scatterX + '%;--scatter-y:' + point.scatterY + '%;--scatter-r:' + point.scatterR + 'deg;z-index:' + point.z + '">' +
        '<img src="' + esc(item.src) + '" alt="' + esc(item.title) + '" loading="lazy"><span class="gallery-image-info"><b>' + esc(item.no) + '</b><strong>' + esc(item.title) + '</strong><small>' + esc(item.titleEn) + '</small><em>' + item.tags.slice(0, 2).map(function (tag) { return esc(tagName(tag)); }).join(' · ') + '</em><p>' + esc(item.description || '') + '</p></span>' +
        '</button>';
    }).join("");
    stage.querySelectorAll("[data-gallery-id]").forEach(function (button) {
      button.addEventListener("click", function () { var item = items.find(function (candidate) { return candidate.id === button.dataset.galleryId; }); if (item) openViewer(item); });
      button.addEventListener("pointerenter", function () { selectCard(button); });
      button.addEventListener("pointerleave", clearSelection);
      button.addEventListener("focus", function () { selectCard(button); });
      button.addEventListener("blur", clearSelection);
    });
    renderFilters();
  }
  function selectCard(button) {
    stage.classList.add("has-gallery-selection");
    stage.querySelectorAll(".gallery-image-card").forEach(function (card) { card.classList.toggle("is-selected", card === button); });
  }
  function clearSelection() {
    stage.classList.remove("has-gallery-selection");
    stage.querySelectorAll(".gallery-image-card.is-selected").forEach(function (card) { card.classList.remove("is-selected"); });
  }
  stage.addEventListener("wheel", function (event) { event.preventDefault(); setScale(scale + (event.deltaY < 0 ? .08 : -.08)); }, { passive: false });
  stage.addEventListener("keydown", function (event) { if (event.key === "+" || event.key === "=") setScale(scale + .08); if (event.key === "-") setScale(scale - .08); });
  closeViewer.addEventListener("click", close);
  viewer.addEventListener("click", function (event) { if (event.target === viewer) close(); });
  document.addEventListener("keydown", function (event) { if (event.key === "Escape") close(); });
  viewerCanvas.addEventListener("pointerdown", function (event) { dragging = { x: event.clientX, translate: Number(viewerImage.dataset.translate || 0) }; viewerCanvas.setPointerCapture(event.pointerId); viewerCanvas.classList.add("dragging"); });
  viewerCanvas.addEventListener("pointermove", function (event) { if (!dragging) return; var next = Math.max(-360, Math.min(360, dragging.translate + event.clientX - dragging.x)); viewerImage.dataset.translate = next; viewerImage.style.transform = "translateX(" + next + "px)"; });
  function stopDrag() { dragging = null; viewerCanvas.classList.remove("dragging"); }
  viewerCanvas.addEventListener("pointerup", stopDrag); viewerCanvas.addEventListener("pointercancel", stopDrag);
  setScale(1);
  render();
  discoverSequentialImages();
}());
