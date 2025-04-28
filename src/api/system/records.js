import request from '@/utils/request'

// 查询会议记录列表
export function listRecords(query) {
  return request({
    url: '/system/records/list',
    method: 'get',
    params: query
  })
}

// 查询会议记录详细
export function getRecords(id) {
  return request({
    url: '/system/records/' + id,
    method: 'get'
  })
}

// 新增会议记录
export function addRecords(data) {
  return request({
    url: '/system/records',
    method: 'post',
    data: data
  })
}

// 修改会议记录
export function updateRecords(data) {
  return request({
    url: '/system/records',
    method: 'put',
    data: data
  })
}

// 删除会议记录
export function delRecords(id) {
  return request({
    url: '/system/records/' + id,
    method: 'delete'
  })
}
