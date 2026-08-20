/* 17 个作品详情页已全部发布；主站卡片始终使用 GitHub Pages 网址。 */
(function () {
  "use strict";
  var repositories = {
    "hangzhou-linxin": "TIAN-hangzhou-linxin",
    "nanshan-wellness": "TIAN-nanshan-wellness",
    "detection-brand": "TIAN-detection-brand",
    "lanyuan-cable": "TIAN-lanyuan-cable",
    "hemei-tianyi": "TIAN-hemei-tianyi",
    "yanbowen-noodles": "TIAN-yanbowen-noodles",
    "applied-project-07": "TIAN-applied-project-07",
    "applied-project-08": "TIAN-applied-project-08",
    "migraine-visual-a1": "TIAN-migraine-visual-a1",
    "dream-visual-c1": "TIAN-dream-visual-c1",
    "meteorite-information-b1": "TIAN-meteorite-information-b1",
    "accessible-touch-d1": "TIAN-accessible-touch-d1",
    "eryu-k1": "TIAN-eryu-k1",
    "wawa-k2": "TIAN-wawa-k2",
    "ceramic-information-k3": "TIAN-ceramic-information-k3",
    "bara-kei-k4": "TIAN-bara-kei-k4",
    "portfolio-project-17": "TIAN-portfolio-project-17"
  };
  window.WORK_DETAIL_LINKS = Object.freeze(Object.keys(repositories).reduce(function (result, id) {
    var repository = repositories[id];
    var live = "https://tianming332.github.io/" + repository + "/";
    result[id] = Object.freeze({
      local: live,
      live: live
    });
    return result;
  }, {}));
  window.resolveWorkDetailLink = function (id) {
    var record = window.WORK_DETAIL_LINKS[id];
    if (record) return record.live;
    return "https://tianming332.github.io/JiangmingTian_Portfolio_Final/#all-works";
  };
}());
