# Mapa de Componentes (React) — Atomic Design *lite*

> Inventario **real** de los componentes implementados en el frontend (repo `diagnostico-frontend`). Enfoque **Atomic Design ligero**: la jerarquía es una **guía de organización**, sin obsesionarse con clasificar cada pieza al milímetro.
>
> **🎯 Regla de oro: el código lo más sencillo posible.** Componentes pequeños y con **una sola responsabilidad**; nada de abstracciones prematuras. Si algo se resuelve con `useState` + `fetch`, no metas más. Prima "que funcione y se lea claro" sobre "que sea sofisticado".

```
Átomos  →  Moléculas  →  Organismos  →  Plantillas  →  Páginas
(botón)    (campo)       (formulario)   (layout)       (ruta)
```

## Estructura de carpetas (real)

```
src/
  api/            # cliente HTTP + token JWT (client.js)
  auth/           # AuthContext · AuthProvider · useAuth · ProtectedRoute (guarda por rol)
  components/
    atoms/        # piezas básicas sin lógica de negocio
    molecules/    # combinaciones simples de átomos
    organisms/    # secciones completas con lógica/estado
  layouts/        # AuthLayout · AppLayout
  pages/          # una por ruta
  utils/          # helpers puros (fecha, texto, datos) + metadata (citas, roles)
  App.jsx         # rutas (React Router) + guardas por rol
  main.jsx        # providers (Router + Auth)
```

## ⚛️ Átomos

| Componente | Uso |
|-----------|-----|
| `Boton` | variantes: primario · secundario · peligro · éxito (tamaños sm/md) |
| `Input` · `Select` · `Label` | controles de formulario (comparten `estilos.js` → `controlBase`) |
| `Badge` | pastilla de color (estado de cita, rol) — 7 colores |
| `Avatar` | iniciales del usuario/paciente (sm/md/lg) |
| `Spinner` | estado de carga ("Cargando…") |
| `Tarjeta` | contenedor blanco con borde (contenedor base de todo) |
| `Alerta` | mensaje de error/éxito/info |
| `MensajeLista` | mensaje centrado en tabla/lista (vacío/error) |

> `Icono` (del plan original) → no se creó: los SVG van **inline** (sidebar, buscador, flechas de agenda…).

## 🧬 Moléculas

| Componente | Compuesto por | Uso |
|-----------|---------------|-----|
| `Campo` | `Label` + control (children) + hint | todos los formularios |
| `Modal` | cabecera + contenido + pie | ventanas modales (formularios, detalle de cita) |
| `EstadoBadge` | `Badge` + `ESTADOS_CITA` | estado de una cita |
| `TarjetaKPI` | `Tarjeta` + título/número/nota | KPIs del panel |
| `BarraBusqueda` | input + icono | buscar paciente/cédula |
| `CamposCita` | `Campo` + `Input` + `Select` | campos compartidos de **nueva/editar cita** |
| `Tabla` | `Tarjeta` + `thead`/`tbody` + estados | tabla reutilizable (config de columnas): Pacientes · Usuarios · Médicos |
| `Dato` | `dt` + `dd` | fila "etiqueta: valor" (ficha de paciente, detalle de cita) |

> `EnlaceNav`, `SelectorVista` (Día/Semana), `FranjaHoraria`, `ItemNota` (del plan) → no se hicieron: la nav va inline en `Sidebar`; solo hay vista Día; la disponibilidad se pinta directa; las notas clínicas son **fase 2**.

## 🦠 Organismos

| Componente | Qué hace |
|-----------|----------|
| `Sidebar` | navegación por rol + usuario + salir |
| `Topbar` | título de la página + botón "Nueva cita" |
| `FormularioPaciente` | alta/edición: **nombre + edad** (cédula opcional) |
| `FormularioUsuario` | alta/edición de personal: nombre + email + rol (+ matrícula/especialidades si médico) |
| `DetalleCita` | detalle de una cita + **acciones** (cancelar · asistencia · editar/mover) |

