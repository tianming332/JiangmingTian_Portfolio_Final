(function () {
  "use strict";

  var themeNames = { white: "白", gray: "灰", black: "黑" };
  var originalTexts = new WeakMap();
  var originalAttributes = new WeakMap();
  var currentLanguage = "zh-hans";
  var currentTheme = "white";

  var english = {
    "天将明": "Tian Jiangming", "所有作品": "All Works", "落地項目": "Applied Projects", "落地项目": "Applied Projects",
    "年度作品集": "Annual Portfolios", "畫廊": "Gallery", "画廊": "Gallery", "AI视频": "AI Video", "關於我": "About", "关于我": "About",
    "作品": "Works", "集合": "Collections", "信息": "Info", "創作方向": "Creative Direction", "创作方向": "Creative Direction",
    "作品類型": "Work Type", "作品类型": "Work Type", "全部": "All", "AI 創作": "AI Creation", "AI 创作": "AI Creation",
    "視覺設計": "Visual Design", "视觉设计": "Visual Design", "交互設計": "Interaction Design", "交互设计": "Interaction Design",
    "平面設計": "Graphic Design", "平面设计": "Graphic Design", "裝置設計": "Installation", "装置设计": "Installation",
    "信息可視化": "Information Visualization", "信息可视化": "Information Visualization", "AI 圖像": "AI Image", "AI 图像": "AI Image",
    "程序": "Program", "研究報告": "Research Report", "研究报告": "Research Report",
    "書籍版式": "Editorial", "书籍版式": "Editorial", "畫冊": "Album", "画册": "Album", "圖形設計": "Graphic Design", "图形设计": "Graphic Design",
    "攝影": "Photography", "摄影": "Photography", "AI 動畫": "AI Animation", "AI 动画": "AI Animation", "動效": "Motion", "动效": "Motion",
    "矢量": "Vector", "體驗設計": "Experience Design", "体验设计": "Experience Design", "清除篩選": "Clear Filters", "清除筛选": "Clear Filters",
    "當前顯示：全部作品": "Showing: All Works", "当前显示：全部作品": "Showing: All Works", "已落地": "Launched", "項目標籤": "Project Tags", "项目标签": "Project Tags",
    "頁面配色 / THEME": "THEME", "页面配色 / THEME": "THEME", "語言 / LANGUAGE": "LANGUAGE", "语言 / LANGUAGE": "LANGUAGE",
    "白": "White", "灰": "Gray", "黑": "Black", "返回所有作品": "Back to All Works", "上一個": "Previous", "下一個": "Next",
    "關於我 / ABOUT": "ABOUT", "关于我 / ABOUT": "ABOUT", "大家好，我是天将明。": "Hello, I’m Tian Jiangming.",
    "設計師／視覺創作者／作品集所有者": "Designer / Visual Creator / Portfolio Owner",
    "设计师／视觉创作者／作品集所有者": "Designer / Visual Creator / Portfolio Owner",
    "我是天将明，一名關注數字視覺體驗的設計師與視覺創作者。": "I am Tian Jiangming, a designer and visual creator focused on digital visual experiences.",
    "我是天将明，一名关注数字视觉体验的设计师与视觉创作者。": "I am Tian Jiangming, a designer and visual creator focused on digital visual experiences.",
    "我擁有視覺傳達設計背景，擅長品牌視覺、UI/UX 設計、圖標設計、界面規劃與視覺系統構建。在設計過程中，我重視從調研、用戶需求、視覺風格到最終呈現的完整邏輯，希望通過清晰的視覺語言，讓複雜的信息變得更容易理解。": "I have a background in visual communication design, with experience in brand identity, UI/UX, icon design, interface planning, and visual systems. My process connects research, user needs, visual direction, and final delivery into a clear and complete design logic.",
    "我也持續關注 AI 與設計的結合，學習並使用 Stable Diffusion、ComfyUI 以及 LLM 工具，將 AI 融入靈感生成、方案整理、視覺探索和設計流程優化之中。我希望在不斷變化的數字環境中，持續探索新的表達方式，創造更有吸引力、更有邏輯感的視覺體驗。": "I continue to explore the intersection of AI and design through Stable Diffusion, ComfyUI, and LLM tools—using AI for ideation, concept organization, visual exploration, and workflow improvement. I aim to create engaging and logically structured experiences in a constantly changing digital environment.",
    "本站均為原創內容，作品均已發表。歡迎通過以下方式與我聯繫，期待與您交流合作！": "All content on this site is original and the works have been published. Feel free to contact me for conversation and collaboration.",
    "個人資料部分": "Profile", "个人资料部分": "Profile", "設計軟件": "Design Software", "设计软件": "Design Software",
    "信息技術": "Information Technology", "信息技术": "Information Technology", "辦公軟件": "Productivity Tools", "办公软件": "Productivity Tools",
    "聯繫方式": "Contact", "联系方式": "Contact", "影像實驗與生成式敘事": "Moving Image Experiments & Generative Narratives",
    "按年份回看完整作品集": "Browse Complete Portfolios by Year", "從概念到真實使用": "From Concept to Real Use",
    "隨意看看，停在喜歡的畫面。": "Look around, and pause on what you like.",
    "這是一個不必急著閱讀的輕鬆空間。工作、生活、攝影與作品的片段以圖片並置；用滾輪拉近或拉遠，懸停選中，點開後可左右拖動畫面慢慢觀看。": "A relaxed space with no need to hurry. Fragments of work, life, photography, and projects sit side by side—scroll to zoom, hover to select, and open an image to drag through it slowly.",
    "這裡匯總已上線、已實施或可體驗的項目。每個項目同時作為獨立作品出現在首頁，並以「已落地」角標標註。": "A collection of launched, implemented, and experiential projects. Each project also appears independently on the homepage with a Launched label.",
    "這裡保存年度作品集、PDF 或獨立網頁。單項作品請從「所有作品」瀏覽。": "Annual portfolios, PDFs, and standalone sites are collected here. Browse individual projects through All Works.",
    "實景拍攝、AI 改造、生成式動畫與短片練習的專題集合。代表項目也可以作為單項作品進入首頁。": "A collection of live-action footage, AI transformations, generative animation, and short-film studies. Selected projects also appear individually on the homepage.",
    "落地項目": "Applied", "品牌識別": "Brand Identity", "智慧社區": "Smart Community", "運動健康": "Sports & Wellness",
    "生態檢測": "Ecological Detection", "工業科技": "Industrial Technology", "公共文旅": "Public Culture & Tourism", "餐飲品牌": "Food Brand",
    "資料待補": "Content Pending", "感官設計": "Sensory Design", "痛覺可視化": "Pain Visualization", "夢境拼圖": "Dream Puzzle",
    "數據敘事": "Data Narrative", "跨媒介": "Cross-media", "無障礙設計": "Accessibility Design", "觸覺交互": "Tactile Interaction",
    "物聯網": "Internet of Things", "用戶體驗": "User Experience", "AI 輔助創作": "AI-assisted Creation", "陶瓷文化": "Ceramic Culture",
    "文化研究": "Cultural Research", "信息設計": "Information Design", "書籍設計": "Book Design", "版式練習": "Editorial Study",
    "把鄰里連接、智慧科技與家園社區轉化為溫暖、穩定的品牌識別。": "A warm and dependable identity translating neighborhood connection, smart technology, and community life.",
    "以運動、平衡與自然共生，建立舒展的健康生活品牌印象。": "A relaxed wellness identity built around movement, balance, and coexistence with nature.",
    "以盾牌、樹葉、水滴與循環箭頭，表達科技守護生態的行業屬性。": "A shield, leaf, water drop, and circular arrow express technology protecting the environment.",
    "從字母與線纜連接中提煉工業科技品牌符號。": "An industrial technology symbol distilled from letterforms and cable connections.",
    "以山海交匯、陽光海岸建立開放明亮的區域公共品牌。": "An open regional identity shaped by mountains, sea, sunlight, and coastline.",
    "以中文字形、山野植物與山水元素建立自然食品品牌。": "A natural food brand combining Chinese letterforms, mountain plants, and landscape imagery.",
    "已預留為獨立作品卡；補入真實標題、說明與圖片後即可完整展示。": "Reserved as an independent project card and ready for its final title, description, and images.",
    "將不可見的痛覺週期轉化為可以被閱讀、被理解的視覺語言。": "Translating invisible cycles of pain into a visual language that can be read and understood.",
    "以形狀、節奏與拼圖，重組夢境裡難以言說的事件和感受。": "Reconstructing indescribable dream events and emotions through shape, rhythm, and puzzles.",
    "從隕石的光譜特性與透光率出發，建立五十種宇宙元素的圖像系統。": "A visual system for fifty cosmic elements based on meteorite spectra and light transmission.",
    "以幾何形態、觸覺與聲音，幫助視覺障礙兒童識別動物。": "Helping visually impaired children recognize animals through geometry, touch, and sound.",
    "結合物聯網與 UX 設計的陪伴式智能產品體驗。": "A companion-product experience combining IoT and UX design.",
    "以 AI 輔助視覺探索，為傳統陶器上的祥獸建立當代 IP 形象。": "AI-assisted visual exploration creating a contemporary character from auspicious creatures on traditional ceramics.",
    "以信息可視化梳理不同歷史時期的陶瓷發展與工藝變化。": "Visualizing the development and craft evolution of ceramics across historical periods.",
    "結合《薔薇刑》寫真集與三島由紀夫生平的編輯設計練習。": "An editorial design study combining the photography of Barakei with the life of Yukio Mishima.",
    "拖動、連接、選擇。": "Drag, Connect, Select.", "拖动、连接、选择。": "Drag, Connect, Select.",
    "請選擇感興趣的詞。它們既是導航，也是作品之間的關係。": "Choose three words. They guide the portfolio and reveal connections between works.",
    "請選擇 3 個標籤（0/3）": "Choose 3 tags (0/3)", "隨機探索": "Random Explore", "按此選擇看作品": "View Selected Works"
  };
  Object.assign(english, {
    "作品 / WORKS": "WORKS", "獨立站 / SITES": "SITES", "關於 / ABOUT": "ABOUT",
    "拖動詞語改變關係圖的形態": "Drag the words to reshape the relationship map",
    "線條表示標籤共享同一件作品": "Lines show tags shared by the same project",
    "已選擇 / SELECTED": "SELECTED", "尚未選擇": "None selected",
    "選擇完成，正在進入": "Selection complete. Entering…", "還需選擇": "More selections needed:", "個標籤": "tags",
    "找到": "Found", "個項目": "projects", "個匹配項目優先": "matching projects prioritized", "當前篩選：": "Current filters: ",
    "菜單 / MENU": "MENU", "收起左側欄目": "Collapse sidebar", "展開左側欄目": "Expand sidebar",
    "收起右上角設定": "Collapse settings", "展開右上角設定": "Expand settings",
    "概念項目": "Concept", "原型項目": "Prototype", "已實施": "Implemented", "已展出": "Exhibited",
    "視覺設計 × AI 應用": "VISUAL DESIGN × AI", "视觉设计 × AI 应用": "VISUAL DESIGN × AI",
    "© 天将明個人作品集": "© Tian Jiangming Portfolio", "© 天将明个人作品集": "© Tian Jiangming Portfolio",
    "落地項目 / APPLIED": "APPLIED PROJECTS", "落地项目 / APPLIED": "APPLIED PROJECTS",
    "關於 / ABOUT": "ABOUT", "关于 / ABOUT": "ABOUT",
    "AI视频 / VIDEO ARCHIVE": "AI VIDEO ARCHIVE",
    "本页汇总实景拍摄、AI 改造、生成式动画与短片练习；点击下方卡片后，才会进入独立的 AI视频影像站。": "This page brings together live-action footage, AI transformations, generative animation, and short-film studies. Open the card below to enter the standalone AI Video archive.",
    "本页汇总实景拍摄、AI 改造、生成式动画与短片练习；点击下方卡片后，才会进入独立的 AI视频影像站。": "This page brings together live-action footage, AI transformations, generative animation, and short-film studies. Open the card below to enter the standalone AI Video archive.",
    "我是天将明，一名关注数字视觉体验的设计师与视觉创作者。": "I am Tian Jiangming, a designer and visual creator focused on digital visual experiences.",
    "我拥有视觉传达设计背景，擅长品牌视觉、UI/UX 设计、图标设计、界面规划与视觉系统构建。在设计过程中，我重视从调研、用户需求、视觉风格到最终呈现的完整逻辑，希望通过清晰的视觉语言，让复杂的信息变得更容易理解。": "I have a background in visual communication design, with experience in brand identity, UI/UX, icon design, interface planning, and visual systems. My process connects research, user needs, visual direction, and final delivery into a clear and complete design logic.",
    "我也持续关注 AI 与设计的结合，学习并使用 Stable Diffusion、ComfyUI 和 LLM 工具，将 AI 融入灵感生成、方案整理、视觉探索与设计流程优化。我开发过 AI 短剧脚本转写、AI 语音检测等 Web 工具，也尝试过由 Agent 驱动的 AI 短剧全流程制作。我希望在不断变化的数字环境中持续探索新的表达方式，创造更有吸引力、更有逻辑感的视觉体验。": "I continue to explore the intersection of AI and design through Stable Diffusion, ComfyUI, and LLM tools. I have developed web workflows for AI short-drama script transcription and AI voice detection, and experimented with agent-driven end-to-end AI short-drama production. I aim to create engaging, logically structured visual experiences in a constantly changing digital environment.",
    "本站均为原创内容，作品均已发表。欢迎通过以下方式与我联系，期待与您交流合作！": "All content on this site is original and the works have been published. Feel free to contact me for conversation and collaboration.",
    "个人资料部分 / PROFILE SECTIONS": "PROFILE", "项目内容 / PROJECT CONTENT": "PROJECT CONTENT",
    "没有找到这个项目": "Project not found", "请返回所有作品继续浏览。": "Return to All Works to continue browsing.",
    "内容待补充": "Content pending", "关闭": "Close", "标签 / TAGS": "TAGS",
    "左右拖动图片 / DRAG HORIZONTALLY": "DRAG HORIZONTALLY", "关闭图片": "Close image",
    "选择作品标签": "Choose portfolio tags", "主导航": "Main navigation", "打开菜单": "Open menu",
    "可缩放作品图片墙": "Zoomable portfolio image wall", "作品画廊": "Portfolio gallery",
    "图片放大查看": "Enlarged image viewer", "放大查看的画廊图片": "Enlarged gallery image"
  });
  Object.assign(english, {
    "收起左侧栏目": "Collapse sidebar", "展开左侧栏目": "Expand sidebar",
    "收起右上角设置": "Collapse settings", "展开右上角设置": "Expand settings",
    "拖動、連接、": "Drag, connect,", "選擇。": "select.",
    "IP 形象": "IP Character", "Web 工具": "Web Tool", "內容待補充": "Content pending", "内容待补充": "Content pending",
    "待補充": "To be added", "待补充": "To be added"
  });

  var titleEnglish = {
    "杭州鄰芯": "Hangzhou Linxin", "南山運動生活館": "Nanshan Sports & Wellness", "蒂克森": "Detection Ecology",
    "纜之源": "Lanyuan Cable", "和美天一": "He Mei Tian Yi", "閆博文山野菜雜麵條": "Yanbowen Noodles",
    "落地項目 07（資料待補）": "Implemented Project 07", "落地項目 08（資料待補）": "Implemented Project 08",
    "偏頭痛可視化": "Migraine Visualization", "夢可視化": "Dream Visualization", "隕石的信息可視化": "Meteorite Information",
    "視覺障礙觸摸識別裝置": "Tactile Accessibility Device", "ERYU 智能陪伴產品": "ERYU Smart Companion",
    "瓦瓦": "WAWA", "陶瓷器發展信息圖表": "Ceramic History Infographic", "《薔薇刑》重排": "Barakei Editorial Redesign"
  };

  var traditionalToSimplified = {
    "視":"视","覺":"觉","設":"设","計":"计","實":"实","際":"际","項":"项","目":"目","頻":"频","關":"关","於":"于","個":"个","資":"资","料":"料","軟":"软","體":"体","圖":"图","標":"标","規":"规","劃":"划","與":"与","學":"学","術":"术","辦":"办","聯":"联","繫":"系","應":"应","用":"用","創":"创","選":"选","擇":"择","動":"动","書":"书","冊":"册","攝":"摄","驗":"验","當":"当","顯":"显","篩":"筛","傳":"传","達":"达","構":"构","建":"建","過":"过","程":"程","從":"从","調":"调","戶":"户","風":"风","終":"终","現":"现","邏":"逻","輯":"辑","過":"过","讓":"让","複":"复","雜":"杂","變":"变","續":"续","習":"习","並":"并","將":"将","優":"优","環":"环","境":"境","達":"达","為":"为","發":"发","佈":"布","歡":"欢","這":"这","裡":"里","匯":"汇","總":"总","線":"线","條":"条","頁":"页","顏":"颜","色":"色","開":"开","閉":"闭","還":"还","需":"需","隨":"随","機":"机","進":"进","覽":"览","數":"数","據":"据","響":"响","寫":"写","薔":"蔷","礙":"碍","觸":"触","識":"识","產":"产","隕":"陨","夢":"梦","鄰":"邻","纜":"缆","閆":"闫","麵":"面","館":"馆","異":"异","時":"时","間":"间","號":"号","導":"导","覽":"览","謂":"谓","屬":"属","類":"类","狀":"状","態":"态","顯":"显","訊":"讯","檔":"档"
  };
  Object.assign(traditionalToSimplified, {
    "畫":"画","廊":"廊","請":"请","詞":"词","們":"们","連":"连","籤":"签","係":"系","單":"单","獨":"独","註":"注","網":"网","瀏":"浏",
    "練":"练","專":"专","題":"题","擁":"拥","長":"长","結":"结","靈":"灵","斷":"断","內":"内","邊":"边","轉":"转","譯":"译","階":"阶",
    "組":"组","讀":"读","點":"点","預":"预","復":"复","塊":"块","來":"来","護":"护","準":"准","義":"义","輛":"辆","務":"务","備":"备",
    "獸":"兽","質":"质","脈":"脉","龐":"庞","編":"编","飾":"饰","較":"较","節":"节","運":"运","勢":"势","葉":"叶","輕":"轻","鬆":"松",
    "穩":"稳","輸":"输","車":"车","陽":"阳","彙":"汇","灣":"湾","聲":"声","兒":"儿","話":"话","習":"习","歷":"历","器":"器","雖":"虽",
    "層":"层","張":"张","記":"记","錄":"录","暫":"暂","圓":"圆","隊":"队","湧":"涌","閃":"闪","銀":"银","藍":"蓝","紅":"红","礦":"矿",
    "處":"处","極":"极","紋":"纹","樹":"树","鏡":"镜","鎧":"铠","霧":"雾","門":"门","鳥":"鸟","將":"将","東":"东","則":"则","寫":"写",
    "緊":"紧","躍":"跃","資訊":"信息","築":"筑","體":"体","號":"号","並":"并","幾":"几","後":"后","歡":"欢","啟":"启","輔":"辅",
    "補":"补","標":"标","題":"题","說":"说","這":"这","個":"个","頁":"页","裡":"里","覽":"览","項":"项","種":"种",
    "軌":"轨","墜":"坠"
  });

  var simplifiedToTraditional = {};
  Object.keys(traditionalToSimplified).forEach(function (traditional) {
    var simplified = traditionalToSimplified[traditional];
    if (traditional.length === 1 && simplified.length === 1 && traditional !== simplified && !simplifiedToTraditional[simplified]) {
      simplifiedToTraditional[simplified] = traditional;
    }
  });
  // These simplified characters have multiple context-dependent traditional forms.
  // Keep the shared form here; explicit data-i18n text handles context-sensitive wording.
  ["面", "系", "注"].forEach(function (char) { delete simplifiedToTraditional[char]; });

  function simplify(text) {
    return Array.from(text).map(function (char) { return traditionalToSimplified[char] || char; }).join("");
  }

  function traditionalize(text) {
    return Array.from(text).map(function (char) { return simplifiedToTraditional[char] || char; }).join("");
  }

  function englishText(text) {
    var trimmed = text.trim();
    var translated = english[trimmed] || titleEnglish[trimmed];
    if (!translated) {
      translated = trimmed;
      Object.keys(english).sort(function (a, b) { return b.length - a.length; }).forEach(function (key) {
        translated = translated.split(key).join(english[key]);
      });
    }
    return text.replace(trimmed, translated);
  }

  function mediaEnglishText(text, element) {
    var translated = englishText(text);
    if (!/[\u3400-\u9fff]/.test(translated) || !element || !element.closest) return translated;
    var figure = element.closest("figure");
    if (!figure) return translated;
    var marker = figure.querySelector("figcaption span:first-child");
    var suffix = marker && !/[\u3400-\u9fff]/.test(marker.textContent) ? marker.textContent.trim() : "";
    return "Project image" + (suffix ? " " + suffix : "");
  }

  function translateI18nElement(element, language) {
    if (!element || element.nodeType !== 1 || !element.hasAttribute("data-i18n")) return;
    var suffix = language === "zh-hans" ? "hans" : (language === "zh-hant" ? "hant" : "en");
    var value = element.getAttribute("data-i18n-" + suffix);
    if (value != null) element.textContent = language === "zh-hant" ? traditionalize(value) : value;
  }

  function translateI18nElements(root, language) {
    if (!root || root.nodeType !== 1) return;
    translateI18nElement(root, language);
    root.querySelectorAll("[data-i18n]").forEach(function (element) { translateI18nElement(element, language); });
  }

  function translateTextNode(node, language) {
    if (!node || node.nodeType !== 3 || !node.nodeValue.trim()) return;
    var parent = node.parentElement;
    if (!parent || parent.closest("script,style,.language-options,[data-i18n]")) return;
    if (!originalTexts.has(node)) originalTexts.set(node, node.nodeValue);
    var original = originalTexts.get(node);
    node.nodeValue = language === "zh-hans" ? simplify(original) : (language === "en" ? mediaEnglishText(original, parent) : traditionalize(original));
  }

  function translateAttributes(element, language) {
    if (!element || element.nodeType !== 1) return;
    var names = ["title", "aria-label", "alt", "placeholder"];
    var originals = originalAttributes.get(element);
    if (!originals) { originals = {}; originalAttributes.set(element, originals); }
    names.forEach(function (name) {
      if (!element.hasAttribute(name)) return;
      if (originals[name] == null) originals[name] = element.getAttribute(name);
      var original = originals[name];
      element.setAttribute(name, language === "zh-hans" ? simplify(original) : (language === "en" ? mediaEnglishText(original, element) : traditionalize(original)));
    });
  }

  function translateTree(root, language) {
    if (!root) return;
    if (root.nodeType === 3) { translateTextNode(root, language); return; }
    translateAttributes(root, language);
    translateI18nElements(root, language);
    root.querySelectorAll("[title],[aria-label],[alt],[placeholder]").forEach(function (element) { translateAttributes(element, language); });
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) translateTextNode(node, language);
  }

  function applyLanguage() {
    currentLanguage = "zh-hans";
    document.documentElement.lang = "zh-CN";
    document.body.dataset.language = currentLanguage;
    translateTree(document.body, currentLanguage);
    var pageTitle = document.body.getAttribute("data-title-hans");
    if (pageTitle) document.title = pageTitle;
    document.dispatchEvent(new CustomEvent("tjm:languagechange", { detail: { language: currentLanguage } }));
  }

  function applyTheme(theme) {
    var next = themeNames[theme] ? theme : "white";
    currentTheme = next;
    document.body.dataset.theme = next;
    document.querySelectorAll("[data-theme-choice]").forEach(function (button) {
      var active = button.dataset.themeChoice === next;
      button.classList.toggle("active", active); button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    try { localStorage.setItem("tjm-theme", next); } catch (error) { /* no-op */ }
  }

  function setupSettings() {
    var settings = document.createElement("div");
    settings.className = "settings-dock";
    settings.innerHTML = '<div class="theme-control"><span>页面配色 / THEME</span><div class="theme-options">' + Object.keys(themeNames).map(function (key) {
        var labels = key === "white" ? ["白", "白", "White"] : (key === "gray" ? ["灰", "灰", "Gray"] : ["黑", "黑", "Black"]);
        return '<button type="button" data-theme-choice="' + key + '"><i></i><span>' + labels[0] + '</span></button>';
      }).join("") + '</div></div>';

    var settingsContent = document.createElement("div");
    settingsContent.className = "settings-content";
    while (settings.firstChild) settingsContent.appendChild(settings.firstChild);

    var settingsToggle = document.createElement("button");
    settingsToggle.type = "button";
    settingsToggle.className = "settings-toggle";
    settingsToggle.setAttribute("data-settings-toggle", "");
    settingsToggle.setAttribute("aria-label", "收起右上角设置");
    settingsToggle.innerHTML = '<span aria-hidden="true">&gt;</span><span class="visually-hidden">收起右上角设置</span>';
    settings.appendChild(settingsToggle);
    settings.appendChild(settingsContent);

    document.body.appendChild(settings);
    settings.addEventListener("click", function (event) {
      var toggle = event.target.closest("[data-settings-toggle]");
      if (toggle) {
        setSettingsCollapsed(!settings.classList.contains("settings-collapsed"));
        return;
      }
      var theme = event.target.closest("[data-theme-choice]");
      if (theme) applyTheme(theme.dataset.themeChoice);
    });
    var savedTheme = "white", savedSettingsCollapsed = false;
    try {
      var query = new URLSearchParams(location.search);
      savedTheme = query.get("theme") || localStorage.getItem("tjm-theme") || "white";
      localStorage.removeItem("tjm-language-v2");
      savedSettingsCollapsed = localStorage.getItem("tjm-settings-dock") === "collapsed";
    } catch (error) { /* no-op */ }

    function setSettingsCollapsed(collapsed) {
      settings.classList.toggle("settings-collapsed", collapsed);
      settingsToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      settingsToggle.setAttribute("aria-label", collapsed ? "展开右上角设置" : "收起右上角设置");
      settingsToggle.querySelector("[aria-hidden]").textContent = collapsed ? "<" : ">";
      settingsToggle.querySelector(".visually-hidden").textContent = collapsed ? "展开右上角设置" : "收起右上角设置";
      try { localStorage.setItem("tjm-settings-dock", collapsed ? "collapsed" : "open"); } catch (error) { /* no-op */ }
    }

    applyTheme(savedTheme); applyLanguage();
    setSettingsCollapsed(savedSettingsCollapsed);

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) { mutation.addedNodes.forEach(function (node) { translateTree(node, currentLanguage); }); });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.tjmLanguage = { apply: applyLanguage, current: function () { return "zh-hans"; } };
    window.tjmTheme = { apply: applyTheme, current: function () { return currentTheme; } };
  }

  function setupPreferenceLinks() {
    document.addEventListener("click", function (event) {
      var anchor = event.target.closest("a[data-preserve-preferences],a[data-site-key]");
      if (!anchor || !anchor.href || /^mailto:|^tel:/i.test(anchor.href)) return;
      try {
        var url = new URL(anchor.href, location.href);
        url.searchParams.delete("lang");
        url.searchParams.set("theme", currentTheme);
        if (anchor.hasAttribute("data-main-return")) url.searchParams.set("from", "project");
        anchor.href = url.href;
      } catch (error) { /* no-op */ }
    }, true);
  }

  function setupSidebar() {
    var sidebar = document.querySelector(".sidebar");
    var page = document.querySelector(".page-holder");
    if (!sidebar || !page) return;
    var inner = sidebar.querySelector(".sidebar-inner");
    if (!inner.querySelector(".sidebar-note")) {
      var note = document.createElement("div"); note.className = "px-4 py-4 sidebar-note";
      note.innerHTML = "VISUAL COMMUNICATION<br>ARTIFICIAL INTELLIGENCE"; inner.appendChild(note);
    }

    if (!document.querySelector("[data-gallery-nav]")) {
      var collectionsLink = inner.querySelector('[data-site-key="annual"],.sidebar-link[href="collections.html"]');
      if (collectionsLink) {
        var galleryLink = document.createElement("a");
        galleryLink.className = "sidebar-link" + (/gallery\.html$/i.test(location.pathname) ? " active" : "");
        galleryLink.href = (window.TJM_SITES && window.TJM_SITES.gallery) || "gallery.html";
        galleryLink.setAttribute("data-gallery-nav", "");
        galleryLink.innerHTML = '画廊 <small>GALLERY</small>';
        collectionsLink.insertAdjacentElement("afterend", galleryLink);
      }
    }

    var collapse = document.createElement("button");
    collapse.type = "button"; collapse.className = "sidebar-collapse";
    collapse.innerHTML = '<span aria-hidden="true">&lt;</span><span class="visually-hidden">收起左侧栏目</span>';
    collapse.setAttribute("aria-label", "收起左侧栏目"); sidebar.appendChild(collapse);

    var expand = document.createElement("button");
    expand.type = "button"; expand.className = "sidebar-expand";
    expand.innerHTML = '<span aria-hidden="true">&gt;</span><span class="visually-hidden">展开左侧栏目</span>';
    expand.setAttribute("aria-label", "展开左侧栏目"); document.body.appendChild(expand);

    var savedCollapsed = false;
    try { savedCollapsed = localStorage.getItem("tjm-sidebar") === "collapsed"; } catch (error) { /* no-op */ }
    if (savedCollapsed && innerWidth > 991) document.body.classList.add("sidebar-collapsed");

    function updateToggle() {
      var mobileOpen = sidebar.classList.contains("active");
      var collapsed = document.body.classList.contains("sidebar-collapsed");
      expand.classList.toggle("visible", innerWidth <= 991 ? !mobileOpen : collapsed);
    }
    collapse.addEventListener("click", function () {
      if (innerWidth <= 991) sidebar.classList.remove("active");
      else { document.body.classList.add("sidebar-collapsed"); try { localStorage.setItem("tjm-sidebar", "collapsed"); } catch (error) { /* no-op */ } }
      updateToggle();
    });
    expand.addEventListener("click", function () {
      if (innerWidth <= 991) sidebar.classList.add("active");
      else { document.body.classList.remove("sidebar-collapsed"); try { localStorage.setItem("tjm-sidebar", "open"); } catch (error) { /* no-op */ } }
      updateToggle();
    });
    var toggler = document.querySelector(".navbar-toggler");
    if (toggler) toggler.addEventListener("click", function () { sidebar.classList.toggle("active"); updateToggle(); });
    document.addEventListener("click", function (event) {
      var anchor = event.target.closest('a[href*="index.html#all-works"]');
      if (!anchor || document.body.classList.contains("welcome-open")) return;
      try { sessionStorage.setItem("tjm-skip-welcome-once", "1"); } catch (error) { /* no-op */ }
    });
    addEventListener("resize", updateToggle); updateToggle(); setupPreferenceLinks(); setupSettings();
  }

  document.addEventListener("DOMContentLoaded", setupSidebar);
  document.documentElement.style.setProperty("--vh", (window.innerHeight * 0.01) + "px");
}());
