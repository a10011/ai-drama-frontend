import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useQuotaStore = defineStore('quota', () => {
  const quota = ref(null)
  const loading = ref(false)

  const videoQuota = computed(() => ({
    total: quota.value?.video?.total || 0,
    used: quota.value?.video?.used || 0,
    remaining: quota.value?.video?.remaining || 0
  }))

  const memberLevel = computed(() => quota.value?.memberLevel || 'free')

  const fetchQuota = async () => {
    loading.value = true
    try {
      const res = await request({
        url: '/api/quota',
        method: 'get'
      })
      quota.value = res.data
    } catch (error) {
      console.error('获取配额失败:', error)
    } finally {
      loading.value = false
    }
  }

  const consumeVideoQuota = (amount) => {
    if (quota.value?.video) {
      quota.value.video.used += amount
      quota.value.video.remaining = Math.max(quota.value.video.remaining - amount, 0)
    }
  }

  return {
    quota,
    loading,
    videoQuota,
    memberLevel,
    fetchQuota,
    consumeVideoQuota
  }
})
