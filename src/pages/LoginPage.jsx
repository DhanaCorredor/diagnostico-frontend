import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { ApiError } from '../config/api'
import AuthLayout from '../layouts/AuthLayout'
import Input from '../components/atoms/Input'
import Label from '../components/atoms/Label'
import Button from '../components/atoms/Button'
import Alert from '../components/atoms/Alert'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from?.pathname ?? '/'

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Correo o contraseña incorrectos.')
      } else {
        setError('No se pudo conectar con el servidor. Inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
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

        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoFocus
          placeholder="tu@diagnostico.com"
          className="mb-4"
        />

        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="mb-4"
        />

        {error && <Alert className="mb-4">{error}</Alert>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>

        <p className="mt-4 text-center text-xs text-ink-muted">
          🔒 Conexión segura · Datos cifrados
        </p>
      </form>
    </AuthLayout>
  )
}
