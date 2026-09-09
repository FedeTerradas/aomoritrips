# Ticket 002: Orquestador del Agente de Viajes IA y Memoria Persistente

- **Estado**: ready-for-agent
- **Dependencias**: Ticket 001
- **Criterio de Aceptación**:
  - Implementación del ciclo de decisión agéntico (`observe -> reason -> act -> verify`).
  - Capa de herramientas con validación tipada (Zod):
    - `search_packs(category, season, maxBudget)`
    - `get_seasonal_forecast(season)`
    - `calculate_pricing(packId, travelers, seasonMultiplier)`
    - `create_itinerary_draft(packId, durationDays, interests)`
  - Memoria persistente en base de datos: recuperación del historial de mensajes y actualización de preferencias del usuario.
  - Guardrail de seguridad: detección y bloqueo de ataques de prompt injection.
