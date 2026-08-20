(function () {
  "use strict";

  var works = window.WORKS || [];
  var definitions = [
    { key: "graphic", hans: "平面", hant: "平面", en: "GRAPHIC", x: .22, y: .60 },
    { key: "uiux", hans: "界面体验", hant: "界面體驗", en: "UI / UX", x: .28, y: .32 },
    { key: "interaction", hans: "交互", hant: "交互", en: "INTERACTION", x: .39, y: .25 },
    { key: "editorial", hans: "书籍版式", hant: "書籍版式", en: "EDITORIAL", x: .50, y: .15 },
    { key: "information", hans: "信息可视化", hant: "信息可視化", en: "INFORMATION", x: .70, y: .24 },
    { key: "ai", hans: "人工智能", hant: "人工智能", en: "AI", x: .79, y: .40 },
    { key: "ip", hans: "IP 形象", hant: "IP 形象", en: "CHARACTER", x: .91, y: .45 },
    { key: "applied", hans: "落地项目", hant: "落地項目", en: "IMPLEMENTED", x: .84, y: .63 },
    { key: "installation", hans: "装置", hant: "裝置", en: "INSTALLATION", x: .66, y: .78 },
    { key: "visual", hans: "视觉", hant: "視覺", en: "VISUAL", x: .47, y: .73 },
    { key: "ai-image", hans: "AI 图像", hant: "AI 圖像", en: "GENERATIVE", x: .28, y: .81 },
    { key: "album", hans: "画册", hant: "畫冊", en: "ALBUM", x: .57, y: .33 },
    { key: "graphic-design", hans: "图形设计", hant: "圖形設計", en: "GRAPHIC DESIGN", x: .38, y: .49 },
    { key: "photography", hans: "摄影", hant: "攝影", en: "PHOTOGRAPHY", x: .57, y: .57 },
    { key: "ai-animation", hans: "AI 动画", hant: "AI 動畫", en: "AI MOTION", x: .72, y: .70 },
    { key: "motion", hans: "动效", hant: "動效", en: "MOTION", x: .87, y: .80 },
    { key: "vector", hans: "矢量", hant: "矢量", en: "VECTOR", x: .18, y: .75 },
    { key: "experience", hans: "体验设计", hant: "體驗設計", en: "EXPERIENCE", x: .61, y: .86 }
  ];
  var selected = [], nodes = [];
  var canvas, context, area, frame, lastTime = 0, entering = false;
  var reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function currentLanguage() { return window.tjmLanguage ? window.tjmLanguage.current() : "zh-hans"; }
  function ensureDefinitionCoverage() {
    var used = [];
    works.forEach(function (item) {
      (item.directions || []).concat(item.types || []).forEach(function (key) { if (used.indexOf(key) === -1) used.push(key); });
    });
    used.forEach(function (key) {
      if (definitions.some(function (item) { return item.key === key; })) return;
      var group = (window.PORTFOLIO_META && window.PORTFOLIO_META.directions && window.PORTFOLIO_META.directions[key]) ? "directions" : "types";
      var translations = window.PORTFOLIO_TRANSLATIONS && window.PORTFOLIO_TRANSLATIONS[group] && window.PORTFOLIO_TRANSLATIONS[group][key];
      var base = window.PORTFOLIO_META && window.PORTFOLIO_META[group] && window.PORTFOLIO_META[group][key] || key;
      var index = definitions.length, angle = index * 2.399963;
      definitions.push({
        key: key,
        hans: translations && translations["zh-hans"] || base,
        hant: translations && translations["zh-hant"] || base,
        en: translations && translations.en || String(key).toUpperCase(),
        x: .5 + Math.cos(angle) * .38,
        y: .52 + Math.sin(angle) * .34
      });
    });
  }
  function definitionLabel(definition) { var language = currentLanguage(); return language === "en" ? definition.en : (language === "zh-hant" ? definition.hant : definition.hans); }
  function enteringText() { var language = currentLanguage(); return language === "en" ? "Selection complete. Entering…" : (language === "zh-hant" ? "選擇完成，正在進入" : "选择完成，正在进入"); }

  function expandedKeys(item) {
    var keys = (item.directions || []).concat(item.types || []);
    var text = (item.tags || []).join(" ") + " " + (item.title || "");
    function add(key, condition) { if (condition && keys.indexOf(key) === -1) keys.push(key); }
    add("album", keys.indexOf("editorial") !== -1 || /書籍|书籍|版式|畫冊|画册/.test(text));
    add("graphic-design", keys.indexOf("graphic") !== -1 || keys.indexOf("information") !== -1 || keys.indexOf("ip") !== -1);
    add("photography", /攝影|摄影|寫真|写真/.test(text));
    add("ai-animation", keys.indexOf("ai-video") !== -1 || keys.indexOf("ai") !== -1);
    add("motion", keys.indexOf("ai-video") !== -1 || keys.indexOf("interaction") !== -1);
    add("vector", keys.indexOf("graphic") !== -1 || keys.indexOf("information") !== -1 || keys.indexOf("ip") !== -1);
    add("experience", keys.indexOf("uiux") !== -1 || keys.indexOf("interaction") !== -1 || keys.indexOf("installation") !== -1);
    return keys;
  }

  function connected(a, b) {
    return works.some(function (item) { var keys = expandedKeys(item); return keys.indexOf(a) !== -1 && keys.indexOf(b) !== -1; });
  }

  function updateSelected() {
    nodes.forEach(function (node) {
      var active = selected.indexOf(node.key) !== -1;
      node.fixed = active;
      node.element.classList.toggle("active", active);
      node.element.setAttribute("aria-pressed", active ? "true" : "false");
    });
    var output = document.getElementById("welcomeSelected");
    var language = currentLanguage();
    output.textContent = selected.length ? selected.map(function (key) {
      return definitionLabel(definitions.find(function (item) { return item.key === key; }));
    }).join(" × ") + " (" + selected.length + "/3)" : (language === "en" ? "Select 3 tags (0/3)" : (language === "zh-hant" ? "請選擇 3 個標籤（0/3）" : "请选择 3 个标签（0/3）"));
    document.getElementById("welcomeConfirm").classList.toggle("ready", selected.length === 3);
  }

  function toggle(key) {
    if (entering) return;
    var index = selected.indexOf(key);
    if (index !== -1) selected.splice(index, 1);
    else if (selected.length < 3) selected.push(key);
    updateSelected();
    if (selected.length === 3) {
      entering = true;
      document.getElementById("welcomeConfirm").querySelector("span").textContent = enteringText();
      setTimeout(confirmSelection, 720);
    }
  }

  function resizeCanvas() {
    var dpr = Math.min(devicePixelRatio || 1, 2), rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function updateMotion(delta) {
    var rect = area.getBoundingClientRect();
    nodes.forEach(function (node) {
      if (node.fixed || reducedMotion) return;
      node.x += node.vx * delta; node.y += node.vy * delta;
      var box = node.element.getBoundingClientRect();
      var halfX = box.width / rect.width / 2 + .006, halfY = box.height / rect.height / 2 + .008;
      if (node.x < halfX) { node.x = halfX; node.vx = Math.abs(node.vx); }
      if (node.x > 1 - halfX) { node.x = 1 - halfX; node.vx = -Math.abs(node.vx); }
      if (node.y < halfY) { node.y = halfY; node.vy = Math.abs(node.vy); }
      if (node.y > 1 - halfY) { node.y = 1 - halfY; node.vy = -Math.abs(node.vy); }
      // 標題區保留為不可進入區，避免浮動詞與大標題重疊。
      if (node.x < .24 && node.y < .48) { node.x = .25; node.vx = Math.abs(node.vx); }
      node.element.style.left = (node.x * 100) + "%"; node.element.style.top = (node.y * 100) + "%";
    });
  }

  function drawLines() {
    var rect = canvas.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);
    for (var i = 0; i < nodes.length; i += 1) for (var j = i + 1; j < nodes.length; j += 1) {
      if (!connected(nodes[i].key, nodes[j].key)) continue;
      var a = nodes[i].element.getBoundingClientRect(), b = nodes[j].element.getBoundingClientRect();
      var active = selected.indexOf(nodes[i].key) !== -1 || selected.indexOf(nodes[j].key) !== -1;
      context.beginPath();
      context.moveTo(a.left + a.width / 2 - rect.left, a.top + a.height / 2 - rect.top);
      context.lineTo(b.left + b.width / 2 - rect.left, b.top + b.height / 2 - rect.top);
      context.strokeStyle = active ? "rgba(49,87,255,.82)" : (document.body.dataset.theme === "black" ? "rgba(240,240,237,.2)" : "rgba(17,17,18,.18)");
      context.lineWidth = active ? 1.8 : 1; context.stroke();
    }
  }

  function animate(time) {
    var delta = Math.min(32, time - (lastTime || time)); lastTime = time;
    updateMotion(delta); drawLines(); frame = requestAnimationFrame(animate);
  }

  function build() {
    ensureDefinitionCoverage();
    canvas = document.getElementById("welcomeLines");
    context = canvas.getContext("2d"); area = document.getElementById("welcomeNodeArea"); resizeCanvas();
    nodes = definitions.map(function (definition, index) {
      var button = document.createElement("button");
      button.type = "button"; button.className = "welcome-node";
      button.style.left = (definition.x * 100) + "%"; button.style.top = (definition.y * 100) + "%";
      button.innerHTML = '<strong data-i18n data-i18n-hans="' + definition.hans + '" data-i18n-hant="' + definition.hant + '" data-i18n-en="' + definition.en + '">' + definition.hans + '</strong><small>' + definition.en + '</small>';
      button.setAttribute("aria-pressed", "false");
      var speed = .000003 + index % 5 * .00000045, angle = .55 + index * 1.71;
      var node = { key: definition.key, element: button, x: definition.x, y: definition.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, fixed: false };
      button.addEventListener("click", function () { toggle(definition.key); }); area.appendChild(button); return node;
    });
    updateSelected(); frame = requestAnimationFrame(animate); addEventListener("resize", resizeCanvas);
  }

  function randomize() {
    if (entering) return;
    selected = [];
    definitions.slice().sort(function () { return Math.random() - .5; }).slice(0, 3).forEach(function (item) { selected.push(item.key); });
    updateSelected(); entering = true;
    document.getElementById("welcomeConfirm").querySelector("span").textContent = enteringText();
    // 隨機按鈕只隨機標籤，唯一目的地始終是首頁作品列表。
    setTimeout(confirmSelection, 720);
  }

  function enterAllWorks() {
    var welcome = document.getElementById("welcomeNetwork");
    welcome.classList.add("leaving"); document.body.classList.remove("welcome-open");
    history.replaceState(null, "", "index.html#all-works");
    setTimeout(function () {
      welcome.hidden = true; cancelAnimationFrame(frame);
      document.getElementById("all-works").scrollIntoView({ behavior: "auto" });
    }, 560);
  }

  function confirmSelection() {
    if (window.portfolioFilter) window.portfolioFilter.applyTags(selected.slice());
    enterAllWorks();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var welcome = document.getElementById("welcomeNetwork");
    var skipOnce = false;
    try { skipOnce = sessionStorage.getItem("tjm-skip-welcome-once") === "1"; sessionStorage.removeItem("tjm-skip-welcome-once"); } catch (error) { skipOnce = false; }
    var fromProject = new URLSearchParams(location.search).get("from") === "project";
    var navigation = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
    var isReload = navigation && navigation.type === "reload";
    // 只有站內「返回所有作品」可跳過一次；刷新或重新開啟首頁始終顯示歡迎頁。
    var skipWelcome = fromProject || (skipOnce && !isReload);
    if (skipWelcome) {
      welcome.hidden = true; document.body.classList.remove("welcome-open");
      if (fromProject && history.replaceState) { try { history.replaceState(null, "", location.pathname + (location.hash || "#all-works")); } catch (error) { /* file preview may block URL cleanup */ } }
      return;
    }
    build();
    document.getElementById("welcomeRandom").addEventListener("click", randomize);
    document.getElementById("welcomeConfirm").addEventListener("click", confirmSelection);
    var worksLink = document.querySelector('.welcome-sitebar a[href$="#all-works"]');
    if (worksLink) worksLink.addEventListener("click", function (event) { event.preventDefault(); enterAllWorks(); });
  });
  document.addEventListener("tjm:languagechange", function () { if (nodes.length) updateSelected(); });
}());
