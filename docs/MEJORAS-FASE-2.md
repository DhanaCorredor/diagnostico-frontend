# Frontend — Mejoras y Fase 2

> Guía de trabajo del frontend tras la entrega del MVP (release `v0.3.1`, desplegado en Vercel).
> Es el **espejo** del catálogo del backend
> ([`diagnostico-backend/docs/MEJORAS-Y-PROXIMOS-PASOS.md`](../../diagnostico-backend/docs/MEJORAS-Y-PROXIMOS-PASOS.md)):
> reutiliza sus identificadores para el trabajo derivado y añade un **bloque `F`** para lo que
> solo afecta a este repo. Revisado contra el código el **29 jul 2026**.

## 1. Convenciones

- **Código 100 % en inglés**: identificadores, funciones, componentes, archivos y tests.
- **Contrato de la API en español** (rutas, campos JSON, enums). No es un pendiente: es la
  decisión `B2` del backend, tomada a propósito porque es el idioma del centro y de la interfaz.
- **Documentación en español**, salvo `README.md`.
- **Sin comentarios en el código**: las explicaciones van en la conversación y en estos documentos.
- Commits *Conventional Commits* en inglés, atómicos. Una rama por unidad, `develop → main` con
  merge `--no-ff` y tag en los hitos. Las casillas se marcan **al mergear**.
- **Identificadores**: `F` = trabajo propio del frontend · `A`/`B`/`C` = derivado del catálogo del
  backend, con su mismo número.

## 2. Regla de orden con el backend

> **Primero se despliega la mejora en el backend, después se hace la UI.** Si la pantalla sale
> antes, pide a la API algo que todavía no existe.

**Estado del backend a 29 jul 2026:** hay mejoras terminadas en su `develop` (`A1` franjas
solapadas con `409`, `A2` CORS multi-origen, `A3` restricción de solapamiento en base de datos,
`A6` CI, `A8` inglés) que **aún no están en producción**: se publicarán juntas en la release
`v0.7.0`, a la vez que `A7` (migración de la base de datos a Neon, **con fecha límite ~14 ago 2026**).

Consecuencia práctica: el bloque `F` de abajo **no depende de esa release** y se puede hacer ya.
Lo derivado del backend (`A5`, `B1`, `C1`–`C4`) espera a que su mejora esté publicada.

## 3. Plan priorizado

| Orden | ID | Tarea | Rama | Coste | Espera al backend | Estado |
|:-----:|:--:|-------|------|:-----:|:-----------------:|:------:|
| 1 | **F1** | Terminar la migración a inglés | `refactor/english-identifiers` | bajo | no | ⬜ |
| 2 | **F2** | Pantalla de disponibilidad del médico | `feat/availability-ui` | medio | no | ⬜ |
| 3 | **F3** | Integración continua | `chore/ci-github-actions` | bajo | no | ⬜ |
| 4 | **F4** | Cobertura de tests de páginas | `test/pages-coverage` | medio | no | ⬜ |
| 5 | **F5** | Mensajes de error reales del backend | `fix/api-error-messages` | bajo | no | ⬜ |
| 6 | **F6** | Accesibilidad de pestañas y modales | `fix/a11y-tabs` | bajo | no | ⬜ |
| — | **C1** | Historia clínica | `feat/clinical-notes` | medio | sí | ⬜ |
| — | **A5** | Identificación del paciente | `feat/patient-birthdate` | medio | sí | ⬜ |
| — | **B1** | Paginación de listados | `feat/pagination` | medio | sí | ⬜ |
| — | **C2** | Reportes | `feat/reports` | alto | sí | ⬜ |
| — | **C3** | Auditoría de citas | `feat/audit-log` | medio | sí | ⬜ |
| — | **C4** | Recursos y salas | `feat/resources` | alto | sí | ⬜ |
| — | **F7** | Peticiones de disponibilidad agrupadas | `perf/availability-batch` | bajo | sí | ⬜ |

`F1` va primero porque **bloquea al resto**: cualquier funcionalidad escrita sobre la base actual
nace mezclada y habría que volver a tocar esas mismas líneas en el rename.

## 4. Bloque F — Trabajo propio del frontend

### F1 · Terminar la migración a inglés · coste bajo

