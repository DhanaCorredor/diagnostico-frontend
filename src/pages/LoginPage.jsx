import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../api/client'
import AuthLayout from '../layouts/AuthLayout'
import Input from '../components/atoms/Input'
import Label from '../components/atoms/Label'
import Boton from '../components/atoms/Boton'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const destino = location.state?.from?.pathname ?? '/'

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await login(email, password)
      navigate(destino, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Correo o contraseña incorrectos.')
      } else {
        setError('No se pudo conectar con el servidor. Inténtalo de nuevo.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <AuthLayout>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl ring-1 ring-line"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-lg font-bold text-white">
            D
          </div>
          <div>
            <p className="text-lg font-semibold leading-tight">Diagnóstico</p>
            <p className="text-xs text-ink-muted">Centro de Salud · Gestión de Citas</p>
          </div>
        </div>

        <h1 className="mb-1 text-xl font-semibold">Iniciar sesión</h1>
        <p className="mb-6 text-sm text-ink-2">Acceso solo para personal autorizado.</p>

        <Label>Correo</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          placeholder="tu@diagnostico.com"
          className="mb-4"
        />

        <Label>Contraseña</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-4"
        />

        {error && (
          <p className="mb-4 rounded-lg bg-crit/10 px-3 py-2 text-sm text-crit">{error}</p>
        )}

        <Boton type="submit" disabled={cargando} className="w-full">
          {cargando ? 'Entrando…' : 'Entrar'}
        </Boton>

        <p className="mt-4 text-center text-xs text-ink-muted">
          🔒 Conexión segura · Datos cifrados
        </p>
      </form>
    </AuthLayout>
  )
}
