import { describe, it, expect } from 'vitest'
import { searchPatients } from './patients'

const PATIENTS = [
  { id: '1', nombre_completo: 'María Pérez', cedula: 'V-12.345.678', telefono: '0414-555-1122' },
  { id: '2', nombre_completo: 'Mario Peña', cedula: 'V-9.876.543', telefono: '0424-777-3344' },
  { id: '3', nombre_completo: 'Ana García', cedula: null, telefono: null },
]

const names = (result) => result.map((patient) => patient.nombre_completo)

describe('searchPatients', () => {
  it('ignores accents and case', () => {
    expect(names(searchPatients(PATIENTS, 'maria'))).toEqual(['María Pérez'])
    expect(names(searchPatients(PATIENTS, 'PEREZ'))).toEqual(['María Pérez'])
  })

  it('matches a partial name across patients', () => {
    expect(names(searchPatients(PATIENTS, 'mar'))).toEqual(['María Pérez', 'Mario Peña'])
  })

  it('finds by national id even when it is written without punctuation', () => {
    expect(names(searchPatients(PATIENTS, '9.876'))).toEqual(['Mario Peña'])
  })

  it('finds by phone ignoring dashes', () => {
    expect(names(searchPatients(PATIENTS, '5551122'))).toEqual(['María Pérez'])
  })

  it('survives patients with no national id or phone', () => {
    expect(names(searchPatients(PATIENTS, 'ana'))).toEqual(['Ana García'])
  })

  it('waits for at least two characters', () => {
    expect(searchPatients(PATIENTS, 'm')).toEqual([])
    expect(searchPatients(PATIENTS, ' ')).toEqual([])
  })

  it('still matches a national id that starts with the digits typed', () => {
    expect(names(searchPatients(PATIENTS, '12'))).toEqual(['María Pérez'])
  })

  it('needs at least three digits before searching by phone', () => {
    expect(searchPatients(PATIENTS, '55')).toEqual([])
    expect(names(searchPatients(PATIENTS, '555'))).toEqual(['María Pérez'])
  })

  it('caps how many it returns', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      nombre_completo: `Paciente ${i}`,
      cedula: null,
      telefono: null,
    }))
    expect(searchPatients(many, 'paciente')).toHaveLength(8)
  })
})
