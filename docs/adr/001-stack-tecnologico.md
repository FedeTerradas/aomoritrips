# ADR 001: Selección del Stack Tecnológico

## Estado

Aceptado

## Contexto

El Trabajo Final de Ciclo de la UTN.BA exige una aplicación real, funcional y demostrable, con despliegue público y orquestación agéntica con memoria persistente. Se requiere además evaluar el stack en una tabla comparativa fundamentada.

## Decisión

Se selecciona el siguiente stack:

1. **Frontend**: Next.js 15 (React 19) con TypeScript y diseño en CSS Vanilla / CSS Modules.
   - _Motivo_: Rendimiento extremo, Server Components, y control total del diseño sin imponer frameworks pesados o utilitarios arbitrarios, cumpliendo las directivas estéticas de Light Mode `#FFFFFF` / `#FDF8F2` con acentos `#1C4F7C` y `#F97316`.
2. **Backend & API**: Next.js Route Handlers y Server Actions.
   - _Motivo_: Monolito modular en TypeScript que unifica el cliente, el orquestador agéntico y el acceso a base de datos en un solo repositorio desplegable en Vercel sin costos fijos.
3. **Control de Calidad**: Husky + Prettier + lint-staged + TypeScript (`tsc --noEmit`) en pre-commit hooks, garantizando calidad de código en cada commit.

## Consecuencias

- Un único lenguaje en todo el proyecto (TypeScript).
- Despliegue en 1 clic en Vercel para satisfacer el enlace obligatorio de la primera página del informe.
