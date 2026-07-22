// Cliente central de la API.
//
// En vez de repetir `fetch` en cada pantalla, todas las llamadas al backend
// pasan por aquí. Este módulo se encarga de tres cosas:
//   1. Anteponer la URL base del backend (que sale del .env: VITE_API_URL).
//   2. Adjuntar el token JWT en la cabecera Authorization cuando hay sesión.
//   3. Convertir los errores del backend en un objeto `ApiError` uniforme.

// Vite expone las variables que empiezan por VITE_ en `import.meta.env`.
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

// Guardamos el token en localStorage para que la sesión sobreviva a un F5.
const TOKEN_KEY = 'diagnostico_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

// Error propio: lleva el código HTTP y el detalle que devuelve FastAPI, para
// que las pantallas puedan mostrar un mensaje claro (o reaccionar a un 401/409).
export class ApiError extends Error {
  constructor(status, message, detail) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

// Función base. `auth = false` para las llamadas públicas (el login).
async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })

  // 204 No Content: no hay cuerpo que leer.
  if (res.status === 204) return null

  // Leemos el cuerpo como texto y lo intentamos parsear a JSON.
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
    // FastAPI pone el mensaje de error en `detail`. A veces es un texto y a
    // veces un objeto (p. ej. citas ambiguas: { mensaje, candidatos }).
    const detail = data?.detail ?? data
    const message =
      typeof detail === 'string'
        ? detail
        : detail?.mensaje ?? 'Ha ocurrido un error en la petición'
    throw new ApiError(res.status, message, detail)
  }

  return data
}

// Atajos por verbo HTTP, para que las pantallas se lean bien: api.get('/pacientes').
export const api = {
  get: (path) => apiFetch(path),
  post: (path, body, opts) => apiFetch(path, { method: 'POST', body, ...opts }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body }),
  del: (path) => apiFetch(path, { method: 'DELETE' }),
}
