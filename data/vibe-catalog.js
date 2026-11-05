(function () {
  "use strict";
  // Display-only metadata. Original descriptions, translations and destinations stay in WORKFLOWS.
  var rows = [
    { id:"video", index:0, icon:"video", category:"media", tone:"#9273ea", name:["视频制作 Agent","動画制作 Agent","Video Agent"], english:"VIDEO AGENT", line:["把视频创意，串成完整流程。","動画のアイデアを、制作の流れへ。","From a video idea to a connected workflow."], tags:["Video","Agent"], prototype:true },
    { id:"book-cn", index:1, icon:"book", category:"type", tone:"#dc974c", name:["一键成册","ワンクリック製本","One-click Booklet"], english:"BOOKLET · CHINA", line:["让照片有顺序，让故事成册。","写真を並べ、物語を一冊に。","Bring your photos together in a booklet."], tags:["Booklet","China"], prototype:true },
    { id:"book-ai", index:2, icon:"book", category:"type", tone:"#cf8742", name:["一键成册 AI","ワンクリック製本 AI","Booklet AI"], english:"BOOKLET · AI EDITION", line:["从图片出发，让 AI 辅助排版。","写真から始める、AI レイアウト。","Start with your images. Let AI help with layout."], tags:["Booklet","AI"], prototype:true },
    { id:"image", index:3, icon:"ai", category:"design", tone:"#4699ee", name:["生图 Skill","画像生成 Skill","Image Skill"], english:"IMAGE GENERATION", line:["探索自研生图工作流。","独自の画像生成ワークフローを体験。","Explore an in-house image-generation workflow."], tags:["Image","Skill"] },
    { id:"studio-open", index:4, icon:"studio", category:"design", tone:"#d59172", name:["设计工作台 · 开源版","デザインスタジオ · OSS","Design Studio · OSS"], english:"DESIGN · OPEN SOURCE", line:["在浏览器里，完成图层与图像编辑。","ブラウザで、レイヤーと画像を編集。","A browser workspace for layers and image editing."], tags:["Editor","Open source"] },
    { id:"studio", index:5, icon:"studio", category:"design", tone:"#d58b77", name:["设计工作台 AI","デザインスタジオ AI","Design Studio AI"], english:"DESIGN · AI EDITION", line:["AI 辅助创作，细节由你掌控。","AI と一緒に、細部までデザイン。","Create with AI. Keep control of the details."], tags:["Editor","AI"] },
    { id:"layout", index:6, icon:"layout", category:"type", tone:"#429bec", name:["版式实验室","レイアウトラボ","Layout Lab"], english:"TYPE & LAYOUT", line:["让文字，找到合适的位置。","言葉に、ふさわしい場所を。","Find the right place for every word."], tags:["Layout","Typography"] },
    { id:"font", index:7, icon:"font", category:"type", tone:"#f27798", name:["字体工作室","フォントスタジオ","Font Studio"], english:"FONT STUDIO", line:["从一笔一画，长出新的字形。","一画ずつ、新しい文字のかたちへ。","New letterforms, one stroke at a time."], tags:["Typeface","OTF"] },
    { id:"construct", index:8, icon:"construct", category:"design", tone:"#9caaa5", name:["规范制图","コンストラクション","Construction Studio"], english:"CONSTRUCTION", line:["把图形直觉，变成几何秩序。","かたちの直感を、幾何学の秩序へ。","Turn visual intuition into geometric order."], tags:["Geometry","SVG"] },
    { id:"photo", index:9, icon:"photo-frame", category:"media", tone:"#e9bb67", name:["相纸工作室","フォトフレーム","Photo Frame Studio"], english:"PHOTO FRAME", line:["让一张照片，多一点被珍藏的感觉。","一枚の写真を、大切な一枚に。","Give a photograph the feeling of a keepsake."], tags:["Photo","3D preview"] },
    { id:"resume", index:10, icon:"resume", category:"office", tone:"#a99ee8", name:["简历与岗位助手","履歴書アシスタント","Resume Assistant"], english:"RESUME & CAREER", line:["把经历，整理成清楚的表达。","経験を、伝わる言葉に。","Give your experience a clearer voice."], tags:["Resume","Writing"], prototype:true }
  ];
  window.TJM_VIBE_APPS = rows.map(function (row) {
    var original = window.WORKFLOWS[row.index];
    return Object.freeze(Object.assign({}, row, {
      source: original,
      url: original.link,
      screen: "uploads/vibe-coding/screens/" + original.cover.split("/").pop().split("?")[0].replace(/\.png$/, ".webp")
    }));
  });
  window.TJM_VIBE_FEATURED = ["layout","construct","font","photo","resume"];
}());
