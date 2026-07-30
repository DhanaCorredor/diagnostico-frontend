# ERP Diagnóstico — Mejoras del backend y trabajo del frontend

> **Catálogo único de trabajo pendiente.** Reúne en un solo sitio el estado de las mejoras del
> **backend** y, a partir de ellas, **qué hay que hacer en el frontend**.
> Contrastado contra el código de los dos repos el **30 jul 2026**.
>
> Backend: release `v0.8.0` · Frontend: release `v0.3.1`.
> El catálogo detallado del backend vive en su propio repo:
> [`diagnostico-backend/docs/MEJORAS-Y-PROXIMOS-PASOS.md`](../../diagnostico-backend/docs/MEJORAS-Y-PROXIMOS-PASOS.md).

## 1. Cómo leer este documento

Cada mejora lleva un **identificador estable** para poder citarla en ramas, commits e *issues*:

| Prefijo | Significado |
|---------|-------------|
| **A** | Deuda técnica del backend |
| **B** | Cambios que tocan el contrato de la API (backend + frontend a la vez) |
| **C** | Funcionalidad de fase 2 |
| **F** | Trabajo del frontend |

`A`, `B` y `C` son los identificadores del backend y se usan aquí **con el mismo número**, para que
los dos documentos hablen igual. El bloque `F` es propio de este repo.

**Coste**: `bajo` (una sesión) · `medio` (una o dos) · `alto` (varias o servicios externos).

> **Regla de orden entre repos:** primero se **publica** la mejora en el backend, después se hace
> la UI. Si la pantalla sale antes, pide a la API algo que todavía no existe.

## 2. Estado del backend

Qué está ya en producción y qué falta. Es el resumen; el detalle de cada ficha está en el repo del
backend.

| ID | Mejora | Estado | Qué desbloquea aquí |
|:--:|--------|:------:|---------------------|
| **A1** | Franjas de disponibilidad solapadas (`409`) | ✅ | `F2` — hay un error real que mostrar |
| **A2** | CORS multi-origen | ✅ | Desarrollo local contra el backend de Render |
| **A3** | Anti-solapamiento en base de datos | ✅ | Nada nuevo; es red de seguridad |
| **A4** | Unicidad sin distinguir mayúsculas ni acentos | ✅ | `F5` — nuevos mensajes de duplicado que mostrar |
| **A6** | Integración continua | ✅ | `F3` — hay un flujo que replicar |
| **A7** | Base de datos migrada a Neon | ✅ | Nada; la URL de la API no cambió |
| **A8**·**A15** | Código y configuración en inglés | ✅ | Referencia para `F1` |
| **A9**·**A12**·**A13** | Pool, dependencias fijadas, `/health` con base | ✅ | `F8` — hay un endpoint que consultar |
| **A5** | Identificación robusta del paciente | ⬜ | Bloquea el cambio de `edad` a fecha de nacimiento |
| **A14** | Índices en la base de datos | ⬜ | Nada |
| **A17** | Copias de seguridad | ⬜ | Nada |
| **B1** | Paginación de listados | ⬜ | Bloquea `F24` y el paginador real |
| **B2** | Contrato de la API en inglés | ✖️ | **Decidido que no**: el contrato se queda en español |
| **C1** | Historia clínica | ⬜ | Bloquea la sección de notas del paciente |
| **C2** | Reportes y estadísticas | ⬜ | Bloquea la sección de reportes |
| **C3** | Auditoría de cambios | ⬜ | Bloquea el historial en el detalle de cita |
| **C4** | Recursos y salas | ⬜ | Bloquea el selector de recurso |
| **C5** | WhatsApp · visitas · Holter · portal · Calendar · PWA | ⬜ | Coste alto, sin fecha |

## 3. Capacidades de la API que el frontend no usa

Encontradas al revisar el backend. **No requieren que el backend haga nada**: ya están publicadas.

| Capacidad | Dónde está | Qué permite |
|-----------|-----------|-------------|
| `GET /citas?desde=&hasta=` (hasta 60 días) | `appointments.py:96-124` | `F9` vista semanal · `F15` panel con la semana |
| `GET /citas?incluir_canceladas=true` | `appointments.py:100` | `F11` — hoy una cita cancelada desaparece y no hay forma de verla |
| `GET /citas?medico_id=` | `appointments.py:99` | Filtrar en el servidor en vez de en el cliente |
| `GET /servicios?medico_id=` | `catalog.py:27-32` | `F25` — la lógica está duplicada en el frontend |
| `GET /usuarios/{id}` | `users.py:27` | `F13` ficha del médico |
| `GET /health` con comprobación de base | `A13` | `F8` aviso de "conectando…" |

