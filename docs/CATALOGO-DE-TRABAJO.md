# ERP Diagnóstico — Catálogo de trabajo

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
| **B3** | Eliminar un usuario del sistema | 📝 | **Propuesta nuestra** (§5.6). Bloquea `F35` |
| **C1** | Historia clínica | ⬜ | Bloquea la sección de notas del paciente |
| **C2** | Reportes y estadísticas | ⬜ | Bloquea la sección de reportes |
| **C3** | Auditoría de cambios | ⬜ | Bloquea el historial en el detalle de cita |
| **C4** | Recursos y salas | ⬜ | Bloquea el selector de recurso |
| **C5** | WhatsApp · visitas · Holter · portal · Calendar · PWA | ⬜ | Coste alto, sin fecha |

**En `develop`, pendiente de publicar:** `feat/complete-crud` ya está mergeada (17 commits por
delante de `main`, todavía sin tag). Completa el CRUD de disponibilidad, especialidades y
servicios, añade `GET /citas/{id}` y **cambia el borrado de pacientes** (R10, ver §3.3). De paso
reorganiza la documentación del backend (retira `ROADMAP.md` y funde `FLUJO-USUARIO.md` en el
manual); `MEJORAS-Y-PROXIMOS-PASOS.md` se mantiene, así que los enlaces de aquí siguen valiendo.

## 3. Capacidades de la API que el frontend no usa

### 3.1 Publicadas y disponibles hoy

Encontradas al revisar el backend. **No requieren que el backend haga nada**: ya están en `v0.8.0`.

| Capacidad | Dónde está | Qué permite |
|-----------|-----------|-------------|
| `GET /citas?desde=&hasta=` (hasta 60 días) | `appointments.py:96-124` | `F9` vista semanal · `F15` panel con la semana |
| `GET /citas?incluir_canceladas=true` | `appointments.py:100` | `F11` — hoy una cita cancelada desaparece y no hay forma de verla |
| `GET /citas?medico_id=` | `appointments.py:99` | Filtrar en el servidor en vez de en el cliente |
| `GET /servicios?medico_id=` | `catalog.py:27-32` | `F25` — la lógica está duplicada en el frontend |
| `GET /usuarios/{id}` | `users.py:27` | `F13` ficha del médico |
| `GET /health` con comprobación de base | `A13` | `F8` aviso de "conectando…" |

### 3.2 En `develop`, pendientes de publicar

Nueve endpoints nuevos, ya mergeados en el backend pero **aún no publicados en producción**. Se
anotan aquí para tener la UI pensada; no se empieza hasta que salga la release.

| Endpoint nuevo | Qué permite en la UI |
|----------------|----------------------|
| `PUT /disponibilidad/{id}` · `DELETE /disponibilidad/{id}` | Completa `F2`: editar y borrar franjas, no solo crearlas |
| `PUT /especialidades/{id}` | `F30` — renombrar una especialidad |
| `DELETE /especialidades/{id}` | `F30` — eliminarla, con el aviso de que está en uso |
| `PUT /servicios/{id}` con especialidades | `F31` — **decidir qué especialidades ofrecen cada servicio** |
| `DELETE /servicios/{id}` | `F32` — baja lógica de verdad, en vez del apaño actual |
| `GET /citas/{id}` | `F33` — que una cita tenga URL propia |

**Tres reglas de negocio nuevas que la interfaz tendrá que explicar**, todas con `409` y datos
útiles en el `detail`:

- **R7** · dos franjas del mismo médico y día no pueden cruzarse (`OverlappingSlot`).
- **R8** · no se puede editar ni borrar una franja que **sostiene citas futuras activas**
  (`StrandedAppointments`, que **incluye cuántas**). Es el caso más delicado: el usuario cree que
  está cambiando un horario y en realidad dejaría citas huérfanas.
- **R9** · no se puede eliminar una especialidad **en uso** (`SpecialtyInUse`, que dice **cuántos
  médicos y servicios** la usan).

Las tres refuerzan `F5`: si la UI sigue tragándose el `detail`, el usuario verá "no se pudo" en vez
de "esta franja sostiene 3 citas futuras".

