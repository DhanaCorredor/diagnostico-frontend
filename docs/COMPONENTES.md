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
  config/         # cliente HTTP + token JWT (configClient · api)
  auth/           # AuthContext · AuthProvider · useAuth · ProtectedRoute (guarda por rol)
  hooks/          # useForm (estado de formularios)
  components/
    atoms/        # piezas básicas sin lógica de negocio
    molecules/    # combinaciones simples de átomos
    organisms/    # secciones completas con lógica/estado
  layouts/        # AuthLayout · AppLayout
  pages/          # una por ruta
  utils/          # helpers puros (date, text, data) + metadata (citas, roles)
  router.jsx      # rutas (React Router) + guardas por rol
  App.jsx         # monta el router
  main.jsx        # providers (Router + Auth)
```

## ⚛️ Átomos

| Componente | Uso |
|-----------|-----|
| `Button` | variantes: primary · secondary · danger · success (tamaños sm/md) |
| `Input` · `Select` · `Label` | controles de formulario (comparten `styles.js` → `controlBase`) |
| `Badge` | pastilla de color (estado de cita, rol) — 7 colores |
| `Avatar` | iniciales del usuario/paciente (sm/md/lg) |
| `Spinner` | estado de carga ("Cargando…") |
| `Card` | contenedor blanco con borde (contenedor base de todo) |
| `Alert` | mensaje de error/éxito/info |
| `ListMessage` | mensaje centrado en tabla/lista (vacío/error) |

> `Icono` (del plan original) → no se creó: los SVG van **inline** (sidebar, buscador, flechas de agenda…).

## 🧬 Moléculas

| Componente | Compuesto por | Uso |
|-----------|---------------|-----|
| `Field` | `Label` + control (children) + hint | todos los formularios |
| `Modal` | cabecera + contenido + pie | ventanas modales (formularios, detalle de cita) |
| `StatusBadge` | `Badge` + `APPOINTMENT_STATES` | estado de una cita |
| `KpiCard` | `Card` + título/número/nota | KPIs del panel |
| `SearchBar` | input + icono | buscar paciente/cédula |
| `AppointmentFields` | `Field` + `Input` + `Select` | campos compartidos de **nueva/editar cita** |
| `Table` | `Card` + `thead`/`tbody` + estados | tabla reutilizable (config de columnas): Pacientes · Usuarios · Médicos |
| `DataRow` | `dt` + `dd` | fila "etiqueta: valor" (ficha de paciente, detalle de cita) |
| `AppointmentError` | caja crit + lista | error de agenda: mensaje + candidatos de solapamiento (nueva/editar cita) |

> `EnlaceNav`, `SelectorVista` (Día/Semana), `FranjaHoraria`, `ItemNota` (del plan) → no se hicieron: la nav va inline en `Sidebar`; solo hay vista Día; la disponibilidad se pinta directa; las notas clínicas son **fase 2**.

## 🦠 Organismos

| Componente | Qué hace |
|-----------|----------|
| `Sidebar` | navegación por rol + usuario + salir |
| `Topbar` | título de la página + botón "Nueva cita" |
| `PatientForm` | alta/edición: **nombre + edad** (cédula opcional) |
| `UserForm` | alta/edición de personal: nombre + email + rol (+ matrícula/especialidades si médico) |
| `AppointmentDetail` | detalle de una cita + **acciones** (cancelar · asistencia · editar/mover) |

> `TablaPacientes` / `TablaUsuarios` / cuadro médico usan la molécula reutilizable **`Table`** (config de columnas). Otras secciones de una sola vista se dejaron **inline**: `Calendario` (la rejilla vive en `AgendaPage`), `PanelResumen` (en `PanelPage`), `FichaCabecera`/`FichaTabs` (en `PatientFilePage`). `FormularioCita` = `NewAppointmentPage` + `AppointmentFields`. `ListaNotasClinicas` → **fase 2**.

## 🖼️ Plantillas (layouts)

| Plantilla | Estructura |
|-----------|-----------|
| `AuthLayout` | contenedor centrado (solo Login) |
| `AppLayout` | `Sidebar` + `Topbar` + área de contenido |

## 📄 Páginas (ruta · rol)

| Página | Ruta | Quién accede | Compone |
|--------|------|--------------|---------|
| `LoginPage` | `/login` | todos | `AuthLayout` |
| `PanelPage` | `/` | todos | `KpiCard` + agenda del día (→ `AppointmentDetail`) |
| `AgendaPage` | `/agenda` | todos | rejilla médico×hora (→ `AppointmentDetail`) |
| `PatientsPage` | `/pacientes` | ADMIN · RECEPCION | `Table` + `SearchBar` + `PatientForm` |
| `PatientFilePage` | `/pacientes/:id` | ADMIN · RECEPCION | cabecera + pestañas (Datos · Historial) |
| `DoctorsPage` | `/medicos` | ADMIN · RECEPCION | `Table` (lista: médico · especialidades · disponibilidad) |
| `NewAppointmentPage` | `/citas/nueva` | ADMIN · RECEPCION | Paciente + `AppointmentFields` |
| `UsersPage` | `/usuarios` | **solo ADMIN** | `Table` + `UserForm` |
| `ConfigPage` | `/config` | **solo ADMIN** | especialidades + servicios |

> **Guardas por rol** (`App.jsx`): RECEPCIÓN **no** ve `/usuarios` ni `/config`; MEDICO ve `Panel` y su `Agenda` (**solo lectura**, sin botón "Nueva cita"). Historia clínica → **fase 2**.

## 🧰 utils/ (helpers y metadata)

| Archivo | Contenido |
|---------|-----------|
| `date.js` | `todayISO`, `formatTime`, `formatShortDate`/`LongDate`, `addDays`, `weekday`… |
| `text.js` | `initials` (para `Avatar`) |
| `data.js` | `indexBy` (lista → mapa por id) |
| `appointments.js` | `APPOINTMENT_STATES` (estado → text · color · bar · chip) |
| `roles.js` | `ROLES` (rol → label · color) |

## 🔑 Comportamientos clave (dónde vive la lógica)

- **Nueva cita** (`NewAppointmentPage` + `AppointmentFields`) → `POST /citas`: **upsert de paciente** por nombre + edad; el backend valida **disponibilidad** (con **sobrecupo**) y **cero solapamientos por médico**.
- **`AgendaPage`** → pide la disponibilidad de cada médico y **grisa** las horas fuera de ella; recepción puede **forzar sobrecupo**.
- **Acciones sobre la cita** (`AppointmentDetail`) → cancelar (libera cupo), marcar asistencia (atendida/no-show), editar/mover (revalida reglas).
- **`StatusBadge` + `APPOINTMENT_STATES`** → mapea `EstadoCita` (SCHEDULED · CONFIRMED · CANCELLED · COMPLETED · NO_SHOW) a color y etiqueta.
- **Sesión** → `AuthProvider` guarda el JWT en `localStorage`, `useAuth` lo consume, `ProtectedRoute` protege por sesión y rol; un **handler global de 401** cierra sesión y redirige a login.
- **Formularios** → `useForm(initial)` (en `hooks/`) centraliza `form` + `set(field, value)`; lo usan los 4 formularios (nueva/editar cita, paciente, usuario).
- La **cédula** no se pide al agendar (opcional, se añade después).

> Este mapa refleja lo **implementado**. La jerarquía es una **guía**, no un contrato: las piezas de un solo uso se quedaron **inline** a propósito (código más sencillo).
