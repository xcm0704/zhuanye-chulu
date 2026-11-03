import fs from 'node:fs'
import path from 'node:path'

const dist = path.join(process.cwd(), 'dist')
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')

html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/g, (tag) => {
  const m = tag.match(/href="([^"]+)"/)
  if (!m) return tag
  const file = path.join(dist, m[1].replace(/^\.\//, ''))
  return '<style>\n' + fs.readFileSync(file, 'utf8') + '\n</style>'
})

html = html.replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g, (tag, src) => {
  const file = path.join(dist, src.replace(/^\.\//, ''))
  const code = fs.readFileSync(file, 'utf8').replace(/<\/script>/g, '<\\/script>')
  return '<script type="module">\n' + code + '\n</script>'
})

const out = path.join(dist, '专业出路.html')
fs.writeFileSync(out, html, 'utf8')
console.log('单文件已生成: ' + out + '  ' + (fs.statSync(out).size / 1024).toFixed(1) + ' KB')
