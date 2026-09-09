# Especificación Técnica Formal: AomoriTrips (SPEC.md)

> Generada mediante la skill `to-spec` a partir de los requerimientos de la Unidad 4 y la consigna oficial del Trabajo Final de Ciclo (UTN.BA).

---

## 1. Alcance y Objetivos

Construir y desplegar una plataforma web funcional de TravelTech focalizada en viajes a la prefectura de Aomori (Japón), incorporando un **Agente IA de Viajes con ciclo de decisión y memoria persistente**, catálogo interactivo, cálculo dinámico de presupuestos por temporada, y emisión de vouchers offline con código QR.

---

## 2. Requerimientos Funcionales (RF)

- **RF-01: Catálogo Curado de Experiencias**:
  - Exploración de paquetes cerrados (Monte Iwaki & Onsen, Festival de Fuego Nebuta Matsuri, Ruta de los Cerezos en Hirosaki, Aventura Invernal Hakkoda).
  - Etiquetas estacionales dinámicas (`🌸 Sakura`, `🏮 Nebuta`, `🍁 Koyo`, `❄️ Snow`).
  - Precios transparentes sin costos ocultos.
- **RF-02: Selector Estacional & Cotizador**:
  - Selector interactivo de fechas y cantidad de pasajeros.
  - Cálculo inmediato del total con desglose transparente (vuelo, ryokan, billete JR Pass, seguro).
- **RF-03: Agente de Viajes IA con Ciclo de Decisión (Decision Loop)**:
  - Interfaz conversacional con streaming de respuestas.
  - Capacidad de razonar y usar herramientas (`search_packs`, `get_seasonal_forecast`, `calculate_pricing`, `create_itinerary_draft`).
  - Memoria persistente de la sesión y preferencias del usuario en base de datos.
- **RF-04: Checkout Simulado y Billetera de Viajes**:
  - Confirmación de reserva y generación de código de reserva único.
  - Generación de código QR dinámico para validación offline.
  - Vista de "Mis Viajes" accesible con los vouchers guardados.

---

## 3. Requerimientos No Funcionales y Ciberseguridad (RNF)

- **RNF-01: Rendimiento**: Time To First Byte (TTFB) < 1.0s; First Contentful Paint < 1.5s.
- **RNF-02: Identidad Estética**: Light Mode limpio (`#FFFFFF`, `#FDF8F2`), acento en naranja sol naciente (`#F97316`) y azul profundo Aomori (`#1C4F7C`), contraste accesible WCAG AA.
- **RNF-03: Ciberseguridad (Sección 6 UTN)**:
  - _Prompt Injection Guard_: Sanitización de inputs y delimitación estricta del contexto del sistema.
  - _Secretos Protegidos_: Variables de entorno (`.env`) excluidas de Git mediante `.gitignore`.
  - _Privacidad de Datos_: No se almacena información sensible innecesaria (PII mínima).
  - _Acceso Controlado_: Identificadores opacos y validación de esquemas con Zod.

---

## 4. Estructura de Datos (Prisma / Base de Datos Relacional)

- **`TravelPack`**: `id`, `slug`, `title`, `description`, `heroImage`, `priceBaseUsd`, `seasonTag`, `durationDays`, `includedHighlights` (JSON).
- **`BookingOrder`**: `id`, `packId`, `travelerName`, `travelerEmail`, `travelersCount`, `travelDate`, `totalPriceUsd`, `status`, `qrCodeData`, `createdAt`.
- **`AgentSession`**: `id`, `userId`, `startedAt`, `lastActiveAt`.
- **`AgentMessage`**: `id`, `sessionId`, `role` (`user` | `assistant` | `system` | `tool`), `content`, `toolCalls` (JSON), `createdAt`.
- **`TravelerPreference`**: `id`, `sessionId`, `budgetTier`, `interests` (JSON), `seasonPreference`.

---

## 5. Criterios de Aceptación y Verificación

1. Todos los commits pasan `husky pre-commit` (`lint-staged` con Prettier y `tsc --noEmit`).
2. La aplicación compila con `npm run build` sin errores.
3. El agente responde preguntas y es capaz de sugerir paquetes invocando sus herramientas internas.
4. Una reserva completada genera un QR escaneable y aparece en "Mis Viajes".
5. Se incluye el log de sesión real y la evidencia local con Ollama para la Parte 2 del informe de la UTN.