### 3.3 Cambio de contrato: borrar un paciente ya no es reversible

> **Esto no es una capacidad nueva: es un cambio de significado de algo que la UI ya usa.**
> Es lo más urgente del catálogo y hay que resolverlo **antes o a la vez** que la release.

`DELETE /pacientes/{id}` **ha cambiado de comportamiento** (regla R10):

| | Antes (`v0.8.0`, lo que hay en producción) | Ahora (en `develop`) |
|---|---|---|
| Qué hace | Baja lógica: `activo = False` | **Borra los datos personales para siempre** |
| ¿Se recupera? | Sí | **No. Es irreversible** |
| Respuesta | `PatientOut` | `PatientErased`: `{ resultado, citas_conservadas }` |

Con dos desenlaces, según el paciente tenga citas o no:

- **Sin citas** → se elimina la fila entera. `resultado: "eliminado"`.
- **Con citas** → se borran nombre, cédula, teléfono, fecha de nacimiento, edad, alergias y
  antecedentes; el registro sale del listado y **las citas se conservan como visita sin
  identificar**. `resultado: "anonimizado"`, con `citas_conservadas` diciendo cuántas.

**`DELETE /usuarios/{id}` no cambia**: el personal sigue con baja lógica reversible
(`PUT {"activo": true}`). Los dos botones se parecen y ahora hacen cosas radicalmente distintas.

El problema para el frontend está en `F34`.

## 4. Plan priorizado del frontend

**34 tareas**: 1 hecha, **1 urgente** (`F34`), 25 que se pueden hacer hoy y 7 que esperan al
backend.

El orden es una **propuesta**; lo que se hace de verdad es lo aprobado. Estados:

| Símbolo | Significado |
|:-------:|-------------|
| ⬜ | **Propuesta** — la sugiere el análisis, falta decidir si entra |
| ✔️ | **Aprobada** — decidida, pendiente de hacer |
| 🔨 | **En curso** — hay una rama abierta |
| ✅ | **Hecha** — mergeada en `develop` |
| ✖️ | **Descartada** — se decidió que no, con su motivo en la ficha |

> Para aprobar: marca ✔️ lo que quieras que se haga y ✖️ lo que no. Lo que quede en ⬜ no se
> empieza. Así el documento distingue lo que **propone el análisis** de lo que **has decidido tú**.

