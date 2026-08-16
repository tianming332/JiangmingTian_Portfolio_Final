天将明个人作品网站｜日常更新说明
================================

一、五个入口
- 主站：首页、作品卡片、筛选、关于我与内置画廊。
- Tian_vidos：独立视频档案站。
- Applied Brand Desig_wed：落地项目站。
- 2024 Annual Summary Portfolio：年度作品集。
- JiangmingTian_Portfolio_Detail_Pages：17 个独立作品详情页。

二、替换现有作品卡片封面（推荐流程）
1. 用 Chrome 或 Edge 打开主站 local-admin.html。
2. 在“替换现有项目”中选择作品。
3. 把新封面拖入右侧区域。
4. 点击“选择目录并保存到网站”，选择 JiangmingTian_Portfolio_Final。
5. 管理页会把图片转换成 WebP，并保存为：
   uploads/works-covers/项目-id.webp
6. works.js 会同步更新，不需要手动修改图片后缀或路径。

三、新增作品卡片
1. 打开 local-admin.html，保留“新增项目”。
2. 填写中英文标题、项目 ID、年份、方向、类型、标签、简介等。
3. 项目 ID 只用小写英文、数字和短横线，例如 new-visual-project。
4. 拖入封面；如详情页已经发布，同时填写详情页线上地址。
5. 保存后会同时更新：
   data/works.js
   data/work-detail-links.js
   uploads/works-covers/项目-id.webp
6. 再复制一个详情页模板，新文件夹名称必须与项目 ID 完全一致。

四、详情页链接
- data/work-detail-links.js 中每个作品有 local 和 live 两个地址。
- local 用于本机联调，固定指向同级详情页总目录。
- live 填写该作品详情页的 GitHub Pages 地址。
- live 暂空时，线上主站会回到主站内部项目页，不会跳到本机地址。
- 也可在 local-admin.html 中选择作品后填写“详情页线上地址”。

五、画廊更新
1. 新图片统一转换为 WebP。
2. 放入 uploads/gallery。
3. 从现有最大编号继续，使用三位连续编号：
   g-043.webp、g-044.webp、g-045.webp……
4. 不要跳号。gallery.html 会自动发现后续连续编号，无需改代码。
5. 自动发现的图片使用默认标题与“视觉设计”标签。
6. 如需自定义标题、英文名、标签和说明，再在 data/gallery.js 末尾增加对应记录。

建议画廊图片使用 sRGB、WebP，长边不超过 2400 px，质量 80—88。

六、标签与语言
- data/works.js 是主站方向、类型与作品标签的唯一来源。
- 首页欢迎页与筛选栏会自动补齐 works.js 中实际使用的新方向和类型。
- 17 个详情页会按作品 ID 读取同一份标签数据，因此与主站保持一致。
- 未被当前作品使用的预留标签可以继续保留。
- 主站默认简体；繁体和英文内容由 data/work-translations.js 维护。

七、上传顺序
先上传详情页、年度站、Tian_vidos 与落地项目站，最后上传主站。
这样主站上传后会立即使用最新接口、标签、卡片和画廊数据。
