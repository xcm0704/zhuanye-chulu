import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const rawDir = path.join(root, 'data-src', 'jd-raw')
const cardDir = path.join(root, 'data-src', 'cards')

const SKILLS = {
  'html-css': [/html5?/i, /css3?/i, /页面布局/, /flex/],
  'javascript': [/javascript/i, /\bjs\b/i, /es6/, /ecmascript/],
  'typescript': [/typescript/i, /\bts\b/i],
  'vue': [/vue/i],
  'ui-framework': [/element\s*ui|element-plus|ant\s*design|\bantd\b|组件库/i],
  'responsive': [/响应式/, /移动端/, /多端/, /适配/, /\bh5\b/i],
  'webpack-vite': [/webpack/i, /\bvite\b/i, /工程化/, /构建/, /打包/],
  'debug': [/调试/, /devtools/i, /排查/, /定位问题/, /问题定位/],
  'http-api': [/\bhttp\b/i, /接口/, /restful/i, /\bapi\b/i],
  'git': [/\bgit\b/i, /github/i, /gitlab/i, /\bsvn\b/i, /ci\/cd/i],
  'java': [/\bjava\b/i],
  'springboot': [/spring\s*boot/i, /springboot/i, /spring\s*cloud/i, /\bssm\b/i, /spring/i, /微服务/],
  'sql': [/\bsql\b/i],
  'mysql': [/mysql/i],
  'redis': [/redis/i],
  'docker': [/docker/i, /容器/],
  'linux': [/linux/i, /centos/i, /ubuntu/i, /redhat/i, /麒麟/, /统信/],
  'network': [/网络/, /tcp\/ip/i, /\btcp\b/i, /路由/, /交换机/, /防火墙/i, /\bdns\b/i, /\bvpn\b/i],
  'python': [/python/i],
  'postman-api': [/postman/i, /接口测试/, /apifox/i],
  'test-theory': [/测试用例/, /用例设计/, /测试理论/, /测试流程/, /测试方法/, /等价类/, /边界值/],
  'bug-track': [/缺陷/, /\bbug\b/i, /禅道/, /\bjira\b/i],
  'selenium': [/selenium/i, /appium/i, /自动化测试/, /ui自动化/i],
  'jmeter': [/jmeter/i, /性能测试/, /压测/i, /loadrunner/i],
  'shell': [/shell\s*脚本/i, /\bbash\b/i, /\bshell\b/i],
  'troubleshoot': [/故障排查/, /排障/, /问题排查/, /应急/, /故障处理/],
  'deploy': [/部署/, /上线发布/, /发布上线/, /安装配置/],
  'customer-comm': [/客户沟通/, /沟通能力/, /沟通协调/, /需求沟通/, /驻场/, /对接客户/, /表达能力/],
  'excel': [/\bexcel\b/i, /数据透视/i, /vlookup/i, /表格处理/i],
  'ppt': [/\bppt\b/i, /汇报/, /路演/, /方案讲解/i],
  'photoshop': [/photoshop/i, /\bps\b/i, /修图/, /抠图/],
  'color': [/色彩/, /配色/],
  'typography': [/版式/, /排版/, /字体/],
  'script': [/脚本/, /口播/, /解说词/],
  'shooting': [/拍摄/, /摄影/, /灯光/, /打光/],
  'capcut': [/剪映/],
  'copywriting': [/文案/, /卖点/, /详情页文案/],
  'ticket': [/工单/, /远程支持/, /远程协助/, /派单/],
  'doc': [/编写文档/, /技术文档/, /手册/, /说明书/, /实施文档/, /文档编写/],
  'ai-tool': [/\baigc\b/i, /chatgpt/i, /大模型/, /\bai工具\b/i, /人工智能工具/i],
  'english': [/英语/, /英文/],
  'figma': [/figma/i, /axure/i, /墨刀/i, /原型设计/, /sketch/i],
  'illustrator': [/illustrator/i, /矢量/],
  'brand': [/\bvi\b/i, /品牌/, /标识/, /logo/i],
  'print': [/印刷/, /出血/, /输出规范/, /材质/, /工艺/],
  'premiere': [/premiere/i, /\bpr\b/i, /剪辑/],
  'storyboard': [/分镜/],
  'subtitle': [/字幕/, /音效/, /配乐/, /调色/],
  'content-plan': [/选题/, /内容策划/, /策划方案/, /内容规划/, /内容运营/],
  'platform-ops': [/抖音/, /小红书/, /快手/, /视频号/, /公众号/, /平台运营/, /账号运营/],
  'data-review': [/复盘/, /数据分析/, /数据统计/, /数据运营/, /看数据/],
  'user-grow': [/增长/, /拉新/, /留存/, /转化率/],
  'ecom-backend': [/千牛/, /卖家中心/, /店铺后台/, /淘宝/, /天猫/, /拼多多/, /京东/],
  'listing': [/上架/, /详情页/, /主图/, /标题优化/],
  'crm': [/社群/, /客户维护/, /私域/, /微信群/, /客服/],
  'selection': [/选品/, /供应链/, /采购/, /货源/],
  'switch-config': [/交换机/, /路由器/, /vlan/i, /网络设备/, /cisco/i],
  'cabling': [/布线/, /机柜/, /弱电/],
  'windows-server': [/windows\s*server/i, /\bwindows\b/i, /域控/, /活动目录/],
  'bi': [/power\s*bi/i, /tableau/i, /可视化/, /看板/],
  'stats': [/统计/, /同比/, /环比/, /指标/, /口径/],
  'etl': [/\betl\b/i, /数据清洗/, /清洗数据/, /数据仓库/],
  'ae': [/after\s*effects/i, /\bae\b/i, /动效/, /特效/],
  'live-ops': [/直播/, /场控/, /带货/],
  'ad-buy': [/直通车/, /信息流/, /付费推广/, /广告投放/, /投放推广/],
  'seo': [/\bseo\b/i, /关键词优化/, /搜索优化/],
  'security': [/防火墙/, /安全防护/, /等保/, /漏洞/],
  'training': [/用户培训/, /客户培训/, /培训客户/, /实施交付/, /上线辅导/],
}

