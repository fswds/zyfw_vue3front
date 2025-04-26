import request from '@/utils/request'

// 查询志愿组织信息
export function listOrganization(query) {
  return request({
    url: '/system/echarts/listOrganization',
    method: 'get',
    params: query
  })
}

// 查询各活动分类统计
export function activityList() {
  return request({
    url: '/system/echarts/list',
    method: 'get'
  })
}


// 查询活动类型信息
export function activityType() {
  return request({
    url: '/system/echarts/activityType',
    method: 'get'
  })
}

