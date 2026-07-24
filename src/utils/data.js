export function indexBy(list, field) {
  return Object.fromEntries(list.map((item) => [item.id, item[field]]))
}