| Orden | ID | Tarea | Rama | Coste | Espera al backend | Estado |
|:-----:|:--:|-------|------|:-----:|:-----------------:|:------:|
| — | **F1** | Migración a inglés | `refactor/english-identifiers` | bajo | no | ✅ |
| **0** | **F34** | **Corregir el aviso al borrar un paciente** | `fix/patient-erase-warning` | bajo | **coordinada** | ✅ |
| 1 | **F5** | Mensajes de error reales | `fix/api-error-messages` | bajo | no | ✔️ |
| 2 | **F27** | Avisar cuando la sesión caduca | `fix/session-expired-notice` | bajo | no | ⬜ |
| 3 | **F17** | Reintentar tras un error | `fix/error-retry` | bajo | no | ⬜ |
| 4 | **F18** | Modales con teclado y foco | `fix/modal-keyboard` | bajo | no | ⬜ |
| 5 | **F19** | Aviso de cambios sin guardar | `feat/unsaved-changes-guard` | bajo | no | ⬜ |
| 6 | **F20** | Confirmación tras guardar | `feat/toasts` | bajo | no | ⬜ |
| 7 | **F28** | Cabeceras de seguridad en Vercel | `chore/security-headers` | bajo | no | ⬜ |
| 8 | **F26** | Cierre de sesión por inactividad | `feat/idle-logout` | bajo | no | ⬜ |
| 9 | **F16** | Uso en móvil y tablet | `feat/responsive-layout` | medio | no | ⬜ |
| 10 | **F2** | Pantalla de disponibilidad | `feat/availability-ui` | medio | no | ✔️ |
| 11 | **F11** | Ver las citas canceladas | `feat/cancelled-appointments` | bajo | no | ⬜ |
| 12 | **F12** | Comprobante de cita imprimible | `feat/appointment-receipt` | bajo | no | ⬜ |
| 13 | **F8** | Aviso de conexión con el servidor | `feat/connection-status` | bajo | no | ⬜ |
| 14 | **F9** | Vista semanal de la agenda | `feat/week-view` | medio | no | ⬜ |
| 15 | **F3** | Integración continua | `chore/ci-github-actions` | bajo | no | ⬜ |
| 16 | **F4** | Cobertura de tests de páginas | `test/pages-coverage` | medio | no | ⬜ |
| 17 | **F6** | Accesibilidad de pestañas | `fix/a11y-tabs` | bajo | no | ⬜ |
| 18 | **F10** | Buscador de hueco libre | `feat/next-free-slot` | medio | no | ⬜ |
| 19 | **F13** | Ficha del médico | `feat/doctor-file` | medio | no | ⬜ |
| 20 | **F21** | Esqueletos de carga | `feat/loading-skeletons` | bajo | no | ⬜ |
| 21 | **F22** | Recordar los filtros de la agenda | `feat/persist-filters` | bajo | no | ⬜ |
| 22 | **F14** | Exportar la agenda del día | `feat/export-agenda` | bajo | no | ⬜ |
| 23 | **F15** | Panel con datos de la semana | `feat/weekly-kpis` | bajo | no | ⬜ |
| 24 | **F25** | Filtrar servicios en el servidor | `refactor/services-by-doctor` | bajo | no | ⬜ |
| 25 | **F23** | Atajos de teclado | `feat/keyboard-shortcuts` | bajo | no | ⬜ |
| — | **F35** | Botón de eliminar usuario | `feat/user-delete` | bajo | **sí (B3)** | ⬜ |
| — | **F30** | Gestión completa de especialidades | `feat/specialty-management` | bajo | **sí** | ⬜ |
| — | **F31** | Qué especialidades ofrecen cada servicio | `feat/service-specialties` | medio | **sí** | ⬜ |
| — | **F32** | Baja de servicios con su propio endpoint | `refactor/service-delete` | bajo | **sí** | ⬜ |
| — | **F33** | URL propia para el detalle de cita | `feat/appointment-route` | medio | **sí** | ⬜ |
| — | **F7** | Disponibilidad en una sola petición | `perf/availability-batch` | bajo | **sí** | ⬜ |
| — | **F24** | Tabla de pacientes virtualizada | `perf/virtual-table` | medio | **sí** | ⬜ |
| — | **F29** | Dónde vive el token *(decisión abierta)* | — | alto | **sí** | ⬜ |

El orden no va por valor sino por **coste creciente dentro de cada grupo**: primero los arreglos
baratos que cambian cómo se siente la aplicación y cierran los huecos de sesión, luego lo que la
hace usable de verdad, después funcionalidad nueva.

## 5. Bloque F — Fichas

### 5.0 Urgente

#### F34 · Corregir el aviso al borrar un paciente · bajo · **hecha**

- **Hoy:** el modal de `PatientsPage.jsx:125-145` dice literalmente *"El paciente se dará de baja
  (baja lógica, recuperable)"*, y el botón se llama "Eliminar".
- **El problema:** con el cambio `R10` (§3.3) **ese texto es falso**. En cuanto se publique
  `develop`, recepción borrará pacientes **de forma irreversible** creyendo que se pueden
  recuperar. Son datos de salud y no hay copias de seguridad todavía (`A17`, §7.4).
- **Por qué es lo primero:** no es una mejora, es **una advertencia equivocada delante de una
  acción destructiva**. El resto del catálogo puede esperar; esto no.
- **Qué haríamos:**
  1. Reescribir el aviso: que diga que es **irreversible** y qué va a pasar exactamente — se
     elimina el paciente, o se borran sus datos personales y **se conservan sus citas** como
     visita sin identificar.
  2. Endurecer la confirmación. Para algo irreversible no basta con un botón rojo: pedir que se
     escriba el nombre del paciente, como hacen las herramientas que borran de verdad.
  3. Usar la respuesta, que hoy se ignora: `PatientErased` trae `resultado` y
     `citas_conservadas`. Decir "Paciente eliminado" o "Datos borrados; se conservan 4 citas como
     registro anónimo" es información que el usuario necesita.
  4. Distinguirlo de **Usuarios**, donde `DELETE` **sí** sigue siendo baja reversible. Dos botones
     que se parecen y hacen cosas opuestas piden nombres distintos: "Eliminar definitivamente"
     frente a "Desactivar".
