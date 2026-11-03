<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import data from '../data/jobs.json'
import majors from '../data/majors.json'
import { store } from '../lib/store.js'
import { skillMap, TIERS, buildItems, scoreOf, orderedGaps } from '../lib/match.js'
import SkillBarChart from '../components/SkillBarChart.vue'

const route = useRoute()

const jobId = computed(() => route.query.job || 'frontend')
const job = computed(() => data.jobs.find((j) => j.id === jobId.value) || data.jobs[0])
const major = computed(() => majors.majors.find((m) => m.id === store.majorId) || majors.majors[0])

const checked = ref(new Set())
const items = computed(() => buildItems(job.value))
const result = computed(() => scoreOf(items.value, checked.value))
const gaps = computed(() => orderedGaps(items.value, checked.value))

const grouped = computed(() => {
  const g = { core: [], important: [], bonus: [] }
  for (const it of items.value) g[it.tier].push(it)
  return g
})

const chartItems = computed(() =>
  items.value
    .slice()
    .sort((a, b) => b.freq - a.freq)
    .map((it) => Object.assign({}, it, { checked: checked.value.has(it.id) })),
)

const affinity = computed(() => {
  const aff = major.value.affinity || {}
  return aff[job.value.id] === undefined ? 0.5 : aff[job.value.id]
})
const crossNote = computed(() => {
  if (affinity.value >= 0.9) return ''
  return '这个方向和你的' + major.value.name + '不是最对口的，下面缺的会比对口方向多。'
})

function toggle(id) {
  const next = new Set(checked.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  checked.value = next
}
function clearAll() {
  checked.value = new Set()
}
function checkAll() {
  checked.value = new Set(items.value.map((i) => i.id))
}
function nameOf(id) {
  const m = skillMap.get(id)
  return m ? m.name : id
}

watch(jobId, () => {
  checked.value = new Set()
})
</script>

<template>
  <section class="page">
    <h1>{{ job.name }} · 你还差什么</h1>
    <p class="sub">
      左边勾你会的，右边实时告诉你缺几项、先补哪个。权重来自真实 JD 里这项技能出现的频率。
    </p>
    <p v-if="crossNote" class="sub" style="color: #d98324">{{ crossNote }}</p>

    <div class="matcher">
      <div>
        <div class="panel">
          <div class="row-actions" style="margin: 0 0 4px">
            <button class="btn primary" @click="checkAll">我全会</button>
            <button class="btn" @click="clearAll">清空重来</button>
          </div>

          <template v-for="tier in ['core', 'important', 'bonus']" :key="tier">
            <div v-if="grouped[tier].length" class="tier-title">
              <span class="dot" :class="tier"></span>
              {{ TIERS[tier].label }}（{{ TIERS[tier].weight }} 分）· {{ TIERS[tier].hint }}
            </div>
            <label
              v-for="it in grouped[tier]"
              :key="it.id"
              class="skill"
              :class="{ on: checked.has(it.id) }"
            >
              <input type="checkbox" :checked="checked.has(it.id)" @change="toggle(it.id)" />
              <span class="nm">{{ it.name }}</span>
              <span class="fq">{{ it.freq }}% JD 要求</span>
            </label>
          </template>
        </div>
      </div>

      <div>
        <div class="panel">
          <div class="score">
            <b>{{ result.percent }}%</b>
            <span>已拿到 {{ result.got }} / {{ result.total }} 分</span>
          </div>
          <div class="bar"><i :style="{ width: result.percent + '%' }"></i></div>
        </div>

        <div class="panel">
          <h2>缺 {{ gaps.length }} 项 · 按这个顺序补</h2>
          <p v-if="!gaps.length" class="empty">一项不缺，可以开始投简历了。</p>
          <div v-for="(g, i) in gaps" :key="g.id" class="gap">
            <span class="no">{{ i + 1 }}</span>
            <div class="body">
              <strong>{{ g.name }}</strong>
              <span class="why">
                · {{ TIERS[g.tier].label }}（{{ g.weight }} 分）· {{ g.freq }}% 的 JD 要求
                <template v-if="g.blockedBy.length">
                  · 先补 {{ g.blockedBy.map(nameOf).join('、') }}
                </template>
              </span>
              <div class="practice">练手：{{ g.practice }}</div>
            </div>
          </div>
        </div>

        <div class="panel">
          <h2>这个岗位的技能出现频率</h2>
          <SkillBarChart :items="chartItems" />
        </div>
      </div>
    </div>
  </section>
</template>
