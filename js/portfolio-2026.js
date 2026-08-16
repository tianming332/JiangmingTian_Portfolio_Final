(function () {
  "use strict";

  var works = window.WORKS || [];
  var tagMeta = (window.PORTFOLIO_META && window.PORTFOLIO_META.tags) || {};
  var filterKeys = ["ai","visual","interaction","applied","graphic","information","installation","uiux","ip","ai-image","editorial"];
  var selected = new Set();
  var reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, function (char) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char];
    });
  }

  function label(key) {
    return tagMeta[key] || [key, key.toUpperCase()];
  }

  function itemTags(item) {
    return (item.directions || []).concat(item.types || []);
  }

  function score(item) {
    var tags = new Set(itemTags(item));
    var total = 0;
    selected.forEach(function (key) { if (tags.has(key)) total += 1; });
    return total;
  }

  function enterSite() {
    var gate = document.getElementById("welcomeGate");
    if (!gate || gate.classList.contains("is-leaving")) return;
    gate.classList.add("is-leaving");
    document.body.classList.remove("gate-open");
    sessionStorage.setItem("portfolioEntered", "true");
    setTimeout(function () {
      gate.hidden = true;
      document.getElementById("works").focus({ preventScroll: true });
      scrollTo(0, 0);
    }, reducedMotion ? 0 : 620);
  }

  function setupWelcome() {
    var gate = document.getElementById("welcomeGate");
    if (sessionStorage.getItem("portfolioEntered") === "true") {
      gate.hidden = true;
      document.body.classList.remove("gate-open");
      return;
    }
    gate.addEventListener("click", enterSite);
    gate.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); enterSite(); }
    });
    if (!reducedMotion) {
      gate.addEventListener("pointermove", function (event) {
        var rect = gate.getBoundingClientRect();
        gate.style.setProperty("--mx", ((event.clientX - rect.left) / rect.width - .5).toFixed(3));
        gate.style.setProperty("--my", ((event.clientY - rect.top) / rect.height - .5).toFixed(3));
      });
    }
  }

  function createCard(item, index) {
    var card = document.createElement("article");
    card.className = "work-card";
    card.dataset.id = item.id;
    var info = (item.tags || []).slice(0, 2).concat(itemTags(item).slice(0, 1).map(function (key) { return label(key)[0]; })).join(" · ");
    var projectLink = window.resolveWorkDetailLink ? window.resolveWorkDetailLink(item.id) : (item.detailUrl || ("project.html?id=" + encodeURIComponent(item.id)));
    card.innerHTML = '<a class="work-link" href="' + esc(projectLink) + '" data-project-id="' + esc(item.id) + '">' +
      '<div class="work-media"><img src="' + esc(item.cover) + '" alt="' + esc(item.title) + '" loading="lazy">' +
      '<div class="frost-card"><div class="frost-top"><span class="work-index-no">' + String(index + 1).padStart(2,"0") + '</span><span class="work-year">' + esc(item.year) + '</span></div>' +
      '<div class="frost-main"><h3>' + esc(item.title) + '<small>' + esc(item.titleEn) + '</small></h3></div>' +
      '<div class="frost-bottom"><span>' + esc(info) + '</span><b>↗</b></div><span class="priority-mark">优先 / PRIORITY</span></div></div></a>';
    return card;
  }

  function renderWorks() {
    var grid = document.getElementById("worksGrid");
    works.forEach(function (item, index) { grid.appendChild(createCard(item, index)); });
    document.getElementById("resultCount").textContent = String(works.length).padStart(2,"0") + " 件作品";
    document.getElementById("topbarCount").textContent = String(works.length).padStart(2,"0") + " WORKS";
  }

  function buildFilters() {
    var holder = document.getElementById("compactTags");
    filterKeys.forEach(function (key) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "compact-tag";
      button.dataset.tag = key;
      button.setAttribute("aria-pressed", "false");
      button.innerHTML = "<span>" + esc(label(key)[0]) + "</span><small>" + esc(label(key)[1]) + "</small>";
      button.addEventListener("click", function () {
        if (selected.has(key)) selected.delete(key); else selected.add(key);
        applyFilters();
      });
      holder.appendChild(button);
    });
  }

  function applyFilters() {
    var grid = document.getElementById("worksGrid");
    var cards = Array.from(grid.children);
    var before = new Map(cards.map(function (card) { return [card.dataset.id, card.getBoundingClientRect()]; }));
    var sorted = works.map(function (item, index) { return { item: item, index: index, score: score(item) }; })
      .sort(function (a, b) { return b.score - a.score || a.index - b.index; });

    sorted.forEach(function (entry) {
      var card = cards.find(function (candidate) { return candidate.dataset.id === entry.item.id; });
      card.classList.toggle("is-priority", selected.size > 0 && entry.score > 0);
      card.classList.toggle("is-secondary", selected.size > 0 && entry.score === 0);
      grid.appendChild(card);
    });

    document.querySelectorAll(".compact-tag").forEach(function (button) {
      var active = selected.has(button.dataset.tag);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });

    if (!reducedMotion) {
      Array.from(grid.children).forEach(function (card) {
        var old = before.get(card.dataset.id);
        var current = card.getBoundingClientRect();
        if (!old || (old.left === current.left && old.top === current.top)) return;
        card.animate([
          { transform: "translate(" + (old.left - current.left) + "px," + (old.top - current.top) + "px)", opacity: .74 },
          { transform: "translate(0,0)", opacity: 1 }
        ], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
      });
    }

    var priority = sorted.filter(function (entry) { return entry.score > 0; }).length;
    document.getElementById("resultMessage").innerHTML = selected.size ? "<i></i>" + priority + " 件匹配作品已优先置顶" : "<i></i>当前展示全部作品";
  }

  function setSidebar(collapsed, remember) {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    var toggle = document.getElementById("sidebarToggle");
    toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    toggle.setAttribute("aria-label", collapsed ? "展开左侧栏" : "收起左侧栏");
    toggle.querySelector("span").textContent = collapsed ? "→" : "←";
    if (remember) localStorage.setItem("portfolioSidebar", collapsed ? "collapsed" : "expanded");
  }

  function setupSidebar() {
    var stored = localStorage.getItem("portfolioSidebar");
    setSidebar(stored === "collapsed", false);
    document.getElementById("sidebarToggle").addEventListener("click", function () {
      setSidebar(!document.body.classList.contains("sidebar-collapsed"), true);
    });
    document.getElementById("mobileSidebarToggle").addEventListener("click", function () {
      var open = document.body.classList.toggle("mobile-sidebar-open");
      this.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.querySelectorAll(".sidebar-nav a").forEach(function (link) {
      link.addEventListener("click", function () { document.body.classList.remove("mobile-sidebar-open"); });
    });
  }

  function setupPage() {
    setupWelcome();
    renderWorks();
    buildFilters();
    setupSidebar();
    document.getElementById("clearTags").addEventListener("click", function () { selected.clear(); applyFilters(); });
    document.querySelector(".home-sidebar .sidebar-brand").addEventListener("click", function (event) {
      event.preventDefault();
      sessionStorage.removeItem("portfolioEntered");
      location.reload();
    });
  }

  document.addEventListener("DOMContentLoaded", setupPage);
}());