## 4. Plan priorizado del frontend

| Orden | ID | Tarea | Rama | Coste | Espera al backend | Estado |
|:-----:|:--:|-------|------|:-----:|:-----------------:|:------:|
| — | **F1** | Migración a inglés | `refactor/english-identifiers` | bajo | no | ✅ |
| 1 | **F5** | Mensajes de error reales | `fix/api-error-messages` | bajo | no | ⬜ |
| 2 | **F17** | Reintentar tras un error | `fix/error-retry` | bajo | no | ⬜ |
| 3 | **F18** | Modales con teclado y foco | `fix/modal-keyboard` | bajo | no | ⬜ |
| 4 | **F19** | Aviso de cambios sin guardar | `feat/unsaved-changes-guard` | bajo | no | ⬜ |
| 5 | **F20** | Confirmación tras guardar | `feat/toasts` | bajo | no | ⬜ |
| 6 | **F16** | Uso en móvil y tablet | `feat/responsive-layout` | medio | no | ⬜ |
| 7 | **F2** | Pantalla de disponibilidad | `feat/availability-ui` | medio | no | ⬜ |
| 8 | **F11** | Ver las citas canceladas | `feat/cancelled-appointments` | bajo | no | ⬜ |
| 9 | **F12** | Comprobante de cita imprimible | `feat/appointment-receipt` | bajo | no | ⬜ |
| 10 | **F8** | Aviso de conexión con el servidor | `feat/connection-status` | bajo | no | ⬜ |
| 11 | **F9** | Vista semanal de la agenda | `feat/week-view` | medio | no | ⬜ |
| 12 | **F3** | Integración continua | `chore/ci-github-actions` | bajo | no | ⬜ |
| 13 | **F4** | Cobertura de tests de páginas | `test/pages-coverage` | medio | no | ⬜ |
| 14 | **F6** | Accesibilidad de pestañas | `fix/a11y-tabs` | bajo | no | ⬜ |
| 15 | **F10** | Buscador de hueco libre | `feat/next-free-slot` | medio | no | ⬜ |
| 16 | **F13** | Ficha del médico | `feat/doctor-file` | medio | no | ⬜ |
| 17 | **F21** | Esqueletos de carga | `feat/loading-skeletons` | bajo | no | ⬜ |
| 18 | **F22** | Recordar los filtros de la agenda | `feat/persist-filters` | bajo | no | ⬜ |
| 19 | **F14** | Exportar la agenda del día | `feat/export-agenda` | bajo | no | ⬜ |
| 20 | **F15** | Panel con datos de la semana | `feat/weekly-kpis` | bajo | no | ⬜ |
| 21 | **F25** | Filtrar servicios en el servidor | `refactor/services-by-doctor` | bajo | no | ⬜ |
| 22 | **F23** | Atajos de teclado | `feat/keyboard-shortcuts` | bajo | no | ⬜ |
| — | **F7** | Disponibilidad en una sola petición | `perf/availability-batch` | bajo | **sí** | ⬜ |
| — | **F24** | Tabla de pacientes virtualizada | `perf/virtual-table` | medio | **sí** | ⬜ |

El orden no va por valor sino por **coste creciente dentro de cada grupo**: primero los cinco
arreglos baratos que cambian cómo se siente la aplicación, luego lo que la hace usable de verdad,
después funcionalidad nueva.

## 5. Bloque F — Fichas

### 5.1 La interfaz no dialoga con quien la usa

Cinco problemas distintos con el mismo fondo: la aplicación no avisa de lo que va a perder, no
confirma lo que ha hecho y, cuando algo falla, deja al usuario tirado. Juntos cambian la sensación
de uso más que cualquier funcionalidad nueva.

#### F5 · Mensajes de error reales del backend · bajo

- **Hoy:** varias páginas capturan con `catch` sin argumento y muestran un texto genérico, tirando
  el `detail` que el servidor sí envía. `PatientsPage.jsx:49-50` dice siempre "No se pudo eliminar
  el paciente."; `PatientFilePage.jsx:41-42`, "No se pudo cargar la ficha del paciente."
