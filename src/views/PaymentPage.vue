<template>
  <div class="payment-page">
    <!-- Header -->
    <div class="page-header">
      <h1>充值中心</h1>
      <p>选择支付方式，为您的账户充值</p>
    </div>

    <!-- Current Balance -->
    <div class="balance-card" v-if="token">
      <div class="balance-row">
        <span class="balance-label">当前余额</span>
        <span class="balance-amount">¥{{ balanceData?.balance?.toFixed(2) || '0.00' }}</span>
      </div>
      <div class="balance-row">
        <span class="balance-label">会员等级</span>
        <span class="balance-tag" :class="'tier-' + (userTier || 'free')">
          {{ tierName }}
        </span>
      </div>
    </div>

    <!-- Step 1: Select Product -->
    <div class="section">
      <h2 class="section-title">选择商品</h2>
      <div class="product-tabs">
        <button
          v-for="tab in productTabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Membership products -->
      <div class="product-grid" v-if="activeTab === 'membership'">
        <div
          v-for="p in membershipProducts"
          :key="p.id"
          class="product-card"
          :class="{ selected: selectedProduct?.id === p.id }"
          @click="selectProduct(p)"
        >
          <div class="card-icon">{{ p.icon }}</div>
          <div class="card-name">{{ p.name }}</div>
          <div class="card-price">¥{{ p.price.toFixed(2) }}</div>
          <div class="card-desc">{{ p.desc }}</div>
          <div class="card-check" v-if="selectedProduct?.id === p.id">✓</div>
        </div>
      </div>

      <!-- Credits products -->
      <div class="product-grid" v-if="activeTab === 'credits'">
        <div
          v-for="p in creditProducts"
          :key="p.id"
          class="product-card"
          :class="{ selected: selectedProduct?.id === p.id }"
          @click="selectProduct(p)"
        >
          <div class="card-icon">{{ p.icon }}</div>
          <div class="card-name">{{ p.name }}</div>
          <div class="card-price">¥{{ p.price.toFixed(2) }}</div>
          <div class="card-desc">{{ p.desc }}</div>
          <div class="card-check" v-if="selectedProduct?.id === p.id">✓</div>
        </div>
      </div>

      <!-- Video seconds billing -->
      <div class="video-bill-section" v-if="activeTab === 'video'">
        <div class="video-input-group">
          <label>视频时长（秒）</label>
          <input
            type="number"
            v-model.number="videoSeconds"
            min="1"
            max="3600"
            placeholder="输入秒数 (1-3600)"
            class="video-input"
          />
        </div>
        <div class="video-price-preview">
          <span>预计费用: ¥{{ videoCost.toFixed(2) }}</span>
          <span class="price-rate">{{ pricePerSec }}元/秒</span>
        </div>
      </div>
    </div>

    <!-- Step 2: Select Payment Method -->
    <div class="section" v-if="showPaymentMethods">
      <h2 class="section-title">选择支付方式</h2>
      <div class="payment-methods">
        <div
          class="method-card"
          :class="{ selected: selectedMethod === 'alipay' }"
          @click="selectedMethod = 'alipay'"
        >
          <img src="https://cdn.alipay.com/web/img/alipay-icon.png" alt="Alipay" class="method-icon alipay-icon"
               onerror="this.style.display='none';this.nextElementSibling.style.display='block'" />
          <span class="method-icon-text" style="display:none">支</span>
          <div class="method-name">支付宝</div>
          <div class="method-desc">电脑/手机支付</div>
        </div>
        <div
          class="method-card"
          :class="{ selected: selectedMethod === 'wechat' }"
          @click="selectedMethod = 'wechat'"
        >
          <div class="method-icon wechat-icon">微</div>
          <div class="method-name">微信支付</div>
          <div class="method-desc">扫码支付</div>
        </div>
      </div>
    </div>

    <!-- Step 3: Confirm & Pay -->
    <div class="confirm-section" v-if="selectedProduct || (activeTab === 'video' && videoSeconds > 0)">
      <div class="confirm-summary">
        <div class="summary-item">
          <span class="summary-label">商品</span>
          <span class="summary-value">{{ summaryName }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">金额</span>
          <span class="summary-amount">¥{{ summaryAmount.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">支付方式</span>
          <span class="summary-value">{{ summaryMethod }}</span>
        </div>
      </div>

      <button class="pay-btn" :disabled="paying" @click="handlePay">
        <span v-if="!paying">确认支付 ¥{{ summaryAmount.toFixed(2) }}</span>
        <span v-else class="loading-spinner">处理中...</span>
      </button>
    </div>

    <!-- QR Code Modal (WeChat Native) -->
    <div class="modal-overlay" v-if="showQRModal" @click.self="closeQRModal">
      <div class="qr-modal">
        <h3>微信扫码支付</h3>
        <p>请使用微信扫描二维码完成支付</p>
        <div class="qr-container">
          <qrcode-vue v-if="qrCodeUrl" :value="qrCodeUrl" :size="280" level="H" />
          <div v-else class="qr-loading">加载中...</div>
        </div>
        <p class="qr-order-id">订单号: {{ currentOrderId }}</p>
        <div class="qr-actions">
          <button class="btn-secondary" @click="checkPaymentStatus">刷新支付状态</button>
          <button class="btn-close" @click="closeQRModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- Payment Success Modal -->
    <div class="modal-overlay" v-if="showSuccessModal">
      <div class="success-modal">
        <div class="success-icon">✅</div>
        <h3>支付成功!</h3>
        <p>订单号: {{ currentOrderId }}</p>
        <p class="success-msg">{{ successMessage }}</p>
        <button class="btn-primary" @click="closeSuccessModal">完成</button>
      </div>
    </div>
  </div>
</template>

<script>
import { pay, PRODUCTS, balance as balanceAPI, orders as ordersAPI } from '@/api/pay'
import QrcodeVue from 'qrcode.vue'

export default {
  name: 'PaymentPage',
  components: { QrcodeVue },
  data() {
    return {
      token: '',
      userTier: 'free',
      balanceData: null,
      activeTab: 'membership',
      selectedProduct: null,
      selectedMethod: 'alipay',
      paying: false,
      showQRModal: false,
      showSuccessModal: false,
      qrCodeUrl: '',
      currentOrderId: '',
      successMessage: '',
      videoSeconds: 10,
      pricePerSec: 0.05,
      checkTimer: null,
    }
  },
  computed: {
    tierName() {
      const map = { free: '免费版', pro: '专业会员', enterprise: '企业版' }
      return map[this.userTier] || '免费版'
    },
    membershipProducts() {
      return Object.values(PRODUCTS).filter(p => p.id.startsWith('vip_'))
    },
    creditProducts() {
      return Object.values(PRODUCTS).filter(p => p.id.startsWith('credits_'))
    },
    showPaymentMethods() {
      return !this.paying && !(this.showQRModal || this.showSuccessModal)
    },
    summaryName() {
      if (this.activeTab === 'video') return `视频生成 ${this.videoSeconds}秒`
      return this.selectedProduct?.name || ''
    },
    summaryAmount() {
      if (this.activeTab === 'video') return pay.calcVideoCost(this.videoSeconds, this.pricePerSec)
      return this.selectedProduct?.price || 0
    },
    summaryMethod() {
      const map = { alipay: '支付宝', wechat: '微信支付' }
      return map[this.selectedMethod] || ''
    },
    productTabs() {
      return [
        { key: 'membership', label: '会员套餐' },
        { key: 'credits', label: '创作点数' },
        { key: 'video', label: '按秒计费' },
      ]
    },
  },
  async mounted() {
    this.token = localStorage.getItem('token') || ''
    if (!this.token) {
      this.$router.push('/login')
      return
    }
    await this.loadUserData()
  },
  beforeUnmount() {
    if (this.checkTimer) clearInterval(this.checkTimer)
  },
  methods: {
    async loadUserData() {
      try {
        const r = await fetch('/api/v1/auth/me', {
          headers: { 'Authorization': 'Bearer ' + this.token }
        }).then(r => r.json())
        if (r.success) {
          this.userTier = r.data.tier || 'free'
        }
      } catch (e) {}
      try {
        const r = await balanceAPI.get()
        if (r.success) this.balanceData = r.data
      } catch (e) {}
    },
    selectProduct(product) {
      this.selectedProduct = product
      this.activeTab = 'membership'
    },
    async handlePay() {
      if (this.paying) return
      this.paying = true

      try {
        const isVideo = this.activeTab === 'video'
        const productId = isVideo ? 'video_seconds' : this.selectedProduct.id
        const extra = {}

        if (isVideo) {
          extra.seconds = this.videoSeconds
          extra.title = `视频生成 ${this.videoSeconds}秒`
        }

        let result
        if (this.selectedMethod === 'wechat') {
          result = await pay.create(productId, {
            channel: 'wechat_native',
            quantity: isVideo ? 1 : undefined,
            ...extra,
          })
        } else {
          result = await pay.create(productId, {
            channel: 'alipay',
            quantity: isVideo ? 1 : undefined,
            ...extra,
          })
        }

        if (!result.success) {
          alert('创建支付失败: ' + (result.error || '未知错误'))
          this.paying = false
          return
        }

        this.currentOrderId = result.data.order_id

        if (this.selectedMethod === 'alipay') {
          // Redirect to Alipay
          window.location.href = result.data.pay_url
        } else if (this.selectedMethod === 'wechat') {
          // Show QR code
          this.qrCodeUrl = result.data.code_url
          this.showQRModal = true
          this.startPaymentCheck(result.data.order_id)
        }
      } catch (e) {
        alert('请求失败: ' + e.message)
      } finally {
        if (this.selectedMethod !== 'wechat') this.paying = false
      }
    },
    startPaymentCheck(orderId) {
      if (this.checkTimer) clearInterval(this.checkTimer)
      this.checkTimer = setInterval(async () => {
        try {
          const r = await pay.wechatPay.query(orderId)
          if (r.success && r.data?.status === 'completed') {
            clearInterval(this.checkTimer)
            this.showQRModal = false
            this.showSuccessModal = true
            this.successMessage = `订单 ${orderId} 支付成功`
            await this.loadUserData()
          }
        } catch (e) {}
      }, 3000)
    },
    async checkPaymentStatus() {
      try {
        const r = await pay.wechatPay.query(this.currentOrderId)
        if (r.success && r.data?.status === 'completed') {
          this.showQRModal = false
          this.showSuccessModal = true
          this.successMessage = '支付成功!'
          await this.loadUserData()
        }
      } catch (e) {}
    },
    closeQRModal() {
      this.showQRModal = false
      if (this.checkTimer) clearInterval(this.checkTimer)
      this.paying = false
    },
    closeSuccessModal() {
      this.showSuccessModal = false
      this.selectedProduct = null
      this.videoSeconds = 10
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
.payment-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}
.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
}
.page-header p {
  color: #888;
  font-size: 14px;
}

/* Balance card */
.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  color: white;
}
.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.balance-row:last-child { margin-bottom: 0; }
.balance-label { font-size: 14px; opacity: 0.8; }
.balance-amount { font-size: 32px; font-weight: 800; }
.balance-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(255,255,255,0.2);
}

/* Section */
.section { margin-bottom: 32px; }
.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
}

/* Product tabs */
.product-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.tab-btn {
  padding: 8px 20px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.tab-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Product grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.product-card {
  border: 2px solid #eee;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.product-card:hover { border-color: #667eea; transform: translateY(-2px); }
.product-card.selected { border-color: #667eea; background: #f8f9ff; }
.card-icon { font-size: 36px; margin-bottom: 8px; }
.card-name { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
.card-price { font-size: 24px; font-weight: 800; color: #667eea; margin-bottom: 8px; }
.card-desc { font-size: 12px; color: #888; }
.card-check {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

/* Video billing */
.video-bill-section {
  background: #f8f9ff;
  border-radius: 12px;
  padding: 24px;
}
.video-input-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}
.video-input {
  width: 200px;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  text-align: center;
}
.video-input:focus { outline: none; border-color: #667eea; }
.video-price-preview {
  margin-top: 16px;
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}
.price-rate {
  font-size: 12px;
  color: #888;
  font-weight: 400;
  margin-left: 8px;
}

/* Payment methods */
.payment-methods {
  display: flex;
  gap: 16px;
}
.method-card {
  flex: 1;
  border: 2px solid #eee;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.method-card:hover { border-color: #ccc; }
.method-card.selected { border-color: #667eea; background: #f8f9ff; }
.method-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
}
.alipay-icon { background: #1677FF; }
.wechat-icon { background: #07C160; }
.method-name { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
.method-desc { font-size: 12px; color: #888; }

/* Confirm section */
.confirm-section {
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 24px;
}
.confirm-summary {
  margin-bottom: 20px;
}
.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.summary-label { color: #888; }
.summary-value { font-weight: 500; }
.summary-amount {
  font-size: 24px;
  font-weight: 800;
  color: #667eea;
}

.pay-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.pay-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.loading-spinner { animation: pulse 1.5s infinite; }
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* QR Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.qr-modal, .success-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}
.qr-modal h3, .success-modal h3 { margin: 0 0 8px; font-size: 20px; }
.qr-container {
  margin: 24px auto;
  width: 280px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  border-radius: 12px;
}
.qr-order-id { font-size: 12px; color: #888; margin: 12px 0; }
.qr-actions { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }

.success-icon { font-size: 48px; margin-bottom: 12px; }
.success-msg { color: #07C160; font-weight: 600; margin: 12px 0; }

.btn-primary, .btn-secondary, .btn-close {
  padding: 10px 24px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  font-weight: 600;
}
.btn-primary { background: #667eea; color: white; }
.btn-secondary { background: #eee; color: #333; }
.btn-close { background: #ff4d4f; color: white; }

/* Mobile responsive */
@media (max-width: 640px) {
  .payment-page { padding: 16px 12px; }
  .page-header h1 { font-size: 22px; }
  .balance-amount { font-size: 24px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .product-card { padding: 14px; }
  .card-price { font-size: 18px; }
  .payment-methods { flex-direction: column; }
  .video-input { width: 100%; }
  .qr-modal, .success-modal { padding: 20px; }
}
</style>
