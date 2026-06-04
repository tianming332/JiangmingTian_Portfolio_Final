function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeKeywords(keywords) {
  if (Array.isArray(keywords)) return keywords;
  if (typeof keywords === "string") return keywords.split(/[，,]/).map(function (item) { return item.trim(); }).filter(Boolean);
  return [];
}

function renderListingCards(targetId, items, emptyText) {
  var container = document.getElementById(targetId);
  if (!container) return;
  var list = Array.isArray(items) ? items : [];
  if (!list.length) {
    container.innerHTML = '<div class="col-12"><p class="text-muted">' + escapeHTML(emptyText || "No items yet.") + '</p></div>';
    return;
  }
  container.innerHTML = list.map(function (item) {
    var link = item.link || "#!";
    var keywords = normalizeKeywords(item.keywords || item.year || "");
    var tags = keywords.map(function (tag) {
      return '<li class="list-inline-item"><a class="reset-anchor fw-normal text-gray text-sm" href="' + escapeHTML(link) + '">' + escapeHTML(tag) + '</a></li>';
    }).join("");
    if (!tags && item.year) {
      tags = '<li class="list-inline-item"><a class="reset-anchor fw-normal text-gray text-sm" href="' + escapeHTML(link) + '">' + escapeHTML(item.year) + '</a></li>';
    }
    return '' +
      '<div class="col-lg-4 col-md-6 grid-item">' +
        '<div class="listing-item ps-0">' +
          '<div class="position-relative">' +
            '<ul class="list-inline listing-tags m-0">' + tags + '</ul>' +
            '<a class="reset-anchor d-block listing-img-holder" href="' + escapeHTML(link) + '">' +
              '<img class="img-fluid rounded-lg card-cover-img" src="' + escapeHTML(item.cover || "uploads/works-covers/sample-work.svg") + '" alt="' + escapeHTML(item.title || "Untitled") + '">' +
              '<p class="mb-0 text-primary small d-flex align-items-center listing-btn"><span>Look inside</span>' +
                '<svg class="svg-icon text-primary svg-icon-sm ms-1"><use xlink:href="#arrow-right-1"></use></svg>' +
              '</p>' +
            '</a>' +
          '</div>' +
          '<div class="py-3"><a class="reset-anchor" href="' + escapeHTML(link) + '">' +
            '<h2 class="h5 listing-item-heading">' + escapeHTML(item.title || "Untitled") + '</h2></a>' +
            '<p class="text-sm mb-0 listing-item-description">' + escapeHTML(item.description || "") + '</p>' +
          '</div>' +
        '</div>' +
      '</div>';
  }).join("");
}

renderListingCards("worksGrid", window.WORKS, "No work cards yet. Add your first work in data/works.js.");
renderListingCards("collectionsGrid", window.COLLECTIONS, "No portfolio collections yet. Add them in data/collections.js.");
renderListingCards("videosGrid", window.VIDEOS, "No video cards yet. Add them in data/videos.js.");
