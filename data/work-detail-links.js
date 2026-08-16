/* 17 个作品详情页已全部发布；主站卡片始终使用 GitHub Pages 网址。 */
(function () {
  "use strict";
  var records = {
    "hangzhou-linxin": "https://tianming332.github.io/TIAN-hangzhou-linxin/",
    "nanshan-wellness": "https://tianming332.github.io/TIAN-nanshan-wellness/",
    "detection-brand": "https://tianming332.github.io/TIAN-detection-brand/",
    "lanyuan-cable": "https://tianming332.github.io/TIAN-lanyuan-cable/",
    "hemei-tianyi": "https://tianming332.github.io/TIAN-hemei-tianyi/",
    "yanbowen-noodles": "https://tianming332.github.io/TIAN-yanbowen-noodles/",
    "applied-project-07": "https://tianming332.github.io/TIAN-applied-project-07/",
    "applied-project-08": "https://tianming332.github.io/TIAN-applied-project-08/",
    "migraine-visual-a1": "https://tianming332.github.io/TIAN-migraine-visual-a1/",
    "dream-visual-c1": "https://tianming332.github.io/TIAN-dream-visual-c1/",
    "meteorite-information-b1": "https://tianming332.github.io/TIAN-meteorite-information-b1/",
    "accessible-touch-d1": "https://tianming332.github.io/TIAN-accessible-touch-d1/",
    "eryu-k1": "https://tianming332.github.io/TIAN-eryu-k1/",
    "wawa-k2": "https://tianming332.github.io/TIAN-wawa-k2/",
    "ceramic-information-k3": "https://tianming332.github.io/TIAN-ceramic-information-k3/",
    "bara-kei-k4": "https://tianming332.github.io/TIAN-bara-kei-k4/",
    "portfolio-project-17": "https://tianming332.github.io/TIAN-portfolio-project-17/"
  };
  window.WORK_DETAIL_LINKS = Object.freeze(Object.keys(records).reduce(function (result, id) {
    result[id] = Object.freeze({ local: records[id], live: records[id] });
    return result;
  }, {}));
  window.resolveWorkDetailLink = function (id) {
    var record = window.WORK_DETAIL_LINKS[id];
    return record ? record.live : "https://tianming332.github.io/JiangmingTian_Portfolio_Final/#all-works";
  };
}());
