import request from '@/utils/request'

// 查询建筑管理列表
export function listBuildings(query) {
  return request({
    url: '/system/buildings/list',
    method: 'get',
    params: query
  })
}

// 查询建筑管理详细
export function getBuildings(id) {
  return request({
    url: '/system/buildings/' + id,
    method: 'get'
  })
}

// 新增建筑管理
export function addBuildings(data) {
  return request({
    url: '/system/buildings',
    method: 'post',
    data: data
  })
}

// 修改建筑管理
export function updateBuildings(data) {
  return request({
    url: '/system/buildings',
    method: 'put',
    data: data
  })
}

// 删除建筑管理
export function delBuildings(id) {
  return request({
    url: '/system/buildings/' + id,
    method: 'delete'
  })
}