- **Hoy:** los componentes, los archivos y las utilidades ya están en inglés (`indexBy`,
  `formatTime`, `APPOINTMENT_STATES`, `AppointmentDetail`), pero **las variables locales no**. En
  `AgendaPage.jsx` conviven `HORAS`, `horaDisponible`, `nombreCorto`, `filtroMedico`,
  `dispPorMedico`, `citaSel` con `loading`, `error` y `canManage`.
- **Consecuencia:** el proyecto se lee mezclado, igual que le pasaba al backend antes de `A8`.
- **Qué haríamos:** renombrar variables, funciones y estados locales de páginas y organismos, sin
  cambio de comportamiento — los tests existentes deben seguir pasando **sin tocarlos**. Después,
  los nombres de archivo que quedan en español (`utils/citas.js` → `utils/appointments.js`,
  `molecules/ErrorCita.jsx` → `molecules/AppointmentError.jsx`) y sus importaciones. Por último,
  las descripciones de `describe`/`it`, hoy en español (p. ej. `AppointmentFields.test.jsx:26`).
- **Aviso:** el contrato sigue en español, así que los campos que vienen de la API
  (`nombre_completo`, `medico_id`, `fecha_nacimiento`…) **no se tocan**. La frontera está en el
  `api.get`: fuera inglés, dentro del JSON español.

### F2 · Pantalla de disponibilidad del médico · coste medio

- **Hoy:** la UI solo **lee** las franjas (`GET /disponibilidad?medico_id=` en `DoctorsPage.jsx:39`
  y `AgendaPage.jsx:55`). Nadie llama al `POST`, que existe desde el MVP.
- **Consecuencia:** las franjas solo se pueden crear llamando a la API a mano o por el *seed*, así
  que **el administrador no puede cambiar el horario de un médico desde la aplicación**. Es el
  hueco más visible que queda en la interfaz, y así lo recoge también el backend en su §4.1.
- **Qué haríamos:** en la ficha del médico, alta y listado de franjas por día de la semana. Debe
  distinguir los dos errores de la API: el `400` de "la hora de inicio debe ser anterior a la de
  fin" y el `409` de franja cruzada que introduce `A1`. El cliente ya propaga el mensaje del
  servidor (`config/configClient.js:56-61`), así que **no hay que tocarlo**.
- **Nota:** el `409` no estará en producción hasta la release `v0.7.0` del backend; contra el
  backend local sí funciona ya.

### F3 · Integración continua · coste bajo

- **Hoy:** los tests (`pnpm vitest run`) y el lint (oxlint) se ejecutan **a mano**.
- **Qué haríamos:** el equivalente de `A6`: un *workflow* de GitHub Actions que en cada `push` y
  cada *pull request* instale con pnpm, corra la suite y pase el lint; más el *badge* en el
  `README`.
- **Por qué importa:** el flujo de ramas ya es parte del proyecto; la CI es lo que lo convierte en
  una garantía y no en una costumbre.

### F4 · Cobertura de tests de páginas · coste medio

- **Hoy:** 25 tests en 5 archivos, todos de utilidades y componentes
  (`AppointmentFields`, `Table`, `data`, `date`, `text`). **Ninguna página está cubierta.**
- **Qué haríamos:** empezar por donde más se rompería sin avisar — `LoginPage` (error `401`),
  `AgendaPage` (rejilla horaria y franjas de disponibilidad) y `PatientsPage` (búsqueda y baja).
- **Orden:** después de `F1`, para no escribir tests que haya que renombrar acto seguido.

### F5 · Mensajes de error reales del backend · coste bajo

