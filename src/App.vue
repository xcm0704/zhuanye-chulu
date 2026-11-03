<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { datasetNote, meta } from './lib/match.js'

const route = useRoute()
const steps = [
  { to: '/', label: '选专业' },
  { to: '/jobs', label: '岗位方向' },
  { to: '/match', label: '匹配器' },
]
const activeTo = computed(() => {
  if (route.path.startsWith('/jobs')) return '/jobs'
  if (route.path.startsWith('/match')) return '/match'
  return '/'
})
const note = datasetNote()
const salaryNote = meta.salaryNote
const collegeRule = meta.collegeRule || ''
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <span class="logo">专业出路</span>
        <span class="tagline">你离这个岗位，差哪几项</span>
      </div>
      <nav class="steps">
        <RouterLink
          v-for="(s, i) in steps"
          :key="s.to"
          :to="s.to"
          class="step"
          :class="{ on: activeTo === s.to }"
        >
          <i>{{ i + 1 }}</i>{{ s.label }}
        </RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="foot">
      <div>数据：{{ note }}</div>
      <div class="foot-note">{{ collegeRule }}</div>
      <div class="foot-note">{{ salaryNote }}</div>
    </footer>
  </div>
</template>
