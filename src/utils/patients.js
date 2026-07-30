import { normalize } from './text'

const MIN_TERM = 2
const MIN_PHONE_DIGITS = 3

function digits(value = '') {
  return value.replace(/\D/g, '')
}

export function searchPatients(patients, term, limit = 8) {
  const needle = normalize(term)
  if (needle.length < MIN_TERM) return []

  const needleDigits = digits(term)

  return patients
    .filter((patient) => {
      if (normalize(patient.nombre_completo).includes(needle)) return true
      if (normalize(patient.cedula ?? '').includes(needle)) return true
      return (
        needleDigits.length >= MIN_PHONE_DIGITS &&
        digits(patient.telefono ?? '').includes(needleDigits)
      )
    })
    .slice(0, limit)
}
