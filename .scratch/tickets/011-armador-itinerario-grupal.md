# Ticket 011 — Armador de Itinerario Grupal con IA (RF-09)

**Estado**: ready-for-agent
**Dependencias**: 002 (agente base), nueva herramienta generate_group_itinerary
**Estimación**: XL

## Descripción

Feature estrella de Capa 2. El usuario define un GroupProfile y el agente genera un DraftItinerary dia a dia con actividades, gastronomia y alojamiento. Al confirmar, se crea un CustomPack persistido.

## Criterios de Aceptación

- [ ] Ruta /itinerary-builder con wizard de GroupProfile (3 pasos):
  - Paso 1: Cantidad de personas (1-12), tipo de grupo (solo|couple|friends|family)
  - Paso 2: Duracion (3-14 dias), temporada, presupuesto por persona
  - Paso 3: Restricciones alimentarias (multi-select: vegetariano, vegano, halal, sin gluten, ninguna)
- [ ] Zod schema GroupProfileSchema validando todos los campos
- [ ] Herramienta generate_group_itinerary(group_profile: GroupProfile) implementada
- [ ] El agente genera DraftItinerary con estructura: { days: DayPlan[], totalBudgetEstimate: BudgetBreakdown }
- [ ] Cada DayPlan: { dayNumber, activities: Activity[], meals: MealSuggestion[], accommodation }
- [ ] UI del itinerario generado: acordeon por dia, cada dia expandible
- [ ] MealSuggestion muestra etiquetas de restricciones dietarias
- [ ] Boton "Guardar como Mi Pack" convierte DraftItinerary en CustomPack (persiste en DB)
- [ ] CustomPack aparece en flujo de reserva estandar de Capa 3

## Esquema CustomPack (extension de TravelPack)

CustomPack: id, userId, title, groupSize, groupType, durationDays, season, itineraryJson (JSON), budgetPerPersonUsd, status (draft|confirmed), createdAt

## Herramienta agente

generate_group_itinerary(group_profile: GroupProfile): DraftItinerary