const DIRECTIONS = {
  frontend: [/前端/, /web前端/i, /\bh5\b/i, /vue/i, /react/i],
  backend: [/\bjava\b/i, /后端/, /服务端/i, /spring/i],
  test: [/测试/, /用例/, /缺陷/],
  ops: [/运维/, /实施/, /服务器/, /部署/i, /linux/i],
  support: [/技术支持/, /售后/, /客户支持/, /it支持/i, /驻场/],
  network: [/网络工程/, /网络运维/, /交换机/, /路由器/, /网络/],
  data: [/数据分析/, /数据专员/, /数据运营/, /报表/],
  ui: [/\bui\b/i, /交互/, /界面设计/, /视觉设计/, /\bux\b/i],
  graphic: [/平面设计/, /视觉设计/, /美术设计/, /排版/, /海报/],
  video: [/剪辑/, /视频/, /后期/, /短视频/],
  newmedia: [/新媒体/, /内容运营/, /社媒/, /小红书/, /抖音/, /公众号/],
  ecom: [/电商/, /店铺运营/, /淘宝/, /拼多多/, /京东/, /直播运营/],
}

const KW_TO_DIR = {
  '前端开发': 'frontend', 'web前端': 'frontend',
  'Java开发': 'backend',
  '软件测试': 'test',
  '运维工程师': 'ops', '实施工程师': 'ops',
  '技术支持': 'support',
  '网络工程师': 'network', '网络运维': 'network',
  '数据分析': 'data',
  'UI设计师': 'ui', 'UI设计': 'ui',
  '平面设计': 'graphic', '视觉设计': 'graphic', '美工': 'graphic', '视频后期': 'video', '数据专员': 'data',
  '视频剪辑': 'video',
  '新媒体运营': 'newmedia',
  '电商运营': 'ecom', '店铺运营': 'ecom',
}

const CUT = ['工作地点', '客户公司信息', '相似职位', '公司介绍', '工商信息', '职位发布者', '看过该职位', '竞争力分析', '工作地址', '公司地址']
const SENIOR = /资深|经理|总监|架构师|专家|主管|负责人/

const hits = (t, pats) => pats.some((re) => re.test(t))
const loadJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return null } }

const byDir = {}
const sources = []
let droppedSenior = 0
let droppedIrrelevant = 0

