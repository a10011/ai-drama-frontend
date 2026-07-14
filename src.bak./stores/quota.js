
import { defineStore } from 'pinia'

import { ref, computed } from 'vue'



export const useQuotaStore = defineStore('quota', () => {

  const quota = ref({

    memberLevel: 'unlimited',

    video: { total: 999999, used: 0, remaining: 999999 },

    image: { total: 999999, used: 0, remaining: 999999 },

    text: { total: 999999, used: 0, remaining: 999999 }

  })

  const loading = ref(false)



  const videoQuota = computed(() => quota.value.video)

  const memberLevel = computed(() => 'unlimited')



  const fetchQuota = async () => {

    return

  }



  const consumeVideoQuota = (amount) => {

    return

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