- **Hoy:** varias páginas capturan con `catch` sin argumento y muestran un texto genérico,
  perdiendo el `detail` que el servidor sí envía. Ejemplos: `PatientsPage.jsx:49-50` ("No se pudo
  eliminar el paciente.") y `PatientFilePage.jsx:41-42` ("No se pudo cargar la ficha del
  paciente.").
- **Consecuencia:** la API explica *por qué* falló y la interfaz lo tira a la basura. Con `F2` esto
  se vuelve crítico: el `409` de franja cruzada **es** el mensaje útil.
- **Qué haríamos:** usar `ApiError.message`, que el cliente ya rellena, y dejar el texto genérico
  solo como respaldo cuando no haya `detail`.

### F6 · Accesibilidad de pestañas y modales · coste bajo

- **Hoy:** las pestañas de la ficha del paciente (`PatientFilePage.jsx:81-102`) son `<button>`
  sueltos, sin `role="tablist"` / `role="tab"` ni `aria-selected`.
- **Consecuencia:** un lector de pantalla no las anuncia como pestañas ni dice cuál está activa.
- **Qué haríamos:** los roles ARIA y la navegación con flechas; de paso, revisar el foco de los
  modales (que al abrirse el foco entre y al cerrarse vuelva al botón que los abrió).

### F7 · Peticiones de disponibilidad agrupadas · coste bajo · **espera al backend**

- **Hoy:** `DoctorsPage.jsx:39` y `AgendaPage.jsx:55` lanzan **una petición por médico**. Con los
  15 médicos reales del briefing, son 15 llamadas para pintar una pantalla.
- **Qué haría falta:** que `GET /disponibilidad` acepte varios `medico_id` (o devuelva todas las
  franjas). No tiene ficha en el catálogo del backend: **hay que proponérselo**.

## 5. Trabajo derivado del catálogo del backend

Cada uno espera a que su mejora esté **publicada** en producción.

| Mejora del backend | Qué hay que hacer aquí |
|--------------------|------------------------|
| **A5** · identificación del paciente | En `PatientForm.jsx`, pedir **fecha de nacimiento** en vez de edad y mostrar la edad calculada. Hoy `cedula` y `fecha_nacimiento` son opcionales y se envían como `null` (líneas 31-33); pasarán a ser obligatorias según decida el backend |
| **B1** · paginación | Paginador en las tablas de **Pacientes** y **Usuarios**, leyendo el total que pasará a devolver la API |
| **C1** · historia clínica | Sección de **notas clínicas** en la ficha del paciente: lista y formulario de nota nueva, visible solo para `MEDICO` y `ADMIN`. El médico **deja de ser solo lectura**, así que hay que revisar las guardas de rol (`ProtectedRoute`) y el menú del `Sidebar` |
| **C2** · reportes | Sección nueva solo para `ADMIN`: citas por médico/servicio/periodo, ausencias y ocupación |
| **C3** · auditoría | Historial de cambios en el detalle de la cita (`AppointmentDetail.jsx`). Solo `ADMIN` |
| **C4** · recursos y salas | Selector de **recurso** en el formulario de cita y mantenimiento del catálogo en `ConfigPage.jsx` |

## 6. Restricciones del contrato

Cosas que el frontend debe respetar y que no se deducen leyendo solo este repo:

- **Fechas sin zona horaria.** La API trabaja en hora local *naive* y **rechaza con `422`**
  cualquier fecha que lleve zona. Nada de `toISOString()`, que añade la `Z`. El "ahora" del centro
  es UTC−4.
- **Los mensajes de error de la API vienen en español** a propósito: los lee el personal del
  centro. Se muestran tal cual, no se traducen (ver `F5`).
- **Baja lógica, no borrado.** `DELETE /pacientes/{id}` y `/usuarios/{id}` desactivan; el registro
  es recuperable. La interfaz ya lo dice y debe seguir diciéndolo.

## 7. Ya hecho — no rehacer

- **Baja de pacientes y de usuarios:** implementada en `PatientsPage.jsx:125-145` (modal de
  confirmación con el aviso de baja lógica) y en `UsersPage.jsx:82` (alternar activar/desactivar),
  sobre `api.del` (`config/api.js:9`).
- **Filtro de servicios por especialidad (N:M):** consumido en `AppointmentFields.jsx:8-13`, con
  *fallback* que muestra todos los servicios si el backend no envía especialidades.
- **Acciones sobre la cita:** cancelar, marcar asistencia y editar, en `AppointmentDetail.jsx`.
- **Refactor a atomic design:** átomos, moléculas y organismos, con lint en 0 avisos.

## 8. Fuera del sistema

**Facturación y cobros:** fuera del ERP (SENIAT, pago directo). Decisión de alcance, no pendiente.

**PWA offline, portal de pacientes, WhatsApp, Google Calendar, visitas, Holter y duración por
médico:** son `C5` en el catálogo del backend, de coste alto y **sin fecha**. Salvo la PWA, todas
necesitan endpoints que aún no existen.

---

> Ver también: [`ARQUITECTURA.md`](ARQUITECTURA.md) · [`COMPONENTES.md`](COMPONENTES.md) · [`TESTING.md`](TESTING.md)
