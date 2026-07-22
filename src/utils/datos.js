// Utilidades para colecciones de datos de la API.

// Convierte una lista [{id, ...}] en un mapa { id: valor } para buscar por id.
// Ej.: indexarPor(medicos, 'nombre_completo') -> { "uuid": "Dra. Ana" }
export function indexarPor(lista, campo) {
  return Object.fromEntries(lista.map((item) => [item.id, item[campo]]))
}
