# Ticket 003: Rutas API, Checkout y Generación de Vouchers QR

- **Estado**: completed (merged)
- **Dependencias**: Ticket 001, Ticket 002
- **Criterio de Aceptación**:
  - `GET /api/packs`: Obtener catálogo completo o filtrado.
  - `POST /api/agent/chat`: Endpoint para interactuar con el agente IA, registrar memoria y ejecutar ciclo de decisión.
  - `POST /api/bookings`: Creación de reserva con validación Zod, emisión de identificador y generación de código QR SVG/data URI.
  - `GET /api/bookings`: Consulta de reservas para el usuario (billetera offline).
