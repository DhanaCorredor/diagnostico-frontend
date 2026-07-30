import { request, ApiError } from './configClient'

export { ApiError }

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
}

export function errorMessage(err, fallback) {
  return err instanceof ApiError ? err.message : fallback
}
