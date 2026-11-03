<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import data from '../data/jobs.json'
import majors from '../data/majors.json'
import { store } from '../lib/store.js'
import { collegeOf } from '../lib/match.js'
import JobCard from '../components/JobCard.vue'

const router = useRouter()
const showAll = ref(false)
const major = computed(() => majors.majors.find((m) => m.id === store.majorId) || majors.majors[0])

watch(() => store.majorId, () => { showAll.value = false })

function passCollege(job) {
  if (!store.onlyCollege) return true
  const c = collegeOf(job.id, store.city)
  return c.rate !== null && c.rate >= 50
}

const byId = computed(() => {
  const aff = major.value.affinity || {}
  const map = {}
  for (const j of data.jobs) map[j.id] = Object.assign({}, j, { affinity: aff[j.id] })
  return map
})

// 推荐：按专业给的顺序，只显示推荐岗位
const recommended = computed(() =>
  (major.value.recommended || [])
    .map((id) => byId.value[id])
    .filter(Boolean)
    .filter(passCollege),
)

// 全部：按大类分组，组内按对口程度排
const allGroups = computed(() => {
  const order = ['技术', '数据', '设计', '产品与运营', '服务']
  const list = data.jobs
    .map((j) => byId.value[j.id])
    .filter(passCollege)
    .sort((a, b) => (b.affinity ?? -1) - (a.affinity ?? -1) || a.name.localeCompare(b.name))
  const map = {}
  for (const j of list) {
    if (!map[j.group]) map[j.group] = []
    map[j.group].push(j)
  }
  return order.filter((g) => map[g]).map((g) => ({ name: g, list: map[g] }))
})

const allCount = computed(() => allGroups.value.reduce((s, g) => s + g.list.length, 0))

function open(job) {
  router.push({ path: '/match', query: { job: job.id } })
}
</script>

<template>
  <section class="page">
    <h1>{{ showAll ? '全部岗位方向' : '适合' + major.name + '的方向' }}</h1>
    <p class="sub">
      <template v-if="!showAll">
        这 {{ recommended.length }} 个方向是这个专业最对口的。技能百分比是真实招聘 JD 里数出来的，点一张卡看你差哪几项。
      </template>
      <template v-else>
        全部 {{ allCount }} 个方向。排在前面的仍然是最对口的，跨方向要补的东西会更多。
      </template>
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
      <button class="btn switch" @click="showAll = !showAll">
        {{ showAll ? '← 只看本专业推荐的' : '想看别的？查看全部 ' + data.jobs.length + ' 个岗位' }}
      </button>
    </div>

    <div v-if="!showAll" class="grid three">
      <JobCard v-for="job in recommended" :key="job.id" :job="job" :city="store.city" @open="open(job)" />
    </div>

    <template v-else>
      <div v-for="g in allGroups" :key="g.name" class="group">
        <h2 class="group-title">{{ g.name }}</h2>
        <div class="grid four">
          <JobCard v-for="job in g.list" :key="job.id" :job="job" :city="store.city" @open="open(job)" />
        </div>
      </div>
    </template>

    <p v-if="(!showAll && !recommended.length) || (showAll && !allCount)" class="empty">
      这个筛选下没有方向，把「只看大专可投」关掉试试。
    </p>
  </section>
</template>
