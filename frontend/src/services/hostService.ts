import { http } from '@api/http'
import type { HostPaged, Host } from '@types/index'

export async function listHosts(params?: {
  page?: number
  pageSize?: number
  search?: string
  expiringInDays?: number
}) {
  const { data } = await http.get<HostPaged>('/hosts', { params })
  return data
}

export async function getHost(id: number) {
  const { data } = await http.get<Host>(`/hosts/${id}`)
  return data
}

export async function createHost(payload: {
  ip: string
  port: number
  uid: string
  pwd: string
  purchasedAt: string
  expiredAt: string
  notes?: string
}) {
  const { data } = await http.post('/hosts', payload)
  return data
}

export async function updateHost(id: number, payload: Partial<{
  ip: string
  port: number
  uid: string
  pwd: string
  purchasedAt: string
  expiredAt: string
  notes?: string
}>) {
  const { data } = await http.patch(`/hosts/${id}`, payload)
  return data
}

export async function deleteHost(id: number) {
  const { data } = await http.delete(`/hosts/${id}`)
  return data
}

export async function revealPwd(id: number) {
  const { data } = await http.get<{ pwd: string }>(`/hosts/${id}/reveal`)
  return data.pwd
}
