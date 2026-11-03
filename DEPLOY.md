# 部署到 Netlify（三步）

产物已经在本地打好：
- 部署包：`专业出路-dist.zip`（90 KB）
- 单文件版：`dist\专业出路.html`（115 KB，双击就开，离线可用，可以微信直接发文件）

## 三步

1. 打开 https://app.netlify.com ，用邮箱或 GitHub 注册登录
2. 首页点 **Add new site → Deploy manually**
3. 把 `专业出路-dist.zip` 或 `dist` 文件夹**拖进虚线框**，等它转完

几十秒后会给你一个 `https://随机名字.netlify.app` 的网址，手机和电脑都能直接打开，也能发给好友。
想换好记的名字：Site configuration → Change site name。

## 说明

- 路由用的是 hash（`#/jobs`），所以部署在根路径、子路径、甚至本地 `file://` 打开都能跑
- 打包用的是相对路径 `base: './'`，不要改成 `/'`，否则子路径部署会白屏
- 现在是 v0 占位数据（页脚有标注）；换成真数据后重新 `npm run build:single` 再拖一次即可
