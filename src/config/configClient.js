const BASE_URL = import.meta.env.VITE_API_URL

const TOKEN_KEY = 'diagnostico_token'

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' }

let unauthorizedHandler = null

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = fn
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(status, message, detail) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

export async function request(path, { method, body, auth = true }) {
  const headers = { ...DEFAULT_HEADERS }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })

  if (res.status === 204) return null

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) unauthorizedHandler?.()
    const detail = data?.detail ?? data
    const message =
      typeof detail === 'string' ? detail : detail?.mensaje ?? 'Ha ocurrido un error en la petición'
    throw new ApiError(res.status, message, detail)
  }

  return data
}
