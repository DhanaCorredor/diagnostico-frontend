// Utilidades de texto.

// Iniciales de un nombre para el avatar: "Carlos Mendoza Rivas" -> "CM".
export function iniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}
