<script setup>
import majors from '../data/majors.json'
import { store } from '../lib/store.js'
import { useRouter } from 'vue-router'

const router = useRouter()

function pick(id) {
  store.majorId = id
  router.push('/jobs')
}
</script>

<template>
  <section class="page">
    <h1>你学的是什么专业？</h1>
    <p class="sub">选一个。它不会限制你能投什么，只影响后面岗位的排序和提示。</p>

    <div class="grid three">
      <button
        v-for="m in majors.majors"
        :key="m.id"
        class="card"
        :class="{ picked: store.majorId === m.id }"
        @click="pick(m.id)"
      >
        <h3>{{ m.name }}</h3>
        <p>{{ m.desc }}</p>
        <span class="go">看这个专业能投什么 →</span>
      </button>
    </div>
  </section>
</template>
