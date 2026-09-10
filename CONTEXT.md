# AomoriTrips - Domain Context & Ubiquitous Language

> Contexto de dominio y glosario de términos ubicuos para la plataforma **AomoriTrips** (Viajes a Japón con Inteligencia Artificial).
>
> **Revisión 2 — Septiembre 2026**: Ampliación de alcance para incluir Capa 1 (Soñadores / fans de cultura japonesa) y Capa 2 (Planificadores activos). Ver ADR-004.

---

## 1. Misión del Dominio

Eliminar la incertidumbre logística, cultural e idiomática que experimentan los viajeros occidentales al planificar y comprar experiencias de viaje en la región de Aomori y el norte de Japón, a través de paquetes integrales transparentes y un **Agente IA de Viajes** con razonamiento agéntico y memoria persistente.

---

## 2. Glosario de Términos Ubicuos (Ubiquitous Language)

### Entidades Principales

- **`TravelPack`**: Paquete integral de viaje cerrado que consolida vuelo internacional, estancia en Ryokan, pases de tren (JR Pass) y actividades culturales con precio total garantizado sin costos ocultos.
- **`DestinationExperience`**: Atracción o punto de interés curado en la prefectura de Aomori (ej. Castillo de Hirosaki, Lago Towada, Montes Hakkoda, Museo Nebuta Warasse).
- **`RyokanStay`**: Hospedaje tradicional japonés incluido en los packs, caracterizado por habitaciones con tatami, baños termales _onsen_ y cena ceremonial _kaiseki_.
- **`SeasonalWindow`**: Ventana estacional de alta demanda y singularidad climática:
  - `SakuraSpring` (Abril-Mayo): Floración de cerezos en Hirosaki.
  - `NebutaSummer` (Agosto): Festival de carrozas de fuego Nebuta Matsuri.
  - `KoyoAutumn` (Octubre-Noviembre): Follaje rojo y dorado en Oirase Gorge.
  - `SnowWinter` (Diciembre-Marzo): Nieve profunda, onsen nevados y figuras de hielo.
- **`TravelerProfile`**: Perfil del usuario que almacena sus preferencias (número de personas, estilo de viaje relajado vs. aventurero, presupuesto, restricciones alimentarias).
- **`BookingOrder`**: Registro de reserva de un paquete turístico con identificador único, estado de pago (`PENDING`, `CONFIRMED`), desglose de costos y código QR de validación.
- **`OfflineVoucher`**: Comprobante digital optimizado con código QR cifrado, descargable para consulta en estaciones o zonas rurales sin internet.

### Dominio Agéntico de IA

- **`TravelAgentOrchestrator`**: Motor agéntico con ciclo de decisión (`observe -> reason -> tool_call -> verify -> answer`) que asesora al viajero, busca packs acordes a su perfil y resuelve dudas logísticas y culturales.
- **`AgentPersistentMemory`**: Almacenamiento en base de datos de las sesiones del usuario, mensajes históricos y preferencias inferidas para mantener continuidad conversacional en futuras visitas.
- **`SecurityGuard`**: Filtro perimetral del agente para mitigar _Prompt Injections_, intentos de fuga de instrucciones y sanitización de entradas de usuario.
- **`AgentTools`**:
  - `search_packs(category, season, max_budget)`: Consulta de paquetes en base de datos.
  - `get_seasonal_forecast(month)`: Recomendación climática y eventos estacionales en Aomori.
  - `create_itinerary_draft(pack_id, days, travelers)`: Generación de itinerario personalizado.
  - `calculate_pricing(pack_id, season, travelers)`: Cotización con tarifas dinámicas.

---

## 3. Entidades — Capa 1: Soñadores / Fans de Cultura Japonesa

- **`CulturalGuideCharacter`**: Personaje original en estilo anime creado específicamente para AomoriTrips (no vinculado a ninguna franquicia existente). Actúa como mascota visual de la plataforma. MVP incluye dos personajes:
  - `Sakura`: Guía de primavera y cerezos. Asociada a la temporada `SakuraSpring` e Hirosaki.
  - `Haruto`: Guía masculino de verano/aventura. Asociado a la temporada `NebutaSummer` y los festivales.
    Aparecen en la landing page y en otras zonas definidas de la UI (quiz, resultados, agente IA). Son **decorativos** en el MVP — no tienen voz propia en el agente.
