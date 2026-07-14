/**
 * localStorage 并发锁工具
 * 解决多个组件同时读写同一 key 的竞态条件
 * 
 * 用法：
 *   import { acquireLock, releaseLock, safeGetLS, safeSetLS } from '@/utils/lsLock'
 *   
 *   await safeSetLS('__DRAMA_SCRIPT__', data.script)
 *   const script = await safeGetLS('__DRAMA_SCRIPT__')
 */

const locks = {}

function acquireLock(key) {
  return new Promise(resolve => {
    function tryAcquire() {
      if (!locks[key]) {
        locks[key] = true
        resolve()
      } else {
        // 轮询等待，最大等待 3 秒后强制获取
        let waited = 0
        function check() {
          if (!locks[key]) {
            locks[key] = true
            resolve()
          } else if (waited >= 3000) {
            console.warn(`[lsLock] 强制获取锁: ${key}`)
            locks[key] = true
            resolve()
          } else {
            waited += 10
            setTimeout(check, 10)
          }
        }
        setTimeout(check, 10)
      }
    }
    tryAcquire()
  })
}

function releaseLock(key) {
  locks[key] = false
}

async function safeGetLS(key) {
  await acquireLock(key)
  try {
    return localStorage.getItem(key)
  } finally {
    releaseLock(key)
  }
}

async function safeSetLS(key, value) {
  await acquireLock(key)
  try {
    localStorage.setItem(key, value)
  } finally {
    releaseLock(key)
  }
}

async function safeGetJSON(key) {
  const raw = await safeGetLS(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (e) { console.error("[lsLock] error:", e); return null }
}

async function safeSetJSON(key, value) {
  await safeSetLS(key, JSON.stringify(value))
}

export { acquireLock, releaseLock, safeGetLS, safeSetLS, safeGetJSON, safeSetJSON }
