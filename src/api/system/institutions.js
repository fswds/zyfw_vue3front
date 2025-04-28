import request from '@/utils/request'

// 查询养老机构列表
export function listInstitutions(query) {
  return request({
    url: '/system/institutions/list',
    method: 'get',
    params: query
  })
}

// 查询养老机构详细
export function getInstitutions(id) {
  return request({
    url: '/system/institutions/' + id,
    method: 'get'
  })
}

// 新增养老机构
export function addInstitutions(data) {
  return request({
    url: '/system/institutions',
    method: 'post',
    data: data
  })
}

// 修改养老机构
export function updateInstitutions(data) {
  return request({
    url: '/system/institutions',
    method: 'put',
    data: data
  })
}

// 删除养老机构
export function delInstitutions(id) {
  return request({
    url: '/system/institutions/' + id,
    method: 'delete'
  })
}
