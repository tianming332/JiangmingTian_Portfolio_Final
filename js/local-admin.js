(function () {
  "use strict";

  var selectedFile = null;
  var rootHandle = null;

  function el(id) { return document.getElementById(id); }
  function values(select) { return Array.prototype.slice.call(select.selectedOptions).map(function (option) { return option.value; }); }
  function safeSlug(value) { return String(value || "").toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""); }
  function message(text, error) { el("adminMessage").textContent = text; el("adminMessage").style.background = error ? "#ffe0df" : "#efffc1"; }
  function placeholder(id) { var number = (String(id).match(/(\d+)$/) || [])[1] || "01"; return "uploads/works-covers/placeholder-applied-" + String(number).padStart(2, "0") + ".svg"; }
  function currentId() { return safeSlug(el("slug").value) || safeSlug(el("titleEn").value) || "new-project"; }
  function updateCoverPath() { el("coverPath").textContent = "uploads/works-covers/" + currentId() + ".webp"; }

  function populateTaxonomy() {
    [["direction", (window.PORTFOLIO_META || {}).directions], ["type", (window.PORTFOLIO_META || {}).types]].forEach(function (entry) {
      var select = el(entry[0]);
      Object.keys(entry[1] || {}).forEach(function (key) {
        if (key === "all" || select.querySelector('option[value="' + key + '"]')) return;
        var option = document.createElement("option");
        option.value = key;
        option.textContent = entry[1][key];
        select.appendChild(option);
      });
    });
  }

  function populate() {
    (window.WORKS || []).forEach(function (item) {
      var option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.title + " / " + item.id;
      el("replaceId").appendChild(option);
    });
  }

  function fill(item) {
    if (!item) return;
    selectedFile = null;
    el("fileList").textContent = "尚未选择图片，将保留现有封面";
    el("coverSelect").innerHTML = '<option value="">保留当前封面</option>';
    el("title").value = item.title || "";
    el("titleEn").value = item.titleEn || "";
    el("slug").value = item.id || "";
    el("year").value = item.year || "";
    el("description").value = item.description || "";
    el("overview").value = item.overview || "";
    el("tools").value = item.tools || "";
    el("tags").value = (item.tags || []).join("，");
    el("status").value = item.status || "concept";
    el("detailLive").value = ((window.WORK_DETAIL_LINKS || {})[item.id] || {}).live || "";
    Array.from(el("direction").options).forEach(function (option) { option.selected = (item.directions || []).indexOf(option.value) > -1; });
    Array.from(el("type").options).forEach(function (option) { option.selected = (item.types || []).indexOf(option.value) > -1; });
    el("coverPreview").src = item.cover || placeholder(item.id);
    updateCoverPath();
  }

  function project() {
    var replaceId = el("replaceId").value;
    var existing = (window.WORKS || []).find(function (item) { return item.id === replaceId; }) || {};
    var id = safeSlug(el("slug").value) || safeSlug(el("titleEn").value) || ("project-" + Date.now());
    return Object.assign({}, existing, {
      id: id,
      title: el("title").value.trim() || "未命名项目",
      titleEn: el("titleEn").value.trim().toUpperCase(),
      directions: values(el("direction")),
      types: values(el("type")),
      tags: el("tags").value.split(/[，,]/).map(function (tag) { return tag.trim(); }).filter(Boolean),
      year: el("year").value.trim(),
      description: el("description").value.trim(),
      overview: el("overview").value.trim(),
      tools: el("tools").value.trim(),
      cover: selectedFile ? "uploads/works-covers/" + id + ".webp" : (existing.cover || placeholder(id)),
      status: el("status").value,
      featured: Boolean(existing.featured)
    });
  }

  function worksUpdated(item) {
    var list = (window.WORKS || []).slice();
    var replaceId = el("replaceId").value;
    var index = list.findIndex(function (candidate) { return candidate.id === replaceId; });
    if (index > -1) list[index] = item; else list.unshift(item);
    return list;
  }

  function worksSource(item) {
    return "// 由本地作品卡片管理页生成。\nwindow.PORTFOLIO_META = " + JSON.stringify(window.PORTFOLIO_META, null, 2) + ";\n\nwindow.WORKS = " + JSON.stringify(worksUpdated(item), null, 2) + ";\n";
  }

  function linkRecordsUpdated(item) {
    var records = {};
    Object.keys(window.WORK_DETAIL_LINKS || {}).forEach(function (id) { records[id] = Object.assign({}, window.WORK_DETAIL_LINKS[id]); });
    var replaceId = el("replaceId").value;
    if (replaceId && replaceId !== item.id) delete records[replaceId];
    var existing = records[item.id] || {};
    var url = el("detailLive").value.trim() || existing.live || existing.local || "";
    records[item.id] = { local: url, live: url };
    return records;
  }

  function linksSource(item) {
    return "/* 由本地作品卡片管理页生成：所有卡片始终使用 GitHub Pages 网址。 */\n(function () {\n  \"use strict\";\n  var records = " + JSON.stringify(linkRecordsUpdated(item), null, 2) + ";\n  window.WORK_DETAIL_LINKS = Object.freeze(records);\n  window.resolveWorkDetailLink = function (id) {\n    var record = window.WORK_DETAIL_LINKS[id];\n    return record && (record.live || record.local) || \"https://tianming332.github.io/JiangmingTian_Portfolio_Final/#all-works\";\n  };\n}());\n";
  }

  function filesChanged(files) {
    selectedFile = Array.from(files).find(function (file) { return file.type.indexOf("image/") === 0; }) || null;
    el("fileList").innerHTML = selectedFile ? "<div>• " + selectedFile.name + " <small>(" + Math.round(selectedFile.size / 1024) + " KB，将转换为 WebP)</small></div>" : "尚未选择图片";
    el("coverSelect").innerHTML = selectedFile ? '<option value="selected">使用这张图片</option>' : '<option value="">保留当前封面</option>';
    if (selectedFile) el("coverPreview").src = URL.createObjectURL(selectedFile);
    updateCoverPath();
  }

  async function toWebp(file) {
    var bitmap = await createImageBitmap(file);
    var longest = Math.max(bitmap.width, bitmap.height);
    var ratio = longest > 1800 ? 1800 / longest : 1;
    var canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    if (bitmap.close) bitmap.close();
    return await new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) { if (blob) resolve(blob); else reject(new Error("封面转换失败")); }, "image/webp", 0.88);
    });
  }

  async function getDir(parent, name) { return await parent.getDirectoryHandle(name, { create: true }); }
  async function writeFile(directory, name, data) { var handle = await directory.getFileHandle(name, { create: true }); var writer = await handle.createWritable(); await writer.write(data); await writer.close(); }

  async function save() {
    if (!window.showDirectoryPicker) { message("当前浏览器不支持直接写入文件夹，请下载两个数据文件后手动替换。", true); return; }
    try {
      var item = project();
      rootHandle = rootHandle || await window.showDirectoryPicker({ mode: "readwrite" });
      var dataDirectory = await getDir(rootHandle, "data");
      await writeFile(dataDirectory, "works.js", worksSource(item));
      await writeFile(dataDirectory, "work-detail-links.js", linksSource(item));
      if (selectedFile) {
        var uploads = await getDir(rootHandle, "uploads");
        var covers = await getDir(uploads, "works-covers");
        await writeFile(covers, item.id + ".webp", await toWebp(selectedFile));
      }
      window.WORKS = worksUpdated(item);
      window.WORK_DETAIL_LINKS = linkRecordsUpdated(item);
      message("已保存作品资料、详情页接口" + (selectedFile ? "与 WebP 封面" : "；现有封面保持不变") + "。", false);
    } catch (error) {
      if (error.name !== "AbortError") message("保存失败：" + error.message, true);
    }
  }

  function downloadFile(name, content) {
    var blob = new Blob([content], { type: "text/javascript;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  document.addEventListener("DOMContentLoaded", function () {
    populateTaxonomy();
    populate();
    updateCoverPath();
    if (!window.showDirectoryPicker) el("supportNotice").textContent = "当前浏览器不支持直接写入网站文件夹，但仍可下载更新后的数据文件。建议使用 Chrome 或 Edge。";
    el("replaceId").addEventListener("change", function () { fill((window.WORKS || []).find(function (item) { return item.id === el("replaceId").value; })); });
    ["slug", "titleEn"].forEach(function (id) { el(id).addEventListener("input", updateCoverPath); });
    el("dropZone").addEventListener("click", function () { el("files").click(); });
    el("files").addEventListener("change", function () { filesChanged(this.files); });
    ["dragover", "drop"].forEach(function (name) { el("dropZone").addEventListener(name, function (event) { event.preventDefault(); if (name === "drop") filesChanged(event.dataTransfer.files); }); });
    el("saveSite").addEventListener("click", save);
    el("downloadData").addEventListener("click", function () { var item = project(); downloadFile("works.js", worksSource(item)); message("已下载 works.js。", false); });
    el("downloadLinks").addEventListener("click", function () { var item = project(); downloadFile("work-detail-links.js", linksSource(item)); message("已下载 work-detail-links.js。", false); });
    el("resetForm").addEventListener("click", function () { location.reload(); });
  });
}());
