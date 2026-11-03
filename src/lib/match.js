import skillsFile from '../data/skills.json'
import stats from '../data/stats.json'

export const skillMap = new Map(skillsFile.skills.map((s) => [s.id, s]))
export const meta = stats.meta

export const TIERS = {
  core: { key: 'core', label: '核心', weight: 3, hint: '超过一半的真实 JD 都要求' },
  important: { key: 'important', label: '重要', weight: 2, hint: '四分之一到一半的 JD 要求' },
  bonus: { key: 'bonus', label: '加分', weight: 1, hint: '少数 JD 提到' },
}

export function freqOf(jobId, skillId) {
  const table = stats.freq[jobId]
  const v = table ? table[skillId] : undefined
  return typeof v === 'number' ? v : 0
}

export function tierOf(freq) {
  if (freq >= 50) return 'core'
  if (freq >= 25) return 'important'
  return 'bonus'
}

export function collegeOf(jobId, city) {
  const c = stats.college ? stats.college[jobId] : null
  if (!c) return { rate: null, n: 0, scope: 'none' }
  const cell = c[city]
  if (cell && cell.n >= 8) return { rate: cell.rate, n: cell.n, scope: 'city' }
  if (c.all && c.all.n >= 8) return { rate: c.all.rate, n: c.all.n, scope: 'all' }
  return { rate: null, n: 0, scope: 'none' }
}

export function collegeText(jobId, city) {
  const c = collegeOf(jobId, city)
  if (c.scope === 'none') return '暂无学历样本'
  if (c.scope === 'city') return '本城 ' + c.n + ' 条招聘里 ' + c.rate + '% 写明接受大专'
  return '本城样本不足 · 全国 ' + c.n + ' 条里 ' + c.rate + '%'
}

export function buildItems(job) {
  return job.skills
    .map((id) => {
      const m = skillMap.get(id) || { id: id, name: id, stage: 3, requires: [], practice: '' }
      const freq = freqOf(job.id, id)
      const tier = tierOf(freq)
      return Object.assign({}, m, { freq: freq, tier: tier, weight: TIERS[tier].weight })
    })
    .filter((it) => it.freq > 0)
    .sort((a, b) => b.weight - a.weight || b.freq - a.freq)
}

export function scoreOf(items, checked) {
  let got = 0
  let total = 0
  for (const it of items) {
    total += it.weight
    if (checked.has(it.id)) got += it.weight
  }
  return { got: got, total: total, percent: total ? Math.round((got / total) * 100) : 0 }
}

export function orderedGaps(items, checked) {
  let pool = items.filter((i) => !checked.has(i.id))
  const covered = new Set(checked)
  const out = []
  while (pool.length) {
    const sorted = pool.slice().sort((a, b) => a.stage - b.stage || b.weight - a.weight || b.freq - a.freq)
    const ready = sorted.find((x) => (x.requires || []).every((r) => covered.has(r) || !pool.some((p) => p.id === r)))
    const pick = ready || sorted[0]
    const blockedBy = (pick.requires || []).filter((r) => !covered.has(r) && items.some((i) => i.id === r))
    out.push(Object.assign({}, pick, { blockedBy: blockedBy }))
    covered.add(pick.id)
    pool = pool.filter((p) => p.id !== pick.id)
  }
  return out
}

export function datasetNote() {
  return 'v1 真实样本 · ' + stats.meta.jdCount + ' 条招聘 JD · 采集于 ' + stats.meta.collectedAt
}
