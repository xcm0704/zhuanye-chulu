<script setup>
import { computed } from 'vue'
import { skillMap, freqOf, tierOf, collegeText } from '../lib/match.js'

const props = defineProps({
  job: { type: Object, required: true },
  city: { type: String, required: true },
})
defineEmits(['open'])

const college = computed(() => collegeText(props.job.id, props.city))

const topSkills = computed(() =>
  props.job.skills
    .map((id) => {
      const m = skillMap.get(id) || { name: id }
      const freq = freqOf(props.job.id, id)
      return { id: id, name: m.name, freq: freq, tier: tierOf(freq) }
    })
    .filter((s) => s.freq > 0)
    .sort((a, b) => b.freq - a.freq)
    .slice(0, 5),
)

const tip = computed(() => {
  const aff = props.job.affinity
  if (aff === undefined) return ''
  if (aff >= 0.9) return '和你专业最对口'
  if (aff >= 0.65) return '也算顺路，要多补一点'
  return '跨方向，补的东西会多一些'
})
</script>

<template>
  <button class="card" @click="$emit('open')">
    <div class="jobcard-head">
      <h3>{{ job.name }}</h3>
      <span class="headcount">{{ job.skills.length }} 项</span>
    </div>
    <p>{{ job.summary }}</p>

    <div class="tags">
      <span v-for="s in topSkills" :key="s.id" class="tag" :class="s.tier">
        {{ s.name }} {{ s.freq }}%
      </span>
    </div>

    <div class="meta"><span>{{ college }}</span></div>
    <div v-if="tip" class="match-note">{{ tip }}</div>
  </button>
</template>
