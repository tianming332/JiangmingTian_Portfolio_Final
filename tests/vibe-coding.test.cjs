/* DOM contract tests, not a browser / visual-layout test.
 * Install test-only jsdom outside the site, then set NODE_PATH to that node_modules directory.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {JSDOM, VirtualConsole} = require("jsdom");
const ROOT = path.resolve(__dirname, "..");
const HTML = fs.readFileSync(path.join(ROOT, "workflow.html"), "utf8");

async function boot(query = "", stored = {}, siteURL = "http://127.0.0.1:8776/JiangmingTian_Portfolio_Final/workflow.html") {
  const errors = [];
  const console = new VirtualConsole();
  console.on("jsdomError", e => errors.push(e.message));
  const dom = new JSDOM(HTML, {
    url: siteURL + query,
    runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: console
  });
  const w = dom.window;
  await new Promise(resolve => w.addEventListener("load", resolve, {once:true}));
  for (const [key,value] of Object.entries(stored)) w.localStorage.setItem(key,value);
  w.matchMedia = () => ({matches:false, addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  // Native dialog behavior is represented explicitly. This does not validate browser focus trapping.
  w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open",""); };
  w.HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); this.dispatchEvent(new w.Event("close")); };
  for (const script of w.document.querySelectorAll("script[src]")) {
    const rel = script.getAttribute("src").split("?")[0];
    Object.defineProperty(w.document, "currentScript", {configurable:true, get:() => script});
    w.eval(fs.readFileSync(path.join(ROOT,rel),"utf8") + "\n//# sourceURL=" + rel);
  }
  Object.defineProperty(w.document, "currentScript", {configurable:true,get:() => null});
  w.document.dispatchEvent(new w.Event("DOMContentLoaded"));
  await new Promise(resolve => setTimeout(resolve,15));
  return {
    w, d:w.document, errors, close:() => w.close(),
    click:selector => { const el = w.document.querySelector(selector); assert.ok(el,selector); el.click(); },
    state:() => w.TJMVibeCoding.getState(),
    visible:() => [...w.document.querySelectorAll(".lab-tool-card")].filter(x => !x.hidden)
  };
}
async function withPage(t, query = "", stored = {}) {
  const p = await boot(query,stored); t.after(p.close); return p;
}

test("all eleven tools preserve original order, URLs, descriptions and translations", async t => {
  const p = await withPage(t);
  assert.equal(p.w.TJMVibeCoding.appCount,11);
  const cards = [...p.d.querySelectorAll(".lab-tool-card")];
  assert.equal(cards.length,11);
  p.w.TJM_VIBE_APPS.forEach((app,i) => {
    assert.equal(cards[i].dataset.app,app.id);
    assert.equal(cards[i].querySelector("a").href,p.w.WORKFLOWS[i].link);
    assert.equal(app.source,p.w.WORKFLOWS[i]);
    assert.equal(cards[i].querySelector("a").target,"_blank");
    assert.match(cards[i].querySelector("a").rel,/noopener/);
  });
  assert.deepEqual(p.errors,[]);
});

test("exactly one canonical sidebar and settings panel", async t => {
  const p = await withPage(t);
  for (const selector of [".sidebar",".settings-dock",".sidebar-collapse",".sidebar-expand"]) {
    assert.equal(p.d.querySelectorAll(selector).length,1,selector);
  }
  assert.equal(p.d.querySelector('.sidebar [data-site-key="workflow"]').href,"http://127.0.0.1:8776/JiangmingTian_Portfolio_Final/workflow.html");
  assert.equal(p.d.querySelector('.sidebar [data-site-key="annual"]').href,"http://127.0.0.1:8776/JiangmingTian_Portfolio_Final/collections.html");
});

test("default is font spotlight / fan, all 11 tools visible", async t => {
  const p = await withPage(t);
  assert.equal(p.state().view,"fan");
  assert.equal(p.state().selected,"font");
  assert.equal(p.visible().length,11);
  assert.equal(p.d.querySelector("#lab-selected-title").textContent,"字体工作室");
  assert.equal(p.d.querySelector("#lab-icon-field").hidden,true);
  assert.equal(p.d.querySelector("#lab-fan").hidden,false);
});

test("fan slots form the full -2..2 set with selected card at center", async t => {
  const p = await withPage(t);
  const cards = [...p.d.querySelectorAll(".lab-fan-card")];
  const slots = cards.map(x => Number(x.style.getPropertyValue("--lab-slot"))).sort((a,b) => a-b);
  assert.deepEqual(slots,[-2,-1,0,1,2]);
  assert.equal(p.d.querySelector('.lab-fan-card[aria-pressed="true"]').style.getPropertyValue("--lab-slot"),"0");
});

test("selecting a card updates spotlight URL and preview trigger", async t => {
  const p = await withPage(t);
  p.click('.lab-fan-card[data-select="photo"]');
  assert.equal(p.state().selected,"photo");
  assert.equal(p.d.querySelector("#lab-selected-title").textContent,"相纸工作室");
  assert.equal(p.d.querySelector("#lab-open-selected").href,p.w.WORKFLOWS[9].link);
  p.click("#lab-preview-selected");
  assert.equal(p.state().preview,"photo");
  assert.equal(p.d.querySelector("#lab-preview-image").getAttribute("src"),"uploads/vibe-coding/screens/tjm-photo-frame-studio.webp");
});

test("next and previous wrap through five featured apps", async t => {
  const p = await withPage(t);
  for (let i = 0; i < 5; i++) p.click("#lab-next");
  assert.equal(p.state().selected,"font");
  p.click("#lab-prev");
  assert.equal(p.state().selected,"construct");
});

test("left/right keyboard selection moves accessible focus", async t => {
  const p = await withPage(t);
  const selected = p.d.querySelector('.lab-fan-card[data-select="font"]');
  selected.focus();
  selected.dispatchEvent(new p.w.KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true,cancelable:true}));
  assert.equal(p.state().selected,"photo");
  assert.equal(p.d.activeElement.dataset.select,"photo");
});

test("icon view renders 11 distinct tools and hides fan interactions", async t => {
  const p = await withPage(t);
  p.click('[data-view="icons"]');
  assert.equal(p.state().view,"icons");
  assert.equal(p.d.querySelector("#lab-fan").hidden,true);
  assert.equal(p.d.querySelector("#lab-icon-field").hidden,false);
  assert.equal(new Set([...p.d.querySelectorAll(".lab-icon-tile")].map(x => x.dataset.select)).size,11);
  p.click('.lab-icon-tile[data-select="video"]');
  assert.equal(p.state().selected,"video");
  assert.match(p.d.querySelector("#lab-selected-number").textContent,/01 \/ 11/);
});

test("switching nonfeatured icon back to fan resets safely", async t => {
  const p = await withPage(t,"?view=icons");
  p.click('.lab-icon-tile[data-select="video"]');
  p.click('[data-view="fan"]');
  assert.equal(p.state().selected,"font");
  assert.equal(p.d.querySelectorAll('.lab-fan-card[aria-pressed="true"]').length,1);
});

test("view preference persists in an isolated key and URL", async t => {
  const p = await withPage(t,"?theme=gray&lang=ja");
  p.click('[data-view="icons"]');
  assert.equal(p.w.localStorage.getItem("tjm-vibe-view"),"icons");
  assert.equal(p.w.localStorage.getItem("tjm-theme"),"gray");
  const params = new URL(p.w.location.href).searchParams;
  assert.equal(params.get("theme"),"gray");
  assert.equal(params.get("lang"),"ja");
  assert.equal(params.get("view"),"icons");
});

test("remembered view restores; unknown query values fall back", async t => {
  const p = await withPage(t,"",{"tjm-vibe-view":"icons"});
  assert.equal(p.state().view,"icons");
  const other = await boot("?view=invalid"); t.after(other.close);
  assert.equal(other.state().view,"fan");
});

test("all 3 themes use original controls and storage", async t => {
  const p = await withPage(t);
  for (const theme of ["black","gray","white"]) {
    p.click('[data-theme-choice="' + theme + '"]');
    assert.equal(p.d.body.dataset.theme,theme);
    assert.equal(p.w.localStorage.getItem("tjm-theme"),theme);
    assert.equal(p.w.tjmTheme.current(),theme);
    assert.equal(p.visible().length,11);
  }
});

test("three languages change new UI, spotlight, search and preview labels", async t => {
  const p = await withPage(t);
  const names = {"zh-hans":"字体工作室",ja:"フォントスタジオ",en:"Font Studio"};
  for (const lang of ["en","ja","zh-hans"]) {
    p.click('[data-language-choice="' + lang + '"]');
    assert.equal(p.d.querySelector("#lab-selected-title").textContent,names[lang]);
    assert.equal(p.d.querySelector('[data-app="font"] h3').textContent,names[lang]);
    assert.match(p.d.querySelector("#lab-preview-selected").getAttribute("aria-label"),new RegExp(names[lang]));
    assert.equal(p.w.localStorage.getItem("tjm-language-v2"),lang);
  }
});

test("language changes preserve active filter / query", async t => {
  const p = await withPage(t);
  p.click('[data-filter="office"]');
  p.click('[data-language-choice="en"]');
  assert.equal(p.visible().length,1);
  assert.equal(p.visible()[0].dataset.app,"resume");
  assert.equal(p.state().filter,"office");
});

test("filters give correct category membership", async t => {
  const p = await withPage(t);
  for (const [category,count] of [["design",4],["type",4],["media",2],["office",1],["all",11]]) {
    p.click('[data-filter="' + category + '"]');
    assert.equal(p.visible().length,count,category);
    assert.equal(p.d.querySelector('[data-filter="' + category + '"]').getAttribute("aria-pressed"),"true");
  }
});

test("search matches names / English / tags and never injects markup", async t => {
  const p = await withPage(t);
  const input = p.d.querySelector("#lab-search");
  for (const [value,id] of [["字体","font"],["OTF","font"],["履歴書","resume"],["Photo Frame","photo"]]) {
    input.value=value; input.dispatchEvent(new p.w.Event("input",{bubbles:true}));
    assert.ok(p.visible().some(x => x.dataset.app === id));
  }
  input.value='<img src=x onerror=alert(1)>'; input.dispatchEvent(new p.w.Event("input",{bubbles:true}));
  assert.equal(p.visible().length,0);
  assert.equal(p.d.querySelector("#lab-empty").hidden,false);
  assert.equal(p.d.querySelector("img[onerror]"),null);
  p.click("#lab-reset");
  assert.equal(input.value,"");
  assert.equal(p.visible().length,11);
  assert.equal(p.d.activeElement,input);
});

test("search and category are combined", async t => {
  const p = await withPage(t);
  p.click('[data-filter="office"]');
  const input = p.d.querySelector("#lab-search");
  input.value="font"; input.dispatchEvent(new p.w.Event("input",{bubbles:true}));
  assert.equal(p.visible().length,0);
  input.value="resume"; input.dispatchEvent(new p.w.Event("input",{bubbles:true}));
  assert.equal(p.visible().length,1);
});

test("slash focuses search without hijacking typing", async t => {
  const p = await withPage(t);
  p.d.body.dispatchEvent(new p.w.KeyboardEvent("keydown",{key:"/",bubbles:true,cancelable:true}));
  assert.equal(p.d.activeElement,p.d.querySelector("#lab-search"));
  const event = new p.w.KeyboardEvent("keydown",{key:"/",bubbles:true,cancelable:true});
  p.d.activeElement.dispatchEvent(event);
  assert.equal(event.defaultPrevented,false);
});

test("preview uses actual screen / original description and close restores focus", async t => {
  const p = await withPage(t);
  const button=p.d.querySelector('[data-app="construct"] .lab-tool-preview'); button.focus(); button.click();
  assert.equal(p.d.querySelector("#lab-preview").open,true);
  assert.equal(p.d.querySelector("#lab-preview-description").textContent,p.w.WORKFLOWS[8].description);
  assert.equal(p.d.querySelector("#lab-preview-open").href,p.w.WORKFLOWS[8].link);
  assert.equal(p.d.body.classList.contains("lab-dialog-open"),true);
  p.click("#lab-preview-close");
  assert.equal(p.d.querySelector("#lab-preview").open,false);
  assert.equal(p.d.body.classList.contains("lab-dialog-open"),false);
  assert.equal(p.d.activeElement,button);
});

test("Escape closes dialog; locale updates preserve open screenshot", async t => {
  const p = await withPage(t);
  p.click('[data-app="resume"] .lab-tool-preview');
  const src=p.d.querySelector("#lab-preview-image").getAttribute("src");
  p.w.tjmLanguage.apply("en");
  assert.equal(p.d.querySelector("#lab-preview-title").textContent,"Resume Assistant");
  assert.equal(p.d.querySelector("#lab-preview-image").getAttribute("src"),src);
  assert.equal(p.d.querySelector("#lab-prototype-note").hidden,false);
  p.d.querySelector("#lab-preview-close").dispatchEvent(new p.w.KeyboardEvent("keydown",{key:"Escape",bubbles:true,cancelable:true}));
  assert.equal(p.d.querySelector("#lab-preview").open,false);
});

test("image error is visible and resets on a different preview", async t => {
  const p = await withPage(t);
  p.click("#lab-preview-selected");
  p.d.querySelector("#lab-preview-image").dispatchEvent(new p.w.Event("error"));
  assert.equal(p.d.querySelector("#lab-preview-image").hidden,true);
  assert.equal(p.d.querySelector("#lab-preview-image-error").hidden,false);
  p.click("#lab-preview-close");
  p.click('[data-app="photo"] .lab-tool-preview');
  assert.equal(p.d.querySelector("#lab-preview-image").hidden,false);
  assert.equal(p.d.querySelector("#lab-preview-image-error").hidden,true);
});

test("native shared controls remain single after many interactions", async t => {
  const p = await withPage(t);
  for (let i=0;i<5;i++) {
    p.click('[data-view="icons"]'); p.click('[data-view="fan"]');
    p.click('[data-language-choice="en"]'); p.click('[data-language-choice="zh-hans"]');
    p.click("#lab-preview-selected"); p.click("#lab-preview-close");
  }
  await new Promise(resolve => setTimeout(resolve,10));
  assert.equal(p.d.querySelectorAll(".settings-dock").length,1);
  assert.equal(p.d.querySelectorAll(".sidebar").length,1);
  assert.equal(p.d.querySelectorAll(".lab-tool-card").length,11);
  assert.equal(p.d.querySelectorAll("#lab-preview").length,1);
  assert.deepEqual(p.errors,[]);
});

test("every declared control has a meaningful accessible name", async t => {
  const p = await withPage(t);
  for (const node of p.d.querySelectorAll(".lab-page button,.lab-page a,.lab-preview button,.lab-preview a")) {
    assert.ok((node.getAttribute("aria-label") || node.textContent).trim(),node.outerHTML);
  }
  assert.equal(p.d.querySelectorAll("#lab-stage button").length,16);
  assert.equal(p.d.querySelectorAll('[tabindex="-1"]').length,0);
});

test("published entry has no experiment noindex, localhost or unpublished UI", async t => {
  const p = await withPage(t);
  assert.equal(p.d.querySelector('meta[name="robots"]'),null);
  assert.doesNotMatch(HTML, /noindex|本地实验|未发布|展示实验|127\.0\.0\.1|localhost|172\.18\.190\.165/);
  assert.equal(p.d.title,"Vibe Coding | 天将明作品集");
  assert.equal(p.d.querySelector('.mobile-header a').getAttribute("href"),"index.html#all-works");
  for (const lang of ["en","ja","zh-hans"]) {
    p.click('[data-language-choice="' + lang + '"]');
    assert.doesNotMatch(p.d.querySelector(".lab-demo-label").textContent,/EXPERIMENT|未公開|未发布/);
  }
});

test("production sidebar stays within a real Pages subpath", async t => {
  const p = await boot("",{}, "https://tianming332.github.io/JiangmingTian_Portfolio_Final/workflow.html");
  t.after(p.close);
  const nav = [...p.d.querySelectorAll(".sidebar a")];
  assert.ok(nav.length >= 8);
  for (const link of nav) {
    assert.ok(link.href.startsWith("https://tianming332.github.io/JiangmingTian_Portfolio_Final/"),link.href);
  }
  assert.equal(p.d.querySelector('.sidebar [data-site-key="workflow"]').href,
    "https://tianming332.github.io/JiangmingTian_Portfolio_Final/workflow.html");
  assert.equal(p.d.querySelectorAll("#tjm-shared-sidebar-style").length,1);
  assert.equal(p.d.querySelector("#tjm-shared-sidebar-style").href,
    "https://tianming332.github.io/JiangmingTian_Portfolio_Final/css/shared-sidebar.css");
});

test("production preferences do not inherit or overwrite experimental view state", async t => {
  const p = await withPage(t,"",{"tjm-vibe-lab-view":"icons","tjm-theme":"gray"});
  assert.equal(p.state().view,"fan");
  p.click('[data-view="icons"]');
  assert.equal(p.w.localStorage.getItem("tjm-vibe-view"),"icons");
  assert.equal(p.w.localStorage.getItem("tjm-vibe-lab-view"),"icons");
  assert.equal(p.w.localStorage.getItem("tjm-theme"),"gray");
});

test("no-JavaScript fallback exposes all real app links without a self-loop", async t => {
  const p = await withPage(t);
  const fragment = HTML.match(/<noscript>([\s\S]*?)<\/noscript>/)[1];
  const fallback = new JSDOM(fragment); t.after(() => fallback.window.close());
  const links = [...fallback.window.document.querySelectorAll("a")];
  assert.equal(links.length,11);
  assert.deepEqual(links.map(a => a.href),Array.from(p.w.WORKFLOWS,a => a.link));
  assert.ok(links.every(a => a.target === "_blank" && a.rel.includes("noopener")));
});

test("every preview and rendered icon is in the production asset folder", async t => {
  const p = await withPage(t);
  for (const app of p.w.TJM_VIBE_APPS) {
    assert.match(app.screen,/^uploads\/vibe-coding\/screens\/[^/]+\.webp$/);
    assert.ok(fs.existsSync(path.join(ROOT,app.screen)),app.screen);
  }
  for (const img of p.d.querySelectorAll(".lab-icon img")) {
    const rel = img.getAttribute("src");
    assert.match(rel,/^uploads\/vibe-coding\/icons\//);
    assert.ok(fs.existsSync(path.join(ROOT,rel)),rel);
  }
});

test("only one renderer is loaded and production resource versions are pinned", async t => {
  const p = await withPage(t);
  const sources = [...p.d.querySelectorAll("script[src]")].map(s => s.getAttribute("src"));
  assert.equal(sources.filter(s => s.startsWith("js/vibe-coding.js")).length,1);
  assert.ok(!sources.some(s => /site-render|js\/lab\.js|js\/catalog\.js/.test(s)));
  for (const rel of ["js/vibe-coding.js","data/vibe-catalog.js","data/workflows.js"]) {
    assert.ok(sources.includes(rel + "?v=20261104-vibe23"),rel);
  }
});

test("published UI does not introduce admin or generator links", async t => {
  const p = await withPage(t);
  for (const link of p.d.querySelectorAll("a[href]")) {
    const url = new URL(link.href);
    assert.doesNotMatch(url.pathname,/^\/admin(?:\/|$)/);
    assert.notEqual(url.hostname,"172.18.190.165");
  }
  assert.doesNotMatch(fs.readFileSync(path.join(ROOT,"js/vibe-coding.js"),"utf8"),/\b(fetch|XMLHttpRequest|WebSocket)\s*\(/);
});

test("asset provenance matches every deployed icon and screenshot", () => {
  const {createHash} = require("node:crypto");
  const records = JSON.parse(fs.readFileSync(path.join(ROOT,"docs/vibe-coding-assets.json"),"utf8"));
  assert.equal(records.files.length,18);
  for (const entry of records.files) {
    assert.equal(createHash("sha256").update(fs.readFileSync(path.join(ROOT,entry.file))).digest("hex"),entry.sha256);
    assert.ok(!entry.source.startsWith("/Users/"));
  }
});
