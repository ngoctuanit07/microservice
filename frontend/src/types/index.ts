export type Host = {
  id: number
  ip: string
  port: number
  uid: string
  pwdEnc: string
  purchasedAt: string
  expiredAt: string
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export type HostPaged = {
  items: Host[]
  total: number
  page: number
  pageSize: number
}
