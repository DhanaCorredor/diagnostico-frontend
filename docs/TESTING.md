# Testing del Frontend — Diagnóstico

> **Qué probamos, por qué y para qué.** Complementa a [`ARQUITECTURA.md`](ARQUITECTURA.md).
> Los tests del backend viven en su repo (`tests/` + `docs/TESTING.md`); estos cubren la capa de cliente.

---

## Herramientas y por qué

| Herramienta | Para qué |
|-------------|----------|
| **Vitest** | *test runner* nativo de Vite → comparte la config del proyecto, arranca rápido, sin duplicar toolchain |
| **React Testing Library** | probar componentes **como los usa la persona** (por texto/rol, no por detalles internos) |
| **jsdom** | DOM simulado en Node para renderizar componentes sin navegador |

**Ejecutar:**
```bash
pnpm test          # una pasada (CI)
pnpm test:watch    # modo watch mientras desarrollas
```

**Filosofía:** pocos tests, bien elegidos. Se priorizan (1) la **lógica pura propensa a errores** y (2) la **funcionalidad crítica de negocio**. No se busca cobertura del 100 %, sino proteger lo que **rompería silenciosamente** o **causaría errores de agenda**.

---

## Qué se prueba y por qué

### `utils/date` — 10 tests · *lógica de fechas*
- **Por qué:** las fechas son la fuente de bugs más típica (zonas horarias, *off-by-one*), y el backend exige **hora local naive**.
- **Para qué:**
  - `formatShortDate` **no adelanta el día** en fechas date-only (regresión del bug real de UTC ya corregido).
  - `addDays` cruza bien **cambio de mes y de año** (navegación de la agenda).
  - `weekday` mapea correctamente el día (se usa para grisar horas fuera de disponibilidad).

### `utils/data` (`indexBy`) — 2 tests
- **Por qué / para qué:** es la base de casi todas las búsquedas por id (médico/servicio/paciente). Si falla, se ven "—" o nombres incorrectos en toda la app.

### `utils/text` (`initials`) — 5 tests
- **Para qué:** las iniciales del `Avatar`; se comprueban casos límite (un solo nombre, espacios de más, cadena vacía).

### `components/Table` — 4 tests · *componente reutilizado en 3 vistas*
- **Por qué:** `Table` es la pieza compartida por Pacientes, Usuarios y Médicos; un fallo se propaga a las tres.
- **Para qué:** garantizar sus **cuatro estados** — filas, **vacío**, **error** (con prioridad sobre el vacío) y **cargando** (sin mostrar filas ni vacío).

### `components/AppointmentFields` — 3 tests · *funcionalidad crítica*
- **Por qué:** es la regla que **evita agendar servicios que no corresponden al médico** (p. ej. un servicio de cardiología con una ginecóloga) — justo el error que se quería prevenir.
- **Para qué:**
  - Con un médico elegido, **solo** aparecen los servicios de **su especialidad**.
  - **Degradación segura:** si el backend aún no envía `especialidades`, se muestran todos (no rompe).
  - Al **cambiar de médico**, se **resetea** el servicio elegido.

---

## Qué NO se cubre (a propósito)

- **Flujos contra la API real** (login, alta de cita con validación de solapamientos): los cubre el **backend** con sus tests de integración; duplicarlos aquí aportaría poco.
- **End-to-end** (navegador completo, Playwright/Cypress): **fase 2**.
- **Estilos/visual**: fuera de alcance para el MVP.

---

## Resumen

**24 tests** en 5 archivos, todos en verde. Cubren la **lógica de fechas** (lo más frágil) y la **regla de negocio clave** del filtrado por especialidad, más el componente reutilizable `Table`. Se ejecutan con `pnpm test`.
