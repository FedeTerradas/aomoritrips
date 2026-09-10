# Ticket 010 — Guías Culturales (RF-08)

**Estado**: ready-for-agent
**Dependencias**: ninguna
**Estimación**: M

## Descripción

Secciones de contenido cultural estático (sin autenticación). El agente responde preguntas culturales con la herramienta answer_cultural_question.

## Criterios de Aceptación

- [ ] Ruta /cultura con 4 secciones: Gastronomia, Onsen Etiquette, Vocabulario Basico, Festivales
- [ ] Cada seccion es un componente CulturalGuide con contenido estatico en MDX o JSON
- [ ] Sin requisito de login para acceder
- [ ] Herramienta del agente answer_cultural_question(topic) implementada
- [ ] El agente puede responder preguntas como: que es el kaiseki, como comportarse en un onsen, cuando es el Nebuta Matsuri
- [ ] Personaje Haruto aparece como decoracion en la seccion de festivales
- [ ] Personaje Sakura aparece en la seccion de gastronomia