- **Consecuencia:** el backend explica *por qué* falló y la interfaz lo tira a la basura. Con `A1`
  y `A4` publicadas esto empeora: hay mensajes nuevos y útiles (franja cruzada, cédula duplicada
  ignorando acentos) que nunca se ven.
- **Qué haríamos:** usar `ApiError.message`, que el cliente ya rellena
  (`config/configClient.js:56-61`), y dejar el texto genérico solo como respaldo.
- **Por qué va primera:** es requisito de `F2`. De poco sirve que `A1` devuelva un `409` bien
  explicado si la UI lo sustituye por "no se pudo".

#### F17 · Reintentar tras un error · bajo

- **Hoy:** `PanelPage.jsx:58-59` y `PatientFilePage.jsx:52-53` hacen `if (error) return <Alert>`.
- **Consecuencia:** el error es un callejón sin salida. La única salida es recargar la página
  entera, y en un backend que se duerme los fallos transitorios son normales.
- **Qué haríamos:** un botón "Reintentar" junto al mensaje, que vuelva a llamar a `load()`.

#### F18 · Modales con teclado y foco · bajo

- **Hoy:** `Modal.jsx` solo se cierra con el botón ✕. No responde a `Escape`, no cierra al pulsar
  fuera y no atrapa el foco: con el tabulador te sales del modal hacia la página de detrás.
- **Consecuencia:** es incómodo para quien trabaja rápido e inaccesible con lector de pantalla.
- **Qué haríamos:** `Escape`, clic en el fondo, foco al abrir y devolución del foco al cerrar.
  Se arregla una vez en la molécula y lo heredan los seis modales.

#### F19 · Aviso de cambios sin guardar · bajo

- **Hoy:** cerrar el modal de paciente, usuario o cita descarta el formulario entero sin preguntar.
- **Consecuencia:** un clic fuera de sitio y hay que reescribirlo todo. Con `F18` el riesgo sube,
  porque `Escape` y el clic fuera añaden dos formas nuevas de cerrar sin querer.
- **Qué haríamos:** comparar el formulario con su estado inicial y pedir confirmación si cambió.
  **Va junto con `F18`.**

#### F20 · Confirmación tras guardar · bajo

- **Hoy:** al guardar, el modal se cierra y la lista se recarga. Nada dice que haya salido bien.
- **Consecuencia:** en acciones rápidas el usuario no sabe si se guardó y repite la operación.
- **Qué haríamos:** un aviso breve y no bloqueante ("Paciente guardado", "Cita cancelada").

### 5.2 Que se pueda usar de verdad

#### F16 · Uso en móvil y tablet · medio

- **Hoy:** `AppLayout.jsx:9` empuja el contenido con `ml-60` fijo y `Sidebar.jsx:56` es
  `fixed … w-60` sin forma de plegarse.
- **Consecuencia:** **en un móvil la aplicación no se puede usar** y en una tablet en vertical se
  queda sin sitio. En un centro de salud con tablets en recepción, eso importa.
- **Qué haríamos:** barra lateral plegable con botón en la `Topbar`, `ml-60` solo desde `lg:`, y
  repasar las tablas para que hagan *scroll* horizontal en vez de desbordar.

#### F2 · Pantalla de disponibilidad del médico · medio

- **Hoy:** la UI solo **lee** las franjas (`DoctorsPage.jsx:39`, `AgendaPage.jsx:55`). Nadie llama
  al `POST /disponibilidad`, que existe desde el MVP.
- **Consecuencia:** las franjas solo se crean llamando a la API a mano o por el *seed*, así que
  **el administrador no puede cambiar el horario de un médico desde la aplicación**. Es el hueco
  más visible que queda, y así lo recoge también el backend en su §4.1.
- **Qué haríamos:** alta y listado de franjas por día en la ficha del médico, distinguiendo el
  `400` ("inicio posterior al fin") del `409` de `A1` (franja cruzada).

#### F11 · Ver las citas canceladas · bajo

- **Hoy:** `GET /citas` las excluye por defecto y el frontend nunca pide `incluir_canceladas=true`.
- **Consecuencia:** una cita cancelada **desaparece de la interfaz**. "¿Qué se canceló ayer?" no
  tiene respuesta sin entrar en la base de datos.
