# 专业出路

大专生选专业 + 目标岗位，系统告诉你「还差哪几项技能、先补哪个」。

## 跑起来

    npm install
    npm run dev      # 开发，浏览器打开终端里给的地址
    npm run build    # 打包到 dist/
    npm run preview  # 预览打包结果

## 现在的状态

- 第 1 步：三屏跑通（选专业 → 岗位方向 → 匹配器），匹配度实时计算、缺口排序、频率条形图已可用
- 数据是 **v0 占位频率**（4 个岗位 × 10 项技能），页脚会显示数据状态；真实 JD 落盘后替换 `src/data/stats.json`
- 权重不手填：`freq >= 50` → 核心 3 分，`25-50` → 重要 2 分，其余加分 1 分，规则在 `src/lib/match.js`

## 目录

    src/data/         majors.json / jobs.json / skills.json / stats.json（技能频率）
    src/lib/match.js  纯函数：算分、排补齐顺序
    src/views/        三个屏
    src/components/   JobCard / SkillBarChart

## 后面要做的

1. 抓真实 JD 落到 `data-src/jd-raw/`，加 `scripts/build-stats.mjs` 由原文统计 `stats.json`
2. 城市与大专筛选接真实统计
3. 部署