- **Coordinación:** hay que decidir con el backend si la release espera a este arreglo o si salen
  juntos. Publicar el backend sin esto deja una trampa en producción.

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

### 5.2 Seguridad de la sesión

El `CLAUDE.md` pone la **seguridad de datos (HIPAA/GDPR)** como prioridad número uno del proyecto.
El backend cumple su parte: contraseñas con bcrypt, JWT, y los roles se comprueban **en el
servidor** (`require_role`, y en `appointments.py:125-126` un médico solo ve su agenda haga lo que
haga la UI). Lo que sigue son los huecos del **lado del navegador**, que es donde hoy no hay nada.

> Conviene tenerlo claro para la defensa: `ProtectedRoute` **no es una medida de seguridad**, es
> comodidad de navegación. Quien manda es el backend. Ocultar un botón no protege un endpoint.

#### F27 · Avisar cuando la sesión caduca · bajo

- **Hoy:** ante un `401`, `AuthProvider.jsx:13-18` borra el token, borra el usuario y navega a
  `/login`. **Sin decir nada.**
- **Consecuencia:** el usuario estaba rellenando una cita y de pronto aparece en la pantalla de
  entrada, sin saber si ha hecho algo mal, si se ha roto la aplicación o si su sesión expiró. Y lo
  que estaba escribiendo se pierde.
- **Qué haríamos:** pasar un motivo al redirigir y que `LoginPage` muestre "Tu sesión ha caducado,
  vuelve a entrar". Va con `F5`: las dos son lo mismo — contar lo que pasa en vez de tragárselo.

#### F26 · Cierre de sesión por inactividad · bajo

- **Hoy:** no existe. La sesión solo termina si el usuario pulsa salir o si una petición devuelve
  `401` porque el token ya expiró en el servidor.
- **Consecuencia:** el ordenador de recepción es **compartido y está en una zona de paso**. Una
  sesión abierta y desatendida deja a la vista el censo de pacientes y su historial de citas. Para
  datos de salud, esto es lo primero que se mira en una auditoría.
- **Qué haríamos:** temporizador de inactividad (unos 15 minutos), con aviso antes de cerrar para
  no interrumpir a media tarea. Se apoya en `F27` para explicar por qué se cerró.

#### F28 · Cabeceras de seguridad en Vercel · bajo

- **Hoy:** `vercel.json` solo tiene la reescritura de rutas de la SPA. No se envía ninguna cabecera
  de seguridad.
- **Consecuencia:** la aplicación se puede embeber en un `iframe` ajeno (*clickjacking*), no hay
  política de contenidos que limite de dónde se cargan scripts, y la URL completa viaja como
  *referrer* a terceros.
- **Qué haríamos:** un bloque `headers` en `vercel.json` con `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy` y una `Content-Security-Policy` que permita solo el
  propio origen y la API. Es configuración, no código: media hora.

#### F29 · Dónde vive el token · alto · *decisión abierta, con el backend*

- **Hoy:** el JWT se guarda en `localStorage` (`config/configClient.js:3,13-20`).
- **El problema:** `localStorage` es accesible desde JavaScript, así que **cualquier XSS se lleva
  el token** y con él la sesión. Además sobrevive a cerrar el navegador.
- **La alternativa:** que el backend lo emita como *cookie* `httpOnly` + `Secure` + `SameSite`,
  inaccesible desde JavaScript. Obliga a **tocar los dos repos** y a resolver CSRF, y el frontend
  y la API están en dominios distintos (Vercel y Render), lo que complica las cookies.
- **Recomendación:** para el alcance actual **se documenta y se deja como está**, apoyándose en que
  React escapa el contenido por defecto (el riesgo de XSS es bajo) y en que el token caduca. Si el
  sistema pasa a manejar historias clínicas reales (`C1`), se reabre.

