<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import data from '../data/jobs.json'
import majors from '../data/majors.json'
import { store } from '../lib/store.js'
import { collegeOf } from '../lib/match.js'
import JobCard from '../components/JobCard.vue'

const router = useRouter()
const major = computed(() => majors.majors.find((m) => m.id === store.majorId) || majors.majors[0])

const sorted = computed(() => {
  const aff = major.value.affinity || {}
  return data.jobs
    .map((j) => Object.assign({}, j, { affinity: aff[j.id] }))
    .sort((a, b) => (b.affinity ?? -1) - (a.affinity ?? -1) || a.name.localeCompare(b.name))
})

const groups = computed(() => {
  const order = ['技术', '数据', '设计', '运营']
  const map = {}
  for (const j of sorted.value) {
    if (store.onlyCollege) {
      const c = collegeOf(j.id, store.city)
      if (c.rate === null || c.rate < 50) continue
    }
    if (!map[j.group]) map[j.group] = []
    map[j.group].push(j)
  }
  return order.filter((g) => map[g]).map((g) => ({ name: g, list: map[g] }))
})

const total = computed(() => groups.value.reduce((s, g) => s + g.list.length, 0))

function open(job) {
  router.push({ path: '/match', query: { job: job.id } })
}
</script>

<template>
  <section class="page">
    <h1>往哪个方向走？</h1>
    <p class="sub">
      按你选的 <span class="chip-major">{{ major.name }}</span> 排了序。技能百分比是真实招聘 JD 里数出来的，点一张卡看你差哪几项。
    </p>

    <div class="filters">
      <label>
        城市
        <select v-model="store.city">
          <option v-for="c in data.cities" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <label>
        <input type="checkbox" v-model="store.onlyCollege" />
        只看大专可投 ≥50% 的方向
      </label>
      <span class="count">共 {{ total }} 个方向</span>
    </div>

    <div v-for="g in groups" :key="g.name" class="group">
      <h2 class="group-title">{{ g.name }}</h2>
      <div class="grid four">
        <JobCard v-for="job in g.list" :key="job.id" :job="job" :city="store.city" @open="open(job)" />
      </div>
    </div>

    <p v-if="!total" class="empty">这个筛选下没有方向，把「只看大专可投」关掉试试。</p>
  </section>
</template>
