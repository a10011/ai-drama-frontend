import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const memberLevel = ref('unlimited')
  const token = ref(localStorage.getItem('token') || '')
  
  const setMemberLevel = (level) => {
    memberLevel.value = level
  }
  
  return {
    memberLevel,
    token,
    setMemberLevel
  }
})