### 5.3 Que se pueda usar de verdad

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
- **Se puede empezar ya** con lo publicado (`GET` y `POST`). Cuando salga `feat/complete-crud`
  (§3.2) se amplía con **editar y borrar**, y con el `409` de **R8**: una franja que sostiene
  citas futuras no se puede tocar, y el error dice cuántas son. Merece la pena dejar la pantalla
  preparada para esos dos botones desde el principio, en vez de rehacerla después.

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

### 5.4 Funcionalidad nueva

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

### 5.5 Calidad e infraestructura

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

### 5.6 Esperan al backend

Los cuatro primeros dependen de la rama `feat/complete-crud` (§3.2), aún sin publicar.

#### B3 · Eliminar un usuario del sistema · *propuesta para el backend*

> **Esta ficha no es trabajo del frontend: es la propuesta que hay que llevar al otro repo.**
> Aquí solo queda `F35`, el botón, que no se puede hacer hasta que exista.

**Por qué.** Hoy no se puede borrar un acceso: `DELETE /usuarios/{id}` hace baja lógica
(`activo = False`). Para un centro que da de alta y de baja personal, «este acceso ya no existe»
es una necesidad real, y hoy la lista sigue mostrando a quien se fue.

**El obstáculo.** `citas` tiene **tres** claves foráneas obligatorias a `usuarios`:

```
paciente_id     → usuarios.id   NOT NULL
medico_id       → usuarios.id   NOT NULL
creado_por_id   → usuarios.id   NOT NULL
```

Ese `creado_por_id` es quien creó la cita, así que **cualquier acceso que haya agendado alguna vez
está referenciado**, no solo los médicos. Borrar la fila sin más hace que PostgreSQL rechace la
operación.

**Regla propuesta (R11).** Misma forma que `R10` en pacientes, con el eje activo/pasado de `R8`:

| Situación del usuario | Resultado |
|-----------------------|-----------|
| Tiene **citas futuras activas** (como médico o como creador) | **No se borra.** `409`, diciendo cuántas |
| Solo tiene **citas pasadas o cerradas** | **Anonimizado**: se borran nombre, email, contraseña, matrícula y especialidades; el historial conserva la referencia |
| **No tiene ninguna cita** | **Eliminado**: se borra la fila |

En los tres casos que proceden, **el acceso desaparece**: sin correo y sin contraseña, esa persona
no vuelve a entrar ni figura en el listado. Lo único que sobrevive, cuando hay historial, es una
referencia para que una cita de marzo siga sabiendo quién la atendió.

**Cambio de contrato.** `DELETE /usuarios/{id}` pasa de dar de baja a **borrar**, igual que en
pacientes. La baja reversible se hace con `PUT /usuarios/{id}` y `{"activo": false}`, que ya
funciona.

| | Respuesta |
|---|---|
| `200` | `{ "resultado": "eliminado" \| "anonimizado", "citas_conservadas": int }` |
| `404` | El usuario no existe |
| `409` | Tiene citas futuras activas; el `detail` lleva cuántas |
| `409` | Es el **último administrador activo** |
| `422` | Es **el propio usuario autenticado** |

Las dos últimas son salvaguardas: borrar al único administrador deja el sistema sin quien
gestione, y borrarse a uno mismo a media sesión es un accidente esperando a pasar.

**Aviso:** al cambiar el significado de `DELETE`, el botón «Desactivar» de `UsersPage.jsx:82`
—que hoy llama a `api.del`— tiene que pasar a `PUT {"activo": false}` **antes o a la vez** que se
publique. Si no, dar de baja pasaría a borrar sin que nadie lo haya pedido. Es el mismo tropiezo
que `F34`.

#### F35 · Botón de eliminar usuario · bajo · **espera a `B3`**

En `UsersPage`, junto a la baja: confirmación que explique lo que va a pasar según el caso, el
mensaje del `409` cuando tenga citas futuras —diciendo cuántas—, y el resultado al terminar
(«eliminado» o «se conservan N citas»). Mismo patrón que `F34`, incluido escribir el nombre para
confirmar. Y separar los dos verbos en la interfaz: **Dar de baja** frente a **Eliminar**.

