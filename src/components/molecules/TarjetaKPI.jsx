import Tarjeta from '../atoms/Tarjeta'

export default function TarjetaKPI({ titulo, valor, nota }) {
  return (
    <Tarjeta className="p-5">
      <p className="text-sm text-ink-2">{titulo}</p>
      <p className="tnum mt-2 text-3xl font-semibold">{valor}</p>
      {nota && <p className="mt-1 text-xs text-ink-muted">{nota}</p>}
    </Tarjeta>
  )
}