- **Qué haríamos:** una casilla "mostrar canceladas" en la agenda, con su estilo atenuado.

#### F12 · Comprobante de cita imprimible · bajo

- **Hoy:** no hay nada que darle al paciente.
- **Qué haríamos:** una vista de impresión con fecha, hora, médico, estudio y las indicaciones de
  preparación. Solo CSS de impresión; **no necesita API**.
- **Por qué merece la pena:** es de lo que más se usa a diario en un centro real y no depende de
  nadie.

#### F8 · Aviso de conexión con el servidor · bajo

- **Hoy:** el servicio web de Render **se duerme a los 15 minutos sin tráfico**. La primera
  petición después tarda bastante y el usuario ve un formulario que no responde.
- **Qué haríamos:** consultar `/health` al arrancar y mostrar "conectando con el servidor…".
  `A13` hizo que ese endpoint compruebe también la base de datos, así que la respuesta es fiable.

#### F9 · Vista semanal de la agenda · medio

- **Hoy:** solo se puede ver un día (`?fecha=`), aunque la API acepta rangos de hasta 60 días.
- **Consecuencia:** recepción no puede planificar. Para colocar una cita hay que ir día a día.
- **Qué haríamos:** conmutador día/semana en la agenda, con una sola petición `?desde=&hasta=`.

### 5.3 Funcionalidad nueva

#### F10 · Buscador de hueco libre · medio

"¿Cuándo puede la Dra. X?" se resuelve hoy mirando la rejilla a ojo. Se calcula cruzando
`/disponibilidad` con `/citas` del rango, ambos ya disponibles. Es la funcionalidad que más
tiempo ahorra en recepción.

#### F13 · Ficha del médico · medio

`GET /usuarios/{id}` existe y no se usa. Una ficha con sus especialidades, su horario y su agenda
del día, igual que la del paciente. Hoy solo hay un listado.

#### F14 · Exportar la agenda del día · bajo

Descargar la agenda en CSV para imprimir o pasar el parte. Se genera en el cliente con lo que ya
está cargado; **no necesita API**.

#### F15 · Panel con datos de la semana · bajo

Los KPI actuales solo miran hoy. Con `?desde=&hasta=` salen ocupación y ausencias de la semana sin
esperar a `C2`.

### 5.4 Calidad e infraestructura

#### F3 · Integración continua · bajo

Los tests (`pnpm vitest run`) y el lint (oxlint) se ejecutan a mano. Replicar `A6`: un *workflow*
de GitHub Actions en cada `push` y *pull request*, más el *badge* en el `README`. Aquí es más
simple que en el backend: no hace falta base de datos de servicio.

#### F4 · Cobertura de tests de páginas · medio

25 tests en 5 archivos, todos de utilidades y componentes. **Ninguna página está cubierta.**
Empezar por `LoginPage` (error `401`), `AgendaPage` (rejilla y disponibilidad) y `PatientsPage`
(búsqueda y baja).

#### F6 · Accesibilidad de pestañas · bajo

Las pestañas de la ficha del paciente (`PatientFilePage.jsx:81-102`) son `<button>` sueltos, sin
`role="tablist"` / `role="tab"` ni `aria-selected`: un lector de pantalla no las anuncia como
pestañas. (El foco de los modales se resuelve en `F18`.)

#### F21 · Esqueletos de carga · bajo

Hoy la carga es un spinner de página completa y, con el backend dormido, son varios segundos de
pantalla vacía. Sustituirlo por esqueletos que dibujen la forma de lo que va a llegar.

#### F22 · Recordar los filtros de la agenda · bajo

`AgendaPage` reinicia fecha y médico al volver a entrar. Guardarlos en la URL (parámetros de
consulta) hace además que la vista se pueda compartir por enlace.

#### F25 · Filtrar servicios en el servidor · bajo

`GET /servicios?medico_id=` filtra por las especialidades del médico, pero el frontend
reimplementa esa lógica en `AppointmentFields.jsx:7-14`. Está duplicada en los dos repos: si la
regla cambia, hay que acordarse de ambos.

#### F23 · Atajos de teclado · bajo

Recepción trabaja rápido y todo se hace a ratón. Al menos: nueva cita, buscar y cerrar modal.

### 5.5 Esperan al backend

#### F7 · Disponibilidad en una sola petición · bajo

