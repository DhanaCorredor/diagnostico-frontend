# Frontend — Mejoras y Fase 2

> Guía de trabajo del frontend tras la entrega del MVP (`v0.3.1`, desplegado en Vercel).
> Cada tarea indica su **rama**; se trabaja en orden, una rama por unidad, `develop → main` con
> merge `--no-ff` y tag en los hitos. Las casillas se marcan al mergear.
>
> El equivalente del backend es [`diagnostico-backend/docs/MEJORAS-Y-PROXIMOS-PASOS.md`](../../diagnostico-backend/docs/MEJORAS-Y-PROXIMOS-PASOS.md);
> este documento es su reflejo en el frontend y **no repite** lo que allí ya está resuelto.

## 0. Alineación con el backend

Lo que el backend ya tiene en `develop` (`v0.6.x`) y qué significa aquí:

| Backend | Efecto en el frontend |
|---------|-----------------------|
| Franjas solapadas rechazadas con **409** | Habilita `feat/availability-ui`: hay un error real que mostrar |
| **CORS multi-origen** | `localhost:5173` vuelve a poder atacar el backend de Render sin tocar `FRONTEND_ORIGIN` |
| **CI con GitHub Actions** (tests + lint) | El frontend no tiene CI: hueco a cubrir (ver 2) |
| `DELETE /pacientes/{id}` y `/usuarios/{id}` | Habilitan los botones de desactivar (ver 2) |
| Filtro de servicios por especialidad (N:M) | **Ya consumido** en `AppointmentFields.jsx:8-13`, con *fallback* si el backend no envía especialidades |

**Restricciones del contrato que el frontend debe respetar:**

- **Fechas sin zona horaria.** La API trabaja en hora local *naive* y **rechaza con 422** cualquier
  fecha que lleve zona. Nada de `toISOString()` (añade la `Z`); el "ahora" del centro es UTC-4.
- **Un solo idioma por capa.** El código va en inglés, el contrato en español (ver 4.3).

*Facturación:* fuera del sistema (SENIAT, pago directo). No es un pendiente del ERP ni del frontend.

## Convenciones

- **Código 100 % en inglés**: identificadores, funciones, componentes, archivos y tests.
  El **contrato de la API sigue en español** (rutas, campos JSON, enums), porque es el idioma
  del centro médico; esa decisión se revisa en el punto 4.3.
- **Documentación en español**, salvo `README.md`.
- **Sin comentarios en el código**: las explicaciones van en la conversación y en estos documentos.
- Commits *Conventional Commits* en inglés, atómicos.

---

## 1. Base: terminar la migración a inglés

Bloquea al resto: cualquier funcionalidad nueva escrita sobre la base actual nace híbrida y
habría que volver a tocar esas mismas líneas en el rename. El backend ya hizo este mismo paso.

**Estado actual**: componentes, archivos y utilidades ya están en inglés (`indexBy`,
`formatTime`, `APPOINTMENT_STATES`, `AppointmentDetail`), pero las variables locales no.
En `AgendaPage.jsx` conviven `HORAS`, `horaDisponible`, `nombreCorto`, `filtroMedico`,
`dispPorMedico`, `citaSel` con `loading`, `error`, `canManage`.

- [ ] **`refactor/english-identifiers`** — renombrar variables, funciones y estados locales de
      todas las páginas y organismos. Sin cambio de comportamiento: los tests existentes deben
      seguir pasando sin tocarlos.
- [ ] **`refactor/english-filenames`** — `utils/citas.js` → `utils/appointments.js`,
      `molecules/ErrorCita.jsx` → `molecules/AppointmentError.jsx`, y sus importaciones.
- [ ] **`refactor/english-tests`** — descripciones de `describe`/`it` en inglés
      (hoy están en español, p. ej. `AppointmentFields.test.jsx:26`).

## 2. Próximos pasos inmediatos

Funcionalidad de bajo esfuerzo cuyo endpoint **ya existe en el backend**.

- [ ] **`feat/patient-deactivate`** — botón "Desactivar" en la ficha del paciente.
      `DELETE /pacientes/{id}` existe desde `v0.6.0`; `PatientFilePage.jsx:75-77` solo ofrece
      "Editar". Requiere confirmación en modal y recarga posterior.
- [ ] **`feat/user-deactivate`** — mismo caso para el personal en `UsersPage.jsx`.
- [ ] **`feat/availability-ui`** — pantalla para **crear y ver franjas horarias** de un médico.
      Hoy el frontend solo lee (`GET /disponibilidad?medico_id=` en `DoctorsPage.jsx:39` y
      `AgendaPage.jsx:55`); nadie llama al `POST`. Debe mostrar el **409 de solapamiento**, que el
      backend ya devuelve. El cliente ya propaga el mensaje del servidor
      (`config/configClient.js:56-61`), así que no hace falta tocarlo.
