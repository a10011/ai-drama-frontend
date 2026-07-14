/**
 * storage.js — Project-scoped localStorage wrapper
 * Keys pattern: project_{id}_{key}
 * Values: { data, ts: Date.now() }
 */

const PREFIX = 'drama_'

function _key(projectId, key) {
  return `${PREFIX}${projectId}_${key}`
}

export default {
  /** Read cached data for a project key. Returns null if missing. */
  get(projectId, key) {
    try {
      const raw = localStorage.getItem(_key(projectId, key))
      if (!raw) return null
      const { data, ts } = JSON.parse(raw)
      return { data, ts }
    } catch { return null }
  },

  /** Write data with timestamp */
  set(projectId, key, data) {
    localStorage.setItem(_key(projectId, key), JSON.stringify({ data, ts: Date.now() }))
  },

  /** Remove a single key */
  remove(projectId, key) {
    localStorage.removeItem(_key(projectId, key))
  },

  /** Check if cached data is older than maxAgeMs */
  isStale(projectId, key, maxAgeMs) {
    const entry = this.get(projectId, key)
    if (!entry) return true
    return (Date.now() - entry.ts) > maxAgeMs
  },

  /** Clear all keys for a project */
  clearProject(projectId) {
    const prefix = _key(projectId, '')
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(prefix)) keys.push(k)
    }
    keys.forEach(k => localStorage.removeItem(k))
  },

  /** Clear ALL drama-related keys (for hard reset) */
  clearAll() {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) keys.push(k)
    }
    keys.forEach(k => localStorage.removeItem(k))
  },

  /** Compute a simple hash of a string (for script change detection) */
  hash(str) {
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i)
      h |= 0
    }
    return String(h)
  }
}
