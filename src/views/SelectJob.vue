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

const list = computed(() => {
  const aff = major.value.affinity || {}
  return data.jobs
    .map((j) => Object.assign({}, j, { affinity: aff[j.id] === undefined ? 0.5 : aff[j.id] }))
    .filter((j) => {
      if (!store.onlyCollege) return true
      const c = collegeOf(j.id, store.city)
      return c.rate !== null && c.rate >= 50
    })
    .sort((a, b) => b.affinity - a.affinity)
})

function open(job) {
  router.push({ path: '/match', query: { job: job.id } })
}
</script>

<template>
  <section class="page">
    <h1>往哪个方向走？</h1>
    <p class="sub">
      按你选的 <span class="chip-major">{{ major.name }}</span> 排了序。技能百分比是真实 JD 里数出来的，点一张卡看你差哪几项。
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
        只看大专可投 ≥50% 的岗位
      </label>
    </div>

    <div class="grid four">
      <JobCard
        v-for="job in list"
        :key="job.id"
        :job="job"
        :city="store.city"
        @open="open(job)"
      />
    </div>

    <p v-if="!list.length" class="empty">这个筛选下没有岗位，把「只看大专可投」关掉试试。</p>
  </section>
</template>