#### F30 · Gestión completa de especialidades · bajo

- **Hoy:** `ConfigPage.jsx` solo permite **crear**. Una especialidad mal escrita se queda para
  siempre en el catálogo.
- **Qué haríamos:** renombrar (`PUT`) y eliminar (`DELETE`). Al eliminar hay que contar bien el
  `409` de **R9**: no basta con "no se pudo", el backend dice **cuántos médicos y servicios** la
  usan, y eso es justo lo que el administrador necesita saber para decidir.

#### F31 · Qué especialidades ofrecen cada servicio · medio

- **Hoy:** la relación N:M entre servicios y especialidades **existe y se usa** —es la que filtra
  los servicios al elegir médico (`AppointmentFields.jsx:7-14`)— pero **no se puede editar desde
  la aplicación**. Se configuró por el *seed*.
- **Consecuencia:** la regla que decide qué puede agendarse con cada médico está fuera del alcance
  del administrador. Si entra un servicio nuevo, no hay forma de decir qué especialidad lo ofrece
  sin tocar la base de datos.
- **Qué haríamos:** en el formulario de servicio, un selector múltiple de especialidades, igual
  que el que ya existe para los médicos en `UserForm.jsx:145-166`.
- **Por qué importa más de lo que parece:** es la pieza que cierra el círculo del filtro por
  especialidad, hoy medio configurable.

#### F32 · Baja de servicios con su propio endpoint · bajo

- **Hoy:** `ConfigPage.jsx:75` da de baja un servicio con `PUT /servicios/{id}` y
  `{ activo: false }`, porque no había un `DELETE`. Es un apaño que funciona pero que confunde:
  parece una edición cuando es una baja.
- **Qué haríamos:** cambiarlo por `api.del('/servicios/{id}')` cuando exista, igual que ya se hace
  con pacientes y usuarios.

#### F33 · URL propia para el detalle de cita · medio

- **Hoy:** `AppointmentDetail` solo se abre como modal desde una lista. No hay forma de enlazar a
  una cita: si recargas la página, se pierde.
- **Consecuencia:** no se puede pasar un enlace a un compañero ni volver a una cita concreta desde
  el historial del navegador.
- **Qué haríamos:** una ruta `/citas/:id` que cargue la cita con `GET /citas/{id}`. Encaja con
  `F22`, que también busca que el estado de la vista viva en la URL.

#### F7 · Disponibilidad en una sola petición · bajo

`DoctorsPage.jsx:39` y `AgendaPage.jsx:55` lanzan **una petición por médico**: con los 15 médicos
del briefing son 15 llamadas para pintar una pantalla. Haría falta que `GET /disponibilidad`
acepte varios `medico_id`. **No tiene ficha en el catálogo del backend: hay que proponérselo.**

#### F24 · Tabla de pacientes virtualizada · medio

La tabla pinta el censo entero. Va después de `B1` (paginación), que es quien define cómo se pide
por páginas.

### 5.7 Derivado de las mejoras pendientes

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
- **Borrar y desactivar no son lo mismo, y cada uno va por su lado.**
  `DELETE /usuarios/{id}` **desactiva**: es reversible con `PUT {"activo": true}`.
  `DELETE /pacientes/{id}` **borra para siempre** desde `R10` (§3.3): no hay vuelta atrás. La
  interfaz debe decir cada cosa por su nombre (`F34`).
- **El médico solo ve su agenda**, y eso lo impone el servidor (`appointments.py:125-126`). La UI
  no debe depender de filtrar en el cliente para eso.

## 7. Riesgos del despliegue

Todo el sistema corre en planes gratuitos. Esto es lo que puede fallar, por qué, y qué se puede
hacer desde el frontend.

### 7.1 El backend se duerme

El servicio web de Render **se suspende a los 15 minutos sin tráfico** y despierta con la siguiente
petición, que tarda bastante. El servicio **no caduca**: solo duerme.