- [ ] **`chore/ci-github-actions`** — el backend ya corre tests y lint en cada push; el frontend
      no tiene CI. Replicar el flujo con `pnpm vitest run` y `pnpm lint` (oxlint), que hoy solo se
      ejecutan a mano.
- [ ] **`test/pages-coverage`** — hoy hay 25 tests en 5 archivos y **ninguna página** está
      cubierta. Prioridad: `LoginPage` (flujo de error 401), `AgendaPage` (rejilla y
      disponibilidad), `PatientsPage` (búsqueda y filtrado).

## 3. Fase 2 — Funcionalidades

Lado frontend de las funcionalidades que el backend dejó conscientemente fuera del MVP.
Cada una depende de que exista antes el endpoint correspondiente.

| Mejora | Trabajo en el frontend | Depende del backend |
|--------|------------------------|---------------------|
| **Historia clínica** | Pestaña de notas en la ficha del paciente; editor por cita | Sí (`notas_clinicas` es andamiaje) |
| **Reportes y estadísticas** | Vista con gráficos: citas por médico/servicio, no-shows, ocupación | Sí (endpoints de agregación) |
| **Auditoría** | Vista de log filtrable por usuario y fecha | Sí |
| **Recursos / salas** | Mostrar la sala en la agenda y en el detalle de cita | Sí |
| **Duración por médico/servicio** | La duración deja de ser fija en el formulario de cita | Sí |
| **Visitas (agrupar estudios)** | Alta de varios estudios en una misma visita | Sí |
| **Holter: colocación y retiro** | Dos momentos en la agenda para un mismo estudio | Sí |
| **Portal de pacientes** | App/rutas públicas con login propio de paciente | Sí |
| **Recordatorios por WhatsApp** | Pantalla de configuración y estado de envíos | Sí |
| **Google Calendar** | Botón de conexión y estado de sincronización | Sí |
| **PWA offline** | *Service worker*, manifiesto y caché de lectura para recepción | No |

## 4. Deuda técnica

Detectada en el código actual; no bloquea nada, pero conviene resolverla.

### 4.1 Errores que se tragan el mensaje del backend

Varias páginas capturan con `catch` vacío y muestran un texto genérico, perdiendo el `detail`
que el servidor sí envía. Ejemplo: `PatientFilePage.jsx:41-42` muestra siempre
"No se pudo cargar la ficha del paciente." Conviene usar `ApiError.message`, que el cliente ya
rellena. Rama sugerida: **`fix/api-error-messages`**.

### 4.2 N+1 de peticiones en el cliente

`DoctorsPage.jsx:39` y `AgendaPage.jsx:55` lanzan **una petición de disponibilidad por médico**
(15 médicos = 15 llamadas). Con un endpoint que acepte varios `medico_id` sería una sola.
Requiere coordinación con el backend. Rama sugerida: **`perf/availability-batch`**.

### 4.3 Contrato de la API en inglés *(decisión abierta)*

El **código** de ambos repos queda en inglés; el **contrato** (rutas, campos JSON, valores de
enum) sigue en español. Cambiarlo obliga a tocar backend y frontend a la vez, así que se decide
y se ejecuta de forma coordinada, o se documenta como decisión de dominio y se deja como está.

### 4.4 Accesibilidad

Las pestañas de la ficha del paciente (`PatientFilePage.jsx:81-102`) son `<button>` sueltos sin
`role="tablist"` / `role="tab"` ni `aria-selected`, por lo que un lector de pantalla no las
anuncia como pestañas. Revisar también el foco en los modales.
Rama sugerida: **`fix/a11y-tabs`**.

### 4.5 Paginación

Los listados de pacientes y personal cargan todo de golpe. El backend tampoco pagina todavía
(está en su propia deuda técnica), así que **va después que él**.

### 4.6 Identificación del paciente

Contrapartida de la deuda del backend (hoy identifica por `nombre_completo` + `edad`, con riesgo
de duplicados). En `PatientForm.jsx` tanto `cedula` como `fecha_nacimiento` son **opcionales** y se
envían como `null` si van vacías (líneas 31-33). Cuando el backend decida exigir uno de los dos,
el formulario debe marcarlo como obligatorio y validarlo antes de enviar.
**Va después del backend**, que es quien define la regla.

---

> Ver también: [`ARQUITECTURA.md`](ARQUITECTURA.md) · [`COMPONENTES.md`](COMPONENTES.md) · [`TESTING.md`](TESTING.md)
