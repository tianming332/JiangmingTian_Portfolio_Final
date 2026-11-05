(function () {
  "use strict";

  var COPY = {
    collectionCount:["11 个在线工具","11 個のオンラインツール","11 ONLINE TOOLS"],
    heroFirst:["把想法，","アイデアを、","Ideas into "],
    heroSecond:["变成工具。","使える道具に。","working tools."],
    heroLead:["从字体、图形到照片与简历，让创作的下一步，更近一点。","文字、図形、写真、履歴書。つくる、その次の一歩をもっと身近に。","Type, graphics, photographs and resumes. A little closer to your next creation."],
    fan:["卡片展台","カード展示","Card showcase"],
    icons:["图标陈列","アイコン展示","Icon collection"],
    preview:["界面预览","画面を見る","Preview"],
    open:["打开应用","アプリを開く","Open app"],
    catalog:["我的工具架","つくるための道具","The tool shelf"],
    catalogLead:["设计出发，代码实现。每一个都可以打开试用。","デザインから始め、コードで形に。気になるツールを試してみてください。","Design-led. Built with code. Ready to explore."],
    all:["全部","すべて","All"],
    design:["图像与图形","画像・図形","Image & design"],
    type:["字体与排版","文字・組版","Type & layout"],
    media:["影像","写真・動画","Photo & video"],
    office:["办公","オフィス","Office"],
    empty:["没有找到这个工具","ツールが見つかりません","No tools found"],
    emptyHelp:["换一个关键词，或看看全部应用。","キーワードを変えるか、すべてのツールを表示してください。","Try another keyword, or browse the full collection."],
    reset:["查看全部","すべて表示","Show all tools"],
    accessNote:["部分国际版应用在中国大陆需代理访问；AI 功能以应用内实际开放状态为准。","中国本土では一部のアプリに VPN が必要です。AI 機能の提供状況は各アプリでご確認ください。","Some international apps require a VPN in mainland China. AI availability is shown inside each app."],
    footer:["独立构建 · 持续探索","独自につくる · 探求を続ける","Independently built · Always exploring"],
    realScreen:["实际界面 / SCREEN PREVIEW","実際の画面 / SCREEN PREVIEW","ACTUAL INTERFACE / SCREEN PREVIEW"],
    prototype:["本页部分图标为功能示意，并非正式品牌 Logo。","一部のアイコンは機能のイメージで、正式なブランドロゴではありません。","Some icons illustrate functionality and are not official brand logos."],
    imageError:["图片暂时无法载入，请打开应用查看。","画像を読み込めません。アプリを開いてご確認ください。","The screenshot could not load. Open the app to take a look."],
    search:["找一个工具…","ツールを探す…","Find a tool…"],
    searchLabel:["搜索工具","ツールを検索","Search tools"],
    previous:["上一个应用","前のアプリ","Previous app"],
    next:["下一个应用","次のアプリ","Next app"],
    close:["关闭界面预览","プレビューを閉じる","Close preview"],
    stageLabel:["精选应用展台","注目のアプリ","Featured apps"],
    viewLabel:["展示方式","展示スタイル","Showcase style"],
    filterLabel:["应用分类","ツールのカテゴリー","Tool categories"],
    count:["个工具","個のツール","tools"],
    countOf:["/ 共","/ 全","/ of"]
  };
  var apps = window.TJM_VIBE_APPS;
  var featured = window.TJM_VIBE_FEATURED;
  var byId = new Map(apps.map(function (app) { return [app.id, app]; }));
  var state = { selected:"font", view:"fan", filter:"all", query:"", preview:null };
  var dialog, lastFocus;

  function langIndex() {
    var language = document.body.dataset.language || new URLSearchParams(location.search).get("lang") || "zh-hans";
    return language === "ja" ? 1 : language === "en" ? 2 : 0;
  }
  function choose(words) { return words[langIndex()] || words[0]; }
  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function attrs(words) {
    return 'data-i18n data-i18n-hans="' + esc(words[0]) + '" data-i18n-ja="' + esc(words[1]) + '" data-i18n-en="' + esc(words[2]) + '"';
  }
  function translated(words, tag, className) {
    return "<" + (tag || "span") + (className ? ' class="' + className + '"' : "") + " " + attrs(words) + ">" + esc(choose(words)) + "</" + (tag || "span") + ">";
  }
  function setText(node, words) {
    if (!node) return;
    node.setAttribute("data-i18n", "");
    node.setAttribute("data-i18n-hans", words[0]);
    node.setAttribute("data-i18n-ja", words[1]);
    node.setAttribute("data-i18n-en", words[2]);
    node.textContent = choose(words);
  }
  function icon(app) {
    var symbol = ["book", "video", "resume"].indexOf(app.icon) !== -1;
    if (symbol) {
      return '<span class="lab-icon lab-icon--symbol lab-icon--' + app.icon + '" aria-hidden="true"><span class="lab-symbol-' + app.icon + '"></span></span>';
    }
    return '<span class="lab-icon' + (app.icon === "ai" ? ' lab-icon--ai' : '') + '" aria-hidden="true"><img src="uploads/vibe-coding/icons/' + app.icon + (app.icon === "ai" ? '.png' : '.webp') + '" alt="" width="512" height="512" draggable="false"></span>';
  }
  function previewLabel(app) { return choose(app.name) + " · " + choose(COPY.preview); }
  function appLabel(app) { return choose(app.name) + " · " + choose(COPY.open); }
  function safeURL(app) {
    var url = new URL(app.url);
    if (url.protocol !== "https:") throw new Error("App destinations must use HTTPS.");
    return url.href;
  }

  function renderFan() {
    document.getElementById("lab-fan").innerHTML = featured.map(function (id) {
      var app = byId.get(id);
      return '<button type="button" class="lab-fan-card" data-select="' + id + '" style="--tone:' + app.tone + '" aria-pressed="false" aria-label="' + esc(choose(app.name)) + '">' +
        '<span class="lab-fan-label">' + translated(app.name, "strong") + '<span class="lab-tiny-arrow" aria-hidden="true">↗</span></span>' +
        icon(app) + '<span class="lab-fan-footer"><span>' + app.english + '</span><span>TJM</span></span></button>';
    }).join("");
  }
  function renderIconField() {
    // Depth is compositional, not a product ranking. All eleven tools remain in the catalogue.
    var rows = [
      { depth:"back", ids:["book-cn","image"] },
      { depth:"middle", ids:["video","book-ai","studio-open","studio"] },
      { depth:"front", ids:["layout","construct","font","photo","resume"] }
    ];
    document.getElementById("lab-icon-field").innerHTML = rows.map(function (row) {
      return '<div class="lab-icon-row lab-icon-row--' + row.depth + '">' + row.ids.map(function (id, i) {
        var app = byId.get(id);
        return '<button type="button" class="lab-icon-tile" data-select="' + id + '" style="--tile-rotate:' + ((i % 3 - 1) * 5) + 'deg" aria-pressed="false" aria-label="' + esc(choose(app.name)) + '">' +
          icon(app) + '<span class="lab-icon-reflection" aria-hidden="true">' + icon(app) + '</span>' +
          translated(app.name, "span", "lab-tile-label") + '</button>';
      }).join("") + '</div>';
    }).join("");
  }

  function updateSpotlight() {
    var app = byId.get(state.selected);
    var pool = state.view === "fan" ? featured : apps.map(function (a) { return a.id; });
    var selectedIndex = pool.indexOf(app.id);
    document.getElementById("lab-selected-number").textContent = String(selectedIndex + 1).padStart(2,"0") + " / " + String(pool.length).padStart(2,"0");
    setText(document.getElementById("lab-selected-title"), app.name);
    setText(document.getElementById("lab-selected-line"), app.line);
    var open = document.getElementById("lab-open-selected");
    open.href = safeURL(app);
    open.setAttribute("aria-label", appLabel(app));
    document.getElementById("lab-preview-selected").setAttribute("aria-label", previewLabel(app));
    var center = featured.indexOf(app.id);
    document.querySelectorAll(".lab-fan-card").forEach(function (card) {
      var index = featured.indexOf(card.dataset.select);
      var slot = ((index - center + 7) % 5) - 2;
      var depth = Math.abs(slot);
      card.style.setProperty("--lab-slot", String(slot));
      card.style.setProperty("--lab-drop", (depth === 2 ? 41 : depth === 1 ? 17 : 0) + "px");
      card.style.setProperty("--lab-rotate", slot * 7 + "deg");
      card.style.setProperty("--lab-scale", String(1 - depth * 0.07));
      card.style.zIndex = String(5 - depth);
      card.setAttribute("aria-pressed", String(card.dataset.select === state.selected));
    });
    document.querySelectorAll(".lab-icon-tile").forEach(function (tile) {
      tile.setAttribute("aria-pressed", String(tile.dataset.select === state.selected));
    });
  }
  function select(id) {
    if (!byId.has(id)) return;
    state.selected = id;
    updateSpotlight();
  }
  function setView(view, remember) {
    state.view = view === "icons" ? "icons" : "fan";
    if (state.view === "fan" && featured.indexOf(state.selected) < 0) state.selected = "font";
    document.getElementById("lab-stage").dataset.view = state.view;
    document.getElementById("lab-fan").hidden = state.view !== "fan";
    document.getElementById("lab-icon-field").hidden = state.view !== "icons";
    document.querySelectorAll("button[data-view]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.view === state.view));
    });
    updateSpotlight();
    if (remember) {
      try { localStorage.setItem("tjm-vibe-view",state.view); } catch (_) { /* Storage is optional. */ }
      var url = new URL(location.href);
      url.searchParams.set("view",state.view);
      history.replaceState(null,"",url.pathname + url.search + url.hash);
    }
  }
  function step(delta) {
    var pool = state.view === "fan" ? featured : apps.map(function (a) { return a.id; });
    select(pool[(pool.indexOf(state.selected) + delta + pool.length) % pool.length]);
  }
  function renderCards() {
    document.getElementById("lab-tool-grid").innerHTML = apps.map(function (app) {
      return '<article class="lab-tool-card" data-app="' + app.id + '" style="--tone:' + app.tone + '">' +
        '<div class="lab-tool-card-top">' + icon(app) + '<a class="lab-tool-open" target="_blank" rel="noopener noreferrer" href="' + esc(safeURL(app)) + '" aria-label="' + esc(appLabel(app)) + '">↗</a></div>' +
        '<button type="button" class="lab-tool-title" data-preview="' + app.id + '" aria-label="' + esc(previewLabel(app)) + '">' + translated(app.name,"h3") + '<span class="lab-tool-english">' + app.english + '</span></button>' +
        translated(app.line,"p","lab-tool-description") +
        '<div class="lab-tool-card-bottom"><div class="lab-tool-tags">' + app.tags.map(function (tag) { return '<span>' + esc(tag) + '</span>'; }).join("") + '</div>' +
        '<button type="button" class="lab-tool-preview" data-preview="' + app.id + '" aria-label="' + esc(previewLabel(app)) + '">' + translated(COPY.preview) + '<span aria-hidden="true">＋</span></button></div></article>';
    }).join("");
    filterCards();
  }
  function searchable(app) {
    return [app.id, app.english, app.name.join(" "), app.line.join(" "), app.tags.join(" "), app.source.title,
      app.source.description].join(" ").normalize("NFKC").toLocaleLowerCase();
  }
  function filterCards() {
    var query = state.query.trim().normalize("NFKC").toLocaleLowerCase();
    var tokens = query.split(/\s+/).filter(Boolean);
    var count = 0;
    document.querySelectorAll(".lab-tool-card").forEach(function (card) {
      var app = byId.get(card.dataset.app);
      var show = (state.filter === "all" || state.filter === app.category) &&
        tokens.every(function (token) { return searchable(app).indexOf(token) !== -1; });
      card.hidden = !show;
      if (show) count++;
    });
    document.getElementById("lab-empty").hidden = count > 0;
    document.querySelectorAll("button[data-filter]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.filter === state.filter));
    });
    setText(document.getElementById("lab-result-count"), [
      count + " / " + apps.length + " 个工具",
      count + " / 全 " + apps.length + " ツール",
      count + " / " + apps.length + " tools"
    ]);
  }

  function populateDialog(app) {
    document.getElementById("lab-preview-icon").innerHTML = icon(app);
    setText(document.getElementById("lab-preview-title"), app.name);
    var original = app.source;
    setText(document.getElementById("lab-preview-description"), [original.i18n["zh-hans"].description,original.i18n.ja.description,original.i18n.en.description]);
    var img = document.getElementById("lab-preview-image");
    img.alt = choose(app.name) + " — " + choose(COPY.realScreen);
    if (img.getAttribute("src") !== app.screen) {
      img.hidden = false;
      document.getElementById("lab-preview-image-error").hidden = true;
      img.src = app.screen;
    }
    var open = document.getElementById("lab-preview-open");
    open.href = safeURL(app);
    open.setAttribute("aria-label", appLabel(app));
    document.getElementById("lab-prototype-note").hidden = !app.prototype;
  }
  function openPreview(id, trigger) {
    var app = byId.get(id);
    if (!app) return;
    state.preview = id;
    lastFocus = trigger || document.activeElement;
    populateDialog(app);
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open","");
    }
    document.body.classList.add("lab-dialog-open");
    document.getElementById("lab-preview-close").focus({preventScroll:true});
  }
  function restoreAfterDialog() {
    state.preview = null;
    document.body.classList.remove("lab-dialog-open");
    if (lastFocus && lastFocus.isConnected) lastFocus.focus({preventScroll:true});
  }
  function closePreview() {
    if (!dialog.open) return;
    if (typeof dialog.close === "function") dialog.close();
    else { dialog.removeAttribute("open"); restoreAfterDialog(); }
  }

  function updateCopy() {
    document.querySelectorAll("[data-copy]").forEach(function (node) {
      var words = COPY[node.dataset.copy];
      if (words) setText(node,words);
    });
    var search = document.getElementById("lab-search");
    search.placeholder = choose(COPY.search);
    search.setAttribute("aria-label",choose(COPY.searchLabel));
    [
      ["lab-prev","previous"], ["lab-next","next"], ["lab-preview-close","close"], ["lab-stage","stageLabel"]
    ].forEach(function (pair) { document.getElementById(pair[0]).setAttribute("aria-label",choose(COPY[pair[1]])); });
    document.querySelector(".lab-view-switch").setAttribute("aria-label",choose(COPY.viewLabel));
    document.querySelector(".lab-filters").setAttribute("aria-label",choose(COPY.filterLabel));
    document.querySelectorAll("[data-select]").forEach(function (node) {
      node.setAttribute("aria-label",choose(byId.get(node.dataset.select).name));
    });
    document.querySelectorAll(".lab-tool-card").forEach(function (card) {
      var app = byId.get(card.dataset.app);
      card.querySelector(".lab-tool-open").setAttribute("aria-label",appLabel(app));
      card.querySelectorAll("[data-preview]").forEach(function (node) { node.setAttribute("aria-label",previewLabel(app)); });
    });
    updateSpotlight();
    filterCards();
    if (state.preview) populateDialog(byId.get(state.preview));
  }

  function start() {
    dialog = document.getElementById("lab-preview");
    renderFan();
    renderIconField();
    renderCards();
    updateCopy();
    var initial = new URLSearchParams(location.search).get("view");
    try { initial = initial || localStorage.getItem("tjm-vibe-view"); } catch (_) { /* no-op */ }
    setView(initial || "fan",false);

    document.querySelectorAll("button[data-view]").forEach(function (button) {
      button.addEventListener("click",function () { setView(button.dataset.view,true); });
    });
    document.getElementById("lab-stage").addEventListener("click",function (event) {
      var button = event.target.closest("button[data-select]");
      if (button) select(button.dataset.select);
    });
    document.getElementById("lab-stage").addEventListener("keydown",function (event) {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        step(event.key === "ArrowLeft" ? -1 : 1);
        var group = state.view === "fan" ? "#lab-fan" : "#lab-icon-field";
        document.querySelector(group + ' [data-select="' + state.selected + '"]').focus({preventScroll:true});
      }
    });
    document.getElementById("lab-prev").addEventListener("click",function () { step(-1); });
    document.getElementById("lab-next").addEventListener("click",function () { step(1); });
    document.getElementById("lab-preview-selected").addEventListener("click",function (event) { openPreview(state.selected,event.currentTarget); });
    document.getElementById("lab-tool-grid").addEventListener("click",function (event) {
      var button = event.target.closest("[data-preview]");
      if (button) openPreview(button.dataset.preview,button);
    });
    document.querySelectorAll("button[data-filter]").forEach(function (button) {
      button.addEventListener("click",function () { state.filter = button.dataset.filter; filterCards(); });
    });
    document.getElementById("lab-search").addEventListener("input",function (event) {
      state.query = event.target.value; filterCards();
    });
    document.getElementById("lab-reset").addEventListener("click",function () {
      state.query = ""; state.filter = "all";
      document.getElementById("lab-search").value = "";
      filterCards();
      document.getElementById("lab-search").focus();
    });
    document.getElementById("lab-preview-close").addEventListener("click",closePreview);
    dialog.addEventListener("close",restoreAfterDialog);
    dialog.addEventListener("click",function (event) {
      if (event.target !== dialog) return;
      var bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closePreview();
    });
    document.getElementById("lab-preview-image").addEventListener("error",function (event) {
      event.target.hidden = true;
      document.getElementById("lab-preview-image-error").hidden = false;
    });
    document.addEventListener("keydown",function (event) {
      if (event.key === "Escape" && dialog.open) { event.preventDefault(); closePreview(); return; }
      var editing = event.target.closest && event.target.closest('input,textarea,[contenteditable="true"]');
      if (event.key === "/" && !editing && !dialog.open && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault(); document.getElementById("lab-search").focus();
      }
    });
    document.addEventListener("tjm:languagechange",updateCopy);
    window.TJMVibeCoding = Object.freeze({
      getState:function () { return Object.assign({},state); },
      appCount:apps.length
    });
  }
  document.addEventListener("DOMContentLoaded",start,{once:true});
}());
