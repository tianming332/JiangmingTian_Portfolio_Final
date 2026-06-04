使用说明

1. Home 页面
- 文件：index.html
- 卡片数据：data/works.js
- 卡片图片：uploads/works-covers/
- 每张单个作品卡片必须包含：cover、title、keywords、description、link。

2. 单个作品 Detail 页面
- 模板：works/project-template/index.html
- 新增作品时，复制 project-template 文件夹，改名为你的项目名。
- 例如：works/ai-visual/index.html
- 然后在 data/works.js 中把 link 写成 works/ai-visual/index.html。

3. 年度作品集栏目
- 页面：collections.html
- 数据：data/collections.js
- 卡片图片：uploads/collection-covers/
- link 填写你部署在 GitHub Pages 上的年度作品集外部链接。

4. 本地管理页
- 页面：local-admin.html
- 它只负责生成数据，不会自动保存。
- 生成后复制对象，粘贴到 data/works.js 或 data/collections.js。

5. 注意
- 不要再直接打开 index.html 改卡片结构。
- 图片先放进 uploads 对应文件夹，再在 data 文件中填写路径。
- 视频建议使用外部链接，不要直接上传大 mp4 到 GitHub。
