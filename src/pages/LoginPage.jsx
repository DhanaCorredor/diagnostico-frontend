import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../api/client'
import AuthLayout from '../layouts/AuthLayout'
import Input from '../components/atoms/Input'
import Label from '../components/atoms/Label'
import Boton from '../components/atoms/Boton'
import Alerta from '../components/atoms/Alerta'

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
        <img src="/logo.png" alt="Diagnóstico · Centro de Salud" className="mx-auto mb-6 h-14 w-auto" />

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

        {error && <Alerta className="mb-4">{error}</Alerta>}

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
