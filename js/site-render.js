(function () {
  "use strict";

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function asArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(/[，,]/).map(function (v) { return v.trim(); }).filter(Boolean);
    return [];
  }

  function getMeta(group, key) {
    var meta = window.PORTFOLIO_META || {};
    return (meta[group] && meta[group][key]) || key;
  }

  function i18nAttributes(hans, hant, en) {
    return ' data-i18n data-i18n-hans="' + escapeHTML(hans) + '" data-i18n-hant="' + escapeHTML(hant) + '" data-i18n-en="' + escapeHTML(en) + '"';
  }

  function workText(item, language, field) {
    var record = window.WORK_TRANSLATIONS && window.WORK_TRANSLATIONS[item.id];
    var fallback = language === "en" && field === "title" ? (item.titleEn || item.title) : item[field];
    return (record && record[language] && record[language][field]) || fallback || "";
  }

  function metaText(group, key, language) {
    var record = window.PORTFOLIO_TRANSLATIONS && window.PORTFOLIO_TRANSLATIONS[group] && window.PORTFOLIO_TRANSLATIONS[group][key];
    return (record && record[language]) || getMeta(group, key);
  }

  function setI18nContent(element, hans, hant, en) {
    if (!element) return;
    element.setAttribute("data-i18n", "");
    element.setAttribute("data-i18n-hans", hans);
    element.setAttribute("data-i18n-hant", hant);
    element.setAttribute("data-i18n-en", en);
    var language = window.tjmLanguage ? window.tjmLanguage.current() : "zh-hans";
    element.textContent = language === "en" ? en : (language === "zh-hant" ? hant : hans);
  }

  function expandedKeys(item) {
    var keys = asArray(item.directions).concat(asArray(item.types));
    var text = asArray(item.tags).join(" ") + " " + (item.title || "") + " " + (item.description || "");
    function add(key, condition) { if (condition && keys.indexOf(key) === -1) keys.push(key); }
    add("album", keys.indexOf("editorial") !== -1 || /書籍|版式|畫冊/.test(text));
    add("graphic-design", keys.indexOf("graphic") !== -1 || keys.indexOf("information") !== -1 || keys.indexOf("ip") !== -1);
    add("photography", /攝影|摄影|寫真|写真/.test(text));
    add("ai-animation", keys.indexOf("ai-video") !== -1 || keys.indexOf("ai") !== -1);
    add("motion", keys.indexOf("ai-video") !== -1 || keys.indexOf("interaction") !== -1);
    add("vector", keys.indexOf("graphic") !== -1 || keys.indexOf("information") !== -1 || keys.indexOf("ip") !== -1);
    add("experience", keys.indexOf("uiux") !== -1 || keys.indexOf("interaction") !== -1 || keys.indexOf("installation") !== -1);
    return keys;
  }

  function isAIProject(item) {
    var directions = asArray(item.directions);
    var types = asArray(item.types);
    return directions.indexOf("ai") !== -1 || types.some(function (type) { return String(type).indexOf("ai-") === 0; });
  }

  function getProjectLink(item) {
    if (window.resolveWorkDetailLink) return window.resolveWorkDetailLink(item.id);
    var links = window.WORK_DETAIL_LINKS || {};
    var record = links[item.id];
    if (typeof record === "string") return record;
    return (record && (record.live || record.local)) || item.detailUrl || ("project.html?id=" + encodeURIComponent(item.id));
  }

  function ensureFilterCoverage(panel) {
    var works = window.WORKS || [];
    var directions = [], types = [];
    works.forEach(function (item) {
      asArray(item.directions).forEach(function (key) { if (directions.indexOf(key) === -1) directions.push(key); });
      asArray(item.types).forEach(function (key) { if (types.indexOf(key) === -1) types.push(key); });
    });
    function append(group, key) {
  if (panel.querySelector('[data-group="' + group + '"][data-filter="' + key + '"]')) return;

  // interaction 逻辑上仍属于 direction，
  // 但视觉上放到“作品类型”这一排。
  var visualGroup = key === "interaction" ? "type" : group;

  var anchor = panel.querySelector('[data-group="' + visualGroup + '"]');
  var holder = anchor && anchor.parentElement;
  if (!holder) return;

  var button = document.createElement("button");
  button.type = "button";
  button.className = "filter-chip";

  // 注意：这里仍然保留 direction，不改变原有筛选逻辑
  button.dataset.group = group;
  button.dataset.filter = key;

  var metaGroup = group === "direction" ? "directions" : "types";
  var hans = metaText(metaGroup, key, "zh-hans");
  var hant = metaText(metaGroup, key, "zh-hant");
  var en = metaText(metaGroup, key, "en");

  button.setAttribute("data-i18n", "");
  button.setAttribute("data-i18n-hans", hans);
  button.setAttribute("data-i18n-hant", hant);
  button.setAttribute("data-i18n-en", en);
  button.textContent = hans;

  // 把“交互设计”放在 UI / UX 后面
  if (key === "interaction") {
    var uiux = holder.querySelector(
      '[data-group="type"][data-filter="uiux"]'
    );

    if (uiux) {
      uiux.insertAdjacentElement("afterend", button);
    } else {
      holder.appendChild(button);
    }
  } else {
    holder.appendChild(button);
  }
}
    directions.forEach(function (key) { append("direction", key); });
    types.forEach(function (key) { append("type", key); });
  }

  function createProjectCard(item, order) {
    var directions = asArray(item.directions);
    var types = asArray(item.types);
    var status = item.status || "concept";
    var labelKeys = types.slice(0, 2);
    var labelsHans = labelKeys.map(function (type) { return metaText("types", type, "zh-hans"); });
    var labelsHant = labelKeys.map(function (type) { return metaText("types", type, "zh-hant"); });
    var labelsEn = labelKeys.map(function (type) { return metaText("types", type, "en"); });
    var titleHans = workText(item, "zh-hans", "title");
    var titleHant = workText(item, "zh-hant", "title");
    var titleEn = workText(item, "en", "title");
    var rawYear = String(item.year || "");
    var yearIsPending = /待[補补]充/.test(rawYear);
    var yearHans = yearIsPending ? "待补充" : rawYear;
    var yearHant = yearIsPending ? "待補充" : rawYear;
    var yearEn = yearIsPending ? "TBD" : rawYear;
    var tagHans = workText(item, "zh-hans", "tags") || [];
    var tagHant = workText(item, "zh-hant", "tags") || [];
    var tagEn = workText(item, "en", "tags") || [];
    var statusBadge = ["launched", "implemented", "exhibited"].indexOf(status) !== -1
      ? '<span class="project-status"' + i18nAttributes(metaText("statuses", status, "zh-hans"), metaText("statuses", status, "zh-hant"), metaText("statuses", status, "en")) + '>' + escapeHTML(metaText("statuses", status, "zh-hans")) + '</span>' : "";
    var aiBadge = isAIProject(item) ? '<span class="project-status project-ai">AI</span>' : "";
    var flags = statusBadge || aiBadge ? '<div class="project-flags' + (statusBadge && aiBadge ? ' project-flags--two' : '') + '">' + statusBadge + aiBadge + '</div>' : "";
    var keys = expandedKeys(item);
    var filterDirections = directions.filter(function (key) { return ["ai", "visual", "interaction"].indexOf(key) !== -1; });
    var filterTypes = keys.filter(function (key) { return filterDirections.indexOf(key) === -1; });
    var data = ' data-directions="' + escapeHTML(filterDirections.join(" ")) + '" data-types="' + escapeHTML(filterTypes.join(" ")) + '" data-order="' + Number(order || 0) + '"';
    var projectLink = getProjectLink(item);

    return '<article class="col-xl-4 col-md-6 grid-item project-card-wrap"' + data + '>' +
      '<a class="project-card" href="' + escapeHTML(projectLink) + '" data-project-id="' + escapeHTML(item.id) + '">' +
        '<div class="project-media">' +
          '<img class="project-cover" src="' + escapeHTML(item.cover) + '" alt="' + escapeHTML(titleHans) + '" loading="lazy">' +
          '<div class="project-glass">' + flags +
            '<div class="glass-head"><span>WORK / <span' + i18nAttributes(yearHans, yearHant, yearEn) + '>' + escapeHTML(yearHans) + '</span></span><span>↗</span></div>' +
            '<div class="glass-title"><strong' + i18nAttributes(titleHans, titleHant, titleEn) + '>' + escapeHTML(titleHans || "未命名项目") + '</strong><small>' + escapeHTML(item.titleEn || "") + '</small></div>' +
            '<div class="glass-meta"' + i18nAttributes(labelsHans.join(" · ") || "作品", labelsHant.join(" · ") || "作品", labelsEn.join(" · ") || "Works") + '>' + escapeHTML(labelsHans.join(" · ") || "作品") + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="project-copy project-tags-row">' +
          '<span class="tags-row-label"><span' + i18nAttributes("项目标签", "項目標籤", "Project Tags") + '>项目标签</span> <small>PROJECT TAGS</small></span>' +
          '<div class="tags-row-list">' + asArray(item.tags).concat(labelKeys).slice(0, 4).map(function (tag, tagIndex) {
            var isItemTag = tagIndex < asArray(item.tags).length;
            var hans = isItemTag ? (tagHans[tagIndex] || tag) : metaText("types", tag, "zh-hans");
            var hant = isItemTag ? (tagHant[tagIndex] || tag) : metaText("types", tag, "zh-hant");
            var en = isItemTag ? (tagEn[tagIndex] || tag) : metaText("types", tag, "en");
            return '<span' + i18nAttributes(hans, hant, en) + '>' + escapeHTML(hans) + '</span>';
          }).join("") + '</div>' +
          '<span class="tags-row-year"' + i18nAttributes(yearHans, yearHant, yearEn) + '>' + escapeHTML(yearHans) + '</span>' +
        '</div>' +
      '</a>' +
    '</article>';
  }

  function renderProjects(targetId, items, emptyText) {
    var target = document.getElementById(targetId);
    if (!target) return;
    var list = Array.isArray(items) ? items : [];
    target.innerHTML = list.length ? list.map(function (item, index) { return createProjectCard(item, index); }).join("") :
      '<div class="col-12 empty-state"><p>' + escapeHTML(emptyText || "暂时没有符合条件的项目。") + '</p></div>';
  }

  function renderSimpleCards(targetId, items, kind) {
    var target = document.getElementById(targetId);
    if (!target) return;
    var list = Array.isArray(items) ? items : [];
    target.innerHTML = list.map(function (item) {
      var itemI18n = item.i18n || {};
      var hans = itemI18n["zh-hans"] || { title: item.title, description: item.description };
      var hant = itemI18n["zh-hant"] || hans;
      var en = itemI18n.en || hans;
      var meta = kind === "video" ? asArray(item.keywords).join(" · ") : (item.year || "年度作品集");
      var aiFlag = kind === "video" ? '<div class="simple-flags"><span class="project-status project-ai">AI</span></div>' : "";
      return '<article class="col-xl-4 col-md-6 grid-item project-card-wrap">' +
        '<a class="project-card" href="' + escapeHTML(item.link || "#!") + '"' + (/^https?:/.test(item.link || "") ? ' target="_blank" rel="noopener"' : '') + '>' +
          '<div class="project-media">' + aiFlag + '<img class="project-cover" src="' + escapeHTML(item.cover) + '" alt="' + escapeHTML(hans.title) + '"><span class="project-arrow">↗</span></div>' +
          '<div class="project-copy"><div class="project-meta"><span>' + escapeHTML(meta) + '</span></div>' +
          '<h2 class="project-title"' + i18nAttributes(hans.title, hant.title, en.title) + '>' + escapeHTML(hans.title) + '</h2><p class="project-description"' + i18nAttributes(hans.description, hant.description, en.description) + '>' + escapeHTML(hans.description) + '</p></div>' +
        '</a></article>';
    }).join("");
  }

  function setupFilters() {
    var grid = document.getElementById("worksGrid");
    var panel = document.getElementById("workFilters");
    if (!grid || !panel) return;
    ensureFilterCoverage(panel);
    var activeDirections = [];
    var activeTypes = [];

    function update() {
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".project-card-wrap"));
      var active = activeDirections.concat(activeTypes);
      var matched = 0;
      cards.forEach(function (card) {
        var directions = (card.dataset.directions || "").split(" ");
        var types = (card.dataset.types || "").split(" ");
        var keys = directions.concat(types);
        var score = active.reduce(function (total, key) { return total + (keys.indexOf(key) !== -1 ? 1 : 0); }, 0);
        card.dataset.matchScore = score;
        card.hidden = false;
        card.classList.toggle("filter-priority", active.length > 0 && score > 0);
        card.classList.toggle("filter-secondary", active.length > 0 && score === 0);
        if (score > 0) matched += 1;
      });
      cards.sort(function (a, b) { return Number(b.dataset.matchScore) - Number(a.dataset.matchScore) || Number(a.dataset.order) - Number(b.dataset.order); }).forEach(function (card) { grid.appendChild(card); });
      var count = document.getElementById("resultCount");
      if (count) setI18nContent(count,
        active.length ? matched + " 个匹配项目优先" : "找到 " + cards.length + " 个项目",
        active.length ? matched + " 個匹配項目優先" : "找到 " + cards.length + " 個項目",
        active.length ? matched + " matching projects prioritized" : cards.length + " projects"
      );
      var summary = document.getElementById("filterSummary");
      if (summary) {
        var partsHans = [], partsHant = [], partsEn = [];
        activeDirections.forEach(function (direction) { partsHans.push(metaText("directions", direction, "zh-hans")); partsHant.push(metaText("directions", direction, "zh-hant")); partsEn.push(metaText("directions", direction, "en")); });
        activeTypes.forEach(function (type) { partsHans.push(metaText("types", type, "zh-hans")); partsHant.push(metaText("types", type, "zh-hant")); partsEn.push(metaText("types", type, "en")); });
        setI18nContent(summary,
          partsHans.length ? "当前筛选：" + partsHans.join(" · ") : "当前显示：全部作品",
          partsHant.length ? "當前篩選：" + partsHant.join(" · ") : "當前顯示：全部作品",
          partsEn.length ? "Current filters: " + partsEn.join(" · ") : "Showing: All Works"
        );
      }
    }

    window.portfolioFilter = {
      applyTags: function (tags) {
        var list = Array.isArray(tags) ? tags : [];
        activeDirections = list.filter(function (tag) { return ["ai", "visual", "interaction"].indexOf(tag) !== -1; });
        activeTypes = list.filter(function (tag) { return ["ai", "visual", "interaction"].indexOf(tag) === -1; });
        panel.querySelectorAll("[data-filter]").forEach(function (el) {
          if (el.dataset.group === "direction") el.classList.toggle("active", el.dataset.filter === "all" ? !activeDirections.length : activeDirections.indexOf(el.dataset.filter) !== -1);
          else el.classList.toggle("active", activeTypes.indexOf(el.dataset.filter) !== -1);
        });
        update();
      }
    };

    panel.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter]");
      if (!button) return;
      if (button.dataset.group === "direction") {
        var direction = button.dataset.filter;
        if (direction === "all") activeDirections = [];
        else {
          var directionIndex = activeDirections.indexOf(direction);
          if (directionIndex === -1) activeDirections.push(direction); else activeDirections.splice(directionIndex, 1);
        }
        panel.querySelectorAll('[data-group="direction"]').forEach(function (el) {
          el.classList.toggle("active", el.dataset.filter === "all" ? !activeDirections.length : activeDirections.indexOf(el.dataset.filter) !== -1);
        });
      } else {
        var type = button.dataset.filter;
        var index = activeTypes.indexOf(type);
        if (index === -1) activeTypes.push(type); else activeTypes.splice(index, 1);
        button.classList.toggle("active");
      }
      update();
    });

    var clear = document.getElementById("clearFilters");
    if (clear) clear.addEventListener("click", function () {
      activeDirections = []; activeTypes = [];
      panel.querySelectorAll("[data-filter]").forEach(function (el) { el.classList.remove("active"); });
      var all = panel.querySelector('[data-group="direction"][data-filter="all"]');
      if (all) all.classList.add("active");
      update();
    });
    update();
  }

  function renderDetail() {
    var target = document.getElementById("dynamicDetail");
    if (!target) return;
    var id = new URLSearchParams(location.search).get("id");
    var item = (window.WORKS || []).find(function (work) { return work.id === id; });
    if (!item) {
      target.innerHTML = '<div class="empty-state"><h1' + i18nAttributes("没有找到这个项目", "沒有找到這個項目", "Project not found") + '>没有找到这个项目</h1>' +
        '<p' + i18nAttributes("请返回所有作品继续浏览。", "請返回所有作品繼續瀏覽。", "Return to All Works to continue browsing.") + '>请返回所有作品继续浏览。</p>' +
        '<a href="index.html#all-works" class="button-link"' + i18nAttributes("返回所有作品", "返回所有作品", "Back to All Works") + '>返回所有作品</a></div>';
      return;
    }
    var typeKeys = asArray(item.types);
    var typesHans = typeKeys.map(function (type) { return metaText("types", type, "zh-hans"); }).join(" · ");
    var typesHant = typeKeys.map(function (type) { return metaText("types", type, "zh-hant"); }).join(" · ");
    var typesEn = typeKeys.map(function (type) { return metaText("types", type, "en"); }).join(" · ");
    var titleHans = workText(item, "zh-hans", "title");
    var titleHant = workText(item, "zh-hant", "title");
    var titleEn = workText(item, "en", "title");
    var rawYear = String(item.year || "");
    var yearIsPending = /待[補补]充/.test(rawYear);
    var yearHans = yearIsPending ? "待补充" : rawYear;
    var yearHant = yearIsPending ? "待補充" : rawYear;
    var yearEn = yearIsPending ? "TBD" : rawYear;
    var descriptionHans = workText(item, "zh-hans", "description");
    var descriptionHant = workText(item, "zh-hant", "description");
    var descriptionEn = workText(item, "en", "description");
    target.innerHTML = '<header class="detail-hero"><p class="eyebrow"' + i18nAttributes(typesHans + " / " + yearHans, typesHant + " / " + yearHant, typesEn + " / " + yearEn) + '>' + escapeHTML(typesHans) + ' / ' + escapeHTML(yearHans) + '</p>' +
      '<h1' + i18nAttributes(titleHans, titleHant, titleEn) + '>' + escapeHTML(titleHans) + '</h1><p class="detail-en">' + escapeHTML(item.titleEn) + '</p>' +
      '<p class="detail-lead"' + i18nAttributes(descriptionHans, descriptionHant, descriptionEn) + '>' + escapeHTML(descriptionHans) + '</p></header>' +
      '<img class="detail-cover" src="' + escapeHTML(item.cover) + '" alt="' + escapeHTML(titleHans) + '">' +
      '<section class="detail-placeholder"><p class="eyebrow"' + i18nAttributes("项目内容 / PROJECT CONTENT", "項目內容 / PROJECT CONTENT", "PROJECT CONTENT") + '>项目内容 / PROJECT CONTENT</p>' +
      '<h2' + i18nAttributes("内容待补充", "內容待補充", "Content pending") + '>内容待补充</h2>' +
      '<p' + i18nAttributes("项目卡片和分类已经建立。请使用本地作品管理页补充项目背景、个人职责、使用工具、图片和外部链接。", "項目卡片和分類已經建立。請使用本地作品管理頁補充項目背景、個人職責、使用工具、圖片和外部鏈接。", "The project card and categories are ready. Use the local project manager to add the background, role, tools, images, and external links.") + '>项目卡片和分类已经建立。请使用本地作品管理页补充项目背景、个人职责、使用工具、图片和外部链接。</p>' +
      '<a href="index.html#all-works" class="text-link"' + i18nAttributes("← 返回所有作品", "← 返回所有作品", "← Back to All Works") + '>← 返回所有作品</a></section>';
    document.title = titleHans + " | 天将明作品集";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderProjects("worksGrid", window.WORKS, "暂时没有作品。");
    renderProjects("appliedGrid", (window.WORKS || []).filter(function (item) { return ["launched", "implemented", "exhibited"].indexOf(item.status) !== -1; }), "暂时没有标记为已落地的项目。");
    renderSimpleCards("collectionsGrid", window.COLLECTIONS, "collection");
    renderSimpleCards("videosGrid", window.VIDEOS, "video");
    setupFilters();
    renderDetail();
  });
}());
