# Ticket 009 — Bucket List Suenos de Japon (RF-07)

**Estado**: ready-for-agent
**Dependencias**: auth existente, DB migration (BucketListItem)
**Estimación**: M

## Descripción

Sistema de lista de deseos para usuarios autenticados. Permite guardar destinos, packs y experiencias.

## Criterios de Aceptación

- [ ] Tabla BucketListItem en DB: id, userId, type (pack|experience|destination), refId, title, imageUrl, notes, createdAt
- [ ] API route POST /api/bucket-list: agregar ítem
- [ ] API route DELETE /api/bucket-list/:id: eliminar ítem
- [ ] API route GET /api/bucket-list: listar ítems del usuario autenticado
- [ ] Botón corazón/estrella en cards de packs y experiencias para guardar en bucket list
- [ ] Ruta /mis-suenos con grid de ítems guardados
- [ ] Toast de confirmación al guardar/eliminar
- [ ] Estado vacío con ilustración de Sakura invitando a explorar

## Esquema DB nuevo

BucketListItem: id, userId, type, refId (nullable), title, imageUrl, notes, createdAt
