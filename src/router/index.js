import { createRouter, createWebHashHistory } from 'vue-router'
import SelectMajor from '../views/SelectMajor.vue'
import SelectJob from '../views/SelectJob.vue'
import Matcher from '../views/Matcher.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'major', component: SelectMajor },
    { path: '/jobs', name: 'jobs', component: SelectJob },
    { path: '/match', name: 'match', component: Matcher },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
