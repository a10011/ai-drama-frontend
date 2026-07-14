import request from '@/utils/request'

// 获取项目角色列表
export const getCharacters = (projectId) => {
  return request({
    url: `/api/character/project/${projectId}`,
    method: 'get'
  })
}

// 创建角色
export const createCharacter = (data) => {
  return request({
    url: '/api/character/create',
    method: 'post',
    data
  })
}

// 更新角色
export const updateCharacter = (id, data) => {
  return request({
    url: `/api/character/update/${id}`,
    method: 'put',
    data
  })
}

// 删除角色
export const deleteCharacter = (id) => {
  return request({
    url: `/api/character/delete/${id}`,
    method: 'delete'
  })
}

// AI补齐角色详情
export const aiCompleteCharacter = (id) => {
  return request({
    url: `/api/character/ai-complete/${id}`,
    method: 'post'
  })
}
