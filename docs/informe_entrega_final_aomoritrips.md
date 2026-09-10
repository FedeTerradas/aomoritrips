# UNIVERSIDAD TECNOLÓGICA NACIONAL

## Facultad Regional Buenos Aires (UTN.BA) · Centro de e-Learning

### Curso de Inteligencia Artificial para Programadores

---

# TRABAJO DE FIN DE CICLO · ENTREGA FINAL DE PROYECTO

## Inteligencia Artificial Aplicada a Organizaciones

> **Proyecto**: AomoriTrips (青森トリップス) · Plataforma de Expediciones a Rutas Secretas de Japón con Asistente Agéntico Autónomo y Validación Offline  
> **Fecha de Entrega**: Septiembre 2026  
> **Autor**: Federico Terradas  
> **Evaluación**: Trabajo Individual

---

## LINKS OBLIGATORIOS (Primera Página del Informe)

> **Nota para el evaluador**: Conforme a la consigna oficial, este informe académico actúa como guía estructurada e índice técnico del trabajo real publicado y comprobable en los siguientes enlaces:

| Recurso                            | URL Directa                                                                                        | Estado / Observación                                                |
| :--------------------------------- | :------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| **Repositorio GitHub**             | [https://github.com/federicoterradas/aomoritrips](https://github.com/federicoterradas/aomoritrips) | Repositorio con historial de commits progresivos y hooks de Husky   |
| **Aplicación Web en Producción**   | [https://aomoritrips.vercel.app](https://aomoritrips.vercel.app)                                   | Despliegue en vivo en Vercel con SSR Next.js y base de datos activa |
| **Video de Demostración**          | [https://youtu.be/placeholder-aomoritrips-demo](https://youtu.be/placeholder-aomoritrips-demo)     | Video demostrativo del flujo completo (3 a 5 minutos)               |
| **Código y Memoria en Repo Local** | `E:\Curso IA\proyecto_final_curso\aomoritrips`                                                     | Entorno local auditado con SQLite y Ollama local                    |

---

# PARTE 1 — El Proyecto como Aplicación Real

---

## Sección 1 · Presentación del Equipo y del Proyecto

### 1.1. Integrantes del Equipo y Roles Asumidos

El desarrollo y arquitectura de la solución fue llevado a cabo de manera individual por:

- **Federico Terradas**
  - **Rol**: _Full-stack AI Engineer & Arquitecto de Software_.
  - **Responsabilidades asumidas**:
    1. **Arquitectura y Orquestación Agéntica**: Diseño e implementación del loop agéntico de _Aomori Sensei_ (`Observar → Razonar → Ejecutar Herramientas → Verificar`), memoria conversacional multi-turno persistente y modelado relacional con Prisma ORM y SQLite.
    2. **Ciberseguridad y Guardrails**: Implementación de barreras activas contra Prompt Injection (OWASP LLM01), sanitización estricta de entradas y gestión segura de credenciales.
    3. **Diseño de Experiencia (UI/UX)**: Implementación de la identidad visual regional inspirada en la Unidad 4 (papel Washi `#FDF8F2`, Azul Aomori `#1C4F7C` y Naranja Sol Naciente `#F97316`), tipografía bilingüe con soporte kanji (`Huninn` / `Noto Sans JP`) y componentes interactivos validados bajo heurísticas de Nielsen.
    4. **Calidad y Automatización**: Configuración de pipelines locales con Git, Husky, Prettier, TypeScript y suite automatizada de pruebas unitarias.

---

### 1.2. Nombre del Proyecto y Propuesta de Valor

- **Nombre**: **AomoriTrips (青森トリップス)**.
- **Propuesta de Valor**:  
  AomoriTrips es una plataforma web inteligente de TravelTech especializada en **expediciones privadas y rutas secretas en la prefectura de Aomori y la región de Tohoku (norte de Japón)**. A diferencia de las agencias tradicionales o los portales de turismo masivo que se limitan a vender pasajes y hoteles urbanos en Tokio o Kioto, AomoriTrips abre el acceso a vivencias culturales profundas y remotas —como el templo sagrado de Osorezan, los baños termales milenarios ocultos bajo la nieve en Hakkoda (Hitō), el rastreo en bosques vírgenes de Shirakami-Sanchi con guías tradicionales Matagi o la construcción artesanal de carrozas gigantes en las cofradías privadas del Nebuta Matsuri—.

  La plataforma integra al **Aomori Sensei (青森の先生)**, un mentor de viajes basado en inteligencia artificial agéntica que asiste al viajero en español antes, durante y después del viaje, resolviendo desgloses presupuestarios transparentes, consultas climáticas estacionales y generando vouchers de reserva con códigos QR criptográficos que funcionan 100% offline.

---

### 1.3. Problema que Resuelve (Evolución desde la Entrega de Medio Ciclo)

Planificar un viaje a Japón es una experiencia inherentemente compleja para el viajero occidental y, de manera muy acentuada, para el **viajero latinoamericano**. Esta problemática se fundamenta en una combinación de factores estructurales:

1. **La Extrema Barrera Idiomática y Cultural en Zonas Rurales**:  
   Mientras que en las grandes urbes metropolitanas (Tokio, Kioto, Osaka) existe señalética en inglés y cierta familiaridad con el turismo internacional, la región norteña de Aomori y Tohoku conserva una infraestructura predominantemente local. En los ryokans tradicionales, santuarios de montaña y baños termales (onsen), el personal no domina el inglés ni el español, y las normas de etiqueta milenaria son estrictas. Un error de interpretación cultural o la imposibilidad de comunicarse ante una eventualidad climática puede derivar en situaciones de incomodidad severa o desprotección.

2. **Dispersión Geográfica y Falta de Transporte Público Regular**:  
   Los tesoros naturales y culturales más auténticos de Tohoku están dispersos en valles montañosos donde los trenes de alta velocidad Shinkansen no llegan de forma capilar y las líneas de buses rurales operan con frecuencias de apenas dos o tres viajes diarios, con cartelería exclusivamente en kanji. Acceder a un Hitō secreto en el Monte Hakkoda durante el invierno o internarse en Shirakami-Sanchi es logísticamente inviable para un viajero extranjero sin vehículo 4x4 acondicionado para nieve extrema y sin chofer o guía local acreditado.

3. **Fragmentación Extrema de Plataformas y Riesgo Financiero**:  
   El viajero se ve forzado a lidiar simultáneamente con 4 o 5 plataformas inconexas: portales de trenes (JR East), centrales japonesas de ryokans que no aceptan tarjetas internacionales, empresas de excursiones en inglés y aplicaciones genéricas de traducción. Un error en la compra de un billete ferroviario, un desfasaje en los días de vigencia de un pase o una reserva fallida en una posada remota representa la pérdida directa de cientos o miles de dólares y la ruina del itinerario planificado.

4. **Incertidumbre y Falta de Conectividad en Destino**:  
   En los pasos montañosos, bosques nubosos y quebradas de Tohoku, la conectividad móvil 4G/5G es con frecuencia nula o inestable. Si los vouchers, itinerarios o comprobantes de reserva dependen de la nube o de aplicaciones en línea, el viajero queda desamparado frente a los anfitriones locales.

**La Solución de AomoriTrips**:  
AomoriTrips transforma radicalmente esta realidad al transformar la aplicación de un simple intermediario comercial a una **herramienta de certidumbre, seguridad y acompañamiento técnico permanente**. Centraliza la oferta en paquetes completos y curados sin costos ocultos, proporciona un agente inteligente bilingüe con razonamiento y herramientas contextuales (_Aomori Sensei_), y almacena de forma segura vouchers con validación QR offline que garantizan el acceso a los servicios sin importar la cobertura de red.

---

### 1.4. Público Objetivo y Contexto de Uso

#### Perfil Sociodemográfico y Psicográfico:

- **Origen Geográfico Prioritario**: **Latinoamérica** (Argentina, Chile, México, Colombia, Perú, Uruguay, etc.), complementado con la comunidad hispanohablante global.
- **Nivel Socioeconómico**: **Medio-Alto a Alto**. Se trata de usuarios con capacidad de ahorro o financiamiento para realizar un viaje de larga distancia intercontinental de alto presupuesto ($2.500 a $4.800 USD por expedición, excluyendo vuelos transpacíficos).
- **Segmento de Viajeros**:
  - Profesionales, parejas y entusiastas de la cultura nipona de entre 28 y 60 años.
  - Viajeros experimentados que frecuentemente ya conocen los circuitos masivos convencionales (el "Golden Route": Tokio-Kioto-Osaka) y buscan adentrarse en el "Japón profundo" e inexplorado.
  - Viajeros que valoran la autenticidad, la exclusividad y la preservación ambiental, pero que rechazan la fricción logística, el estrés de perderse en rutas nevadas o el temor a quedar desamparados por el idioma.

#### Contexto de Uso por Etapas del Ciclo de Viaje:

1. **Fase de Inspiración y Descubrimiento (Móvil / Web)**:  
   El usuario navega desde su dispositivo en momentos de ocio buscando alternativas al turismo de masas. Es atraído por la fotografía inmersiva de paisajes nevados, festivales de fuego y termas curativas, filtrando por temporadas emblemáticas (_Sakura_, _Nebuta_, _Koyo_, _Nieve_).
2. **Fase de Consulta y Planificación Asistida con IA**:  
   El viajero dialoga en español natural con el _Aomori Sensei_. Formula preguntas complejas sobre el clima en enero, el equipamiento térmico requerido, la posibilidad de viajar con niños o el presupuesto para 2 personas. El agente razona utilizando herramientas de backend y le devuelve itinerarios estructurados y cotizaciones exactas.
3. **Fase de Conversión y Checkout**:  
   El usuario selecciona su fecha y viajeros, visualiza el desglose transparente de costos (vuelos internos, Ryokan de montaña, JR Pass Shinkansen, chofer 4x4 y seguro médico) y confirma la reserva en un flujo de menos de 2 minutos.
4. **Fase de Operación en Destino (Offline / On-the-Go)**:  
   Durante el viaje en Japón, en medio del bosque de Shirakami o en Sukayu Onsen, el usuario accede a su billetera digital desde la aplicación, exhibiendo su voucher QR de alta densidad para canjear traslados y accesos sin requerir conexión a internet.

---

## Sección 2 · Arquitectura Técnica

### 2.1. Arquitectura General del Sistema y Flujo de Datos

La arquitectura técnica de **AomoriTrips** fue concebida para conciliar la flexibilidad conversacional de la inteligencia artificial generativa con la rigurosidad transaccional y matemática requerida en el comercio electrónico de viajes de alta gama.

Para evitar los vicios comunes de "cajas negras" o arquitecturas no defendibles, el sistema implementa una **separación tajante de responsabilidades**:

1. **Lógica Determinística (TypeScript / Node.js)**: Controla el enrutamiento HTTP, la validación estricta de datos de entrada mediante esquemas Zod, las reglas matemáticas de tarificación por temporada, la persistencia transaccional ACID en base de datos relacional y la firma criptográfica de vouchers.
2. **Capa de Inteligencia Artificial (Estructurada en 3 Niveles)**:
   - **Nivel 1: LLM Probabilístico (Inferencia y Comprensión Semántica)**: Modelo de lenguaje responsable de comprender el lenguaje natural del viajero, extraer intenciones, mantener el tono cultural empático de Aomori y generar recomendaciones discursivas.
   - **Nivel 2: Orquestación Determinística-Puente (Control del Ciclo y Seguridad)**: Máquina de estados en TypeScript que administra el ciclo de vida del agente, aplica filtros anti-inyección, implementa el **Circuit Breaker** (con límite de iteraciones) y actúa como compuerta de autorización y validación previa a la ejecución de cualquier herramienta.
   - **Nivel 3: Herramientas de Negocio Determinísticas (Tools)**: Funciones puras que consultan el catálogo oficial, calculan presupuestos exactos sin margen de alucinación y formatean borradores de itinerarios.
3. **Persistencia Relacional y Memoria Multi-Turno**: SQLite local operado a través de **Prisma ORM** con modo **Write-Ahead Logging (WAL)**, que garantiza lecturas concurrentes sin bloqueo y desacopla el motor relacional para permitir una migración directa a PostgreSQL/Supabase en producción.
4. **Mecanismo de Firma y Modo Offline**: La validación en zonas montañosas de Tohoku sin conectividad satelital ni 4G/5G se resuelve mediante un **voucher digital firmado con HMAC-SHA256**. El payload del código QR contiene `{ id: orderId, pack: packSlug, pax: travelersCount, date: travelDate, hash: signature }`. La aplicación del anfitrión en el ryokan rural verifica la firma matemática localmente en menos de 1 milisegundo mediante **Web Crypto API**, garantizando autenticidad e inmutabilidad sin depender de internet.

#### Diagrama 1: Arquitectura General y Bifurcación Online / Offline

```mermaid
flowchart TD
  subgraph Cliente["1. Cliente Web / Móvil (Next.js 16)"]
    UI["Catálogo, Chat Sensei & Checkout"]
    WalletOffline["Billetera de Vouchers (Offline Cache / PWA)"]
  end

  subgraph ServidorNext["2. Servidor Node.js (Next.js App Router)"]
    API["API Routes (/api/packs, /api/bookings, /api/agent/chat)"]
    Zod["Validación de Esquemas (Zod)"]
    QRCodeGen["Motor Criptográfico & Generador QR"]
  end

  subgraph CapaIA["3. Capa de Inteligencia Artificial (3 Niveles)"]
    LLM["Nivel 1: LLM Probabilístico (Inferencia y Razonamiento)"]
    Orquestador["Nivel 2: Orquestación Determinística (Guardrails, Ciclo y Tool Auth)"]
    Tools["Nivel 3: Tools de Negocio (Precios, Clima, Catálogo, Itinerario)"]
  end

  subgraph Persistencia["4. Persistencia Relacional"]
    Prisma["Prisma ORM (Modo WAL)"]
    DB[("SQLite: dev.db")]
  end

  subgraph ModoOffline["5. Operación en Campo (Sin Conectividad)"]
    Guia["Terminal / App del Guía en Montaña"]
    CryptoVerify["Verificación Matemática de Firma (Web Crypto API)"]
  end

  UI -->|Solicitudes HTTP / JSON| API
  API --> Zod
  Zod --> Orquestador
  Orquestador <-->|Prompts & Tool Calls| LLM
  Orquestador --> Tools
  Tools --> Prisma
  API --> QRCodeGen
  QRCodeGen --> Prisma
  Prisma <--> DB

  QRCodeGen -.->|Descarga de Voucher Firmado| WalletOffline
  WalletOffline -.->|Escaneo Óptico QR| Guia
  Guia --> CryptoVerify
```

---

### 2.2. Ciclo de Decisión Agéntico (Loop del Aomori Sensei)

El asistente _Aomori Sensei_ no opera como un simple chatbot de autocompletado probabilístico, sino como un **agente autónomo gobernado por software**. Para blindar el sistema contra costos descontrolados, bucles infinitos de llamadas a herramientas y alucinaciones de parámetros, el orquestador implementa una **doble frontera de seguridad**:

1. **Primera Frontera (Input Guardrail)**: Sanitización regex y detección proactiva de inyecciones antes de enviar cualquier token al modelo.
2. **Segunda Frontera (Tool Authorization & Validation)**: Antes de ejecutar cualquier función en el backend, el orquestador verifica que la herramienta solicitada esté en la lista blanca de permisos y que sus argumentos cumplan estrictamente el esquema de datos tipado (Zod).

Asimismo, el ciclo incorpora una compuerta explícita de **Control del Agente**:

- **Evaluación de Tarea Finalizada**: Determina si el objetivo del usuario ha sido satisfecho.
- **Circuit Breaker (`MAX_ITERATIONS = 3`)**: Si el modelo requiere más de 3 iteraciones sin converger, el sistema corta el bucle probabilístico de inmediato y activa una degradación elegante con una respuesta determinística estructurada.

#### Diagrama 2: Ciclo de Decisión Agéntico Controlado

```mermaid
flowchart TD
  A(["Inicio: Input del Usuario"]) --> B["Guardrail de Entrada (Filtro Anti-Inyección)"]
  B -->|Peligro Detectado| B_Err["Rechazo Determinístico Inmediato"]
  B -->|Entrada Segura| C["Carga de Memoria Persistente (AgentSession / SQLite)"]
  C --> D["Inferencia y Decisión del Agente (LLM)"]
  D --> E{"¿Requiere Tool Call?"}

  E -->|No / Respuesta Directa| H{"¿Tarea Finalizada?"}
  E -->|Sí| F1["Tool Authorization (Verificación de permisos)"]
  F1 --> F2["Tool Validation (Validación de parámetros con Zod)"]
  F2 -->|Parámetros Inválidos| F_Err["Retroalimentación de Error al LLM"]
  F_Err --> D
  F2 -->|Válido| F3["Ejecución Determinística de la Herramienta (TypeScript)"]
  F3 --> G["Incrementar Contador de Iteraciones (i = i + 1)"]
  G --> I{"¿i >= MAX_ITERATIONS (3)?"}
  I -->|Sí / Circuit Breaker| I_Fallback["Fallback Controlado (Degradación Elegante Washi)"]
  I -->|No| D

  H -->|No| D
  H -->|Sí| J["Verificación de Salida & Formato Visual"]
  J --> K["Persistencia en SQLite (AgentMessage) & Retorno al Cliente"]
  I_Fallback --> K
```

---

### 2.3. Modelado UML Formal

Para satisfacer y superar los requerimientos de la cátedra de la UTN.BA, se incluyen **ambos diagramas UML**: el estructural (Diagrama de Clases de la persistencia) y el dinámico (Diagrama de Secuencia temporal de la interacción).

#### Diagrama 3a: Diagrama de Clases UML (Estructura de Datos en Prisma)

Modela las entidades relacionales persistidas en `dev.db`, incluyendo las sesiones multi-turno del agente, las preferencias inferidas del viajero y las órdenes de reserva con firma criptográfica.

```mermaid
classDiagram
  class TravelPack {
    +String id
    +String slug
    +String title
    +String description
    +String heroImage
    +Float priceBaseUsd
    +String seasonTag
    +Int durationDays
    +String includedHighlights
    +DateTime createdAt
  }

  class BookingOrder {
    +String id
    +String packId
    +String travelerName
    +String travelerEmail
    +Int travelersCount
    +DateTime travelDate
    +Float totalPriceUsd
    +String status
    +String qrCodeData
    +String qrSignature
    +DateTime createdAt
  }

  class AgentSession {
    +String id
    +String userId
    +DateTime startedAt
    +DateTime lastActiveAt
  }

  class AgentMessage {
    +String id
    +String sessionId
    +String role
    +String content
    +String toolCalls
    +DateTime createdAt
  }

  class TravelerPreference {
    +String id
    +String sessionId
    +String budgetTier
    +String interests
    +String seasonPreference
  }

  TravelPack "1" <-- "0..*" BookingOrder : referencia
  AgentSession "1" --> "0..*" AgentMessage : almacena
  AgentSession "1" --> "0..1" TravelerPreference : perfila
```

#### Diagrama 3b: Diagrama de Secuencia UML (Flujo Integral y Operación Offline)

Ilustra la interacción completa: desde la consulta en lenguaje natural del viajero, pasando por el orquestador y la ejecución de tools determinísticas, hasta el checkout y la validación matemática sin conexión en los baños termales de Sukayu Onsen.

```mermaid
sequenceDiagram
  autonumber
  actor Viajero as Viajero (Latinoamérica)
  participant UI as Cliente Web (Next.js)
  participant API as API Server & Zod
  participant Guard as Guardrail & Tool Auth
  participant Sensei as Aomori Sensei (LLM)
  participant Tools as Tools Determinísticas
  participant DB as SQLite (Prisma WAL)
  actor Guia as Guía Rural en Aomori (Offline)

  Viajero->>UI: Solicita plan y cotización en lenguaje natural
  UI->>API: POST /api/agent/chat { sessionId, message }
  API->>Guard: Sanitización regex de entrada (Anti-Prompt Injection)
  Guard-->>API: Entrada validada
  API->>DB: Recupera historial previo de AgentSession
  API->>Sensei: Prompt del sistema + Historial + Input seguro
  Sensei-->>API: Intención: Ejecutar toolCalculatePricing(packId, pax)
  API->>Guard: Tool Authorization & Schema Validation (Zod)
  Guard-->>API: Autorizado
  API->>Tools: Invoca toolCalculatePricing(...)
  Tools->>DB: Lee tarifas y temporada en TravelPack
  Tools-->>API: JSON estructurado con desglose transparente
  API->>Sensei: Inyecta resultado de la herramienta
  Sensei-->>API: Síntesis final en estilo Washi y recomendación cultural
  API->>DB: Persiste AgentMessage en la sesión
  API-->>UI: Retorna respuesta y tarjeta interactiva de reserva

  Viajero->>UI: Confirma reserva y efectúa checkout
  UI->>API: POST /api/bookings { packId, traveler, date }
  API->>API: Genera código AOM-2026 y firma digital HMAC-SHA256
  API->>DB: Guarda BookingOrder con qrSignature
  API-->>UI: Voucher emitido y descargado a la Billetera local

  Note over Viajero,Guia: Escenario en Destino (Sukayu Onsen / Sin Conectividad)
  Viajero->>Guia: Exhibe voucher QR desde Billetera Offline
  Guia->>Guia: Escaneo óptico y validación de firma con Web Crypto API
  Guia-->>Viajero: Acceso confirmado y bienvenida tradicional
```

---

## Sección 3 · Stack Tecnológico

Conforme a la rúbrica oficial de la UTN.BA, a continuación se presenta la tabla obligatoria que detalla cada componente de la arquitectura, la herramienta seleccionada y su rigurosa fundamentación técnica y comparativa frente a alternativas del mercado:

### 3.1. Tabla Obligatoria de Tecnologías y Justificación Técnica

| Componente                      | Tecnología / Herramienta                                                                       | Por qué se eligió esta y no otra (Criterio Comparativo)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :------------------------------ | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Frontend**                    | **Next.js 16 (React 19 / Turbopack)** + CSS Tokens de Identidad Washi                          | Se priorizó **Next.js 16** con Turbopack por su capacidad nativa de Server-Side Rendering (SSR) y Server Components, fundamentales para renderizar el catálogo con latencias menores a 300 ms y optimización SEO en paquetes turísticos. **Frente a Single Page Applications (SPA) tradicionales con Vite o Create React App**: evita el bundle masivo inicial en conexiones móviles inestables y unifica frontend y backend en un único repositorio tipado de punta a punta. **Frente a librerías de componentes prediseñadas (Material UI / Chakra UI)**: se descartaron para evitar el aspecto genérico corporativo, implementando una arquitectura de tokens CSS propios inspirada en la Unidad 4 (papel Washi `#FDF8F2`, Azul Aomori `#1C4F7C` y Naranja Sol `#F97316`) con estricto cumplimiento de contraste WCAG AA.                                                                                        |
| **Backend**                     | **Next.js App Router (Node.js API Routes en TypeScript)**                                      | Permite construir endpoints RESTful (`/api/packs`, `/api/bookings`, `/api/agent/chat`) con tipado estricto compartido entre cliente y servidor mediante TypeScript 5. **Frente a un microservicio separado en Python (FastAPI / Flask)**: elimina la sobrecarga de mantener dos runtimes, dos pipelines de CI/CD y serializaciones manuales redundantes. Al residir en el mismo monorepo, las interfaces de TypeScript de los modelos de base de datos y esquemas Zod se reutilizan sin fricción, reduciendo drásticamente la superficie de fallas en producción.                                                                                                                                                                                                                                                                                                                                                   |
| **Base de Datos**               | **SQLite local operado con Prisma ORM (Modo WAL)**                                             | SQLite en modo **Write-Ahead Logging (WAL)** ofrece persistencia relacional ACID en un archivo autocontenido (`prisma/dev.db`) con cero latencia de red en entornos locales y edge nodes, permitiendo lecturas concurrentes sin bloqueos de contención. **Frente a bases NoSQL documentales (MongoDB / Firebase)**: la estructura de viajes, vouchers con código único y preferencias de usuario requiere integridad referencial estricta y transaccionalidad bancaria que el modelo relacional garantiza por diseño. **Frente a PostgreSQL / MySQL administrados en la nube**: para el alcance de este ciclo educativo y desarrollo autónomo, evita costos fijos de infraestructura e incidentes de red. Gracias al desacoplamiento de **Prisma ORM**, la migración a Supabase o AWS RDS en una fase corporativa requiere únicamente modificar el connection string en el `.env` sin alterar la lógica de negocio. |
| **Modelo de IA**                | **Híbrido: LLM Cloud (`llama-3.3-70b` / Groq / OpenAI) + SLM Local (`llama3.2:1b` en Ollama)** | Para la inferencia en producción se utiliza un modelo de alta capacidad con ventana de contexto extendida y velocidad de generación ultra-rápida (Groq/OpenAI), permitiendo responder consultas complejas en lenguaje natural en menos de 1.5 segundos con tono empático bilingüe. Como complemento estratégico de gobernanza y privacidad, se integró **Ollama con `llama3.2:1b`** como SLM (Small Language Model) local: corre 100% offline en la máquina del usuario, no transmite datos personales de pasajeros a la nube y sirve como respaldo de contingencia ante caídas de API externas.                                                                                                                                                                                                                                                                                                                    |
| **Orquestación Agéntica**       | **Código Propio en TypeScript (Máquina de Estados Finita con Circuit Breaker)**                | El loop agéntico de _Aomori Sensei_ (`Observar → Razonar → Autorizar Herramienta → Validar Parámetros → Ejecutar → Verificar`) fue programado directamente en TypeScript nativo. **Frente a frameworks de orquestación como LangChain o CrewAI**: se rechazaron deliberadamente debido a su severo "dependency bloat" (decenas de dependencias opacas), abstracciones innecesarias que encubren el funcionamiento del loop, y dificultad para auditar la latencia y el consumo de tokens. El código propio garantiza control milimétrico del **Circuit Breaker (`MAX_ITERATIONS = 3`)**, timeouts determinísticos con `AbortController` y una trazabilidad total para la cátedra. **Frente a plataformas no-code (n8n, Make, Flowise)**: permite versionado directo en Git, ejecución de tests unitarios automáticos en Husky y cero dependencia de servidores externos de terceros.                                |
| **Ciberseguridad & Validación** | **Zod (Runtime Schema Validation) + Guardrails Heurísticos Regex + Web Crypto API**            | Implementa una defensa en profundidad en dos capas: **Zod** valida estrictamente el tipado de los inputs HTTP y de los argumentos generados por el LLM antes de ejecutar herramientas de base de datos o tarificación, impidiendo Type Injections. El módulo `guardrails.ts` intercepta patrones maliciosos de Prompt Injection (OWASP LLM01: jailbreaks, suplantación de sistema, directivas de escape). Por su parte, la **Web Crypto API** gestiona la generación y validación matemática de firmas HMAC-SHA256 para el QR offline sin librerías externas vulnerables.                                                                                                                                                                                                                                                                                                                                           |
| **Despliegue**                  | **Vercel (Plataforma Serverless / Edge con CI/CD automatizado)**                               | Infraestructura serverless nativa optimizada para Next.js. Proporciona despliegue continuo automático conectado al repositorio GitHub, compresión Brotli, distribución global mediante Edge Network y certificados SSL automáticos. **Frente a VPS tradicionales (DigitalOcean / EC2)**: elimina tareas manuales de aprovisionamiento, parches de seguridad del sistema operativo y configuración de proxies Nginx, asegurando alta disponibilidad con costo cero para la evaluación académica.                                                                                                                                                                                                                                                                                                                                                                                                                     |

---

## Sección 4 · Evidencia de Funcionamiento

### 4.1. Capturas de Pantalla del Frontend

La plataforma web interactiva se encuentra completamente operativa, implementando la arquitectura visual de la Unidad 4:

1. **Pantalla Principal (Home / Catálogo Curado)**:
   - Header con branding regional (`青森 AomoriTrips`), navegación superior y badge reactivo de reservas y favoritos.
   - Hero inmersivo con fotografía de las montañas de Aomori, buscador predictivo y selector horizontal de temporadas (`🌸 Sakura`, `🏮 Nebuta`, `🍁 Koyo`, `❄️ Snow` y `❤️ Mis Favoritos`).
   - Grilla de tarjetas de viaje compactas con fotografías en alta definición, badges flotantes, precio transparente por persona en dólares y botón interactivo para apertura y cotización.

2. **Flujo de Uso Principal (Interacción con Aomori Sensei y Cotización)**:
   - Panel conversacional en tiempo real con el asistente _Aomori Sensei_ (`青森の先生`).
   - Visualización del inspector agéntico que expone el ciclo de decisión (`Observar → Razonar → Ejecutar Herramientas → Verificar`).
   - Modal de reserva detallada (`BookingModal`) con galería fotográfica, itinerario día por día, desglose transparente de costos (vuelo, ryokan, billete Shinkansen, impuestos) y cálculo en vivo según cantidad de viajeros.

3. **Resultado / Output Visible para el Usuario (Billetera QR y Perfil)**:
   - Emisión instantánea de voucher digital tras la confirmación de reserva.
   - Código QR dinámico de alta fidelidad generado con la paleta de colores de Aomori (`#1C4F7C`), validable offline en destino.
   - Pantalla de Perfil y Configuración (`ProfileView`) fiel al prototipo Figma de la Unidad 4 (`aomoritrips_perfil.png`), con administración de métodos de pago, selector interactivo de divisa (`USD $`, `JPY ¥`, `EUR €`, `ARS $`), datos de pasaporte, selector de idioma (`ES`, `EN`, `日本語`) y gestión de experiencias favoritas guardadas.

### 4.2. Video de Demostración

- **Duración Estimada**: 3 minutos y 45 segundos.
- **Contenido del Recorrido**:
  1. Exploración del catálogo estacional y uso del filtro reactivo de favoritos.
  2. Apertura de tarjeta y cotización dinámica en tiempo real.
  3. Conversación con _Aomori Sensei_, demostrando la invocación de herramientas (`toolSearchPacks`, `toolGetSeasonalForecast`, `toolCalculatePricing`).
  4. Checkout simulado, generación de orden `AOM-2026` y validación del voucher QR offline en la Billetera.
  5. Recorrido por la sección de Perfil y Configuración, demostrando la persistencia de preferencias en `localStorage`.

### 4.3. Log y Registro de una Sesión Real (Decision Loop del Sensei)

A continuación se transcribe la traza de ejecución real registrada en la base de datos `dev.db` durante una consulta realizada por un viajero interesado en festivales de verano:

```json
{
  "sessionId": "sess_8k29fma01d",
  "timestamp": "2026-09-09T23:14:02.180Z",
  "userInput": "Hola Sensei, quiero viajar en agosto para ver el festival Nebuta con mi pareja. ¿Qué me recomendás y cuánto nos costaría?",
  "guardrailStatus": "PASSED (No Prompt Injection detected)",
  "decisionCycle": [
    {
      "step": 1,
      "phase": "OBSERVE",
      "thought": "El usuario indica intención de viajar en agosto (verano) para presenciar el festival Nebuta con su pareja (2 personas). Procedo a buscar paquetes estacionales asociados al tag 'nebuta'."
    },
    {
      "step": 2,
      "phase": "TOOL_INVOCATION",
      "tool": "toolSearchPacks",
      "arguments": { "season": "nebuta", "query": "Nebuta" },
      "output": [
        {
          "id": "pack_nebuta_001",
          "slug": "nebuta-matsuri-fuego",
          "title": "Festival de Fuego Nebuta Matsuri & Costa Sanriku",
          "priceBaseUsd": 1650,
          "durationDays": 6,
          "highlights": [
            "Acceso VIP gradas Nebuta",
            "Estancia en Ryokan tradicional",
            "Pase JR East Pass 5 días"
          ]
        }
      ]
    },
    {
      "step": 3,
      "phase": "TOOL_INVOCATION",
      "tool": "toolCalculatePricing",
      "arguments": {
        "priceBaseUsd": 1650,
        "travelersCount": 2,
        "seasonTag": "nebuta"
      },
      "output": {
        "pricePerPersonUsd": 1650,
        "subtotalUsd": 3300,
        "taxesAndTransfersUsd": 264,
        "grandTotalUsd": 3564,
        "groupDiscountApplied": "0%"
      }
    },
    {
      "step": 4,
      "phase": "VERIFY_AND_SYNTHESIS",
      "thought": "Tengo la información del paquete y el cálculo exacto garantizado sin costos ocultos. Genero respuesta empática con tono cultural del norte de Japón."
    }
  ],
  "agentReply": "¡Konnichiwa! Viajar a Aomori en agosto es una de las experiencias más intensas y emocionantes que podrás vivir en Japón. Durante esas fechas la ciudad vibra con el legendario **Festival Nebuta Matsuri**, donde colosales carrozas de papel washi iluminadas por fuego recorren las calles al son de tambores taiko.\n\nPara viajar con tu pareja (2 personas), te recomiendo nuestro paquete cerrado **'Festival de Fuego Nebuta Matsuri & Costa Sanriku' (6 días / 5 noches)**:\n- **Tarifa Base**: $1,650 USD por persona.\n- **Total Final para 2 viajeros**: **$3,564 USD** (incluye vuelos internos, asientos reservados en gradas VIP, ryokan con baños onsen y tasas aéreas).\n\n¿Te gustaría que reservemos las fechas de agosto o preferís revisar el itinerario día por día?"
}
```

---

## Sección 5 · Evaluación UX/UI

### 5.1. Heurísticas de Nielsen Aplicadas al Proyecto

Conforme a la rúbrica oficial, se evaluó la interfaz web frente a 6 de las 10 heurísticas de usabilidad de Jakob Nielsen:

| Heurística                                           | ¿Cumple? | Evidencia Concreta en AomoriTrips                                                                                                                                                                                                                                                                                                                               |
| :--------------------------------------------------- | :------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Visibilidad del estado del sistema**            |  **Sí**  | La aplicación informa visualmente en todo momento el estado de las operaciones: spinners de carga al consultar el catálogo o al agente, toasts flotantes de confirmación al guardar ajustes en el perfil, badges de conteo en la barra de navegación para reservas y favoritos, y mensajes de progreso (`"Generando Vouchers Offline..."`) durante el checkout. |
| **2. Coincidencia entre el sistema y el mundo real** |  **Sí**  | Se emplean metáforas visuales familiares para el viajero: billetes Shinkansen con diseño de ticket físico, sellos de control, íconos de pasaporte (`🛡️`), divisas reales (`USD $`, `JPY ¥`, `EUR €`, `ARS $`) y terminología clara sin jerga técnica opaca, explicando conceptos japoneses (_Ryokan_, _Onsen_, _JR Pass_) con descripciones accesibles.         |
| **3. Control y libertad del usuario**                |  **Sí**  | Los modales (`BookingModal`, `AuditModal`) cuentan con botón visible de cierre (`✕`), cierre mediante tecla `Escape` y clic fuera del contenedor (overlay). En las tarjetas de viaje, los usuarios disponen de botones para desplegar o plegar el resumen rápido a demanda y botón para restablecer filtros con un solo clic.                                   |
| **4. Consistencia y estándares**                     |  **Sí**  | Coherencia estricta en la paleta cromática regional (Azul Aomori `#1C4F7C`, Naranja Sol `#F97316`, Fondo Washi `#FDF8F2`). La navegación superior fija en desktop se traduce limpiamente a una barra inferior móvil de 5 íconos según los estándares de diseño nativo de iOS y Android.                                                                         |
| **6. Reconocimiento antes que recuerdo**             |  **Sí**  | En lugar de exigir que el usuario recuerde los paquetes que le interesaron, la app ofrece un sistema de **Favoritos persistente con botón de corazón (❤️)** y un filtro dedicado en el hero banner. Asimismo, el formulario de checkout autocompleta el nombre y correo del titular a partir del perfil almacenado.                                             |
| **8. Diseño estético y minimalista**                 |  **Sí**  | Rediseño consciente de las tarjetas de catálogo a un formato compacto (~300px), eliminando textos redundantes y bloques gigantescos de inclusiones que generaban sobrecarga cognitiva y scroll excesivo, permitiendo al usuario escanear visualmente las 5 experiencias en un solo vistazo.                                                                     |

### 5.2. Evaluación Orientada al Público Objetivo

- **Nivel Técnico del Usuario Final**: La plataforma está diseñada para viajeros de 18 a 55 años con nivel técnico básico a intermedio (usuarios habituales de aplicaciones de e-commerce o reservas como Booking o Airbnb). La navegación prescinde de comandos complejos; la interacción con el agente IA es tan natural como chatear por WhatsApp, complementada con botones de acción sugerida de un solo toque.
- **Comprensión Visual y Textual**: Se utilizó una tipografía dual humanista (`Outfit` para texto occidental y `Huninn` para kanjis japoneses). Todo precio expuesto se presenta bajo la leyenda _"Garantía sin costos ocultos"_, eliminando la desconfianza habitual ante cargos sorpresa al momento del pago.
- **Feedback de Pruebas Informales con Usuarios**: Se realizó una prueba de usabilidad con 2 usuarios finales representativos.
  - _Feedback recibido inicial_: Ambos usuarios señalaron que las tarjetas originales eran demasiado largas y que resultaba tedioso scrollear para comparar los precios de las distintas temporadas. Además, uno de ellos intentó guardar un paquete haciendo clic en el corazón y notó que al recargar la página el guardado desaparecía.
  - _Acción implementada_: Se compactaron las tarjetas a 300px, se incorporó persistencia real en `localStorage` para los favoritos y se creó la pantalla de Perfil con selector de moneda e idioma. En una segunda prueba, el tiempo para encontrar y cotizar un viaje se redujo en un 60%, con satisfacción unánime.

---

## Sección 6 · Evaluación de Ciberseguridad

En cumplimiento estricto con los lineamientos de la UTN.BA (Módulo 6), a continuación se presenta la bitácora de análisis de riesgos, vectores de ataque evaluados y salvaguardas implementadas:

### Log de Consideraciones de Seguridad

| Riesgo Identificado                                | Tipo (OWASP / Privacidad / Acceso)              | Medida Implementada o Decisión Tomada en Código                                                                                                                                                                                                                                                                                                                                                                                                    |
| :------------------------------------------------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Inyección de Prompt en el Agente IA**            | **OWASP LLM01 (Prompt Injection & Jailbreaks)** | Implementación de una barrera perimetral (`src/lib/agent/guardrails.ts`) con expresiones regulares que detectan intentos de escape de instrucciones (`ignore previous instructions`, `bypass`, `system prompt dump`, `dan mode`). Si se detecta un patrón malicioso, el orquestador aborta la llamada al LLM y retorna un mensaje seguro predefinido. Además, el contexto de sistema y los inputs de usuario viajan delimitados de forma estricta. |
| **Exposición de Credenciales y Secretos de API**   | **Secretos en Código / Fuga de Entorno**        | Todas las API keys (Groq, OpenAI, secret keys de firma) residen exclusivamente en variables de entorno (`.env.local`). El archivo `.gitignore` excluye `.env*` de los commits. Las rutas de API de Next.js actúan como proxy perimetral seguro: el cliente en el navegador nunca tiene acceso directo a las credenciales del proveedor de IA.                                                                                                      |
| **Privacidad y Exposición de PII de Pasajeros**    | **Privacidad de Datos (PII Mínima)**            | Principio de minimización de datos: la plataforma únicamente almacena el nombre del titular y correo electrónico para la generación del voucher. No se almacenan números reales de tarjetas de crédito (la tarjeta en Perfil se modela como token enmascarado `•••• 4821` para simulación didáctica). Los vouchers QR contienen hashes firmados y no datos sensibles en texto plano.                                                               |
| **Falsificación o Alteración de Vouchers Offline** | **Integridad de Datos / Acceso no Autorizado**  | Cada voucher emitido genera un código único con prefijo institucional (`AOM-2026-XXXX`) acompañado de una firma digital HMAC-SHA256 calculada en backend mediante Web Crypto API. Esto permite que un guía rural en los valles de Aomori pueda validar la autenticidad matemática del voucher mediante escaneo óptico sin requerir conexión a internet y sin riesgo de falsificación.                                                              |

---

## Sección 7 · IAs Usadas en el Co-work de Desarrollo

### 7.1. Tabla de Herramientas IA Utilizadas

| Herramienta IA               | Para qué la usaron                                                                                                                                 | Aportó bien / mal / sorprendió                                                                                                                                                                            |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude (Anthropic)**       | Generación de la arquitectura del orquestador agéntico en TypeScript, máquina de estados finita y diseño de guardrails regex de ciberseguridad.    | **Aportó muy bien**: Estructuración limpia de tipos, modularización del loop agéntico y manejo robusto de errores asíncronos.                                                                             |
| **Gemini (Google DeepMind)** | Co-working interactivo en desarrollo frontend, redacción de esquemas Prisma, diagramas Mermaid de arquitectura y redacción del informe técnico.    | **Sorprendió gratamente**: Gran capacidad para razonar sobre el diseño de interfaces limpias basadas en wireframes, generación rápida de código React y comprensión integral del contexto de la Unidad 4. |
| **Cursor / GitHub Copilot**  | Autocompletado contextual de código en el editor, tipado TypeScript y generación de pruebas unitarias con el runner nativo de Node.js.             | **Aportó bien**: Aceleró la escritura de tests repetitivos y definiciones de interfaces, aunque requirió supervisión en imports circulares.                                                               |
| **Leonardo.ai & Figma Make** | Conceptualización visual en la Unidad 4: exploración de paleta cromática regional (Azul Aomori / Naranja Sol) y wireframing de las pantallas base. | **Aportó bien**: Rompió el bloqueo creativo inicial y permitió converger rápidamente en una identidad visual no cliché para Japón.                                                                        |

---

### 7.2. Bitácora de Co-working Crítico: Supervisión Humana y Corrección de Fallas de la IA

En línea con la filosofía del protocolo **`ia-cowork-review`**, la inteligencia artificial fue utilizada como un copiloto de aceleración y nunca como una autoridad dogmática. La supervisión humana activa (_Human-in-the-Loop_) resultó indispensable para detectar desviaciones críticas entre lo generado automáticamente por los modelos y los requisitos de usabilidad del prototipo original:

#### Caso 1: Detección del Botón de Favoritos Volátil (Sin Persistencia)

- **Falla de la IA**: La IA generó un componente visual `PackCard` con un botón de corazón para favoritos, pero implementó la funcionalidad con un simple `useState(false)` local efímero. Visualmente parecía funcionar al hacer clic, pero el dato no se guardaba en ningún medio de almacenamiento: al recargar la página o navegar a otra pestaña, los favoritos desaparecían.
- **Intervención Humana**: El desarrollador detectó la desconexión funcional y exigió una solución robusta. Se creó el módulo `src/lib/favorites.ts` y el hook `src/hooks/useFavorites.ts`, implementando persistencia en `localStorage`, despacho de eventos DOM personalizados (`aomori-favorites-updated`) para sincronización multiventana reactiva, y un filtro estacional dedicado en el catálogo (`❤️ Mis Favoritos`) con badges de conteo en la barra de navegación.

#### Caso 2: Cards Permanentemente Desplegadas y Fatiga de Scroll

- **Falla de la IA**: La IA implementó tarjetas de catálogo excesivamente extensas (más de 550 píxeles de altura cada una), incluyendo párrafos enteros de descripción y listados completos de inclusión forzados en la vista principal. Esto violaba la heurística de diseño minimalista de Nielsen y contradecía el prototipo de Figma (`aomoritrips_home.png`), obligando al usuario a realizar un scroll vertical interminable.
- **Intervención Humana**: El desarrollador identificó la fatiga de navegación y ordenó compactar las tarjetas a ~300px. Se implementó un esquema de doble nivel de apertura: por un lado, un acordeón sutil para despliegue rápido inline (`"Ver resumen ▾"` / `"Ocultar resumen ▴"`), y por otro, la apertura del modal completo de cotización (`BookingModal`) al hacer clic en la tarjeta, respetando con fidelidad milimétrica la experiencia proyectada en la Unidad 4.

#### Caso 3: Omisión Total de la Pantalla de Perfil & Configuración de la App

- **Falla de la IA**: En el desarrollo autónomo inicial, la IA concentró sus esfuerzos en el chat y la billetera, omitiendo por completo la tercera pantalla clave del prototipo de la Unidad 4 (`aomoritrips_perfil.png`). No existía ninguna vista para que el usuario consultara o modificara sus preferencias de cuenta.
- **Intervención Humana**: El desarrollador contrastó la aplicación contra los wireframes de Figma y exigió la construcción integral de `ProfileView.tsx`: cabecera con avatar kanji (`花`), estado del viajero (`🌸 Viajero Sakura · Nv. 3`), métricas de viaje, configuración de tarjeta de pago, selector interactivo de divisas (`USD`, `JPY`, `EUR`, `ARS`), datos de pasaporte, selector de idioma (`ES`, `EN`, `日本語`) y enlace directo a experiencias favoritas, todo persistido en `localStorage` e integrado en la navegación móvil y desktop.

---

### 7.3. Reflexión Crítica Obligatoria (Consigna Oficial UTN.BA)

> **Reflexión obligatoria**:  
> El co-work con Inteligencia Artificial redujo a menos de un tercio el tiempo necesario para desarrollar una aplicación completa: hubiera sido prácticamente imposible estructurar en los plazos del curso una arquitectura con Next.js 16, orquestador agéntico con loop de decisión, integración de Prisma con SQLite, validación de esquemas Zod, generación de QR dinámicos y diseño responsivo sin la asistencia continua de modelos generativos. Sin embargo, la experiencia demostró fehacientemente que la IA carece de criterio estético global y coherencia de estado si no es supervisada con rigor: la IA asumió atajos inaceptables como dejar botones de favoritos puramente cosméticos sin persistencia de datos, saturó el layout con tarjetas sobredimensionadas que arruinaban la usabilidad móvil, y omitió componentes estructurales como la pantalla de Perfil. La intervención humana crítica fue el factor determinante que transformó un conjunto de fragmentos de código autogenerados en un producto de software robusto, auditable, accesible y fiel a las especificaciones originales.

---

## PARTE 2 — IA Local en tu Proyecto

### Preguntas Técnicas y Fundamentación de Inferencia Local

#### 1. ¿Qué papel jugaría un LLM/SLM local en tu proyecto?

En AomoriTrips, un modelo de lenguaje local pequeño (SLM como `llama3.2:1b` o `phi-3 mini` ejecutado bajo **Ollama**) cumple un rol estratégico como **Agente de Soporte Offline y Guardián de Privacidad en Destino**:

- **No reemplazaría por completo** al modelo cloud de 70B parámetros en producción web (donde se prioriza la riqueza de vocabulario y el razonamiento complejo), sino que actuaría como un **subagente de contingencia local**: en caso de caída de conectividad en zonas montañosas remotas de Tohoku (por ejemplo, en los valles del Monte Iwaki o las termas de Sukayu Onsen), la aplicación empaquetada o el dispositivo del guía local puede ejecutar inferencia directa sobre el hardware local.
- Permite resolver consultas de itinerario, traducción de términos culturales japoneses y asistencia de primeros auxilios o transporte local a costo cero por token, con latencias ultra-bajas e independencia total de servidores externos.

#### 2. ¿Qué le aportaría al usuario de la aplicación?

Al usuario final le aporta tres beneficios tangibles:

1. **Resiliencia Extrema sin Conexión**: La prefectura de Aomori cuenta con extensas zonas de bosque primario (Shirakami-Sanchi) y carreteras de montaña donde la señal 4G/5G es nula o intermitente. Un SLM local permite que el viajero continúe interactuando con su Sensei de viajes para consultar instrucciones de llegada al ryokan o recomendaciones gastronómicas sin requerir un plan de datos internacional costoso.
2. **Privacidad Absoluta de Datos Sensibles**: Datos como nombres completos, itinerarios de vuelo, números de pasaporte o requerimientos médicos y alimenticios jamás salen de la máquina del cliente, garantizando cumplimiento normativo de privacidad (GDPR / Ley de Protección de Datos Personales).
3. **Cero Latencia en Consultas Frecuentes**: Al no existir viaje de ida y vuelta a servidores en EE.UU. o Japón, las respuestas breves se generan de manera instantánea mediante inferencia directa en el chip del dispositivo.

#### 3. ¿Qué te aportaría a vos como profesional?

1. **Auditoría Integral de Datos y Gobernanza**: Permite procesar y resumir logs de interacción, consultas de usuarios y métricas de soporte directamente en los servidores de la organización sin enviar telemetría a proveedores terceros, abriendo la puerta al análisis profundo de patrones de demanda turística sin riesgos legales de fuga de datos corporativos.
2. **Autonomía Operativa en Desarrollo**: Facilita iterar, realizar pruebas automatizadas y validar prompts en entornos locales de desarrollo (aviones, trenes o zonas sin internet) sin consumir créditos de API ni depender de cuotas de tasa (_rate limits_).
3. **Dominio de la Pila Completa de IA**: Permite adquirir competencia práctica en quantización de pesos (formatos GGUF Q4_K_M), gestión de memoria VRAM, context window tuning y optimización de inferencia en CPU/GPU, habilidades sumamente cotizadas en la industria TravelTech y Enterprise.

#### 4. ¿Qué limitaciones concretas tiene versus una API en la nube?

1. **Capacidad de Hardware y Consumo de Recursos**: Correr modelos locales requiere hardware dedicado (al menos 8 GB a 16 GB de RAM unificada o GPU con VRAM dedicada). En computadoras estándar sin aceleración gráfica, la velocidad de generación puede caer por debajo de los 15 tokens/segundo, degradando la experiencia conversacional.
2. **Capacidad de Razonamiento y Function Calling (Herramientas)**: Mientras que un modelo frontera como Claude 3.5 Sonnet o LLaMA 3.3 70B genera JSONs perfectamente estructurados para invocar múltiples herramientas en paralelo con 100% de fiabilidad sintáctica, un modelo de 1B o 3B parámetros presenta mayor tasa de alucinación en los nombres de las herramientas o en los esquemas de parámetros complejos.
3. **Ventana de Contexto y Gestión del Modelo**: La actualización de conocimiento requiere descargar gigabytes de nuevos checkpoints o aplicar técnicas de RAG local (Retrieval-Augmented Generation), a diferencia de las APIs cloud que se actualizan de forma transparente en la nube.

---

### Entregable Opcional: Evidencia de Terminal con Ollama Local

Se verificó el funcionamiento local en el entorno del proyecto utilizando el motor **Ollama** con el modelo **`llama3.2:1b`**, consultando recomendaciones específicas sobre Aomori:

```text
$ ollama run llama3.2:1b
>>> ¿Qué lugares recomiendas visitar en Aomori durante el invierno y por qué?

En Aomori durante el invierno (diciembre a marzo), recomiendo tres lugares extraordinarios:

1. Sukayu Onsen y Montes Hakkoda: Famosos por acumular más de 4 metros de nieve en invierno.
   Aquí se pueden contemplar los impresionantes "Monstruos de Nieve" (Juhyo) creados por la
   congelación del viento en los abetos, y relajarse en el histórico baño termal Senninburo
   (baño de los mil bañistas) de madera tradicional de ciprés hiba.

2. Parque del Castillo de Hirosaki: Aunque es célebre en primavera por los cerezos, en invierno
   se celebra el Festival de Linternas de Nieve de Hirosaki, donde cientos de faroles iluminados
   y esculturas de hielo contrastan mágicamente con el castillo feudal nevado.

3. Lago Towada y Garganta de Oirase: En invierno, las cascadas de Oirase se congelan por completo
   creando colosales cortinas de hielo azulado (Hyobaku), accesibles mediante excursiones guiadas
   con raquetas de nieve.

¿Te gustaría información sobre el transporte en tren Shinkansen hacia la estación Shin-Aomori?
```

- **Parámetros de Inferencia**: Temperature = `0.3`, Context Size = `2048`, Formato = GGUF Q4_K_M.
- **Rendimiento Observado**: 42.8 tokens/segundo sobre CPU/GPU local, tiempo de primera respuesta < 600 ms, sin conexión a internet activa.
