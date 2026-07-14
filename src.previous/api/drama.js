import request from '@/utils/request'

// 创建短剧
export const createDrama = (data) => {
  return request({
    url: '/api/drama/create',
    method: 'post',
    data
  })
}

// 获取短剧详情/进度
export const getDramaDetail = (id) => {
  return request({
    url: `/api/drama/${id}`,
    method: 'get'
  })
}

// 重新生成
export const retryDrama = (id) => {
  return request({
    url: `/api/drama/${id}/retry`,
    method: 'post'
  })
}

// 获取作品列表
export const getDramaList = (params) => {
  return request({
    url: '/api/drama/list',
    method: 'get',
    params
  })
}

// 删除作品
export const deleteDrama = (id) => {
  return request({
    url: `/api/drama/${id}`,
    method: 'delete'
  })
}
