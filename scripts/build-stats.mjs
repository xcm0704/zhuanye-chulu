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
  'shell': [/shell/i, /bash/i, /脚本/],
  'troubleshoot': [/故障排查/, /排障/, /问题排查/, /应急/, /故障处理/],
  'deploy': [/部署/, /上线/, /安装配置/, /实施/],
  'customer-comm': [/客户沟通/, /沟通能力/, /沟通协调/, /需求沟通/, /驻场/, /对接客户/, /表达能力/],
}

const DIRECTIONS = {
  frontend: [/前端/, /web前端/i, /\bh5\b/i, /vue/i, /react/i],
  backend: [/\bjava\b/i, /后端/, /服务端/i, /spring/i],
  test: [/测试/, /用例/, /缺陷/],
  ops: [/运维/, /实施/, /服务器/, /部署/i, /linux/i],
}

const KW_TO_DIR = { '前端开发': 'frontend', 'Java开发': 'backend', '软件测试': 'test', '运维工程师': 'ops', '实施工程师': 'ops' }
const CUT = ['工作地点', '客户公司信息', '相似职位', '公司介绍', '工商信息', '职位发布者', '看过该职位', '竞争力分析', '工作地址', '公司地址']
const SENIOR = /资深|高级|经理|总监|架构师|专家|主管|负责人/

const hits = (t, pats) => pats.some((re) => re.test(t))
const loadJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')) } catch { return null } }

const byDir = { frontend: [], backend: [], test: [], ops: [] }
const sources = []
let droppedSenior = 0
let droppedIrrelevant = 0

for (const f of fs.existsSync(rawDir) ? fs.readdirSync(rawDir).filter((x) => x.endsWith('.json')) : []) {
  const data = loadJson(path.join(rawDir, f))
  if (!data) continue
  const dir = KW_TO_DIR[data.keyword]
  if (!dir) continue
  for (const r of data.records || []) {
    if (!r.jd || r.jd.length < 120) continue
    let jd = r.jd
    for (const m of CUT) { const i = jd.indexOf(m); if (i > 200) { jd = jd.slice(0, i); break } }
    const title = r.pageTitle || ''
    if (SENIOR.test(title)) { droppedSenior++; continue }
    if (!hits(title + ' ' + jd, DIRECTIONS[dir])) { droppedIrrelevant++; continue }
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

// 大专可投：唯一口径 —— 招聘页学历标注里明确写「大专/学历不限/中专/高中」的比例
const ACCEPT = (edu) => /大专|学历不限|中专|高中/.test(edu)
const dirCity = { frontend: {}, backend: {}, test: {}, ops: {} }
const dirAll = { frontend: { a: 0, n: 0 }, backend: { a: 0, n: 0 }, test: { a: 0, n: 0 }, ops: { a: 0, n: 0 } }

if (fs.existsSync(cardDir)) {
  for (const f of fs.readdirSync(cardDir).filter((x) => x.endsWith('.json') && !x.startsWith('_'))) {
    const d = loadJson(path.join(cardDir, f))
    if (!d || !d.cards || !d.cards.length) continue
    const dir = KW_TO_DIR[d.kw]
    if (!dir) continue
    const cards = d.cards.filter((c) => c.edu)
    if (cards.length < 8) continue
    const a = cards.filter((c) => ACCEPT(c.edu)).length
    dirCity[dir][d.city] = dirCity[dir][d.city] || { a: 0, n: 0 }
    dirCity[dir][d.city].a += a
    dirCity[dir][d.city].n += cards.length
    dirAll[dir].a += a
    dirAll[dir].n += cards.length
  }
}

const college = { frontend: {}, backend: {}, test: {}, ops: {} }
for (const dir of Object.keys(college)) {
  for (const [city, v] of Object.entries(dirCity[dir])) {
    if (v.n >= 8) college[dir][city] = { rate: Math.round((v.a / v.n) * 100), n: v.n }
  }
  if (dirAll[dir].n >= 8) college[dir].all = { rate: Math.round((dirAll[dir].a / dirAll[dir].n) * 100), n: dirAll[dir].n }
}

const total = sources.length
const out = {
  meta: {
    version: 'v1-真实样本',
    jdCount: total,
    byDirection: Object.fromEntries(Object.entries(byDir).map(([k, v]) => [k, v.length])),
    dropped: { senior: droppedSenior, irrelevant: droppedIrrelevant },
    source: '智联招聘公开招聘页（jobdetail 原文，逐条保留来源 URL，见 data-src/sources.json）',
    collectedAt: new Date().toISOString().slice(0, 10),
    salaryNote: '薪资区间需登录后才显示，本轮未采集；界面沿用占位区间并已标注为待补',
    rule: '技能出现率 >=50% 核心 3 分，25-50% 重要 2 分，其余加分 1 分；已剔除资深/经理岗',
    collegeRule: '大专可投 = 招聘页学历标注明确写「大专/学历不限/中专/高中」的比例；某城不足 8 条时不单独统计，退回全国样本',
  },
  freq,
  college,
}

fs.writeFileSync(path.join(root, 'src', 'data', 'stats.json'), JSON.stringify(out, null, 2), 'utf8')
fs.writeFileSync(path.join(root, 'data-src', 'sources.json'), JSON.stringify(sources, null, 1), 'utf8')

console.log('样本：', JSON.stringify(out.meta.byDirection), '合计', total, '| 剔除资深', droppedSenior, '| 剔除不相关', droppedIrrelevant)
for (const dir of ['frontend', 'backend', 'test', 'ops']) {
  const rows = Object.entries(freq[dir]).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v + '%')
  console.log('\n[' + dir + '] n=' + byDir[dir].length)
  console.log('  ' + rows.join('  '))
}
console.log('\n大专可投(全国)：', JSON.stringify(Object.fromEntries(Object.entries(college).map(([k, v]) => [k, v.all || null]))))
console.log('大专可投(分城)：', JSON.stringify(Object.fromEntries(Object.entries(college).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).filter(([c]) => c !== 'all'))]))))