- **`QuizSession`**: Instancia de una sesión de quiz "¿Cuál es tu Japón?" asociada a un usuario autenticado. Almacena las respuestas a las 7 preguntas de perfil cultural.
- **`QuizResult`**: Resultado calculado de un `QuizSession`. Contiene: región recomendada, temporada ideal, estilo de viaje inferido (`relaxed | adventurous | cultural | gastronomic`), y una carta de presentación personalizada generada por el Agente IA. Es **compartible** como imagen/card en redes sociales.
- **`BucketListItem`**: Ítem guardado en la lista de deseos "Sueños de Japón" de un usuario autenticado. Puede referenciar una `DestinationExperience`, un `TravelPack`, o un destino libre descrito en texto.
- **`CulturalGuide`**: Artículo de contenido cultural no transaccional (gastronomía, onsen etiquette, vocabulario básico, festivales). Accesible sin autenticación.

---

## 4. Entidades — Capa 2: Planificadores Activos

- **`DraftItinerary`**: Itinerario día a día generado por el Agente IA a partir de los parámetros del usuario. Existe **exclusivamente en la sesión activa** (no se persiste en base de datos). Estructura por día: `{ day: number, activities: Activity[], meals: MealSuggestion[], accommodation: string }`.
  - Un `DraftItinerary` confirmado por el usuario puede convertirse en un **`CustomPack`**, que sí persiste y puede ser reservado (Capa 3).
- **`CustomPack`**: Variante de `TravelPack` generada dinámicamente a partir de un `DraftItinerary` aprobado. A diferencia de un pack cerrado, sus componentes (alojamiento, actividades, gastronomía) fueron elegidos iterativamente por el usuario con asistencia del Agente.
- **`GroupProfile`**: Caracterización del grupo viajero para el armado de itinerario. Campos: `size` (1–12 personas), `type` (`solo | couple | friends | family`), `durationDays`, `budgetPerPersonUsd`, `season`, `dietaryRestrictions[]`.
- **`Activity`**: Unidad mínima de un itinerario. Campos: `title`, `location`, `durationHours`, `estimatedCostUsd`, `category` (`cultural | nature | festival | onsen | gastronomy`).
- **`MealSuggestion`**: Sugerencia gastronómica dentro de un día de itinerario. Campos: `mealType` (`breakfast | lunch | dinner`), `restaurantName`, `cuisine`, `estimatedCostUsd`, `dietaryTags[]`.
- **`BudgetBreakdown`**: Desglose de presupuesto de un `DraftItinerary` o `CustomPack`: vuelo estimado, alojamiento, JR Pass, actividades, gastronomía, seguro. Expresado por persona y total de grupo.

---

## 5. Dominio Agéntico de IA (actualizado)

- **`TravelAgentOrchestrator`**: Motor agéntico con ciclo de decisión (`observe -> reason -> tool_call -> verify -> answer`) que asesora al viajero, busca packs acordes a su perfil y resuelve dudas logísticas y culturales.
- **`AgentPersistentMemory`**: Almacenamiento en base de datos de las sesiones del usuario, mensajes históricos y preferencias inferidas para mantener continuidad conversacional en futuras visitas.
- **`SecurityGuard`**: Filtro perimetral del agente para mitigar _Prompt Injections_, intentos de fuga de instrucciones y sanitización de entradas de usuario.
- **`AgentTools`**:
  - `search_packs(category, season, max_budget)`: Consulta de paquetes en base de datos.
  - `get_seasonal_forecast(month)`: Recomendación climática y eventos estacionales en Aomori.
  - `create_itinerary_draft(pack_id, days, travelers)`: Generación de itinerario personalizado desde pack existente.
  - `calculate_pricing(pack_id, season, travelers)`: Cotización con tarifas dinámicas.
  - `generate_quiz_recommendation(quiz_answers)` _(nuevo)_: Analiza las respuestas del `QuizSession` y produce un `QuizResult` con región, temporada y carta personalizada.
  - `generate_group_itinerary(group_profile)` _(nuevo)_: Construye un `DraftItinerary` completo con actividades, gastronomía y alojamiento para un `GroupProfile` dado.
  - `answer_cultural_question(topic)` _(nuevo)_: Responde preguntas culturales sobre Japón (gastronomía, etiqueta, idioma, historia) sin requerir intención de compra.

---

## 6. Principios de Diseño

- **Identidad visual no cliché**: Rechazo del esquema rojo/blanco dominante en turismo japonés; uso de naranja sol naciente (`#F97316`) y azul Aomori (`#1C4F7C`).
- **Transparencia radical**: Precios finales desde la primera pantalla; el usuario nunca descubre tarifas ocultas en el checkout.
- **Resiliencia offline**: Toda reserva confirmada genera un voucher accesible sin conexión a internet.
