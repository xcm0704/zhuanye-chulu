<script setup>
defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <div class="chart">
    <div v-for="it in items" :key="it.id" class="chart-row">
      <span class="chart-label" :class="{ on: it.checked }">{{ it.name }}</span>
      <div class="chart-track">
        <div class="chart-bar" :class="{ on: it.checked }" :style="{ width: it.freq + '%' }"></div>
      </div>
      <span class="chart-val">{{ it.freq }}%</span>
    </div>
  </div>
</template>