> `TablaPacientes` / `TablaUsuarios` / cuadro médico usan la molécula reutilizable **`Tabla`** (config de columnas). Otras secciones de una sola vista se dejaron **inline**: `Calendario` (la rejilla vive en `AgendaPage`), `PanelResumen` (en `PanelPage`), `FichaCabecera`/`FichaTabs` (en `FichaPacientePage`). `FormularioCita` = `NuevaCitaPage` + `CamposCita`. `ListaNotasClinicas` → **fase 2**.

## 🖼️ Plantillas (layouts)

| Plantilla | Estructura |
|-----------|-----------|
| `AuthLayout` | contenedor centrado (solo Login) |
| `AppLayout` | `Sidebar` + `Topbar` + área de contenido |

## 📄 Páginas (ruta · rol)

| Página | Ruta | Quién accede | Compone |
|--------|------|--------------|---------|
| `LoginPage` | `/login` | todos | `AuthLayout` |
| `PanelPage` | `/` | todos | `TarjetaKPI` + agenda del día (→ `DetalleCita`) |
| `AgendaPage` | `/agenda` | todos | rejilla médico×hora (→ `DetalleCita`) |
| `PacientesPage` | `/pacientes` | ADMIN · RECEPCION | `Tabla` + `BarraBusqueda` + `FormularioPaciente` |
| `FichaPacientePage` | `/pacientes/:id` | ADMIN · RECEPCION | cabecera + pestañas (Datos · Historial) |
| `MedicosPage` | `/medicos` | ADMIN · RECEPCION | `Tabla` (lista: médico · especialidades · disponibilidad) |
| `NuevaCitaPage` | `/citas/nueva` | ADMIN · RECEPCION | Paciente + `CamposCita` |
| `UsuariosPage` | `/usuarios` | **solo ADMIN** | `Tabla` + `FormularioUsuario` |
| `ConfigPage` | `/config` | **solo ADMIN** | especialidades + servicios |

> **Guardas por rol** (`App.jsx`): RECEPCIÓN **no** ve `/usuarios` ni `/config`; MEDICO ve `Panel` y su `Agenda` (**solo lectura**, sin botón "Nueva cita"). Historia clínica → **fase 2**.

## 🧰 utils/ (helpers y metadata)

| Archivo | Contenido |
|---------|-----------|
| `fecha.js` | `hoyISO`, `formatHora`, `formatFechaCorta`/`Larga`, `sumarDias`, `diaSemana`… |
| `texto.js` | `iniciales` (para `Avatar`) |
| `datos.js` | `indexarPor` (lista → mapa por id) |
| `citas.js` | `ESTADOS_CITA` (estado → texto · color · barra · chip) |
| `roles.js` | `ROLES` (rol → etiqueta · color) |

## 🔑 Comportamientos clave (dónde vive la lógica)

- **Nueva cita** (`NuevaCitaPage` + `CamposCita`) → `POST /citas`: **upsert de paciente** por nombre + edad; el backend valida **disponibilidad** (con **sobrecupo**) y **cero solapamientos por médico**.
- **`AgendaPage`** → pide la disponibilidad de cada médico y **grisa** las horas fuera de ella; recepción puede **forzar sobrecupo**.
- **Acciones sobre la cita** (`DetalleCita`) → cancelar (libera cupo), marcar asistencia (atendida/no-show), editar/mover (revalida reglas).
- **`EstadoBadge` + `ESTADOS_CITA`** → mapea `EstadoCita` (SCHEDULED · CONFIRMED · CANCELLED · COMPLETED · NO_SHOW) a color y etiqueta.
- **Sesión** → `AuthProvider` guarda el JWT en `localStorage`, `useAuth` lo consume, `ProtectedRoute` protege por sesión y rol; un **handler global de 401** cierra sesión y redirige a login.
- La **cédula** no se pide al agendar (opcional, se añade después).

> Este mapa refleja lo **implementado**. La jerarquía es una **guía**, no un contrato: las piezas de un solo uso se quedaron **inline** a propósito (código más sencillo).
