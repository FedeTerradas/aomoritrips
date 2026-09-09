# ADR 003: Arquitectura Agéntica de IA y Memoria Persistente

## Estado

Aceptado

## Contexto

La consigna de la entrega final exige orquestación agéntica con ciclos de decisión (`observe -> reason -> act -> verify`), integración de herramientas (tool calling) y memoria persistente. También exige evaluar el papel de un SLM/LLM local frente a APIs en la nube.

## Decisión

Se implementa una arquitectura híbrida:

1. **Nube (Producción Web)**: Motor de agente ejecutando sobre Gemini / OpenAI mediante llamadas a funciones tipadas (Tools) y persistencia de memoria contextual en base de datos.
2. **Local (Parte 2 de la Consigna - SLM)**: Integración y validación local con Ollama (Llama 3.2 / Phi-3) para responder preguntas sobre itinerarios sin requerir conexión a internet ni costos por token.
3. **Ciberseguridad y Guardrails**:
   - Sanitización de entradas y filtrado de palabras clave de inyección de prompt (`ignore previous instructions`, `system prompt override`).
   - Esquemas estrictos de validación con Zod para toda herramienta invocada por la IA.
   - Aislamiento de variables de entorno (`.env` en `.gitignore`).

## Consecuencias

- Cumplimiento de la Sección 2 (diagrama de flujo agéntico y de memoria).
- Cumplimiento de la Sección 6 (log de ciberseguridad con 4 mitigaciones concretas).
- Preparación directa para el entregable opcional de la Parte 2 (captura de terminal con Ollama).