- **Se nota en:** el primer acceso del día y cualquiera tras un rato de pausa. El *login* parece
  colgado.
- **Mitigación desde aquí:** `F8` (avisar de que se está conectando) y `F21` (esqueletos en vez de
  pantalla vacía). No lo arregla, pero deja de parecer roto.
- **Lo que ya está resuelto en el backend:** `A9` añadió `pool_pre_ping`, así que la base
  suspendida no provoca `SSL SYSCALL error` al despertar.

### 7.2 La URL de la API se fija al construir

Vite sustituye `import.meta.env.VITE_API_URL` **en tiempo de compilación**, no de ejecución.

- **Consecuencia:** si la URL del backend cambia, **no basta con editar la variable en Vercel**;
  hay que volver a desplegar el frontend. Es el tipo de detalle que cuesta una tarde el día que
  pasa.

### 7.3 CORS y los despliegues de vista previa

El backend admite varios orígenes (`A2`), pero es una **lista explícita**: `FRONTEND_ORIGINS`.

- **Consecuencia:** cada *preview deploy* de Vercel recibe una URL única que **no está en esa
  lista**, así que no puede hablar con la API y la vista previa aparece rota aunque el código esté
  bien. Solo funcionan `localhost:5173` y la URL de producción.
- **Qué hacer:** saberlo antes de asustarse, y probar las ramas en local.

### 7.4 No hay copias de seguridad

`A17` sigue pendiente en el backend y el plan gratuito de Neon **no trae copias automáticas**.

- **Hoy no es grave:** en producción solo hay datos del *seed* y pruebas; la base se puede recrear.
- **Pasa a ser lo más importante del proyecto** en cuanto el centro registre pacientes y citas
  reales. Son datos de salud, y una copia que nunca se ha restaurado no se sabe si sirve.
- **No es trabajo del frontend**, pero conviene que esté escrito aquí: es el riesgo que de verdad
  puede hacer daño.

### 7.5 Límites del plan gratuito de Neon

Según el runbook del backend: **0,5 GB de almacenamiento y 100 horas de cómputo por proyecto y
mes**, con suspensión automática cuando nadie la usa. De sobra para este ERP, pero conviene saber
que existe un techo y que la suspensión es justo la que provoca 7.1.

## 8. Convenciones

- **Código 100 % en inglés**: identificadores, funciones, componentes, nombres de archivo,
  descripciones de tests y mensajes de commit. **El contrato de la API se queda en español**
  (decisión `B2`). La frontera está en la llamada a la API: un campo que viaja en el JSON conserva
  su nombre del contrato (`duracion_min`); uno puramente local se traduce (`form.date`).
- **Documentación en español**, salvo `README.md`. **Código sin comentarios.**
- Commits *Conventional Commits* en inglés y atómicos. Una rama por unidad, `develop → main` con
  merge `--no-ff` y tag en los hitos. Las casillas de este documento se marcan **al mergear**.

## 9. Ya hecho — no rehacer

- **F1 · Código en inglés** (5 commits): identificadores, props, nombres de archivo y tests.
- **Baja de pacientes y usuarios:** `PatientsPage.jsx:125-145` con modal de confirmación, y
  `UsersPage.jsx:82` para activar/desactivar, sobre `api.del` (`config/api.js:9`).
  ⚠️ El aviso del modal de pacientes **se quedó obsoleto** con `R10`: lo corrige `F34`.
- **Filtro de servicios por especialidad:** consumido en `AppointmentFields.jsx:7-14`, con
  *fallback* si el backend no envía especialidades. (`F25` lo mueve al servidor.)
- **Acciones sobre la cita:** cancelar, marcar asistencia y editar, en `AppointmentDetail.jsx`.
- **Refactor a atomic design**, con lint en 0 avisos.

## 10. Fuera del sistema

**Facturación y cobros:** fuera del ERP (SENIAT, pago directo). Decisión de alcance, no pendiente.

---

> Ver también: [`ARQUITECTURA.md`](ARQUITECTURA.md) · [`COMPONENTES.md`](COMPONENTES.md) · [`TESTING.md`](TESTING.md)
