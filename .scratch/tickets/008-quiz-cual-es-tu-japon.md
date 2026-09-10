# Ticket 008 — Quiz Interactivo '¿Cuál es tu Japón?' (RF-06)

**Estado**: ready-for-agent
**Dependencias**: 007 (personajes en pantalla resultado), DB migration (QuizSession, QuizResult)
**Estimación**: L

## Descripción

Quiz de 7 preguntas que produce un `QuizResult` personalizado via agente IA. Requiere login. El resultado es compartible en redes sociales.

## Criterios de Aceptación

- [ ] Ruta `/quiz` protegida por autenticación (redirect a login si no autenticado)
- [ ] 7 preguntas de selección (una por pantalla con transición animada):
  1. ¿Qué tipo de anime preferís?
  2. ¿Cuál es tu comida japonesa favorita?
  3. ¿Qué clima preferís para viajar?
  4. ¿Cómo definís tu ritmo de viaje?
  5. ¿Qué tipo de alojamiento preferís?
  6. ¿Qué experiencia buscás más?
  7. ¿Cuándo podrías viajar?
- [ ] Al completar, se persiste `QuizSession` en DB con las respuestas
- [ ] El agente llama a `generate_quiz_recommendation(quiz_answers)` y devuelve `QuizResult`
- [ ] Pantalla de resultado en `/quiz/resultado` muestra: región, temporada, estilo, carta personalizada del agente, y personaje Sakura o Haruto según la temporada recomendada
- [ ] Botón "Compartir mi resultado" genera og:image dinámica (Next.js `opengraph-image.tsx`)
- [ ] El `QuizResult` se persiste en DB y enriquece `TravelerProfile`

## Esquema DB nuevo

`QuizSession: id, userId, answers (JSON), completedAt
QuizResult:  id, sessionId, region, season, travelStyle, personalizedCard (text), createdAt`

## Herramienta agente nueva

`generate_quiz_recommendation(quiz_answers: QuizAnswers): QuizResult`
