export function indexarPor(lista, campo) {
  return Object.fromEntries(lista.map((item) => [item.id, item[campo]]))
}
