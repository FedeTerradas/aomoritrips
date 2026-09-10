# Ticket 007 — Personajes Guía: Sakura y Haruto (RF-05)

**Estado**: ready-for-agent
**Dependencias**: ninguna (assets independientes de la lógica de negocio)
**Estimación**: S

## Descripción

Incorporar los dos `CulturalGuideCharacter` originales en la UI. Son decorativos en el MVP.

## Criterios de Aceptación

- [ ] Directorio `/public/characters/` creado con placeholders SVG/WebP para `sakura.webp` y `haruto.webp`
- [ ] Componente `<CharacterDisplay character="sakura" | "haruto" />` reutilizable
- [ ] Sakura visible en landing page (sección hero o debajo del hero)
- [ ] Haruto visible en landing page (sección de packs de verano / Nebuta)
- [ ] Ambos personajes aparecen en: entrada al quiz, resultado del quiz, header del agente IA
- [ ] Imágenes con `alt` descriptivo y lazy loading
- [ ] Formato WebP con fallback PNG

## Notas técnicas

- Por ahora usar placeholders SVG en estilo anime (silueta naranja/azul con los colores de marca)
- El componente debe aceptar prop `size: 'sm' | 'md' | 'lg'`
- Reemplazables fácilmente cuando lleguen los assets finales generados con IA
