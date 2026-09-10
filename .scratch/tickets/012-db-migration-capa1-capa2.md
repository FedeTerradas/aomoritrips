# Ticket 012 — DB Migration: Nuevas Tablas Capa 1 y Capa 2 (RF-06, RF-07, RF-09)

**Estado**: ready-for-agent
**Dependencias**: 001 (schema base)
**Estimación**: S

## Descripción

Migracion de Prisma para agregar las tablas requeridas por las features de Capa 1 y Capa 2.

## Nuevas tablas

### QuizSession

- id (cuid), userId (FK User), answers (Json), completedAt (DateTime), createdAt (DateTime)

### QuizResult

- id (cuid), sessionId (FK QuizSession), region (String), season (String), travelStyle (Enum: relaxed|adventurous|cultural|gastronomic), personalizedCard (Text), createdAt (DateTime)

### BucketListItem

- id (cuid), userId (FK User), type (Enum: pack|experience|destination), refId (String?), title (String), imageUrl (String?), notes (String?), createdAt (DateTime)

### CustomPack

- id (cuid), userId (FK User), title (String), groupSize (Int), groupType (Enum: solo|couple|friends|family), durationDays (Int), season (String), itineraryJson (Json), budgetPerPersonUsd (Float), status (Enum: draft|confirmed), createdAt (DateTime)

## Criterios de Aceptación

- [ ] schema.prisma actualizado con los 4 modelos
- [ ] npx prisma migrate dev genera migracion sin errores
- [ ] npx prisma generate actualiza el cliente
- [ ] Seed actualizado con al menos 1 QuizSession y 1 CustomPack de ejemplo
