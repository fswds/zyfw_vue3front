import request from '@/utils/request'

// 查询签到通知公告列表
export function listsignNotice(query) {
  return request({
    url: '/system/signNotice/list',
    method: 'get',
    params: query
  })
}

// 查询签到通知公告详细
export function getsignNotice(signNoticeId) {
  return request({
    url: '/system/signNotice/' + signNoticeId,
    method: 'get'
  })
}

// 新增签到通知公告
export function addsignNotice(data) {
  return request({
    url: '/system/signNotice',
    method: 'post',
    data: data
  })
}

// 修改签到通知公告
export function updatesignNotice(data) {
  return request({
    url: '/system/signNotice',
    method: 'put',
    data: data
  })
}

// 删除签到通知公告
export function delsignNotice(signNoticeId) {
  return request({
    url: '/system/signNotice/' + signNoticeId,
    method: 'delete'
  })
}
