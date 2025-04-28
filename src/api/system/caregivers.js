import request from '@/utils/request'

// 查询护理人员信息管理列表
export function listCaregivers(query) {
  return request({
    url: '/system/caregivers/list',
    method: 'get',
    params: query
  })
}

// 查询护理人员信息管理详细
export function getCaregivers(id) {
  return request({
    url: '/system/caregivers/' + id,
    method: 'get'
  })
}

// 新增护理人员信息管理
export function addCaregivers(data) {
  return request({
    url: '/system/caregivers',
    method: 'post',
    data: data
  })
}

// 修改护理人员信息管理
export function updateCaregivers(data) {
  return request({
    url: '/system/caregivers',
    method: 'put',
    data: data
  })
}

// 删除护理人员信息管理
export function delCaregivers(id) {
  return request({
    url: '/system/caregivers/' + id,
    method: 'delete'
  })
}
