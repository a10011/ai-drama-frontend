/**
 * Payment API wrapper - H5 mobile browser support
 */
const BASE = ''

function headers() {
  const token = localStorage.getItem('token')
  const h = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = 'Bearer ' + token
  return h
}

async function req(method, path, body) {
  const opts = { method, headers: headers() }
  if (body) opts.body = JSON.stringify(body)
  const r = await fetch(BASE + path, opts)
  return r.json()
}

export const PRODUCTS = {
  vip_month: { id: 'vip_month', name: 'Monthly VIP', price: 29.90, icon: '\uD83D\uDD11', desc: 'Unlimited generations' },
  vip_quarter: { id: 'vip_quarter', name: 'Quarterly VIP', price: 79.90, icon: '\uD83D\uDD11', desc: 'Save 11%' },
  vip_year: { id: 'vip_year', name: 'Yearly VIP', price: 299.00, icon: '\uD83D\uDD11', desc: 'Save 17%' },
  credits_100: { id: 'credits_100', name: '100 Credits', price: 9.90, icon: '\uD83E\uDE99', desc: 'For generation' },
  credits_500: { id: 'credits_500', name: '500 Credits', price: 39.90, icon: '\uD83E\uDE99', desc: 'Best value' },
  credits_1000: { id: 'credits_1000', name: '1000 Credits', price: 69.90, icon: '\uD83E\uDE99', desc: 'Max savings' },
}

export const alipay = {
  create: (productId, quantity = 1) => req('POST', '/api/v1/alipay/create', { product_id: productId, quantity }),
  query: (orderId) => req('GET', '/api/v1/alipay/query/' + orderId),
}

export const wechatPay = {
  nativeCreate: (productId, quantity = 1, extra = {}) =>
    req('POST', '/api/v1/wechat/pay/native/create', { product_id: productId, quantity, ...extra }),
  h5Create: (productId, quantity = 1, sceneType, extra = {}) =>
    req('POST', '/api/v1/wechat/pay/h5/create', { product_id: productId, quantity, scene_type: sceneType || 'WAP', ...extra }),
  jsapiCreate: (productId, quantity = 1, openid, extra = {}) =>
    req('POST', '/api/v1/wechat/pay/jsapi/create', { product_id: productId, quantity, openid: openid || '', ...extra }),
  query: (orderId) => req('GET', '/api/v1/wechat/pay/query/' + orderId),
  refund: (orderId, reason) => req('POST', '/api/v1/wechat/pay/refund', { order_id: orderId, reason: reason || '' }),
}

export const pay = {
  create: async (productId, options = {}) => {
    const channel = options.channel || 'wechat_h5'
    const quantity = options.quantity || 1
    const extra = { ...options }; delete extra.channel; delete extra.quantity
    if (channel === 'alipay') return await alipay.create(productId, quantity)
    if (channel === 'wechat_native') return await wechatPay.nativeCreate(productId, quantity, extra)
    if (channel === 'wechat_h5') return await wechatPay.h5Create(productId, quantity, extra.scene_type, extra)
    if (channel === 'wechat_jsapi') return await wechatPay.jsapiCreate(productId, quantity, options.openid, extra)
    throw new Error('Unknown channel: ' + channel)
  },
  isVideoSeconds: (p) => p === 'video_seconds',
  calcVideoCost: (s, pp = 0.05) => parseFloat((s * pp).toFixed(2)),
}

export const orders = {
  myOrders: () => req('GET', '/api/v1/orders/my'),
  orderDetail: (o) => req('GET', '/api/v1/orders/' + o),
  stats: () => req('GET', '/api/v1/orders/stats/summary'),
}

export const balance = { get: () => req('GET', '/api/v1/billing/balance') }
