export interface ApiHealth {
  status: 'ok' | 'error'
  service: string
  timestamp: string
}
