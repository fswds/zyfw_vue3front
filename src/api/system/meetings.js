import request from '@/utils/request'

// 查询会议列表
export function listMeetings(query) {
  return request({
    url: '/system/meetings/list',
    method: 'get',
    params: query
  })
}

// 查询会议详细
export function getMeetings(id) {
  return request({
    url: '/system/meetings/' + id,
    method: 'get'
  })
}

// 新增会议
export function addMeetings(data) {
  return request({
    url: '/system/meetings',
    method: 'post',
    data: data
  })
}

// 修改会议
export function updateMeetings(data) {
  return request({
    url: '/system/meetings',
    method: 'put',
    data: data
  })
}

// 删除会议
export function delMeetings(id) {
  return request({
    url: '/system/meetings/' + id,
    method: 'delete'
  })
}
