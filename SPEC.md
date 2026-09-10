# Especificación Técnica Formal: AomoriTrips (SPEC.md)

> Generada mediante la skill `to-spec` a partir de los requerimientos de la Unidad 4 y la consigna oficial del Trabajo Final de Ciclo (UTN.BA).

---

## 1. Alcance y Objetivos

Construir y desplegar una plataforma web funcional de TravelTech focalizada en viajes a la prefectura de Aomori (Japón), incorporando un **Agente IA de Viajes con ciclo de decisión y memoria persistente**, catálogo interactivo, cálculo dinámico de presupuestos por temporada, y emisión de vouchers offline con código QR.

---

## 2. Requerimientos Funcionales (RF)

### Capa 3 — Viajero (MVP Original)

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

### Capa 1 — Soñador / Fan de Cultura Japonesa _(nuevo — Revisión 2)_

- **RF-05: Personajes Guía Originales (`CulturalGuideCharacter`)**:
  - Dos personajes en estilo anime: **Sakura** (primavera/cerezos) y **Haruto** (verano/festival).
  - Ilustraciones generadas con IA, 100% originales, sin referencia a franquicias existentes.
  - Presencia decorativa en: landing page hero, sección quiz, pantalla de resultado del quiz, y zonas de entrada al agente IA.
  - Imágenes en formato WebP optimizado; fuente: royalty-free / generación propia hasta incorporar assets finales.
- **RF-06: Quiz Interactivo "¿Cuál es tu Japón?" (`QuizSession` → `QuizResult`)**:
  - Requiere autenticación de usuario (login requerido antes de iniciar).
  - 7 preguntas de perfil cultural sobre preferencias de anime, comida, clima, ritmo de viaje y tipo de experiencia.
  - Al completar, el Agente IA llama a `generate_quiz_recommendation(quiz_answers)` para producir un `QuizResult`.
  - El resultado incluye: región recomendada, temporada ideal, estilo de viaje inferido y carta de presentación personalizada.
  - El resultado es **compartible**: se genera una imagen/card OG compartible en redes sociales (og:image dinámica).
  - El `QuizResult` alimenta el `TravelerProfile` del usuario para futuras recomendaciones del agente.
- **RF-07: Bucket List "Sueños de Japón" (`BucketListItem`)**:
  - Usuario autenticado puede guardar destinos, packs o experiencias en su lista de deseos.
  - Accesible desde perfil del usuario en "Mis Sueños".
- **RF-08: Guías Culturales (`CulturalGuide`)**:
  - Secciones de contenido: gastronomía japonesa, etiqueta onsen, vocabulario básico, festivales por temporada.
  - Accesibles sin autenticación.
  - El Agente IA responde preguntas culturales mediante la herramienta `answer_cultural_question(topic)`.

### Capa 2 — Planificador Activo _(nuevo — Revisión 2)_

- **RF-09: Armador de Itinerario Grupal con IA (`DraftItinerary`)**:
  - El usuario define un `GroupProfile`: tamaño (1–12 personas), tipo de grupo (`solo | couple | friends | family`), días, presupuesto por persona, temporada, restricciones alimentarias.
  - El Agente llama a `generate_group_itinerary(group_profile)` y retorna un `DraftItinerary` con estructura día a día.
  - Cada día incluye: actividades (`Activity[]`), sugerencias gastronómicas (`MealSuggestion[]`) con indicadores de restricciones dietarias, y alojamiento sugerido.
  - El itinerario existe **solo en la sesión activa** (no persiste en DB).
  - Al confirmar el `DraftItinerary`, se crea un **`CustomPack`** persistido y disponible para reserva (flujo Capa 3).
- **RF-10: Calculadora de Presupuesto DIY (`BudgetBreakdown`)**:
  - Herramienta libre no atada a packs prearmados.
  - Componentes seleccionables: vuelo estimado, tipo de hospedaje, días de JR Pass, actividades opcionales.
  - Desglose en tiempo real por persona y por grupo total.
- **RF-11: Comparador de Temporadas**:
  - Visualización interactiva mes a mes: clima, eventos, precio estimado, nivel de turismo.
  - Usa datos de `get_seasonal_forecast(month)`.

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

### Tablas originales (Capa 3)

- **`TravelPack`**: `id`, `slug`, `title`, `description`, `heroImage`, `priceBaseUsd`, `seasonTag`, `durationDays`, `includedHighlights` (JSON).
- **`BookingOrder`**: `id`, `packId`, `travelerName`, `travelerEmail`, `travelersCount`, `travelDate`, `totalPriceUsd`, `status`, `qrCodeData`, `createdAt`.
- **`AgentSession`**: `id`, `userId`, `startedAt`, `lastActiveAt`.
- **`AgentMessage`**: `id`, `sessionId`, `role` (`user` | `assistant` | `system` | `tool`), `content`, `toolCalls` (JSON), `createdAt`.
- **`TravelerPreference`**: `id`, `sessionId`, `budgetTier`, `interests` (JSON), `seasonPreference`.

### Tablas nuevas — Revisión 2

- **`QuizSession`**: `id`, `userId`, `answers` (JSON), `completedAt`, `createdAt`.
- **`QuizResult`**: `id`, `sessionId`, `region`, `season`, `travelStyle` (`relaxed | adventurous | cultural | gastronomic`), `personalizedCard` (Text), `createdAt`.
- **`BucketListItem`**: `id`, `userId`, `type` (`pack | experience | destination`), `refId` (nullable), `title`, `imageUrl` (nullable), `notes` (nullable), `createdAt`.
- **`CustomPack`**: `id`, `userId`, `title`, `groupSize` (1–12), `groupType` (`solo | couple | friends | family`), `durationDays`, `season`, `itineraryJson` (JSON), `budgetPerPersonUsd`, `status` (`draft | confirmed`), `createdAt`.

---

## 5. Criterios de Aceptación y Verificación

1. Todos los commits pasan `husky pre-commit` (`lint-staged` con Prettier y `tsc --noEmit`).
2. La aplicación compila con `npm run build` sin errores.
3. El agente responde preguntas y es capaz de sugerir paquetes invocando sus herramientas internas.
4. Una reserva completada genera un QR escaneable y aparece en "Mis Viajes".
5. Se incluye el log de sesión real y la evidencia local con Ollama para la Parte 2 del informe de la UTN.
