import request from '@/utils/request'

// 查询老人信息列表
export function listCommunity(query) {
  return request({
    url: '/system/community/list',
    method: 'get',
    params: query
  })
}

// 查询老人信息详细
export function getCommunity(id) {
  return request({
    url: '/system/community/' + id,
    method: 'get'
  })
}

// 新增老人信息
export function addCommunity(data) {
  return request({
    url: '/system/community',
    method: 'post',
    data: data
  })
}

// 修改老人信息
export function updateCommunity(data) {
  return request({
    url: '/system/community',
    method: 'put',
    data: data
  })
}

// 删除老人信息
export function delCommunity(id) {
  return request({
    url: '/system/community/' + id,
    method: 'delete'
  })
}
