# AomoriTrips - Domain Context & Ubiquitous Language

> Contexto de dominio y glosario de términos ubicuos para la plataforma **AomoriTrips** (Viajes a Japón con Inteligencia Artificial).

---

## 1. Misión del Dominio

Eliminar la incertidumbre logística, cultural e idiomática que experimentan los viajeros occidentales al planificar y comprar experiencias de viaje en la región de Aomori y el norte de Japón, a través de paquetes integrales transparentes y un **Agente IA de Viajes** con razonamiento agéntico y memoria persistente.

---

## 2. Glosario de Términos Ubicuos (Ubiquitous Language)

### Entidades Principales

- **`TravelPack`**: Paquete integral de viaje cerrado que consolida vuelo internacional, estancia en Ryokan, pases de tren (JR Pass) y actividades culturales con precio total garantizado sin costos ocultos.
- **`DestinationExperience`**: Atracción o punto de interés curado en la prefectura de Aomori (ej. Castillo de Hirosaki, Lago Towada, Montes Hakkoda, Museo Nebuta Warasse).
- **`RyokanStay`**: Hospedaje tradicional japonés incluido en los packs, caracterizado por habitaciones con tatami, baños termales _onsen_ y cena ceremonial _kaiseki_.
- **`SeasonalWindow`**: Ventana estacional de alta demanda y singularidad climática:
  - `SakuraSpring` (Abril-Mayo): Floración de cerezos en Hirosaki.
  - `NebutaSummer` (Agosto): Festival de carrozas de fuego Nebuta Matsuri.
  - `KoyoAutumn` (Octubre-Noviembre): Follaje rojo y dorado en Oirase Gorge.
  - `SnowWinter` (Diciembre-Marzo): Nieve profunda, onsen nevados y figuras de hielo.
- **`TravelerProfile`**: Perfil del usuario que almacena sus preferencias (número de personas, estilo de viaje relajado vs. aventurero, presupuesto, restricciones alimentarias).
- **`BookingOrder`**: Registro de reserva de un paquete turístico con identificador único, estado de pago (`PENDING`, `CONFIRMED`), desglose de costos y código QR de validación.
- **`OfflineVoucher`**: Comprobante digital optimizado con código QR cifrado, descargable para consulta en estaciones o zonas rurales sin internet.

### Dominio Agéntico de IA

- **`TravelAgentOrchestrator`**: Motor agéntico con ciclo de decisión (`observe -> reason -> tool_call -> verify -> answer`) que asesora al viajero, busca packs acordes a su perfil y resuelve dudas logísticas y culturales.
- **`AgentPersistentMemory`**: Almacenamiento en base de datos de las sesiones del usuario, mensajes históricos y preferencias inferidas para mantener continuidad conversacional en futuras visitas.
- **`SecurityGuard`**: Filtro perimetral del agente para mitigar _Prompt Injections_, intentos de fuga de instrucciones y sanitización de entradas de usuario.
- **`AgentTools`**:
  - `search_packs(category, season, max_budget)`: Consulta de paquetes en base de datos.
  - `get_seasonal_forecast(month)`: Recomendación climática y eventos estacionales en Aomori.
  - `create_itinerary_draft(pack_id, days, travelers)`: Generación de itinerario personalizado.
  - `calculate_pricing(pack_id, season, travelers)`: Cotización con tarifas dinámicas.

---

## 3. Principios de Diseño

- **Identidad visual no cliché**: Rechazo del esquema rojo/blanco dominante en turismo japonés; uso de naranja sol naciente (`#F97316`) y azul Aomori (`#1C4F7C`).
- **Transparencia radical**: Precios finales desde la primera pantalla; el usuario nunca descubre tarifas ocultas en el checkout.
- **Resiliencia offline**: Toda reserva confirmada genera un voucher accesible sin conexión a internet.
