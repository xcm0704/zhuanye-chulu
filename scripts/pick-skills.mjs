import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const stats = JSON.parse(fs.readFileSync(path.join(root, 'src/data/stats.json'), 'utf8'))
const skillsFile = JSON.parse(fs.readFileSync(path.join(root, 'src/data/skills.json'), 'utf8'))
const jobsFile = JSON.parse(fs.readFileSync(path.join(root, 'src/data/jobs.json'), 'utf8'))
const stage = new Map(skillsFile.skills.map((s) => [s.id, s.stage]))
for (const job of jobsFile.jobs) {
  const table = stats.freq[job.id] || {}
  const ranked = Object.entries(table)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1] || (stage.get(a[0]) || 9) - (stage.get(b[0]) || 9))
    .slice(0, 10)
    .map(([k]) => k)
  job.skills = ranked
  console.log(job.id, '(' + ranked.length + ')', ranked.map((k) => k + '=' + table[k]).join(' '))
}
fs.writeFileSync(path.join(root, 'src/data/jobs.json'), JSON.stringify(jobsFile, null, 2), 'utf8')
