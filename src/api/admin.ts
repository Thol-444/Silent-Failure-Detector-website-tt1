import { api } from './client'
import type { User } from '../types'

export async function fetchAllUsers() {
  const { data } = await api.get<User[]>('/admin/users')
  return data
}

export async function deleteUser(userId: string) {
  await api.delete(`/admin/users/${userId}`)
}
