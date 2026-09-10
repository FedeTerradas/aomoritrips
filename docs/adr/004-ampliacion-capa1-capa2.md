# ADR 004: Ampliación de Alcance — Inclusión de Capa 1 y Capa 2

## Estado

Aceptado

## Contexto

El MVP de AomoriTrips servía exclusivamente a usuarios con intención de compra activa de paquetes turísticos (Capa 3). Tras análisis del segmento de amantes de la cultura japonesa, se identificó que este perfil representa solo el ~10% del mercado potencial total. El 90% restante corresponde a:

- **Capa 1 — Soñadores**: fans de anime, manga, gastronomía japonesa, sin viaje planificado.
- **Capa 2 — Planificadores**: usuarios investigando activamente, que prefieren construir su propio itinerario antes de comprar un pack cerrado.

## Decisión

Se amplía el alcance del producto incorporando los RF-05 a RF-11, transformando AomoriTrips de una agencia de paquetes a una **plataforma cultural de viajes a Japón**. Los nuevos módulos no reemplazan el MVP sino que crean un embudo de conversión natural hacia él.

### Personajes originales: Sakura y Haruto

Se incorporan dos `CulturalGuideCharacter` originales en estilo anime, creados con herramientas de IA generativa. No replican personajes de franquicias existentes. Aparecen de forma decorativa en la landing page, el quiz, los resultados y la entrada al agente.

### Quiz con login y resultado compartible

El quiz requiere autenticación para asociar el `QuizResult` al perfil del usuario y enriquecer el `TravelerProfile`. El resultado es compartible como imagen OG dinámica.

### Itinerario grupal en sesión (máx. 12 personas)

El `DraftItinerary` vive en la sesión activa del agente. Al ser aprobado, se persiste como `CustomPack` disponible para reserva. El límite de 12 personas es una heurística razonable para grupos de viaje independiente.

### Gastronomía como ciudadano de primera clase

El `DraftItinerary` incluye `MealSuggestion[]` por día, con etiquetas de restricciones dietarias (`vegetarian`, `vegan`, `halal`, `gluten-free`).

## Consecuencias

- El sistema agéntico requiere 3 nuevas herramientas (`generate_quiz_recommendation`, `generate_group_itinerary`, `answer_cultural_question`).
- El esquema de DB incorpora las tablas `QuizSession`, `QuizResult`, `BucketListItem`.
- La UI suma las rutas `/quiz`, `/quiz/resultado`, `/itinerary-builder`, `/cultura`, `/mis-suenos`.
- Se agrega el `GroupProfile` como nuevo concepto de dominio con validación Zod.
- Las imágenes de los personajes se gestionan como assets estáticos en `/public/characters/`.
