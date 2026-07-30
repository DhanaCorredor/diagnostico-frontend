import { useEffect, useState } from 'react'
import { api, errorMessage } from '../config/api'
import Input from '../components/atoms/Input'
import Button from '../components/atoms/Button'
import Badge from '../components/atoms/Badge'
import Alert from '../components/atoms/Alert'
import Card from '../components/atoms/Card'
import Modal from '../components/molecules/Modal'

const CATEGORIES = [
  { value: 'CONSULTA', label: 'Consulta' },
  { value: 'ECOGRAFIA', label: 'Ecografía' },
  { value: 'DOPPLER', label: 'Doppler' },
  { value: 'ESTUDIO_CARDIACO', label: 'Estudio cardíaco' },
  { value: 'PROMOCION', label: 'Promoción' },
  { value: 'OTRO', label: 'Otro' },
]
const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]))

export default function ConfigPage() {
  const [specialties, setSpecialties] = useState([])
  const [services, setServices] = useState([])
  const [error, setError] = useState('')

  const [newSpecialty, setNewSpecialty] = useState('')
  const [newService, setNewService] = useState({ nombre: '', categoria: 'CONSULTA' })
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    setError('')
    try {
      const [specialtyList, serviceList] = await Promise.all([
        api.get('/especialidades'),
        api.get('/servicios'),
      ])
      setSpecialties(specialtyList)
      setServices(serviceList)
    } catch (err) {
      setError(errorMessage(err, 'No se pudieron cargar los catálogos.'))
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function createSpecialty(event) {
    event.preventDefault()
    if (!newSpecialty.trim()) return
    try {
      await api.post('/especialidades', { nombre: newSpecialty.trim() })
      setNewSpecialty('')
      load()
    } catch (err) {
      setError(errorMessage(err, 'No se pudo crear la especialidad.'))
    }
  }

  async function createService(event) {
    event.preventDefault()
    if (!newService.nombre.trim()) return
    try {
      await api.post('/servicios', {
        nombre: newService.nombre.trim(),
        categoria: newService.categoria,
      })
      setNewService({ nombre: '', categoria: 'CONSULTA' })
      load()
    } catch (err) {
      setError(errorMessage(err, 'No se pudo crear el servicio.'))
    }
  }

  async function deleteService() {
    setBusy(true)
    try {
      await api.put(`/servicios/${deleting.id}`, { activo: false })
      setDeleting(null)
      load()
    } catch (err) {
      setError(errorMessage(err, 'No se pudo eliminar el servicio.'))
      setDeleting(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <Alert>{error}</Alert>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-1 font-semibold">Especialidades</h3>
          <p className="mb-3 text-xs text-ink-muted">Áreas médicas del centro.</p>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {specialties.map((specialty) => (
              <Badge key={specialty.id} color="brand" size="sm">
                {specialty.nombre}
              </Badge>
            ))}
            {specialties.length === 0 && (
              <span className="text-sm text-ink-muted">Aún no hay especialidades.</span>
            )}
          </div>

          <form onSubmit={createSpecialty} className="flex gap-2">
            <Input
              value={newSpecialty}
              onChange={(event) => setNewSpecialty(event.target.value)}
              placeholder="Nueva especialidad…"
            />
            <Button className="shrink-0">Añadir</Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="mb-1 font-semibold">Servicios y estudios</h3>
          <p className="mb-3 text-xs text-ink-muted">
            La duración de cada cita la elige recepción al agendar.
          </p>

          <div className="mb-4 max-h-56 space-y-2 overflow-y-auto text-sm">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-surface-plane px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate">{service.nombre}</span>
                <span className="shrink-0 text-xs text-ink-muted">
                  {CATEGORY_LABEL[service.categoria] ?? service.categoria}
                </span>
                <button
                  onClick={() => setDeleting(service)}
                  className="shrink-0 text-ink-muted hover:text-crit"
                  title="Eliminar servicio"
                  aria-label={`Eliminar ${service.nombre}`}
                >
                  ✕
                </button>
              </div>
            ))}
            {services.length === 0 && (
              <span className="text-ink-muted">Aún no hay servicios activos.</span>
            )}
          </div>

          <form onSubmit={createService} className="flex gap-2">
            <Input
              value={newService.nombre}
              onChange={(event) =>
                setNewService((current) => ({ ...current, nombre: event.target.value }))
              }
              placeholder="Nuevo servicio…"
            />
            <select
              value={newService.categoria}
              onChange={(event) =>
                setNewService((current) => ({ ...current, categoria: event.target.value }))
              }
              className="shrink-0 rounded-lg border border-line px-2 py-2 text-sm outline-none focus:border-brand"
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            <Button className="shrink-0">Añadir</Button>
          </form>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-3 font-semibold">Seguridad</h3>
        <div className="space-y-2 text-sm">
          {[
            'Contraseñas cifradas (bcrypt)',
            'Acceso por rol (JWT)',
            'Bajas lógicas (sin borrado físico)',
          ].map((item) => (
            <div key={item} className="flex items-center justify-between">
              <span className="text-ink-2">{item}</span>
              <Badge color="good" size="sm">
                Activo
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {deleting && (
        <Modal
          title="Eliminar servicio"
          subtitle="Se dará de baja (dejará de aparecer al agendar)."
          onClose={() => setDeleting(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleting(null)} disabled={busy}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={deleteService} disabled={busy}>
                {busy ? 'Eliminando…' : 'Eliminar'}
              </Button>
            </>
          }
        >
          <p className="text-sm text-ink-2">
            ¿Seguro que quieres eliminar{' '}
            <span className="font-medium text-ink">{deleting.nombre}</span>?
          </p>
        </Modal>
      )}
    </div>
  )
}
