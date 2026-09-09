# ADR 002: Persistencia y Base de Datos

## Estado

Aceptado

## Contexto

El sistema requiere persistir paquetes turísticos, reservas con estados (`PENDING`, `CONFIRMED`) y, fundamentalmente, la **memoria del agente IA** (sesiones de usuario, preferencias declaradas e historial conversacional) según lo solicitado por la cátedra.

## Decisión

Se adopta una base de datos relacional orientada a tipos (Prisma ORM con SQLite en desarrollo y compatibilidad directa con PostgreSQL / Supabase para producción en nube).

### Tablas Clave:

- `TravelPack`: Catálogo con imágenes, precios base, temporada recomendada y tags.
- `BookingOrder`: Reservas de usuarios, fecha de viaje, cantidad de personas, estado y código QR.
- `AgentSession`: Sesiones del usuario con el agente de viajes.
- `AgentMessage`: Registro histórico de mensajes (usuario vs. asistente) para dar soporte al contexto continuo.
- `TravelerPreference`: Memoria de preferencias inferidas (presupuesto estimado, intereses culturales, época de viaje preferida).

## Consecuencias

- Esquema fuertemente tipado con TypeScript.
- Resuelve la exigencia de memoria persistente solicitada en la Sección 2 del informe.
