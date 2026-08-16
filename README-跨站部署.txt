天将明作品网站｜固定接口与部署结构
================================

固定公开地址
------------
主站
https://tianming332.github.io/JiangmingTian_Portfolio_Final/

年度作品集
https://tianming332.github.io/TianJiangming-s-portfolio/

Tian_vidos
https://tianming332.github.io/Tian_vidos/

落地项目站
https://tianming332.github.io/Applied-Brand-Desig_wed/

主站内画廊
https://tianming332.github.io/JiangmingTian_Portfolio_Final/gallery.html

维护位置
--------
- 主站固定接口：data/site-links.js
- 年度站、Tian_vidos、落地项目站各自也保留同名 site-links.js。
- 四个站的跳转会根据环境自动选择：本机使用相对路径，GitHub Pages 使用上述固定地址。
- TianJiangming_Gallery 不再作为独立站；画廊已经回到主站 gallery.html。

17 个详情页
-----------
- 主站卡片接口：data/work-detail-links.js。
- 每条记录包含 local 和 live。
- local 保持相对路径，不使用 file:/// 绝对地址。
- live 由每个详情页实际发布地址决定；未填写时线上会安全回到主站内部项目页。
- 每个详情页的主导航已使用固定站点地址。
- 上一个 / 下一个作品会优先使用各自 live；未配置时返回主站所有作品。

建议部署顺序
------------
1. 分别上传或更新 17 个详情页。
2. 上传年度作品集、Tian_vidos、落地项目站。
3. 在主站 local-admin.html 补齐详情页 live 地址。
4. 最后上传 JiangmingTian_Portfolio_Final。

注意
----
GitHub Pages 区分大小写。仓库名称、公开地址和代码中的路径必须保持完全一致，
尤其是 Tian_vidos、Applied-Brand-Desig_wed 与 JiangmingTian_Portfolio_Final。