for (const f of fs.existsSync(rawDir) ? fs.readdirSync(rawDir).filter((x) => x.endsWith('.json')) : []) {
  const data = loadJson(path.join(rawDir, f))
  if (!data) continue
  const dir = KW_TO_DIR[data.keyword]
  if (!dir) continue
  byDir[dir] = byDir[dir] || []
  for (const r of data.records || []) {
    if (!r.jd || r.jd.length < 120) continue
    let jd = r.jd
    for (const m of CUT) { const i = jd.indexOf(m); if (i > 200) { jd = jd.slice(0, i); break } }
    const title = String(r.pageTitle || '').replace(/招聘[_-].*$/, '').replace(/招聘\s*-.*$/, '').trim()
    if (SENIOR.test(title)) { droppedSenior++; continue }
    if (!hits(title, DIRECTIONS[dir] || [])) { droppedIrrelevant++; continue }
    byDir[dir].push({ source: r.source, title, jd })
    sources.push(r.source)
  }
}

const freq = {}
for (const [dir, list] of Object.entries(byDir)) {
  const n = list.length
  freq[dir] = {}
  for (const [skill, pats] of Object.entries(SKILLS)) {
    freq[dir][skill] = n ? Math.round((list.filter((r) => hits(r.jd, pats)).length / n) * 100) : 0
  }
}

const ACCEPT = (edu) => /大专|学历不限|中专|高中/.test(edu)
const dirCity = {}
const dirAll = {}
if (fs.existsSync(cardDir)) {
  for (const f of fs.readdirSync(cardDir).filter((x) => x.endsWith('.json') && !x.startsWith('_'))) {
    const d = loadJson(path.join(cardDir, f))
    if (!d || !d.cards || !d.cards.length) continue
    const dir = KW_TO_DIR[d.kw]
    if (!dir) continue
    const cards = d.cards.filter((c) => c.edu)
    if (cards.length < 8) continue
    const a = cards.filter((c) => ACCEPT(c.edu)).length
    dirCity[dir] = dirCity[dir] || {}
    dirCity[dir][d.city] = dirCity[dir][d.city] || { a: 0, n: 0 }
    dirCity[dir][d.city].a += a
    dirCity[dir][d.city].n += cards.length
    dirAll[dir] = dirAll[dir] || { a: 0, n: 0 }
    dirAll[dir].a += a
    dirAll[dir].n += cards.length
  }
}

const college = {}
for (const dir of Object.keys(byDir)) {
  college[dir] = {}
  for (const [city, v] of Object.entries(dirCity[dir] || {})) {
    if (v.n >= 8) college[dir][city] = { rate: Math.round((v.a / v.n) * 100), n: v.n }
  }
  const all = dirAll[dir]
  if (all && all.n >= 8) college[dir].all = { rate: Math.round((all.a / all.n) * 100), n: all.n }
}

const total = sources.length
const out = {
  meta: {
    version: 'v2-真实样本',
    jdCount: total,
    byDirection: Object.fromEntries(Object.entries(byDir).map(([k, v]) => [k, v.length])),
    dropped: { senior: droppedSenior, irrelevant: droppedIrrelevant },
    source: '智联招聘公开招聘页（jobdetail 原文，逐条保留来源 URL，见 data-src/sources.json）',
    collectedAt: new Date().toISOString().slice(0, 10),
    salaryNote: '薪资区间需登录招聘网站才显示，本版未采集，因此界面上不显示薪资，只用技能与学历做匹配',
    rule: '技能出现率 >=50% 核心 3 分，25-50% 重要 2 分，其余加分 1 分；已剔除资深/经理岗',
    collegeRule: '大专可投 = 招聘页学历标注明确写「大专/学历不限/中专/高中」的比例；某城不足 8 条时不单独统计，退回全国样本',
  },
  freq,
  college,
}

fs.writeFileSync(path.join(root, 'src', 'data', 'stats.json'), JSON.stringify(out, null, 2), 'utf8')
fs.writeFileSync(path.join(root, 'data-src', 'sources.json'), JSON.stringify(sources, null, 1), 'utf8')

console.log('样本：', JSON.stringify(out.meta.byDirection), '合计', total, '| 剔除资深', droppedSenior, '| 剔除不相关', droppedIrrelevant)
for (const [dir, list] of Object.entries(byDir)) {
  const rows = Object.entries(freq[dir]).filter(([, v]) => v >= 25).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => k + ' ' + v + '%')
  console.log('[' + dir + ' n=' + list.length + '] ' + rows.join('  '))
}
console.log('大专可投(全国):', JSON.stringify(Object.fromEntries(Object.entries(college).map(([k, v]) => [k, v.all || null]))))
