/**
 * Payment API wrapper
 * Supports: Alipay, WeChat Pay (Native QR + JSAPI), video-per-second billing
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

// -- Product catalog --
export const PRODUCTS = {
  // Membership
  vip_month:   { id: 'vip_month',   name: 'Monthly VIP',    price: 29.90,  icon: '👑', desc: 'Unlimited generations, priority queue' },
  vip_quarter: { id: 'vip_quarter', name: 'Quarterly VIP',  price: 79.90,  icon: '👑', desc: 'Save 11% vs monthly' },
  vip_year:    { id: 'vip_year',    name: 'Yearly VIP',     price: 299.00, icon: '👑', desc: 'Save 17% vs monthly' },
  // Credits
  credits_100:  { id: 'credits_100',  name: '100 Credits',    price: 9.90,  icon: '🪙', desc: 'For image/video generation' },
  credits_500:  { id: 'credits_500',  name: '500 Credits',    price: 39.90,  icon: '🪙', desc: 'Best value credits pack' },
  credits_1000: { id: 'credits_1000', name: '1000 Credits',   price: 69.90,  icon: '🪙', desc: 'Maximum savings' },
}

export const PRODUCT_LIST = Object.values(PRODUCTS)

// -- Alipay --
export const alipay = {
  /** Create Alipay order, returns { pay_url, order_id, amount } */
  create: (productId, quantity = 1) => req('POST', '/api/v1/alipay/create', { product_id: productId, quantity }),
  /** Query order status */
  query: (orderId) => req('GET', `/api/v1/alipay/query/${orderId}`),
}

// -- WeChat Pay --
export const wechatPay = {
  /** Native: returns { code_url, order_id, amount } - code_url is QR link */
  nativeCreate: (productId, quantity = 1, extra = {}) =>
    req('POST', '/api/v1/wechat/pay/native/create', { product_id: productId, quantity, ...extra }),
  /** JSAPI: returns { prepay_id, js_params, order_id, amount } */
  jsapiCreate: (productId, quantity = 1, openid = '', extra = {}) =>
    req('POST', '/api/v1/wechat/pay/jsapi/create', { product_id: productId, quantity, openid, ...extra }),
  /** Query order */
  query: (orderId) => req('GET', `/api/v1/wechat/pay/query/${orderId}`),
  /** Refund */
  refund: (orderId, reason = '') => req('POST', '/api/v1/wechat/pay/refund', { order_id: orderId, reason }),
}

// -- Unified payment --
export const pay = {
  /**
   * Create payment via chosen channel
   * channel: 'alipay' | 'wechat_native' | 'wechat_jsapi'
   */
  create: async (productId, options = {}) => {
    const channel = options.channel || 'alipay'
    const quantity = options.quantity || 1
    const extra = { ...options }
    delete extra.channel
    delete extra.quantity

    if (channel === 'alipay') {
      return await alipay.create(productId, quantity)
    }
    if (channel === 'wechat_native') {
      return await wechatPay.nativeCreate(productId, quantity, extra)
    }
    if (channel === 'wechat_jsapi') {
      return await wechatPay.jsapiCreate(productId, quantity, options.openid || '', extra)
    }
    throw new Error(`Unknown payment channel: ${channel}`)
  },

  /** Check if product is video_seconds billing */
  isVideoSeconds(productId) {
    return productId === 'video_seconds'
  },

  /** Calculate video cost: seconds * price_per_sec */
  calcVideoCost(seconds, pricePerSec = 0.05) {
    return parseFloat((seconds * pricePerSec).toFixed(2))
  },
}

// -- Orders --
export const orders = {
  myOrders: () => req('GET', '/api/v1/orders/my'),
  orderDetail: (orderId) => req('GET', `/api/v1/orders/${orderId}`),
  stats: () => req('GET', '/api/v1/orders/stats/summary'),
}

// -- Balance --
export const balance = {
  get: () => req('GET', '/api/v1/billing/balance'),
}