`DoctorsPage.jsx:39` y `AgendaPage.jsx:55` lanzan **una petición por médico**: con los 15 médicos
del briefing son 15 llamadas para pintar una pantalla. Haría falta que `GET /disponibilidad`
acepte varios `medico_id`. **No tiene ficha en el catálogo del backend: hay que proponérselo.**

#### F24 · Tabla de pacientes virtualizada · medio

La tabla pinta el censo entero. Va después de `B1` (paginación), que es quien define cómo se pide
por páginas.

### 5.6 Derivado de las mejoras pendientes

Cada uno espera a que su mejora esté **publicada**.

| Mejora | Qué hay que hacer aquí |
|--------|------------------------|
| **A5** · identificación del paciente | En `PatientForm.jsx`, pedir **fecha de nacimiento** en vez de edad y mostrar la edad calculada. Hoy `cedula` y `fecha_nacimiento` son opcionales y se envían como `null` (líneas 31-33) |
| **B1** · paginación | Paginador en Pacientes y Usuarios, leyendo el total que pasará a devolver la API |
| **C1** · historia clínica | Sección de notas en la ficha del paciente, solo para `MEDICO` y `ADMIN`. El médico deja de ser solo lectura: hay que revisar `ProtectedRoute` y el menú del `Sidebar` |
| **C2** · reportes | Sección nueva solo para `ADMIN`: citas por médico/servicio/periodo, ausencias y ocupación |
| **C3** · auditoría | Historial de cambios en `AppointmentDetail.jsx`. Solo `ADMIN` |
| **C4** · recursos y salas | Selector de recurso en el formulario de cita y catálogo en `ConfigPage.jsx` |

## 6. Restricciones del contrato

Cosas que el frontend debe respetar y que no se deducen leyendo solo este repo:

- **Fechas sin zona horaria.** La API trabaja en hora local *naive* y **rechaza con `422`**
  cualquier fecha que lleve zona. Nada de `toISOString()`, que añade la `Z`. El "ahora" del centro
  es UTC−4.
- **Rango máximo de 60 días** en `GET /citas?desde=&hasta=`; si se supera, `422`.
- **Los mensajes de error de la API vienen en español** a propósito: los lee el personal del
  centro. Se muestran tal cual, no se traducen.
- **Baja lógica, no borrado.** `DELETE /pacientes/{id}` y `/usuarios/{id}` desactivan; el registro
  es recuperable. La interfaz ya lo dice y debe seguir diciéndolo.
- **El médico solo ve su agenda**, y eso lo impone el servidor (`appointments.py:125-126`). La UI
  no debe depender de filtrar en el cliente para eso.

## 7. Convenciones

- **Código 100 % en inglés**: identificadores, funciones, componentes, nombres de archivo,
  descripciones de tests y mensajes de commit. **El contrato de la API se queda en español**
  (decisión `B2`). La frontera está en la llamada a la API: un campo que viaja en el JSON conserva
  su nombre del contrato (`duracion_min`); uno puramente local se traduce (`form.date`).
- **Documentación en español**, salvo `README.md`. **Código sin comentarios.**
- Commits *Conventional Commits* en inglés y atómicos. Una rama por unidad, `develop → main` con
  merge `--no-ff` y tag en los hitos. Las casillas de este documento se marcan **al mergear**.

## 8. Ya hecho — no rehacer

- **F1 · Código en inglés** (5 commits): identificadores, props, nombres de archivo y tests.
- **Baja de pacientes y usuarios:** `PatientsPage.jsx:125-145` con modal de confirmación y aviso de
  baja lógica, y `UsersPage.jsx:82` para activar/desactivar, sobre `api.del` (`config/api.js:9`).
- **Filtro de servicios por especialidad:** consumido en `AppointmentFields.jsx:7-14`, con
  *fallback* si el backend no envía especialidades. (`F25` lo mueve al servidor.)
- **Acciones sobre la cita:** cancelar, marcar asistencia y editar, en `AppointmentDetail.jsx`.
- **Refactor a atomic design**, con lint en 0 avisos.

## 9. Fuera del sistema

**Facturación y cobros:** fuera del ERP (SENIAT, pago directo). Decisión de alcance, no pendiente.

---

> Ver también: [`ARQUITECTURA.md`](ARQUITECTURA.md) · [`COMPONENTES.md`](COMPONENTES.md) · [`TESTING.md`](TESTING.md)
