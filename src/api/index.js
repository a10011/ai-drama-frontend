const BASE = ''

async function req(method, path, body) {
  const token = localStorage.getItem('token')
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (token) opts.headers['Authorization'] = 'Bearer ' + token
  if (body) opts.body = JSON.stringify(body)
  const r = await fetch(BASE + path, opts)
  return r.json()
}

export default {
  get: (p) => req('GET', p),
  post: (p, b) => req('POST', p, b),
  put: (p, b) => req('PUT', p, b),
  del: (p) => req('DELETE', p),

  // v2 接口
  estimate: (cc) => req('POST', '/v2/balance/estimate', { character_count: cc }),
  balance: () => req('GET', '/v2/balance/check'),
  characters: () => req('GET', '/v2/characters/personal'),
  charUpdate: (n, d) => req('PUT', '/v2/characters/personal/' + encodeURIComponent(n), d),
  charGenerate: (n) => req('POST', '/v2/characters/' + encodeURIComponent(n) + '/generate'),
  assetsList: (t) => req('GET', '/v2/assets/list?asset_type=' + (t||'')),
  upload: async (file) => {
    const token = localStorage.getItem('token')
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('/v2/assets/upload', { method: 'POST', headers: token ? { 'Authorization': 'Bearer ' + token } : {}, body: fd })
    return r.json()
  },

  // 管线
  pipelineRun: (d) => req('POST', '/api/v1/pipeline/start', d),
  pipelineStatus: (id) => req('GET', '/api/v1/pipeline/status/' + id),
  projects: () => req('GET', '/api/v1/projects'),
}
