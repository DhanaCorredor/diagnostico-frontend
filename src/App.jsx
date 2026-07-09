function App() {
  return (
    <div className="flex min-h-screen">
      {/* Barra lateral */}
      <aside className="w-60 bg-[#276D6B] p-5 text-white">
        <h1 className="text-lg font-semibold">Diagnóstico</h1>
        <p className="text-xs text-white/70">Gestión de Citas</p>
        <nav className="mt-6 space-y-1 text-sm">
          <a className="block cursor-pointer rounded px-3 py-2 hover:bg-white/10">Panel</a>
          <a className="block cursor-pointer rounded px-3 py-2 hover:bg-white/10">Agenda</a>
          <a className="block cursor-pointer rounded px-3 py-2 hover:bg-white/10">Pacientes</a>
          <a className="block cursor-pointer rounded px-3 py-2 hover:bg-white/10">Médicos</a>
        </nav>
      </aside>

      {/* Zona principal */}
      <div className="flex flex-1 flex-col">
        <header className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-800">Panel</h2>
        </header>
        <main className="p-6 text-gray-600">
          <p>Frontend en construcción — layout base con Tailwind ✅</p>
        </main>
      </div>
    </div>
  )
}

export default App
