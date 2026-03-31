import { getFirst } from './http'
import { normalizeSystemStatus } from './normalize'
import type { SystemStatus } from '../types'

const STATUS_PATHS = [
  '/system/status',
  '/api/system/status',
  '/detector/status',
  '/silent-failure/status',
  '/admin/system/status',
  '/api/detector/status',
]

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const raw = await getFirst<unknown>(STATUS_PATHS)
  return normalizeSystemStatus(raw)
}
